import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from "unplugin-vue-components/vite"
import {AntDesignVueResolver} from "unplugin-vue-components/resolvers";
import * as path from "path";
import mkcert from "vite-plugin-mkcert";

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
        https: true,
        host: "0.0.0.0",
        port: 9981
    },
    base:"./",
    resolve: {
        alias: {
            '~': path.resolve(__dirname, '/src'),
        },
    },
})
