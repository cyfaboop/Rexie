import esbuild from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = require('../package.json')

const ctx = await esbuild.context({
    entryPoints: [resolve(__dirname, '../src/index.ts')],
    bundle: true,
    outdir: resolve(__dirname, '../dist'),
    format: 'esm',
    platform: 'browser',
    // external: ['pixi.js'],
    target: 'es2016',
    sourcemap: 'inline',
    define: {
        __DEV__: `true`,
        __VERSION__: `"${pkg.version}"`,
    },
    plugins: [
        {
            name: '_',
            setup(build) {
                build.onStart(() => {
                    process.stdout.write('\x1Bc')
                })

                build.onEnd(() => {
                    const now = new Date().toLocaleTimeString()
                    console.log(`✅ 开发环境打包完成 ${now}`)
                })
            },
        },
    ],
})

ctx.watch()
    .then(() => {
        console.log('👀 正在监听文件变化...')
    })
    .catch(err => {
        console.error('⚠️ 开发环境构建失败:')
        console.error(err)
        process.exit(1)
    })
