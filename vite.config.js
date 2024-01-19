import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from "vite-plugin-mkcert";
import Components from "unplugin-vue-components/vite"
import {AntDesignVueResolver} from "unplugin-vue-components/resolvers";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        mkcert(),
        Components({
            resolvers: [
                AntDesignVueResolver({
                    importStyle: false, // css in js
                }),
            ],
        }),
    ],
    server: {
        https: true
    },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, '/src'),
        },
    },
})
