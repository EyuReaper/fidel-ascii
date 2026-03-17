/**
 * Options for rendering Fidel ASCII.
 */
export interface RenderOptions {
  /** Maximum width of a single line of ASCII. If exceeded, the text will wrap. */
  maxWidth?: number;
  /** Whether to add a shadow effect. */
  shadow?: boolean;
  /** Direction of the light source for the shadow. */
  lightSource?: "top-left" | "top-right" | "top" | "bottom" | "left" | "right";
  /** An array of colors for a vertical gradient. */
  gradient?: string[];
  /** Whether to add a border around the output. */
  border?: boolean;
  /** Thickness of the border in characters. */
  borderThickness?: number;
  /** The character style of the border. */
  borderStyle?: "solid" | "double" | "dotted" | "bold";
  /** The color of the border. */
  borderColor?: string;
}

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
