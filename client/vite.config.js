import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
    if (mode === 'production') {
        return {
            mode: 'production',
            build: {
                rollupOptions: {
                    input: {
                        main: resolve(__dirname, 'index.html'),
                        board: resolve(__dirname, 'board/index.html'),
                        admin: resolve(__dirname, 'admin/index.html'),
                        error: resolve(__dirname, 'error/index.html')
                    }
                }
            },
            envDir: './env'
        }
    } else {
        return {
            mode: 'development',
            build: {
                rollupOptions: {
                    input: {
                        main: resolve(__dirname, 'index.html'),
                        board: resolve(__dirname, 'board/index.html'),
                        admin: resolve(__dirname, 'admin/index.html'),
                        error: resolve(__dirname, 'error/index.html')
                    }
                }
            },
            envDir: './env'
        }
    }
})