import { CanvasElement, TextboxElement } from '@/types/canvas'
import { ElementNames } from '@/types/elements'
import useCommon from '@/views/Canvas/useCommon'
import { defineStore } from 'pinia'
import { useMainStore } from './main'

export interface KeyboardState {
  ctrlKeyState: boolean
  shiftKeyState: boolean
  spaceKeyState: boolean
}

export const useKeyboardStore = defineStore('keyboard', {
  state: (): KeyboardState => ({
    ctrlKeyState: false, // ctrl键按下状态
    shiftKeyState: false, // shift键按下状态
    spaceKeyState: false, // space键按下状态
  }),

  getters: {
    ctrlOrShiftKeyActive(state) {
      return state.ctrlKeyState || state.shiftKeyState
    },
  },

  actions: {
    setCtrlKeyState(active: boolean) {
      this.ctrlKeyState = active
    },
    setShiftKeyState(active: boolean) {
      this.shiftKeyState = active
    },
    setSpaceKeyState(active: boolean) {
      this.spaceKeyState = active
    }
  },
})