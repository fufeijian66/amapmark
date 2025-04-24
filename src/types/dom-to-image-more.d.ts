declare module 'dom-to-image-more' {
  export interface DomToImageOptions {
    filter?: (node: HTMLElement) => boolean;
    bgcolor?: string;
    quality?: number;
    style?: Record<string, string>;
    width?: number;
    height?: number;
    cacheBust?: boolean;
  }

  function toPng(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
  function toJpeg(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
  function toBlob(node: HTMLElement, options?: DomToImageOptions): Promise<Blob>;
  function toPixelData(node: HTMLElement, options?: DomToImageOptions): Promise<Uint8ClampedArray>;
  function toSvg(node: HTMLElement, options?: DomToImageOptions): Promise<string>;

  export default {
    toPng,
    toJpeg,
    toBlob,
    toPixelData,
    toSvg
  };
} 