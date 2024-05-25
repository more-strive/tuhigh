<template>
  <div ref="wrapper">
    <input type="file" @change="getSvgContent">
    
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { Leafer, Path } from 'leafer-ui'
import { loadSVGFromString } from '@/extension/parser/loadSVGFromString'
const canvasRef = ref<HtmlCanvasElement | null>()
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
</script>

<style scoped>
.background-grid {
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