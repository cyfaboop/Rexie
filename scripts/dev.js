import esbuild from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = require('../package.json')

const ctx = await esbuild.context({
    entryPoints: [resolve(__dirname, '../examples/index.tsx')],
    bundle: true,
    outdir: resolve(__dirname, '../dist'),
    format: 'iife',
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
                    console.log(`✅ Development build completed at ${now}`)
                })
            },
        },
    ],
})

ctx.watch()
    .then(() => {
        console.log('👀 Watching for file changes...')
    })
    .catch(err => {
        console.error('⚠️ Development build failed: ')
        console.error(err)
        process.exit(1)
    })
