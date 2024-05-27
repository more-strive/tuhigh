/*
 * @Author: June
 * @Description: 
 * @Date: 2024-05-25 20:03:23
 * @LastEditors: June
 * @LastEditTime: 2024-05-25 23:20:38
 */
import useCanvas from "./useCanvas"
import { LeafList  } from 'leafer-ui'
import { WorkSpaceDrawType, WorkSpaceThumbType } from "@/configs/canvas"
import { CanvasElement } from "@/types/canvas"
import { Group, Point } from "fabric"
import { CanvasTypes } from '@/enums'

export default () => {
  const [ canvas ] = useCanvas()
  const workspace = canvas.tree.findOne(`#${CanvasTypes.WorkSpaceDrawType}`)
  let left = 0, top = 0
  let width = canvas.width || 0, height = canvas.height || 0
  const centerPoint = {x: 0, y: 0}
  if (workspace) {
    width = workspace.width || 0, height = workspace.height || 0
    left = workspace.x || 0
    top = workspace.y || 0
    centerPoint.x = left + width / 2
    centerPoint.y = top + height / 2
  }
  
  console.log(width, height, left, top)
  return {
    workSpaceDraw: workspace,
    width,
    height,
    left,
    top,
    centerPoint
  }
}