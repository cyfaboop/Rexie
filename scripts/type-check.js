import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const createTypeCheckPlugin = (prod = false) => ({
    name: 'type-check',
    setup(build) {
        build.onStart(() => {
            try {
                const tsconfigPath = resolve(__dirname, '../tsconfig.json')
                execSync(`tsc --noEmit --project ${tsconfigPath}`, {
                    stdio: 'inherit',
                })
                console.log('✅ TypeScript 检查通过')
            } catch (err) {
                console.error('❌ TypeScript 检查失败')
                if (prod) {
                    console.error(err)
                    process.exit(1)
                }
            }
        })
    },
})
