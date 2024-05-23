import Dexie from "dexie"
import { LocalStorageDiscardedKey } from "@/configs/canvas"
import { databaseId } from '@/store'
import { Template } from "@/types/canvas"


export interface WritingBoardImg {
  id: string
  dataURL: string
}

export interface Snapshot {
  index: number
  templates: Template[]
}

const DatabaseNamePrefix = 'YFT'
// 删除失效/过期的数据库
// 应用关闭时（关闭或刷新浏览器），会将其数据库ID记录在 localStorage 中，表示该ID指向的数据库已失效
// 当应用初始化时，检查当前所有数据库，将被记录失效的数据库删除
// 另外，距离初始化时间超过12小时的数据库也将被删除（这是为了防止出现因意外未被正确删除的库）
export const deleteDiscardedDB = async () => {
  const now = new Date().getTime()

  const localStorageDiscardedDB = localStorage.getItem(LocalStorageDiscardedKey)
  const localStorageDiscardedDBList: string[] = localStorageDiscardedDB ? JSON.parse(localStorageDiscardedDB) : []

  const databaseNames = await Dexie.getDatabaseNames()
  const discardedDBNames = databaseNames.filter(name => {
    if (name.indexOf(DatabaseNamePrefix) === -1) return false
    
    const [prefix, id, time] = name.split('_')
    if (prefix !== DatabaseNamePrefix || !id || !time) return true
    if (localStorageDiscardedDBList.includes(id)) return true
    if (now - (+time) >= 1000 * 60 * 60 * 12) return true

    return false
  })

  for (const name of discardedDBNames) Dexie.delete(name)
  localStorage.removeItem(LocalStorageDiscardedKey)
}

class DrawDB extends Dexie {
  public snapshots: Dexie.Table<Snapshot, number>
  public writingBoardImgs: Dexie.Table<WritingBoardImg, number>

  public constructor() {
    super(`${DatabaseNamePrefix}_${databaseId}_${new Date().getTime()}`)
    this.version(1).stores({
      snapshots: '++id',
      writingBoardImgs: '++id',
    })
    this.snapshots = this.table('snapshots')
    this.writingBoardImgs = this.table('writingBoardImgs')
  }
}

export const db = new DrawDB()