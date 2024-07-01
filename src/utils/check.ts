

// 类型工具

const isActiveSelection = (thing: unknown): thing is ActiveSelection => {
  return false
}


const isGroup = (thing?: unknown): thing is Group => {
  return false
}

const isCollection = (thing?: unknown): thing is Group | ActiveSelection | Canvas => {
  return false
}

/**
 * 判断是否为原生组
 * @param thing
 * @returns NativeGroup | Group | Board
 */
const isNativeGroup = (thing?: unknown): thing is NativeGroup => {
  return false
}

const isGradient = (thing: unknown): thing is Gradient<'linear' | 'radial'> => {
  return false
}

const isPattern = (thing: unknown): thing is Pattern => {
  return false
}

const isTextObject = (thing?: FabricObject): thing is Text => {
  return false
}

// const isFiller = (filler: TFiller | string | null): filler is TFiller => {
//     return !!filler && (filler as TFiller).toLive !== undefined
// }

// const isSerializableFiller = (filler: TFiller | string | null): filler is TFiller => {
//     return !!filler && typeof (filler as TFiller).toObject === 'function'
// }

export const check = {
  isCollection,
  isGradient,
  isPattern,
  isActiveSelection,
  isTextObject,
  isGroup,
  isNativeGroup,
  // isFiller,
  // isSerializableFiller,
}
