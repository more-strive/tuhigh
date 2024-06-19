import { storeToRefs } from "pinia";
import { useFabricStore, useLeaferStore, useTemplatesStore } from "@/store";
import { useMainStore } from "@/store/modules/main";
import { RightStates, ElementNames } from "@/types/elements";
import { nanoid } from "nanoid";
import { QRCodeElement, QRCodeOption } from "@/types/canvas";
import { getImageSize } from "@/utils/image";
import { Object as FabricObject, classRegistry, XY, util, Image as FabricImage } from "fabric";

import { LinePoint } from "@/types/elements";
import { QRCode } from "@/extension/object/QRCode";
import { BarCode } from "@/extension/object/BarCode";
import { ArcText } from '@/extension/object/ArcText';
import { VerticalText } from '@/extension/object/VerticalText'
import { Text, Path, Line, Image } from 'leafer-ui'
import JsBarcode from "jsbarcode";
import { i18nObj } from "@/plugins/i18n/index"
import useCenter from "@/logic/Canvas/useCenter";
import useCanvas from "@/logic/Canvas/useCanvas";
import useCanvasZindex from "./useCanvasZindex";
import { CanvasTypes } from '@/enums'


// 测试代码


export default () => {

  const mainStore = useMainStore();
  const templatesStore = useTemplatesStore();
  const { setZindex } = useCanvasZindex();
  const { t } = i18nObj().global;
  const { rightState, systemFonts } = storeToRefs(mainStore);

  const renderCanvas = (element: any) => {
    const [canvas] = useCanvas();
	  // canvas.viewportCenterObject(element); 
    // canvas.add(element);
    // canvas.setActiveObject(element);
    // rightState.value = RightStates.ELEMENT_STYLE;
    // setZindex(canvas);
    // canvas.renderAll();
    canvas.tree.findOne(`#${CanvasTypes.WorkSpaceDrawType}`).add(element)
    // templatesStore.modifedElement();
  };

  const createTextElement = (fontSize: number, textStyle = "transverse", textHollow = false, textValue = t("default.textValue")) => {
    const [ canvas ] = useCanvas();
    const { left, top, centerPoint } = useCenter();
    const textElement = new Text({
      id: nanoid(10),
      x: 0,
      y: 0,
      fontSize,
      fontFamily: systemFonts.value[0].value,
      fontWeight: "normal",
      opacity: 1,
      textAlign: "left",
      text: textValue,
      editable: true,
      // lineHeight: 1,
      // lineHeight: {
      //   type: 'percent',
      //   value: 1,
      // }
    })
    textElement.x = centerPoint.x - textElement.width;
    textElement.y = centerPoint.y - textElement.height;
    renderCanvas(textElement)
  };

  const createArcTextElement = (fontSize: number, textStyle = 'transverse', textHollow = false, textValue = '双击修改文字') => {
    const { centerPoint } = useCenter()

    const textBoxElement = new ArcText(textValue, {
      id: nanoid(10),
      left: centerPoint.x,
      top: centerPoint.y,
      fontSize,
      fontFamily: systemFonts.value[0].value,
      fillType: 0,
      hasControls: true,
      hasBorders: true,
      fontWeight: 'normal',
      charSpacing: 3,
      opacity: 1,
      lineHeight: 1.3,
      originX: 'left',
      originY: 'top',
      textAlign: 'justify-center',
      name: ElementNames.TEXTBOX,
      splitByGrapheme: textStyle === 'direction' ? true : false,
    })
    textBoxElement.set({ left: textBoxElement.left - textBoxElement.width / 2, top: textBoxElement.top - textBoxElement.height / 2 })
    if (textHollow) {
      textBoxElement.fill = ''
      textBoxElement.stroke = 'black'
      textBoxElement.strokeWidth = 1
    }
    renderCanvas(textBoxElement)
  }

  const createVerticalTextElement = (fontSize: number, textHollow = false, textValue = '双击修改文字') => {
    const { centerPoint } = useCenter()
    const [ canvas ] = useCanvas();
    const textBoxElement = new VerticalText(textValue, {
      id: nanoid(10),
      left: centerPoint.x,
      top: centerPoint.y,
      fontSize,
      fontFamily: systemFonts.value[0].value,
      fillType: 0,
      hasControls: true,
      hasBorders: true,
      fontWeight: 'normal',
      charSpacing: 3,
      opacity: 1,
      lineHeight: 1.3,
      originX: 'left',
      originY: 'top',
      name: ElementNames.VERTICALTEXT,
    })
    textBoxElement.set({ left: textBoxElement.left - textBoxElement.width / 2, top: textBoxElement.top - textBoxElement.height / 2 })
    if (textHollow) {
      textBoxElement.fill = "";
      textBoxElement.stroke = "black";
      textBoxElement.strokeWidth = 1;
    }
    renderCanvas(textBoxElement)
  }

  const createPathElement = (path: string, left?: number, top?: number) => {
    const { centerPoint } = useCenter();
    const pathElement = new Path({
      id: nanoid(10),
      path,
      x: left ? left : 0,
      y: top ? top : 0,
      opacity: 1,
      fill: "#ff5e17",
      editable: true
    });
    pathElement.x = centerPoint.x - pathElement.width;
    pathElement.y = centerPoint.y - pathElement.height;
    renderCanvas(pathElement);
  };

  const createLineElement = (path: XY[], startStyle: LinePoint, endStyle: LinePoint, strokeDashArray?: [number, number]) => {
    const { centerPoint } = useCenter();
    const lineElement = new Line({  
      x: centerPoint.x,
      y: centerPoint.y,
      width: 100,
      strokeWidth: 5,
      stroke: "#ff5e17",
      editable: true
    })
    lineElement.x = centerPoint.x - lineElement.width;
    lineElement.y = centerPoint.y - lineElement.height;
    renderCanvas(lineElement);
  };

  const createPolylineElement = (path: XY[], startStyle: LinePoint, endStyle: LinePoint, strokeDashArray?: [number, number]) => {
   
    
  };

  const createImageElement = (url: string) => {
    const { zoom } = storeToRefs(useLeaferStore());
    const { currentTemplateWidth, currentTemplateHeight } = storeToRefs(useTemplatesStore());
    const { centerPoint } = useCenter();
    getImageSize(url).then(async ({ width, height }) => {
      const scale = height / width;
      let imageScale = 1;
      if (scale < zoom.value && width > currentTemplateWidth.value) {
        imageScale = currentTemplateWidth.value / width;
      } else if (height > currentTemplateHeight.value) {
        imageScale = currentTemplateHeight.value / height;
      }
      const imageElement = new Image({  
        url,
        x: centerPoint.x,
        y: centerPoint.y,
        scale: imageScale,
        draggable: true,
        editable: true
      })
      renderCanvas(imageElement);
    });
  };

  const createQRCodeElement = async (url: string, codeOption: QRCodeOption, codeContent?: string) => {
    const { centerPoint } = useCenter();
    // const QRCode = classRegistry.getClass('QRCode')
    const codeObject = (await QRCode.fromURL(url, {}, {
      id: nanoid(10),
      name: ElementNames.QRCODE,
      angle: 0,
      left: centerPoint.x,
      top: centerPoint.y,
      hasControls: true,
      hasBorders: true,
      opacity: 1,
      originX: "left",
      originY: "top",
      borderColor: "#ff8d23",
      codeContent,
      codeOption,
      crossOrigin: "anonymous",
    })) as QRCodeElement;
    console.log("codeObject", codeObject);
    codeObject.left -= codeObject.width / 2;
    codeObject.top -= codeObject.height / 2;
    renderCanvas(codeObject);
  };

  const createBarCodeElement = async (url: string, codeContent: string, codeOption: JsBarcode.BaseOptions) => {
    const { centerPoint } = useCenter();
    // const Barcode = classRegistry.getClass('BarCode')
    const barcodeObject = await BarCode.fromURL(url, {}, {
      id: nanoid(10),
      name: ElementNames.BARCODE,
      angle: 0,
      left: centerPoint.x,
      top: centerPoint.y,
      hasControls: true,
      hasBorders: true,
      opacity: 1,
      originX: "left",
      originY: "top",
      borderColor: "#ff8d23",
      codeContent,
      codeOption,
      crossOrigin: "anonymous",
    });
    barcodeObject.left -= barcodeObject.width / 2;
    barcodeObject.top -= barcodeObject.height / 2;

    renderCanvas(barcodeObject);
  };

  const createVideoElement = (url: string) => {
    const { centerPoint } = useCenter();
    const [canvas] = useCanvas();
    const videoEl = document.createElement("video");
    videoEl.loop = true;
    videoEl.crossOrigin = "anonymous";
    videoEl.controls = true;
    videoEl.style.display = "none";

    const sourceEl = document.createElement("source");
    sourceEl.src = url;
    videoEl.appendChild(sourceEl);

    videoEl.addEventListener("loadeddata", function () {
      videoEl.width = videoEl.videoWidth;
      videoEl.height = videoEl.videoHeight;
      const videoElement = new FabricImage(videoEl, {
        left: centerPoint.x,
        top: centerPoint.y,
        originX: "center",
        originY: "center",
        objectCaching: false,
      });
      canvas.add(videoElement);
      const viedoSource = videoElement.getElement() as any
      viedoSource.play();
      util.requestAnimFrame(function render() {
        canvas.renderAll();
        util.requestAnimFrame(render);
      });
    });
  };

  const createTableElement = () => {
    // const { centerPoint } = useCenter();
    // const [canvas] = useCanvas();

    // const table = new Table();

    // renderCanvas(table)

  }

  return {
    createTextElement,
    createPathElement,
    createLineElement,
    createImageElement,
    createQRCodeElement,
    createBarCodeElement,
    createVideoElement,
    createArcTextElement,
    createVerticalTextElement,
    createTableElement
  };
};
