import * as PIXI from 'pixi.js'
import {
    h,
    FC,
    memo,
    useRef,
    useEffect,
    useTransition,
    useContext,
} from 'rexie'

import { AppContext } from 'examples'
import { Loading } from 'examples/components/Loading'

export const RenderGroup: FC<{
    screen: { width: number; height: number }
}> = memo(({ screen }) => {
    const app = useContext(AppContext)
    const treeTexture = useRef<PIXI.Texture>()
    const container = useRef<PIXI.Container>()
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        startTransition(async () => {
            treeTexture.current = await PIXI.Assets.load(
                `https://pixijs.com/assets/tree.png`,
            )
        })
    }, [])

    useEffect(() => {
        if (!treeTexture.current || !container.current) return
        const worldSize = 5000
        for (let i = 0; i < 100000; i++) {
            const yPos = Math.random() * worldSize

            const tree = new PIXI.Sprite({
                texture: treeTexture.current,
                x: Math.random() * worldSize,
                y: yPos,
                scale: 0.25,
                anchor: 0.5,
            })

            container.current.addChild(tree)
        }

        container.current.children.sort((a, b) => a.position.y - b.position.y)

        let x = 0
        let y = 0

        const move = (e: MouseEvent) => {
            x = e.clientX
            y = e.clientY
        }

        app.canvas.addEventListener('mousemove', move)

        const animate = () => {
            if (!container.current) return
            const screenWidth = screen.width
            const screenHeight = screen.height

            const targetX = (x / screenWidth) * (worldSize - screenWidth)
            const targetY = (y / screenHeight) * (worldSize - screenHeight)

            container.current.x += (-targetX - container.current.x) * 0.1
            container.current.y += (-targetY - container.current.y) * 0.1
        }

        app.ticker.add(animate)
        return () => {
            app.ticker.remove(animate)
            app.canvas.removeEventListener('mousemove', move)
        }
    }, [treeTexture.current, container.current])

    return (
        <container ref={container} isRenderGroup={true}>
            {isPending ? <Loading /> : undefined}
        </container>
    )
})
