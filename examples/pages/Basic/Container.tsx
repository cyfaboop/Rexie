import * as PIXI from 'pixi.js'
import {
    h,
    memo,
    useRef,
    useEffect,
    useTransition,
    useState,
    useContext,
    FC,
    useCallback,
} from 'rexie'

import { AppContext } from 'examples'
import { Loading } from '../../components/Loading'

export const Container: FC<{
    screen: { width: number; height: number }
}> = memo(({ screen }) => {
    const texture = useRef<PIXI.Texture>()
    const app = useContext(AppContext)
    const container = useRef<PIXI.Container>()
    const [bunnies, setBunnies] = useState<PIXI.PointData[]>([])
    const [isPending, startTransitioin] = useTransition()
    const animate = useCallback(
        (time: PIXI.Ticker) => {
            // Continuously rotate the container!
            // * use delta to create frame-independent transform *
            if (container.current) {
                container.current.rotation -= 0.01 * time.deltaTime
                container.current.pivot
            }
        },
        [container.current],
    )

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
            app.ticker.add(animate)
        })

        return () => {
            app.ticker.remove(animate)
        }
    }, [])

    useEffect(() => {
        if (container.current) {
            container.current.pivot.x = container.current.width / 2
            container.current.pivot.y = container.current.height / 2
        }
    }, [bunnies])

    return (
        <container x={screen.width / 2} y={200}>
            <container ref={container}>
                {isPending ? (
                    <Loading />
                ) : (
                    bunnies.map(bunny => (
                        <sprite
                            options={texture.current}
                            x={bunny.x}
                            y={bunny.y}
                        />
                    ))
                )}
            </container>
        </container>
    )
})
