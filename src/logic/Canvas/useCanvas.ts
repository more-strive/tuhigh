import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Leafer, App, Rect } from 'leafer-ui'
import { useElementBounding } from '@vueuse/core'
import { isMobile } from '@/utils/common'
import { FabricCanvas } from '@/app/fabricCanvas'
import { useTemplatesStore, useLeaferStore } from '@/store'
import useCommon from './useCommon'
import useHammer from './useHammer'




let app: null | App = null

// 初始化配置
const initConf = () => {
  
}

// 更新视图区长宽
const setCanvasTransform = () => {
  if (!app) return
  const leaferStore = useLeaferStore()
  const { zoom, wrapperRef, scalePercentage } = storeToRefs(leaferStore)
  const { width, height } = useElementBounding(wrapperRef.value)
  // canvas.set({width: width.value, height: height.value})
  // canvas.width = width.value
  // canvas.height = height.value
  // const objects = canvas.getObjects().filter(ele => !WorkSpaceThumbType.includes(ele.id))
  // const boundingBox = Group.prototype.getObjectsBoundingBox(objects)
  // if (!boundingBox) return
  // let boxWidth = boundingBox.width, boxHeight = boundingBox.height
  // let centerX = boundingBox.centerX, centerY = boundingBox.centerY
  // const workSpaceDraw = canvas.getObjects().filter(item => item.id === WorkSpaceDrawType)[0]
  // if (workSpaceDraw) {
  //   boxWidth = workSpaceDraw.width
  //   boxHeight = workSpaceDraw.height
  //   centerX = workSpaceDraw.left + workSpaceDraw.width / 2
  //   centerY = workSpaceDraw.top + workSpaceDraw.height / 2 
  // }
  // zoom.value = Math.min(canvas.getWidth() / boxWidth, canvas.getHeight() / boxHeight) * scalePercentage.value / 100
  // canvas.setZoom(zoom.value)
  // canvas.absolutePan(new Point(centerX, centerY).scalarMultiply(zoom.value).subtract(canvas.getCenterPoint()))
}

const initCanvas = () => {
  const leaferStore = useLeaferStore()
  const { canvasRef } = storeToRefs(leaferStore)
  const leaferWidth = leaferStore.getWidth()
  const leaferHeight = leaferStore.getHeight()
  if (!canvasRef.value) return
  // canvas = new Leafer({
  //   view: canvasRef.value, 
  //   width: leaferWidth,
  //   height: leaferHeight
  // })
  app = new App({ 
    view: canvasRef.value,
    ground: { type: 'draw' },
    tree: {},
    sky: { type: 'draw' }
})

  const background = new Rect({ width: 800, height: 600, fill: 'gray' })
  const rect = new Rect({ x: 100, y: 100, fill: '#32cd79', draggable: true })
  const border = new Rect({ x: 200, y: 200, stroke: 'blue', draggable: true })

  app.ground.add(background)
  app.tree.add(rect)
  app.sky.add(border)
  // const keybinding = new Keybinding()
  // new FabricTool(canvas)
  // new FabricGuide(canvas)
  // new HoverBorders(canvas)
  // new WheelScroll(canvas)
  // new FabricRuler(canvas)
  // canvas.preserveObjectStacking = true
  // canvas.renderAll()
}

const initEvent = () => {
  if (!app) return
  // const templatesStore = useTemplatesStore()
  // canvas.on('object:modified', () => templatesStore.modifedElement())
}

// 初始化模板
const initTemplate = async () => {
  if (!app) return
  // const templatesStore = useTemplatesStore()
  // const { initCommon } = useCommon()
  // const { initHammer } = useHammer()
  // const { currentTemplate } = storeToRefs(templatesStore)
  // await canvas.loadFromJSON(currentTemplate.value)
  setCanvasTransform()
  // initCommon()
  // initEvent()
  // if (isMobile()) {
  //   initHammer()
  // }
}

export const initEditor = async () => {
  const leaferStore = useLeaferStore()
  const { wrapperRef } = storeToRefs(leaferStore)
  initConf()
  initCanvas()
  initTemplate()
  const { width, height } = useElementBounding(wrapperRef.value)
  watch([width, height], () => {
    setCanvasTransform()
  })
}

export default (): [App] => [app as App]