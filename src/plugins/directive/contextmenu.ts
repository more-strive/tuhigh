import { storeToRefs } from 'pinia'
import { useFabricStore } from '@/store'
import { Directive, createVNode, render, DirectiveBinding } from 'vue'
import useHandleElement from '@/hooks/useHandleElement'
import ContextmenuComponent from '@/components/ContextMenu/index.vue'

const checkElementClick = () => {
  const { elementHover } = storeToRefs(useFabricStore())
  const { selectElement } = useHandleElement()
  if (!elementHover.value) return
  selectElement(elementHover.value)
}


const contextmenuListener = (el: HTMLElement, event: MouseEvent, binding: DirectiveBinding) => {
  event.stopPropagation()
  event.preventDefault()
  checkElementClick()
  const menus = binding.value(el)
  if (!menus) return
  
  let container: HTMLDivElement | null = null

  // 移除右键菜单并取消相关的事件监听
  const removeContextmenu = () => {
    if (container) {
      document.body.removeChild(container)
      container = null
    }
    // el.classList.remove('contextmenu-active')
    document.body.removeEventListener('scroll', removeContextmenu)  
    window.removeEventListener('resize', removeContextmenu)
  }

  // 创建自定义菜单
  const options = {
    axis: { x: event.x, y: event.y },
    el,
    menus,
    removeContextmenu,
  }
  container = document.createElement('div')
  const vm = createVNode(ContextmenuComponent, options, null)
  render(vm, container)
  document.body.appendChild(container)

  // 为目标节点添加菜单激活状态的className
  // el.classList.add('contextmenu-active')

  // 页面变化时移除菜单
  document.body.addEventListener('scroll', removeContextmenu)
  window.addEventListener('resize', removeContextmenu)
}

const ContextmenuDirective: Directive = {
  mounted(el: HTMLElement, binding) {
    const handleDirective = (event: MouseEvent) => contextmenuListener(el, event, binding)
    el.addEventListener('contextmenu', handleDirective)
  },

  unmounted(el: HTMLElement, binding) {
    if (el) {
      const handleDirective = (event: MouseEvent) => contextmenuListener(el, event, binding)
      el.removeEventListener('contextmenu', handleDirective)
    }
  },
}

export default ContextmenuDirective