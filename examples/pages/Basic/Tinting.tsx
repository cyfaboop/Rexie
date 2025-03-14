import * as PIXI from 'pixi.js'
import { h, memo, useRef, useEffect, useTransition, FC } from 'rexie'

import { Loading } from '../../components/Loading'

export const Tinting: FC<{
    screen: { width: number; height: number }
}> = memo(({ screen }) => {
    const texture = useRef<PIXI.Texture>()
    const container = useRef<PIXI.Container>()
    const [isPending, startTransitioin] = useTransition()

    useEffect(() => {
        startTransitioin(async () => {
            texture.current = await PIXI.Assets.load(
                'https://pixijs.com/assets/eggHead.png',
            )
        })

        return () => {}
    }, [])

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
