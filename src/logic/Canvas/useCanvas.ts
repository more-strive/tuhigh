
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { App, Text, ChildEvent, UI, DragEvent, RotateEvent, ZoomEvent, PointerEvent, PropertyEvent } from 'leafer-ui';
import { useElementBounding } from '@vueuse/core'
import { useTemplatesStore, useLeaferStore } from '@/store'
import { Editor, EditorMoveEvent, EditorEvent } from '@leafer-in/editor'
import { CanvasTypes } from '@/enums'
import '@leafer-in/view'
import '@leafer-in/editor'  
import '@leafer-in/text-editor'

let app: null | App = null

// 初始化配置
const initConf = () => {
  Text.setEditConfig({
    editSize: 'size' // 使用对象
  })
  
}

// 更新视图区长宽
const setCanvasTransform = () => {
  if (!app) return
  const leaferStore = useLeaferStore()
  const { wrapperRef, zoom, scalePercentage } = storeToRefs(leaferStore)
  const { width, height } = useElementBounding(wrapperRef.value)
  const workspace = app.tree.findOne(`#${CanvasTypes.WorkSpaceDrawType}`)
  if (!width.value || !height.value) return
  if (!workspace.width || !workspace.height) return
  app.tree.zoom('fit', height.value / 10)
  zoom.value = app.tree.scale as number
}

const initCanvas = () => {
  const leaferStore = useLeaferStore()
  const { canvasRef, wrapperRef } = storeToRefs(leaferStore)
  if (!canvasRef.value) return
  if (!wrapperRef.value) return
  app = new App({ 
    view: canvasRef.value,
    editor: {}
  })
  app.tree = app.addLeafer()
  app.sky = app.addLeafer({ type: 'draw', usePartRender: false })

  app.editor = new Editor()
  app.sky.add(app.editor)

  // const frame = new Frame({ id: CanvasTypes.WorkSpaceDrawType, x: 100, y: 100, width: 1000, height: 618, fill: '#fff', draggable: false })
  // app.tree.add(frame)
}

// 初始化模板
const initTemplate = () => {
  if (!app) return
  const templatesStore = useTemplatesStore()
  const { currentTemplate } = storeToRefs(templatesStore)
  const frame = UI.one(currentTemplate.value)
  app.tree.add(frame)
  setCanvasTransform()
}

const initEvent = () => {
  if (!app) return
  const leaferStore = useLeaferStore()
  const { zoom } = storeToRefs(leaferStore)
  const templatesStore = useTemplatesStore()
  const workspace = app.tree.findOne(`#${CanvasTypes.WorkSpaceDrawType}`)
  if (!workspace) return
  workspace.on(ChildEvent.ADD, function (e: ChildEvent) { 
    console.log('ChildEvent.ADD:', e) // changed list
    templatesStore.modifedElement()
  })
  workspace.on(ChildEvent.REMOVE, function (e: ChildEvent) { 
    console.log('ChildEvent.REMOVE:', e) // changed list
    templatesStore.modifedElement()
  })
  app.tree.on(PropertyEvent.CHANGE, (e: PropertyEvent) => {
    console.log('PropertyEvent.CHANGE', e)
  })
  app.tree.on(DragEvent.END, (e: DragEvent) => { 
    console.log('DragEvent.END', e)
    templatesStore.modifedElement()
  })
  app.tree.on(RotateEvent.END, (e: RotateEvent) => { 
    console.log('RotateEvent.END', e)
    templatesStore.modifedElement()
  })
  app.tree.on(ZoomEvent.ZOOM, (e: ZoomEvent) => {
    if (!app) return
    zoom.value = app.tree.scale as number
  })
  app.tree.on(PointerEvent.DOWN, (e: PointerEvent) => {
    console.log(app?.editor.list)
  })
}

export const initEditor = () => {
  const leaferStore = useLeaferStore()
  const { wrapperRef } = storeToRefs(leaferStore)
  
  initCanvas()
  initConf()
  initTemplate()
  initEvent()
  const { width, height } = useElementBounding(wrapperRef.value)
  watch([width, height], () => {
    setCanvasTransform()
  })
}

export default (): [App] => [app as App]