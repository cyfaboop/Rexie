import * as PIXI from 'pixi.js'
import {
    h,
    memo,
    useRef,
    useEffect,
    useTransition,
    useContext,
    useCallback,
    FC,
} from 'rexie'

import { AppContext } from 'examples'
import { Loading } from '../../components/Loading'

export const Tinting: FC<{
    screen: { width: number; height: number }
}> = memo(({ screen }) => {
    const app = useContext(AppContext)
    const texture = useRef<PIXI.Texture>()
    const container = useRef<PIXI.Container>()
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
                'https://pixijs.com/assets/eggHead.png',
            )
            app?.ticker.add(animate)
        })

        return () => {
            app?.ticker.remove(animate)
        }
    }, [])

    useEffect(() => {
        if (!container.current) return
        container.current.pivot.x = container.current.width / 2
        container.current.pivot.y = container.current.height / 2
    }, [container.current])

    return (
        <container>
            <container ref={container}>
                {isPending ? (
                    <Loading />
                ) : (
                    new Array(20)
                        .fill(null)
                        .map(_ => (
                            <sprite
                                options={texture.current}
                                anchor={0.5}
                                scale={0.8 + Math.random() * 0.3}
                                x={Math.random() * screen.width}
                                y={Math.random() * screen.height}
                                tint={Math.random() * 0xffffff}
                                rotation={Math.random() * Math.PI * 2}
                            />
                        ))
                )}
            </container>
        </container>
    )
})
