import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from './router'; 
import { setupI18n } from '@/plugins/i18n'

import 'element-plus/dist/index.css'
import "@icon-park/vue-next/styles/index.css"
import "@/assets/style/global.scss"
import "@/assets/style/font.scss"
import "@/assets/style/element-plus.scss"
import "@/assets/style/tailwindcss.scss"

import SvgIcon from "@/icons"
import Icon from "@/plugins/icon"
import Component from "@/plugins/component"
import Directive from "@/plugins/directive"

import "virtual:svg-icons-register"
// import { useRegisterSW } from 'virtual:pwa-register/vue'
// useRegisterSW()

async function start() {
  const app = createApp(App);
  await setupI18n(app)
  app.use(router);
  app.use(createPinia());
  app.use(Icon);
  app.use(SvgIcon);
  app.use(Component);
  app.use(Directive);
  // 当路由准备好时再执行挂载
  await router.isReady();
  app.mount("#app");
}

start()
