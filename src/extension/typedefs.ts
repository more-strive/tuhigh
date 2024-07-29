// https://www.typescriptlang.org/docs/handbook/utility-types.html
// import type { Gradient } from './gradient/Gradient';
import type { Pattern } from '@/extension/pattern/Pattern';
import type { Point } from './point/Point';

interface NominalTag<T> {
  nominalTag?: T;
}

type Nominal<Type, Tag> = NominalTag<Tag> & Type;

type TNonFunctionPropertyNames<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type TClassProperties<T> = Pick<T, TNonFunctionPropertyNames<T>>;


export type Constructor<T = object> = new (...args: any[]) => T;

export interface XY {
  x: number;
  y: number;
}


const enum Degree {}
const enum Radian {}

export type TDegree = Nominal<number, Degree>;
export type TRadian = Nominal<number, Radian>;

export type TAxis = 'x' | 'y';

export type TAxisKey<T extends string> = `${T}${Capitalize<TAxis>}`;

export type TFiller = Gradient<'linear'> | Gradient<'radial'> | Pattern;

export type TSize = {
  width: number;
  height: number;
};

export type TBBox = {
  left: number;
  top: number;
} & TSize;

export type Percent = `${number}%`;

export type ImageFormat = 'jpeg' | 'png';

export type SVGElementName = 'linearGradient' | 'radialGradient' | 'stop';

export type SupportedSVGUnit = 'mm' | 'cm' | 'in' | 'pt' | 'pc' | 'em';

export type TMat2D = [
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number
];


export type TCrossOrigin = '' | 'anonymous' | 'use-credentials' | null;

export type TOriginX = 'center' | 'left' | 'right' | number;
export type TOriginY = 'center' | 'top' | 'bottom' | number;

export type TCornerPoint = {
  tl: Point;
  tr: Point;
  bl: Point;
  br: Point;
};

export type TSVGReviver = (markup: string) => string;

export type TValidToObjectMethod = 'toDatalessObject' | 'toObject';

export type TCacheCanvasDimensions = {
  width: number;
  height: number;
  zoomX: number;
  zoomY: number;
  x: number;
  y: number;
};

export type TRectBounds = [min: XY, max: XY];

export type TToCanvasElementOptions<T> = {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  filter?: (object: T) => boolean;
};

export type TDataUrlOptions<T> = TToCanvasElementOptions<T> & {
  multiplier: number;
  format?: ImageFormat;
  quality?: number;
  enableRetinaScaling?: boolean;
};

export type Abortable = {
  signal?: AbortSignal;
};

export type TOptions<T> = Partial<T> & Record<string, any>;
