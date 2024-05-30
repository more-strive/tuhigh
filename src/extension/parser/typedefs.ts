

export type SVGParsingOutput = {
  objects: (any | null)[];
  options: Record<string, any>;
  elements: Element[];
  allElements: Element[];
};

export type TSvgReviverCallback = (
  element: Element,
  leaferObject: any
) => void;

export type TMat2D = [
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number
];

export type CSSRules = Record<string, Record<string, string>>;
