import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
    if (command === "build") {
        return {
            mode: "production",
            build: {
                rollupOptions: {
                    input: {
                        main: resolve(__dirname, 'index.html'),
                        board: resolve(__dirname, 'board/index.html'),
                        admin: resolve(__dirname, 'admin/index.html'),
                        error: resolve(__dirname, 'error/index.html')
                    }
                }
            }
        }
    } else {
        return {
            mode: "development"
        }
    }
})