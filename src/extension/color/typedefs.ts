import type { Color } from './Color';

export type TRGBColorSource = [red: number, green: number, blue: number];

export type TRGBAColorSource = [red: number, green: number, blue: number, alpha: number];

export type TColorArg = string | TRGBColorSource | TRGBAColorSource | Color;