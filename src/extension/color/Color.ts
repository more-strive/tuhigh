import { ColorNameMap } from '@/extension/color/color_map';
import { reHSLa, reHex, reRGBa } from '@/extension/color/constants';
import type { TRGBAColorSource, TColorArg } from '@/extension/color/typedefs';
import { hue2rgb, hexify, rgb2Hsl, fromAlphaToFloat, greyAverage } from '@/extension/color/util';


export class Color {
  private declare _source: TRGBAColorSource;

  constructor(color?: TColorArg) {
    if (!color) {
      this.setSource([0, 0, 0, 1]);
    } else if (color instanceof Color) {
      this.setSource([...color._source]);
    } else if (Array.isArray(color)) {
      const [r, g, b, a = 1] = color;
      this.setSource([r, g, b, a]);
    } else {
      this.setSource(this._tryParsingColor(color));
    }
  }

  protected _tryParsingColor(color: string) {
    if (color in ColorNameMap) {
      color = ColorNameMap[color as keyof typeof ColorNameMap];
    }
    return color === 'transparent'
      ? ([255, 255, 255, 0] as TRGBAColorSource)
      : Color.sourceFromHex(color) ||
          Color.sourceFromRgb(color) ||
          Color.sourceFromHsl(color) ||
          // color is not recognized
          // we default to black as canvas does
          ([0, 0, 0, 1] as TRGBAColorSource);
  }

  getSource() {
    return this._source;
  }

  setSource(source: TRGBAColorSource) {
    this._source = source;
  }

  toRgb() {
    const [r, g, b] = this.getSource();
    return `rgb(${r},${g},${b})`;
  }

  toRgba() {
    return `rgba(${this.getSource().join(',')})`;
  }

  toHsl() {
    const [h, s, l] = rgb2Hsl(...this.getSource());
    return `hsl(${h},${s}%,${l}%)`;
  }

  toHsla() {
    const [h, s, l, a] = rgb2Hsl(...this.getSource());
    return `hsla(${h},${s}%,${l}%,${a})`;
  }

  toHex() {
    const fullHex = this.toHexa();
    return fullHex.slice(0, 6);
  }

  toHexa() {
    const [r, g, b, a] = this.getSource();
    return `${hexify(r)}${hexify(g)}${hexify(b)}${hexify(Math.round(a * 255))}`;
  }

  getAlpha() {
    return this.getSource()[3];
  }

  setAlpha(alpha: number) {
    this._source[3] = alpha;
    return this;
  }

  toGrayscale() {
    this.setSource(greyAverage(this.getSource()));
    return this;
  }

  toBlackWhite(threshold: number) {
    const [average, , , a] = greyAverage(this.getSource()),
      bOrW = average < (threshold || 127) ? 0 : 255;
    this.setSource([bOrW, bOrW, bOrW, a]);
    return this;
  }

  overlayWith(otherColor: string | Color) {
    if (!(otherColor instanceof Color)) {
      otherColor = new Color(otherColor);
    }

    const source = this.getSource(),
      otherAlpha = 0.5,
      otherSource = otherColor.getSource(),
      [R, G, B] = source.map((value, index) =>Math.round(value * (1 - otherAlpha) + otherSource[index] * otherAlpha));

    this.setSource([R, G, B, source[3]]);
    return this;
  }

  static fromRgb(color: string): Color {
    return Color.fromRgba(color);
  }

  static fromRgba(color: string): Color {
    return new Color(Color.sourceFromRgb(color));
  }

  static sourceFromRgb(color: string): TRGBAColorSource | undefined {
    const match = color.match(reRGBa());
    if (match) {
      const [r, g, b] = match.slice(1, 4).map((value) => {
        const parsedValue = parseFloat(value);
        return value.endsWith('%')
          ? Math.round(parsedValue * 2.55)
          : parsedValue;
      });
      return [r, g, b, fromAlphaToFloat(match[4])];
    }
  }

  static fromHsl(color: string): Color {
    return Color.fromHsla(color);
  }

  static fromHsla(color: string): Color {
    return new Color(Color.sourceFromHsl(color));
  }

  static sourceFromHsl(color: string): TRGBAColorSource | undefined {
    const match = color.match(reHSLa());
    if (!match) {
      return;
    }

    const h = (((parseFloat(match[1]) % 360) + 360) % 360) / 360,
      s = parseFloat(match[2]) / 100,
      l = parseFloat(match[3]) / 100;
    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l <= 0.5 ? l * (s + 1) : l + s - l * s,
        p = l * 2 - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255),
      fromAlphaToFloat(match[4]),
    ];
  }

  static fromHex(color: string): Color {
    return new Color(Color.sourceFromHex(color));
  }

  static sourceFromHex(color: string): TRGBAColorSource | undefined {
    if (color.match(reHex())) {
      const value = color.slice(color.indexOf('#') + 1),
        isShortNotation = value.length <= 4;
      let expandedValue: string[];
      if (isShortNotation) {
        expandedValue = value.split('').map((hex) => hex + hex);
      } else {
        expandedValue = value.match(/.{2}/g)!;
      }
      const [r, g, b, a = 255] = expandedValue.map((hexCouple) =>
        parseInt(hexCouple, 16)
      );
      return [r, g, b, a / 255];
    }
  }
}
