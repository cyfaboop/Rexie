import * as PIXI from 'pixi.js'
import {
    h,
    memo,
    useRef,
    useEffect,
    useTransition,
    FC,
    useContext,
    useMemo,
} from 'rexie'

import { Loading } from '../../components/Loading'
import { AppContext } from 'examples'

export const Particle: FC<{
    screen: { width: number; height: number }
}> = memo(({ screen }) => {
    const texture = useRef<PIXI.Texture>()
    const app = useContext(AppContext)
    const dudes = useRef<PIXI.Sprite[]>([])
    const tick = useRef(0)
    const container = useRef<PIXI.Container>()
    const dudeBounds = useMemo(() => {
        const dudeBoundsPadding = 100
        return new PIXI.Rectangle(
            -dudeBoundsPadding,
            -dudeBoundsPadding,
            screen.width + dudeBoundsPadding * 2,
            screen.height + dudeBoundsPadding * 2,
        )
    })
    const [isPending, startTransitioin] = useTransition()
    useEffect(() => {
        startTransitioin(async () => {
            texture.current = await PIXI.Assets.load(
                'https://pixijs.com/assets/maggot_tiny.png',
            )
        })
    }, [])

    useEffect(() => {
        if (!container.current || !texture.current) return
        const totalSprites = 10000
        for (let i = 0; i < totalSprites; i++) {
            const dude = new PIXI.Sprite(texture.current)
            dude.anchor.set(0.5)
            dude.scale.set(0.8 + Math.random() * 0.3)
            dude.x = Math.random() * app.screen.width
            dude.y = Math.random() * app.screen.height
            dude.tint = Math.random() * 0x808080
            dude.rotation = Math.random() * Math.PI * 2
            dudes.current.push(dude)
            container.current.addChild(dude)
        }

        const animate = () => {
            for (let i = 0; i < dudes.current.length; i++) {
                const dude = dudes.current[i]
                dude.scale.y = 0.95 + Math.sin(tick.current) * 0.05
                dude.rotation += 0.01
                dude.x += Math.sin(dude.rotation) * dude.scale.y
                dude.y += Math.cos(dude.rotation) * dude.scale.y

                // Wrap the maggots
                if (dude.x < dudeBounds.x) {
                    dude.x += dudeBounds.width
                } else if (dude.x > dudeBounds.x + dudeBounds.width) {
                    dude.x -= dudeBounds.width
                }

                if (dude.y < dudeBounds.y) {
                    dude.y += dudeBounds.height
                } else if (dude.y > dudeBounds.y + dudeBounds.height) {
                    dude.y -= dudeBounds.height
                }

                tick.current += 1
            }
        }

        app.ticker.add(animate)
        return () => {
            app.ticker.remove(animate)
            tick.current = 0
        }
    }, [texture.current, container.current])

    return (
        <container>
            {isPending ? <Loading /> : <container ref={container} />}
        </container>
    )
})
