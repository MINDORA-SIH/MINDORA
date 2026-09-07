export interface RecordingResult {
  blob: Blob;
  mimeType: string;
  durationMs: number;
}

/** Keeps an in-memory recording only for the duration of one voice command. */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime = 0;
  private maxTimer: ReturnType<typeof setTimeout> | null = null;
  private analyserNode: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private silenceCheckInterval: ReturnType<typeof setInterval> | null = null;
  private resultPromise: Promise<RecordingResult> | null = null;
  private resolveResult: ((value: RecordingResult) => void) | null = null;
  private rejectResult: ((reason: Error) => void) | null = null;

  async start(maxSeconds = 8): Promise<void> {
    this.cancel();
    this.audioChunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = this.getSupportedMimeType();
    this.mediaRecorder = mimeType
      ? new MediaRecorder(this.stream, { mimeType })
      : new MediaRecorder(this.stream);

    this.resultPromise = new Promise<RecordingResult>((resolve, reject) => {
      this.resolveResult = resolve;
      this.rejectResult = reject;
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.audioChunks.push(event.data);
    };
    this.mediaRecorder.onstop = () => this.completeRecording();

    this.audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 256;
    source.connect(this.analyserNode);

    let silenceStart = Date.now();
    let speechStarted = false;
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.silenceCheckInterval = setInterval(() => {
      if (!this.analyserNode || this.mediaRecorder?.state !== "recording") return;
      this.analyserNode.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      if (average > 10) {
        speechStarted = true;
        silenceStart = Date.now();
      } else if (speechStarted && Date.now() - silenceStart > 2000) {
        this.requestStop();
      }
    }, 200);

    this.startTime = Date.now();
    this.mediaRecorder.start();
    this.maxTimer = setTimeout(() => this.requestStop(), maxSeconds * 1000);
  }

  waitForResult(): Promise<RecordingResult> {
    if (!this.resultPromise) return Promise.reject(new Error("Recorder not active"));
    return this.resultPromise;
  }

  stop(): Promise<RecordingResult> {
    this.requestStop();
    return this.waitForResult();
  }

  cancel(): void {
    const reject = this.rejectResult;
    this.resultPromise = null;
    this.resolveResult = null;
    this.rejectResult = null;
    if (this.mediaRecorder?.state === "recording") {
      this.mediaRecorder.onstop = null;
      this.mediaRecorder.stop();
    }
    this.releaseResources();
    reject?.(new Error("Recording cancelled"));
  }

  private requestStop(): void {
    if (this.mediaRecorder?.state === "recording") this.mediaRecorder.stop();
  }

  private completeRecording(): void {
    const mimeType = this.mediaRecorder?.mimeType || "audio/webm";
    const durationMs = Date.now() - this.startTime;
    const blob = new Blob(this.audioChunks, { type: mimeType });
    const resolve = this.resolveResult;
    const reject = this.rejectResult;
    this.resultPromise = null;
    this.resolveResult = null;
    this.rejectResult = null;
    this.releaseResources();

    if (blob.size === 0) reject?.(new Error("Empty audio recording"));
    // Reserve 16 bytes for the AES-GCM authentication tag so base64 remains below 2 MB.
    else if (blob.size > 1_572_848) reject?.(new Error("Audio recording exceeds maximum allowed size (1.5MB)"));
    else resolve?.({ blob, mimeType, durationMs });
  }

  private releaseResources(): void {
    if (this.maxTimer) clearTimeout(this.maxTimer);
    if (this.silenceCheckInterval) clearInterval(this.silenceCheckInterval);
    if (this.audioContext?.state !== "closed") void this.audioContext?.close();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.maxTimer = null;
    this.silenceCheckInterval = null;
    this.analyserNode = null;
    this.audioContext = null;
    this.stream = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  private getSupportedMimeType(): string {
    return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg"]
      .find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
  }
}
