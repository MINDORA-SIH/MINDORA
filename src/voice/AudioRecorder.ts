export interface RecordingResult {
  blob: Blob;
  mimeType: string;
  durationMs: number;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private maxTimer: ReturnType<typeof setTimeout> | null = null;
  private analyserNode: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private silenceCheckInterval: ReturnType<typeof setInterval> | null = null;

  async start(maxSeconds: number = 8): Promise<void> {
    this.cleanup();
    this.audioChunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = this.getSupportedMimeType();
    
    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 256;
    source.connect(this.analyserNode);

    let silenceStart = Date.now();
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

    this.silenceCheckInterval = setInterval(() => {
      if (!this.analyserNode) return;
      this.analyserNode.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      if (average > 10) {
        silenceStart = Date.now();
      } else if (Date.now() - silenceStart > 2000) {
        this.mediaRecorder?.stop();
      }
    }, 200);

    this.mediaRecorder.start();
    this.startTime = Date.now();

    this.maxTimer = setTimeout(() => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      }
    }, maxSeconds * 1000);
  }

  stop(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanup();
        reject(new Error("Recorder not active"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const durationMs = Date.now() - this.startTime;
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        
        this.cleanup();

        if (blob.size === 0) {
          reject(new Error("Empty audio recording"));
          return;
        }

        if (blob.size > 1572864) {
          reject(new Error("Audio recording exceeds maximum allowed size (1.5MB)"));
          return;
        }

        resolve({ blob, mimeType, durationMs });
      };

      this.mediaRecorder.stop();
    });
  }

  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  private cleanup(): void {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.maxTimer) clearTimeout(this.maxTimer);
    if (this.silenceCheckInterval) clearInterval(this.silenceCheckInterval);
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    this.silenceTimer = null;
    this.maxTimer = null;
    this.silenceCheckInterval = null;
    this.analyserNode = null;
    this.audioContext = null;
    this.stream = null;
    this.mediaRecorder = null;
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg'
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }
}
