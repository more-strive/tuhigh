

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

export type CSSRules = Record<string, Record<string, string>>;
