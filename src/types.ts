export interface FidelMetadata {
  name: string;
  height: number;
  author: string;
}

export interface FidelFont {
  metadata: FidelMetadata;
  glyphs: {
    [key: string]: string[];
  };
}
