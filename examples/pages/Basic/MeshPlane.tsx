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
} from 'rexie'

export const MeshPlane: FC<{
    screen: { width: number; height: number }
}> = memo(() => {
    const app = useContext(AppContext)
    const plane = useRef<PIXI.MeshPlane>()
    const container = useRef<PIXI.Container>()
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        startTransition(async () => {
            const texture = await PIXI.Assets.load(
                'https://pixijs.com/assets/bg_grass.jpg',
            )
            plane.current = new PIXI.MeshPlane({
                texture,
                verticesX: 10,
                verticesY: 10,
            })
            plane.current.x = 100
            plane.current.y = 100
        })
    }, [])

    useEffect(() => {
        if (!plane.current || !container.current) return
        container.current.addChild(plane.current)

        const { buffer } = plane.current.geometry.getAttribute('aPosition')
        let timer = 0
        const animate = () => {
            // Randomize the vertice positions a bit to create movement.
            for (let i = 0; i < buffer.data.length; i++) {
                buffer.data[i] += Math.sin(timer / 10 + i) * 0.5
            }
            buffer.update()
            timer++
        }

        app.ticker.add(animate)
        return () => {
            app.ticker.remove(animate)
        }
    }, [isPending])

    return (
        <container ref={container}>
            {isPending ? <Loading /> : undefined}
        </container>
    )
})
