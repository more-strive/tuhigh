import { createApp } from 'vue'

import ElementPlus from 'element-plus'
import './style.css'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)

app.use(ElementPlus)
app.mount('#app')
createApp(App).mount('#app')
