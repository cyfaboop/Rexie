import { AppContext } from 'examples/AppContext'
import { Loading } from '../../components/Loading'
import * as PIXI from 'pixi.js'
import {
    h,
    memo,
    useRef,
    useEffect,
    useTransition,
    useState,
    useContext,
} from 'rexie'

export const Container = memo(() => {
    const texture = useRef<PIXI.Texture>()
    const app = useContext(AppContext)
    const container = useRef<PIXI.Container>()
    const [bunnies, setBunnies] = useState<PIXI.PointData[]>([])
    const [isPending, startTransitioin] = useTransition()
    console.log(app)
    useEffect(() => {
        startTransitioin(async () => {
            texture.current = await PIXI.Assets.load(
                'https://pixijs.com/assets/bunny.png',
            )

            const arr: PIXI.PointData[] = []
            for (let i = 0; i < 25; i++) {
                arr.push({
                    x: (i % 5) * 40,
                    y: Math.floor(i / 5) * 40,
                })
            }
            setBunnies(arr)

            app?.ticker.add(time => {
                // Continuously rotate the container!
                // * use delta to create frame-independent transform *
                console.log
                if (container.current)
                    container.current.rotation -= 0.01 * time.deltaTime
            })
        })
    })

    return (
        <container ref={container}>
            {isPending ? (
                <Loading />
            ) : (
                bunnies.map(bunny => (
                    <sprite options={texture.current} x={bunny.x} y={bunny.y} />
                ))
            )}
        </container>
    )
})
