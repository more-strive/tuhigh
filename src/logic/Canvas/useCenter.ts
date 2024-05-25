import useCanvas from "./useCanvas"
import { LeafList  } from 'leafer-ui'
import { WorkSpaceDrawType, WorkSpaceThumbType } from "@/configs/canvas"
import { CanvasElement } from "@/types/canvas"
import { Group, Point } from "fabric"

export default () => {
  const [ canvas ] = useCanvas()
  const workspace = canvas.tree.find('#workspace')[0]

  // const workSpaceDraw = canvas.getObjects().filter(item => (item as CanvasElement).id === WorkSpaceDrawType)[0] as CanvasElement
  // const objects = canvas.getObjects().filter(ele => !WorkSpaceThumbType.includes(ele.id))
  // const boundingBox = Group.prototype.getObjectsBoundingBox(objects)

  let left = 0, top = 0
  // let centerPoint = canvas.getCenterPoint()
  let width = canvas.width || 0, height = canvas.height || 0
  // if (boundingBox) {
  //   centerPoint = new Point(boundingBox.centerX, boundingBox.centerY)
  //   width = boundingBox.width, height = boundingBox.height
  //   left = boundingBox.centerX - boundingBox.width / 2
  //   top = boundingBox.centerY - boundingBox.height / 2
  // }
  if (workspace) {
    // centerPoint = new Point(workSpaceDraw.left + workSpaceDraw.width / 2, workSpaceDraw.top + workSpaceDraw.height / 2)
    width = workspace.width || 0, height = workspace.height || 0
    left = workspace.x || 0
    top = workspace.y || 0
  }
  
  console.log(width, height, left, top)
  return {
    workSpaceDraw: workspace,
    width,
    height,
    left,
    top,
  //   centerPoint
  }
}