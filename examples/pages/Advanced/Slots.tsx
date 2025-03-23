import * as PIXI from 'pixi.js'
import { h, FC, memo, useRef, useEffect, useTransition } from 'rexie'

import { Loading } from 'examples/components/Loading'

export const Slots: FC<{
    screen: { width: number; height: number }
}> = memo(() => {
    const container = useRef<PIXI.Container>()
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        startTransition(async () => {
            await PIXI.Assets.load([
                'https://pixijs.com/assets/eggHead.png',
                'https://pixijs.com/assets/flowerTop.png',
                'https://pixijs.com/assets/helmlok.png',
                'https://pixijs.com/assets/skully.png',
            ])
        })
    }, [])

    return <container ref={container}>{isPending ? <Loading /> : undefined}</container>
})
