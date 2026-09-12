export interface MidiEventHandlers {
  onNoteOn: (note: number, velocity: number, channel: number) => void;
  onNoteOff: (note: number, channel: number) => void;
  onPitchBend: (value: number) => void; // -1 to +1
  onControlChange: (controller: number, value: number) => void;
  onProgramChange?: (program: number) => void;
  onDevicesChanged: (deviceNames: string[]) => void;
}

interface WebMidiInput {
  name?: string;
  onmidimessage: ((event: WebMidiMessageEvent) => void) | null;
}

interface WebMidiMessageEvent {
  data: Uint8Array;
}

interface WebMidiAccess {
  inputs: {
    values: () => IterableIterator<WebMidiInput>;
  };
  onstatechange: (() => void) | null;
}

export class MidiManager {
  private midiAccess: WebMidiAccess | null = null;
  private handlers: MidiEventHandlers;
  public isSupported: boolean = false;
  public connectedDevices: string[] = [];

  constructor(handlers: MidiEventHandlers) {
    this.handlers = handlers;
    this.isSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
  }

  public async init(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      const nav = navigator as unknown as {
        requestMIDIAccess: (options?: { sysex?: boolean }) => Promise<WebMidiAccess>;
      };
      this.midiAccess = await nav.requestMIDIAccess({ sysex: false });
      this.updateDeviceList();

      this.midiAccess.onstatechange = () => {
        this.updateDeviceList();
      };

      this.attachListeners();
      return true;
    } catch (e) {
      console.warn('Web MIDI Access request denied or failed:', e);
      return false;
    }
  }

  private updateDeviceList() {
    if (!this.midiAccess) return;
    const names: string[] = [];
    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      if (input.name) {
        names.push(input.name);
      }
    }
    this.connectedDevices = names;
    this.handlers.onDevicesChanged(names);
    this.attachListeners();
  }

  private attachListeners() {
    if (!this.midiAccess) return;
    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      input.onmidimessage = this.handleMidiMessage.bind(this);
    }
  }

  private handleMidiMessage(event: WebMidiMessageEvent) {
    const data = event.data;
    if (!data || data.length < 2) return;

    const status = data[0];
    const command = status >> 4;
    const channel = status & 0xf;
    const byte1 = data[1];
    const byte2 = data.length > 2 ? data[2] : 0;

    switch (command) {
      case 0x9: // Note On
        if (byte2 > 0) {
          this.handlers.onNoteOn(byte1, byte2, channel);
        } else {
          this.handlers.onNoteOff(byte1, channel);
        }
        break;

      case 0x8: // Note Off
        this.handlers.onNoteOff(byte1, channel);
        break;

      case 0xe: { // Pitch Bend
        // 14-bit pitch bend value: byte1 is LSB, byte2 is MSB
        const bendValue = ((byte2 << 7) | byte1) - 8192;
        const normalizedBend = Math.max(-1, Math.min(1, bendValue / 8192));
        this.handlers.onPitchBend(normalizedBend);
        break;
      }

      case 0xb: // Control Change (CC)
        this.handlers.onControlChange(byte1, byte2);
        break;

      case 0xc: // Program Change
        if (this.handlers.onProgramChange) {
          this.handlers.onProgramChange(byte1);
        }
        break;

      default:
        break;
    }
  }
}
