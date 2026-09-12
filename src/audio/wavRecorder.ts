/**
 * Studio Synth Workstation - Lossless Master Audio Recorder & WAV Exporter
 * Captures master stereo output directly from Web Audio API and exports standard 16-bit 44.1kHz WAV.
 */

export class WavRecorder {
  private ctx: AudioContext;
  private sourceNode: AudioNode;
  private processorNode: ScriptProcessorNode | null = null;
  private recording: boolean = false;
  private leftChannel: Float32Array[] = [];
  private rightChannel: Float32Array[] = [];
  private recordingLength: number = 0;
  private startTime: number = 0;
  private recordedBlob: Blob | null = null;
  private loopAudioBuffer: AudioBuffer | null = null;
  private loopSource: AudioBufferSourceNode | null = null;
  private isLooping: boolean = false;

  constructor(ctx: AudioContext, sourceNode: AudioNode) {
    this.ctx = ctx;
    this.sourceNode = sourceNode;
  }

  public isCurrentlyRecording(): boolean {
    return this.recording;
  }

  public isCurrentlyLooping(): boolean {
    return this.isLooping;
  }

  public getElapsedTime(): number {
    if (!this.recording) return 0;
    return (Date.now() - this.startTime) / 1000;
  }

  public startRecording() {
    if (this.recording) return;

    this.stopLoop();
    this.leftChannel = [];
    this.rightChannel = [];
    this.recordingLength = 0;
    this.recordedBlob = null;
    this.loopAudioBuffer = null;
    this.startTime = Date.now();
    this.recording = true;

    // Buffer size 4096 gives ~92ms slices at 44.1kHz with negligible CPU load
    this.processorNode = this.ctx.createScriptProcessor(4096, 2, 2);

    this.processorNode.onaudioprocess = (e) => {
      if (!this.recording) return;
      const left = e.inputBuffer.getChannelData(0);
      const right = e.inputBuffer.getChannelData(1);

      this.leftChannel.push(new Float32Array(left));
      this.rightChannel.push(new Float32Array(right));
      this.recordingLength += left.length;
    };

    this.sourceNode.connect(this.processorNode);
    // Connect processor to destination to keep it alive in Chrome/Safari (output is silent because we don't write to outputBuffer)
    this.processorNode.connect(this.ctx.destination);
  }

  public stopRecording(): Blob | null {
    if (!this.recording) return this.recordedBlob;

    this.recording = false;

    if (this.processorNode) {
      try {
        this.sourceNode.disconnect(this.processorNode);
        this.processorNode.disconnect();
      } catch {
        // Ignored
      }
      this.processorNode = null;
    }

    if (this.recordingLength === 0) return null;

    // Flatten channels
    const mergedLeft = this.mergeBuffers(this.leftChannel, this.recordingLength);
    const mergedRight = this.mergeBuffers(this.rightChannel, this.recordingLength);

    // Build AudioBuffer for looping
    this.loopAudioBuffer = this.ctx.createBuffer(2, this.recordingLength, this.ctx.sampleRate);
    this.loopAudioBuffer.copyToChannel(mergedLeft, 0);
    this.loopAudioBuffer.copyToChannel(mergedRight, 1);

    // Build 16-bit PCM WAV Blob
    this.recordedBlob = this.encodeWAV(mergedLeft, mergedRight, this.ctx.sampleRate);
    return this.recordedBlob;
  }

  public toggleLoop(onEnded?: () => void) {
    if (this.isLooping) {
      this.stopLoop();
      return false;
    } else {
      return this.playLoop(onEnded);
    }
  }

  public playLoop(onEnded?: () => void): boolean {
    if (!this.loopAudioBuffer) return false;
    this.stopLoop();

    this.loopSource = this.ctx.createBufferSource();
    this.loopSource.buffer = this.loopAudioBuffer;
    this.loopSource.loop = true;
    this.loopSource.connect(this.ctx.destination);
    this.loopSource.start();
    this.isLooping = true;

    this.loopSource.onended = () => {
      this.isLooping = false;
      if (onEnded) onEnded();
    };
    return true;
  }

  public stopLoop() {
    if (this.loopSource) {
      try {
        this.loopSource.stop();
        this.loopSource.disconnect();
      } catch {
        // Ignored
      }
      this.loopSource = null;
    }
    this.isLooping = false;
  }

  public hasRecording(): boolean {
    return this.recordedBlob !== null && this.recordingLength > 0;
  }

  public downloadWav(filename = 'studio-play-recording.wav') {
    if (!this.recordedBlob) return;
    const url = URL.createObjectURL(this.recordedBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  private mergeBuffers(channelBuffer: Float32Array[], recordingLength: number): Float32Array {
    const result = new Float32Array(recordingLength);
    let offset = 0;
    for (let i = 0; i < channelBuffer.length; i++) {
      result.set(channelBuffer[i], offset);
      offset += channelBuffer[i].length;
    }
    return result;
  }

  private encodeWAV(samplesL: Float32Array, samplesR: Float32Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samplesL.length * 2 * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samplesL.length * 4, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // 16 for PCM
    view.setUint16(20, 1, true); // Linear quantization (PCM)
    view.setUint16(22, 2, true); // 2 channels (Stereo)
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 4, true); // Byte rate (SampleRate * 2 channels * 2 bytes)
    view.setUint16(32, 4, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample (16 bit)

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, samplesL.length * 4, true);

    // Write interleaved 16-bit PCM samples with soft clipping
    let offset = 44;
    for (let i = 0; i < samplesL.length; i++) {
      // Left channel
      let sL = Math.max(-1, Math.min(1, samplesL[i]));
      view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true);
      offset += 2;

      // Right channel
      let sR = Math.max(-1, Math.min(1, samplesR[i]));
      view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true);
      offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
