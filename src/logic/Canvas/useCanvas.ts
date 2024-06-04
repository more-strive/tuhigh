/*
 * @Author: June
 * @Description: 
 * @Date: 2024-05-25 20:03:23
 * @LastEditors: June
 * @LastEditTime: 2024-05-25 23:20:28
 */
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Leafer, App, Rect, Frame, Text, defineKey } from 'leafer-ui'
import { useElementBounding } from '@vueuse/core'
import { isMobile } from '@/utils/common'
import { FabricCanvas } from '@/app/fabricCanvas'
import { useTemplatesStore, useLeaferStore } from '@/store'
import useCommon from './useCommon'
import useHammer from './useHammer'
import { Editor } from '@leafer-in/editor'
import { CanvasTypes } from '@/enums'

let app: null | App = null

// 初始化配置
const initConf = () => {
  Text.setEditConfig({
    editSize: 'size' // 使用对象
  })

  // Text.setEditConfig(function (text: Text) {
  //   return {  // 使用函数返回对象，可增加业务逻辑分流
  //     editSize: text.get('width') ? 'size' : 'scale'
  //   }
  // })
  
}

// 更新视图区长宽
const setCanvasTransform = () => {
  if (!app) return
  const leaferStore = useLeaferStore()
  const { wrapperRef } = storeToRefs(leaferStore)
  const { width, height } = useElementBounding(wrapperRef.value)
  // const background = app.ground.findOne('#background')
  const workspace = app.tree.findOne(`#${CanvasTypes.WorkSpaceDrawType}`)
  // background.set({width: width.value, height: height.value})
  if (!workspace.width) return
  if (!workspace.height) return
  workspace.set({x: width.value / 2 - workspace.width / 2, y: height.value / 2 - workspace.height / 2})
  // console.log(background)
}

const initCanvas = () => {
  const leaferStore = useLeaferStore()
  const { canvasRef, wrapperRef } = storeToRefs(leaferStore)
  if (!canvasRef.value) return
  if (!wrapperRef.value) return
  app = new App({ 
    view: canvasRef.value,
    
  })
  app.tree = app.addLeafer()
  app.sky = app.addLeafer({ type: 'draw', usePartRender: false })

  app.editor = new Editor()
  app.sky.add(app.editor)

  const frame = new Frame({ id: CanvasTypes.WorkSpaceDrawType, x: 100, y: 100, width: 1800, height: 1600, fill: '#fff', draggable: false })
  app.tree.add(frame)
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
  
  initCanvas()
  initConf()
  initTemplate()
  const { width, height } = useElementBounding(wrapperRef.value)
  watch([width, height], () => {
    setCanvasTransform()
  })
}

export default (): [App] => [app as App]