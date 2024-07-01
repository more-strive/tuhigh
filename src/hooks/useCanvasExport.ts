
import { ref } from 'vue'
import { saveAs } from 'file-saver'
import { storeToRefs } from 'pinia'
import { useFabricStore, useTemplatesStore } from '@/store'
import { WorkSpaceThumbType, WorkSpaceClipType, WorkSpaceCommonType, WorkSpaceSafeType, propertiesToInclude } from '@/configs/canvas'
import { ImageFormat } from 'fabric'
import { downloadSVGFile, downloadLinkFile } from '@/utils/download'
import { changeDpiDataUrl } from 'changedpi'
import useCanvas from '@/logic/Canvas/useCanvas'
import useCenter from '@/logic/Canvas/useCenter'
import { exportFile } from '@/api/file'
import { Base64 } from 'js-base64'
import { ElementNames } from '@/types/elements'
import { CanvasTypes } from '@/enums'
import { toDataURL } from '../extension/util/misc/dom';

export default () => {
  
  const Exporting = ref(false)
  const { showClip, showSafe } = storeToRefs(useFabricStore())
  const { currentTemplate } = storeToRefs(useTemplatesStore())
  // 导出图片
  const exportImage = async (format: ImageFormat, quality: number, dpi: number, ignoreClip = true) => {
    Exporting.value = true
    const [ canvas ] = useCanvas()
    const workspace = canvas.tree.findOne(`#${CanvasTypes.WorkSpaceDrawType}`)
    const exportData = await workspace.export(format)
    console.log('exportData:', exportData)
   
    const result = changeDpiDataUrl(exportData.data, dpi)
    saveAs(result, `tuhigh-${Date.now()}.${format}`)
    Exporting.value = false
  }

  const getSVGData = () => {
    const [ canvas ] = useCanvas()
    const workspace = canvas.tree.findOne(`#${CanvasTypes.WorkSpaceDrawType}`)
    const result = workspace.toJSON()
    return result
  }

  const getJSONData = () => {
    const [ canvas ] = useCanvas()
    const workspace = canvas.tree.findOne(`#${CanvasTypes.WorkSpaceDrawType}`)
    const result = workspace.toJSON()
    return result
  }

  const exportSVG = () => {
    const [ canvas ] = useCanvas()
    const workspace = canvas.tree.findOne(`#${CanvasTypes.WorkSpaceDrawType}`)
    // const result = workspace.toSVG()
    // return result
  }

  // 导出PDF
  const exportPDF = async () => {
    convertFile('pdf')
  }

  // 导出PSD
  const exportPSD = async () => {
    convertFile('psd')
  }

  const convertFile = async (filetype: string) => {
    const content = {
      data: Base64.encode(getSVGData()),
      filetype,
      width: currentTemplate.value.width / currentTemplate.value.zoom,
      height: currentTemplate.value.height / currentTemplate.value.zoom,
    }
    const result = await exportFile(content)
    if (result && result.data.link) {
      downloadLinkFile(result.data.link, `tuhigh-${Date.now()}.${filetype}`)
    }
  }

  // 导出json
  const exportJSON = () => {
    const serializer = getJSONData()
    const blob = new Blob([JSON.stringify(serializer)])
    saveAs(blob, `tuhigh-${Date.now()}.json`)
  }

  return {
    exportImage,
    exportPDF,
    exportPSD,
    exportJSON,
    exportSVG,
    getJSONData,
    getSVGData,
    Exporting
  }
}