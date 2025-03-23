import esbuild from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'

import { createTypeCheckPlugin } from './type-check.js'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = require('../package.json')

esbuild
    .build({
        entryPoints: [resolve(__dirname, '../examples/index.tsx')],
        bundle: true,
        outdir: resolve(__dirname, '../dist'),
        format: 'iife',
        platform: 'browser',
        target: 'es2016',
        minify: true,
        sourcemap: true,
        // external: ['pixi.js'],
        define: {
            __DEV__: `false`,
            __VERSION__: `"${pkg.version}"`,
        },
        plugins: [createTypeCheckPlugin(true)],
    })
    .then(() => {
        console.log('✅ Production build completed')
    })
    .catch(() => process.exit(1))
