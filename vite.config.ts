import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import type { ConfigEnv, UserConfigExport } from "vite";

import path from "path";
import vue from "@vitejs/plugin-vue";
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import tailwindcss from  'tailwindcss'


export default ({ command }: ConfigEnv): UserConfigExport => {
  return {
    base: "./", // publicPath
    server: {
      host: 'localhost',
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8789',
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp('^'), ''),
        },
        '/static': {
          // target: 'http://127.0.0.1:8789',
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp('^'), ''),
        },
        '/yft-static': {
          // target: 'http://127.0.0.1:8789',
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp('^'), ''),
        },
      },
    },
    plugins: [                                                                                                                                                                                                                            
      vue(),


      AutoImport({
        imports: ['vue'],
        dts: './src/types/auto-imports.d.ts',
        eslintrc: {
          enabled: true
        },
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),

    ],
    css: {
      postcss: {
        plugins: [
          tailwindcss,
        ]
      },
      // preprocessorOptions: {
      //   scss: {
      //     additionalData: `@import "src/assets/style/variable.scss";@import "src/assets/style/mixin.scss";`,
      //   },
      //   less: {
      //     modifyVars: {
      //       "primary-color": "#d14424",
      //       "text-color": "#41464b",
      //       "font-size-base": "13px",
      //       "border-radius-base": "2px",
      //     },
      //     javascriptEnabled: true,
      //   },
      // },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      extensions: [".js", ".ts", ".jsx", ".tsx", ".vue", ".json"],
    },
    build: {
      target: "es2015",
      outDir: path.resolve(__dirname, "dist"),
      minify: "terser",
      terserOptions: {
        compress: {
          //生产环境时移除console
          drop_console: true,
          drop_debugger: true,
        },
      },
      // 关闭文件计算
      reportCompressedSize: false,
      // 关闭生成map文件
      sourcemap: false,
      rollupOptions: {
        output: {
          // chunkFileNames: 'js/[name]-[hash].js',  // 引入文件名的名称
          // entryFileNames: 'js/[name]-[hash].js',  // 包的入口文件名称
          // assetFileNames: '[ext]/[name]-[hash].[ext]', // 资源文件像 字体，图片等
          manualChunks: {
            vue: ['vue'],
            'lodash-es': ['lodash-es'],
            'element-plus': ['element-plus'],
          },
        }
      }
    },
  };
};
