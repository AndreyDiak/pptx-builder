declare module 'lamejs' {
  export class Mp3Encoder {
    constructor(channels: number, sampleRate: number, bitRate: number);
    encodeBuffer(left: Int16Array, right: Int16Array): Int8Array;
    flush(): Int8Array;
  }
  
  export class WavHeader {
    dataOffset: number;
    dataLen: number;
    channels: number;
    sampleRate: number;
    static RIFF: number;
    static WAVE: number;
    static fmt_: number;
    static data: number;
    static readHeader(dataView: DataView): WavHeader | undefined;
  }
}
