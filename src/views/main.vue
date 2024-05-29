<template>
  <div ref="wrapper">
    <input type="file" @change="getSvgContent">
    <canvas ref="canvasRef" class="background-grid" height="600"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { Leafer, Path, Text, App, Rect } from 'leafer-ui'
import { loadSVGFromString } from '@/extension/parser/loadSVGFromString'
import { Editor } from '@leafer-in/editor'
import '@leafer-in/view'
const canvasRef = ref<HTMLCanvasElement | null>(null)
const leaferCanvas = ref()

const getSvgContent = (event) => {
  const file = event.target.files[0]
  
  const reader = new FileReader()
  reader.onload = async (event) => {
    const fileContent = event.target.result
    // console.log('fileContent:', fileContent)
    const content = await loadSVGFromString(fileContent)
    console.log('content:', content)
    content.objects.forEach(ele => {
      if (ele.type.toLowerCase() === 'path') {
        let d = ''
        for (let i = 0; i < ele.path.length; i++ ) {
          d += ele.path[i].join(' ')
        }
        const path = new Path({ 
          x: ele.left,
          y: ele.top,
          scaleX: ele.flipX ? -ele.scaleX : ele.scaleX,
          scaleY: ele.flipY ? -ele.scaleY : ele.scaleY,
          path: d,
          fill: ele.fill
        })
        leaferCanvas.value.add(path)
      }
      
    })
  }
  reader.readAsText(file)
}
onMounted(() => {
  if (!canvasRef.value) return
  // leaferCanvas.value = new Leafer({
  //   view: canvasRef.value,
  //   height: 800,
  //   width: 1200
  // })
  const app = new App({ view: canvasRef.value, height: 600, width: 1600 }) 

  app.tree = app.addLeafer()
  app.sky = app.addLeafer({ type: 'draw', usePartRender: false })

  app.editor = new Editor()
  app.sky.add(app.editor)

  app.tree.add(Rect.one({ editable: true, fill: '#FEB027', cornerRadius: [20, 0, 0, 20] }, 100, 100))
  app.tree.add(Rect.one({ editable: true, fill: '#FFE04B', cornerRadius: [0, 20, 20, 0] }, 300, 100))

  const text = new Text({
    id: 'text1',
    x: 100,
    y: 200,
    fontSize: 16,
    fontWeight: "normal",
    opacity: 1,
    textAlign: "center",
    text: '双击修改文字',
    editable: true,
    // lineHeight: 1,
    // lineHeight: {
    //   type: 'percent',
    //   value: 1,
    // }
  })
  leaferCanvas.value.add(text)
})
</script>

<style scoped>
.background-grid {
  margin: 0 auto;
  --offsetX: 0px;
  --offsetY: 0px;
  --size: 8px;
  --color: #dedcdc;
  background-image: 
    linear-gradient(45deg, var(--color) 25%, transparent 0, transparent 75%, var(--color) 0), 
    linear-gradient(45deg, var(--color) 25%, transparent 0, transparent 75%, var(--color) 0);
  background-position: var(--offsetX) var(--offsetY), calc(var(--size) + var(--offsetX)) calc(var(--size) + var(--offsetY));
  background-size: calc(var(--size) * 2) calc(var(--size) * 2);
}
</style>