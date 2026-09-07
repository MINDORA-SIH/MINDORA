import Meyda from "meyda";

const MFCC_FRAME_SIZE = 512;
const MFCC_COEFFICIENTS = 13;

export interface AudioFeatureSummary {
  /** Mean MFCC vector for this one in-memory recording; never persisted or sent. */
  mfcc: number[];
  frameCount: number;
  meanRms: number;
}

/**
 * Extracts MFCCs from microphone frames with Meyda. The summary is deliberately
 * kept in memory only: MFCCs can be biometric data and are not needed by ASR.
 */
export class AudioFeatureExtractor {
  private readonly coefficientTotals = new Array<number>(MFCC_COEFFICIENTS).fill(0);
  private frameCount = 0;
  private rmsTotal = 0;

  extract(frame: Float32Array, sampleRate: number): void {
    if (frame.length !== MFCC_FRAME_SIZE) return;

    Meyda.bufferSize = MFCC_FRAME_SIZE;
    Meyda.sampleRate = sampleRate;
    Meyda.numberOfMFCCCoefficients = MFCC_COEFFICIENTS;
    const features = Meyda.extract(["mfcc", "rms"], frame);
    const mfcc = features?.mfcc;
    if (!mfcc || mfcc.length !== MFCC_COEFFICIENTS) return;

    mfcc.forEach((coefficient, index) => {
      this.coefficientTotals[index] += coefficient;
    });
    this.rmsTotal += features.rms ?? 0;
    this.frameCount += 1;
  }

  summarize(): AudioFeatureSummary | undefined {
    if (this.frameCount === 0) return undefined;
    return {
      mfcc: this.coefficientTotals.map((total) => total / this.frameCount),
      frameCount: this.frameCount,
      meanRms: this.rmsTotal / this.frameCount,
    };
  }

  clear(): void {
    this.coefficientTotals.fill(0);
    this.frameCount = 0;
    this.rmsTotal = 0;
  }
}
