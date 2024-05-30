import { Color } from '@/extension/color/Color';
import { toFixed } from '../util/misc/toFixed';

const colorAttributesMap = {
  stroke: 'strokeOpacity',
  fill: 'fillOpacity',
};

/**
 * @private
 * @param {Object} attributes Array of attributes to parse
 */

export const interactiveObjectDefaultValues: Record<string, any> = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  angle: 0,
  flipX: false,
  flipY: false,
  scaleX: 1,
  scaleY: 1,
  minScaleLimit: 0,
  skewX: 0,
  skewY: 0,
  originX: 'left',
  originY: 'top',
  strokeWidth: 1,
  strokeUniform: false,
  padding: 0,
  opacity: 1,
  paintFirst: 'fill',
  fill: 'rgb(0,0,0)',
  fillRule: 'nonzero',
  stroke: null,
  strokeDashArray: null,
  strokeDashOffset: 0,
  strokeLineCap: 'butt',
  strokeLineJoin: 'miter',
  strokeMiterLimit: 4,
  globalCompositeOperation: 'source-over',
  backgroundColor: '',
  shadow: null,
  visible: true,
  includeDefaultValues: true,
  excludeFromExport: false,
  objectCaching: true,
  clipPath: undefined,
  inverted: false,
  absolutePositioned: false,
  centeredRotation: true,
  centeredScaling: false,
  dirty: true,
  noScaleCache: true,
  lockMovementX: false,
  lockMovementY: false,
  lockRotation: false,
  lockScalingX: false,
  lockScalingY: false,
  lockSkewingX: false,
  lockSkewingY: false,
  lockScalingFlip: false,
  cornerSize: 13,
  touchCornerSize: 24,
  transparentCorners: true,
  cornerColor: 'rgb(178,204,255)',
  cornerStrokeColor: '',
  cornerStyle: 'rect',
  cornerDashArray: null,
  hasControls: true,
  borderColor: 'rgb(178,204,255)',
  borderDashArray: null,
  borderOpacityWhenMoving: 0.4,
  borderScaleFactor: 1,
  hasBorders: true,
  selectionBackgroundColor: '',
  selectable: true,
  evented: true,
  perPixelTargetFind: false,
  activeOn: 'down',
  hoverCursor: null,
  moveCursor: null,
};

export function setStrokeFillOpacity(
  attributes: Record<string, any>
): Record<string, any> {
  // const defaults = FabricObject.getDefaults();
  const defaults = interactiveObjectDefaultValues;
  Object.entries(colorAttributesMap).forEach(([attr, colorAttr]) => {
    if (typeof attributes[colorAttr] === 'undefined' || attributes[attr] === '') {
      return;
    }
    if (typeof attributes[attr] === 'undefined') {
      if (!defaults[attr]) {
        return;
      }
      attributes[attr] = defaults[attr];
    }
    if (attributes[attr].indexOf('url(') === 0) {
      return;
    }
    const color = new Color(attributes[attr]);
    attributes[attr] = color.setAlpha(toFixed(color.getAlpha() * attributes[colorAttr], 2)).toRgba();
  });
  return attributes;
}
