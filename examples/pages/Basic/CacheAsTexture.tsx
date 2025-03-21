import { AppContext } from 'examples'
import { Loading } from 'examples/components/Loading'
import * as PIXI from 'pixi.js'
import {
    h,
    FC,
    memo,
    useRef,
    useEffect,
    useTransition,
    useContext,
    useCallback,
} from 'rexie'

const alienFrames = [
    'eggHead.png',
    'flowerTop.png',
    'helmlok.png',
    'skully.png',
]

export const CacheAsTexture: FC<{
    screen: { width: number; height: number }
}> = memo(() => {
    const app = useContext(AppContext)

    const container = useRef<PIXI.Container>()
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        startTransition(async () => {
            await PIXI.Assets.load(
                'https://pixijs.com/assets/spritesheet/monsters.json',
            )
        })
    }, [])

    useEffect(() => {
        if (isPending) return
        if (!container.current) return
        container.current.x = app.screen.width / 2
        container.current.y = app.screen.height / 2
        const aliens: PIXI.Sprite[] = []

        for (let i = 0; i < 100; i++) {
            const frameName = alienFrames[i % 4]

            const alien = PIXI.Sprite.from(frameName)

            alien.tint = Math.random() * 0xffffff

            alien.x = Math.random() * app.screen.width - app.screen.width / 2
            alien.y = Math.random() * app.screen.height - app.screen.height / 2
            alien.anchor.x = 0.5
            alien.anchor.y = 0.5
            aliens.push(alien)
            container.current.addChild(alien)
        }

        let count = 0
        const animate = () => {
            if (!container.current) return
            for (let i = 0; i < 100; i++) {
                const alien = aliens[i]

                alien.rotation += 0.1
            }

            count += 0.01

            container.current.scale.x = Math.sin(count)
            container.current.scale.y = Math.sin(count)
            container.current.rotation += 0.01
        }

        app.ticker.add(animate)
        return () => {
            app.ticker.remove(animate)
        }
    }, [isPending])

    const onClick = useCallback(() => {
        container.current?.cacheAsTexture(container.current.isCachedAsTexture)
    }, [])

    return (
        <container onPointertap={onClick} ref={container}>
            {isPending ? <Loading /> : undefined}
        </container>
    )
})
