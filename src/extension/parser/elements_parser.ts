import {
  invertTransform,
  multiplyTransformMatrices,
  qrDecompose,
} from '../util/misc/matrix';
import { Point } from '../point/Point';
import { removeTransformMatrixForSvgParsing } from '../util/transform_matrix_removal';
import { CENTER } from '../constants';
import { getGradientDefs } from './getGradientDefs';
import { getCSSRules } from './getCSSRules';
import type { CSSRules, TSvgReviverCallback } from './typedefs';
import type { ParsedViewboxTransform } from './applyViewboxTransform';
import type { LoadImageOptions } from '../util/misc/objectEnlive';
import { nanoid } from 'nanoid';
import { Path, Text } from 'leafer-ui';
import { parseAttributes } from './parseAttributes'
import { ATTRIBUTE_NAMES } from './constants'
import { Image } from 'fabric/*';
import { CanvasTypes } from '@/enums'
import useCanvas from '@/logic/Canvas/useCanvas';
import useCanvasScale from '@/hooks/useCanvasScale';
import { sizeAfterTransform } from '../util/misc/objectTransforms';
import { calcDimensionsMatrix } from '../util/misc/matrix'



const findTag = (el: Element) => {
  const tag = el.tagName.toLowerCase().replace('svg:', '')
  if (tag === 'text') return Text
  else if (tag === 'path') return Path
}

type StorageType = {
  fill: SVGGradientElement;
  stroke: SVGGradientElement;
  clipPath: Element[];
  mask: Element[];
};

type NotParsedFabricObject = {} & {
  fill: string;
  stroke: string;
  clipPath?: string;
  mask?: string;
  clipRule?: CanvasFillRule;
};

export class ElementsParser {
  declare elements: Element[];
  declare options: LoadImageOptions & ParsedViewboxTransform;
  declare reviver: TSvgReviverCallback | undefined;
  declare regexUrl: RegExp;
  declare doc: Document;
  declare clipPaths: Record<string, Element[]>;
  declare masks: Record<string, Element[]>;
  declare gradientDefs: Record<string, SVGGradientElement>;
  declare cssRules: CSSRules;

  constructor(
    elements: Element[],
    options: LoadImageOptions & ParsedViewboxTransform,
    reviver: TSvgReviverCallback | undefined,
    doc: Document,
    clipPaths: Record<string, Element[]>,
    masks: Record<string, Element[]>
  ) {
    this.elements = elements;
    this.options = options;
    this.reviver = reviver;
    this.regexUrl = /^url\(['"]?#([^'"]+)['"]?\)/g;
    this.doc = doc;
    this.clipPaths = clipPaths;
    this.masks = masks;
    this.gradientDefs = getGradientDefs(doc);
    this.cssRules = getCSSRules(doc);
  }

  parse(): Promise<Array<any | null>> {
    this.setLeaferSize()
    return Promise.all(
      this.elements.map((element) => this.createObject(element))
    );
  }

  _getTransformedDimensions(options: any = {}): Point {
    const dimOptions = {
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      skewX: this.skewX,
      skewY: this.skewY,
      width: this.width,
      height: this.height,
      strokeWidth: this.strokeWidth,
      ...options,
    };
    // stroke is applied before/after transformations are applied according to `strokeUniform`
    const strokeWidth = dimOptions.strokeWidth;
    let preScalingStrokeValue = strokeWidth, postScalingStrokeValue = 0;

    if (this.strokeUniform) {
      preScalingStrokeValue = 0;
      postScalingStrokeValue = strokeWidth;
    }
    const dimX = dimOptions.width + preScalingStrokeValue,
      dimY = dimOptions.height + preScalingStrokeValue,
      noSkew = dimOptions.skewX === 0 && dimOptions.skewY === 0;
    let finalDimensions;
    if (noSkew) {
      finalDimensions = new Point(dimX * dimOptions.scaleX, dimY * dimOptions.scaleY);
    } else {
      finalDimensions = sizeAfterTransform(dimX, dimY, calcDimensionsMatrix(dimOptions));
    }

    return finalDimensions.scalarAdd(postScalingStrokeValue);
  }

  setLeaferSize() {
    console.log(this.options)
    const { setCanvasTransform } = useCanvasScale()
    const [ canvas ] = useCanvas()
    const workspace = canvas.tree.findOne(`#${CanvasTypes.WorkSpaceDrawType}`)
    workspace.set({width: this.options.width, height: this.options.height})
    setCanvasTransform()
  }

  async createObject(el: Element): Promise<any | null> {
    // const klass = findTag(el) as Path | Text;
    let leaferClass = undefined
    const [ canvas ] = useCanvas()
    const tag = el.tagName.toLowerCase().replace('svg:', '')
    // if (tag === 'text') leaferClass = Text
    // else if (tag === 'path') leaferClass = Path
    const attributes = parseAttributes(el as HTMLElement, ATTRIBUTE_NAMES, this.cssRules)
    
    const textContent = (el.textContent || '').replace(/^\s+|\s+$|\n+/g, '').replace(/\s+/g, ' ');
    // console.log('tag:', tag, 'attributes:', attributes)
    if (tag === 'text') {
      console.log('tag:', tag, 'attributes:', attributes)
      
      const text = new Text({
        id: nanoid(10),
        // width: attributes.width,
        // height: attributes.height,
        text: textContent,
        x: attributes.transformMatrix[4] + attributes.dx,
        y: attributes.transformMatrix[5] + attributes.dy,
        scaleX: attributes.transformMatrix[0],
        scaleY: attributes.transformMatrix[3],
        editable: true,
        fontSize: attributes.fontSize,
        fontFamily: attributes.fontFamily,
      })
      canvas.tree.findOne(`#${CanvasTypes.WorkSpaceDrawType}`).add(text)
    }
    else if (tag === 'path') {
      console.log('attributes:', attributes)
      const path = new Path({
        id: nanoid(10),
        width: attributes.width,
        height: attributes.height,
        path: attributes.d,
        fill: attributes.fill,
        x: attributes.transformMatrix[4],
        y: attributes.transformMatrix[5],
        scaleX: attributes.transformMatrix[0],
        scaleY: attributes.transformMatrix[3],
        editable: true,
      })
      canvas.tree.findOne(`#${CanvasTypes.WorkSpaceDrawType}`).add(path)
    }
    // const obj = new leaferClass({
    //   id: nanoid(10),
    //   x: attributes.x,
    //   y: attributes.y
      
    // });
    // let obj: Image
    this.resolveGradient(el, 'fill');
    this.resolveGradient(el, 'stroke');
    // if (obj instanceof Image && obj._originalElement) {
    //   removeTransformMatrixForSvgParsing(obj, obj.parsePreserveAspectRatioAttribute());
    // } else {
    //   removeTransformMatrixForSvgParsing(obj);
    // }
    // await this.resolveClipPath(obj, el);
    // await this.resolveMask(obj, el);
    // this.reviver && this.reviver(el, obj);
    // return obj;
    return null;
  }

  extractPropertyDefinition(property: 'fill' | 'stroke' | 'clipPath' | 'mask', storage: Record<string, StorageType[typeof property]>): StorageType[typeof property] | undefined {
    const regex = this.regexUrl, value = '';
    if (!regex.test(value)) {
      return undefined;
    }
    // verify: can we remove the 'g' flag? and remove lastIndex changes?
    regex.lastIndex = 0;
    // we passed the regex test, so we know is not null;
    const id = regex.exec(value)![1];
    regex.lastIndex = 0;
    // @todo fix this
    return storage[id];
  }

  resolveGradient(el: Element, property: 'fill' | 'stroke') {
    const gradientDef = this.extractPropertyDefinition( property, this.gradientDefs) as SVGGradientElement;
    if (gradientDef) {
      const opacityAttr = el.getAttribute(property + '-opacity');
      // const gradient = Gradient.fromElement(gradientDef, obj, {
      //   ...this.options,
      //   opacity: opacityAttr,
      // } as SVGOptions);
      // obj.set(property, gradient);
    }
  }

  async resolveClipPath(obj: NotParsedFabricObject, usingElement: Element) {
    const clipPathElements = this.extractPropertyDefinition(obj, 'clipPath', this.clipPaths) as Element[];
    if (clipPathElements) {
      const objTransformInv = invertTransform(obj.calcTransformMatrix());
      // move the clipPath tag as sibling to the real element that is using it
      const clipPathTag = clipPathElements[0].parentElement;
      let clipPathOwner = usingElement;
      while (clipPathOwner.parentElement && clipPathOwner.getAttribute('clip-path') !== obj.clipPath) {
        clipPathOwner = clipPathOwner.parentElement;
      }
      clipPathOwner.parentElement!.appendChild(clipPathTag!);
      const container = await Promise.all(
        clipPathElements.map((clipPathElement) => {
          return findTag(clipPathElement).fromElement(clipPathElement, this.options, this.cssRules).then((enlivedClippath: NotParsedFabricObject) => {
              removeTransformMatrixForSvgParsing(enlivedClippath);
              enlivedClippath.fillRule = enlivedClippath.clipRule!;
              delete enlivedClippath.clipRule;
              return enlivedClippath;
            });
        })
      );
      const clipPath = container.length === 1 ? container[0] : new Group(container);
      const gTransform = multiplyTransformMatrices(
        objTransformInv,
        clipPath.calcTransformMatrix()
      );
      if (clipPath.clipPath) {
        await this.resolveClipPath(clipPath, clipPathOwner);
      }
      const { scaleX, scaleY, angle, skewX, translateX, translateY } = qrDecompose(gTransform);
      clipPath.set({
        flipX: false,
        flipY: false,
      });
      clipPath.set({
        scaleX,
        scaleY,
        angle,
        skewX,
        skewY: 0,
      });
      clipPath.setPositionByOrigin(
        new Point(translateX, translateY),
        CENTER,
        CENTER
      );
      obj.clipPath = clipPath;
    } else {
      // if clip-path does not resolve to any element, delete the property.
      delete obj.clipPath;
      return;
    }
  }

  async resolveMask(obj: NotParsedFabricObject, usingElement: Element) {
    const maskElements = this.extractPropertyDefinition(obj, 'mask', this.masks) as Element[];
    if (maskElements) {
      const maskElement = maskElements[0] as HTMLElement
      // const maskImage = await Image.fromElement(maskElement)
      // obj.set({mask: {
      //   src: maskImage?.getSrc(),
      //   left: obj.left,
      //   top: obj.top,
      //   width: obj.width,
      //   height: obj.height
      // }})
      // if (obj instanceof Image && obj._originalElement) {
      //   console.log('maskImage:', maskImage, 'obj:', obj.id)
      //   const [ pixi ] = usePixi()
      //   pixi.postMessage({
      //     id: obj.id,
      //     type: "mask", 
      //     src: obj.getSrc(),
      //     mask: JSON.stringify({
      //       src: maskImage?.getSrc()
      //     }), 
      //     width: obj.width, 
      //     height: obj.height
      //   });
      // }
    }
  }
}
