<template>
  <div ref="wrapper">
    <input type="file" @change="getSvgContent">
    <canvas ref="canvasRef" class="background-grid"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { Leafer } from 'leafer-ui'
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
  }
  reader.readAsText(file)
}

onMounted(() => {
  leaferCanvas.value = new Leafer({
    view: canvasRef.value, // 支持 window 、div、canvas 标签对象， 可使用id字符串(不用加 # 号)
    width: 1200, // 不能设置为 0， 否则会变成自动布局
    height: 600,
  })
})
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