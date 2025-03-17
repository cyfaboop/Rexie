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

export const BlendModes: FC<{
    screen: { width: number; height: number }
}> = memo(() => {
    const app = useContext(AppContext)
    const pandaTexture = useRef<PIXI.Texture>()
    const rainbowGradient = useRef<PIXI.Texture>()
    const allBlendModes = useMemo<PIXI.BLEND_MODES[]>(() => [
        'normal',
        'add',
        'screen',
        'darken',
        'lighten',
        'color-dodge',
        'color-burn',
        'linear-burn',
        'linear-dodge',
        'linear-light',
        'hard-light',
        'soft-light',
        'pin-light',
        'difference',
        'exclusion',
        'overlay',
        'saturation',
        'color',
        'luminosity',
        'add-npm',
        'subtract',
        'divide',
        'vivid-light',
        'hard-mix',
        'negation',
    ])
    const size = 800 / 5
    const wrapper = useRef<PIXI.Container>()
    const pandas = useRef<PIXI.Sprite[]>([])
    const [isPending, startTransitioin] = useTransition()
    useEffect(() => {
        startTransitioin(async () => {
            pandaTexture.current = await PIXI.Assets.load(
                'https://pixijs.com/assets/panda.png',
            )
            rainbowGradient.current = await PIXI.Assets.load(
                'https://pixijs.com/assets/rainbow-gradient.png',
            )
        })
    }, [])

    useEffect(() => {
        if (
            !rainbowGradient.current ||
            !pandaTexture.current ||
            !wrapper.current
        )
            return

        for (let i = 0; i < allBlendModes.length; i++) {
            const container = new PIXI.Container()

            const sprite = new PIXI.Sprite({
                texture: pandaTexture.current,
                width: 100,
                height: 100,
                anchor: 0.5,
                position: { x: size / 2, y: size / 2 },
            })

            pandas.current.push(sprite)

            const sprite2 = new PIXI.Sprite({
                texture: rainbowGradient.current,
                width: size,
                height: size,
                blendMode: allBlendModes[i],
            })

            container.addChild(sprite, sprite2)

            const text = new PIXI.Text({
                text: allBlendModes[i],
                style: {
                    fontSize: 16,
                    fontFamily: 'short-stack',
                },
            })

            text.x = size / 2 - text.width / 2
            text.y = size - text.height
            const textBackground = new PIXI.Sprite(PIXI.Texture.WHITE)

            textBackground.x = text.x - 2
            textBackground.y = text.y
            textBackground.width = text.width + 4
            textBackground.height = text.height + 4
            container.addChild(textBackground, text)
            wrapper.current.addChild(container)
            container.x = (i % 5) * size
            container.y = Math.floor(i / 5) * size
        }

        const animate = () => {
            pandas.current.forEach((panda, i) => {
                panda.rotation += 0.01 * (i % 2 ? 1 : -1)
            })
        }

        app.ticker.add(animate)
        return () => {
            app.ticker.remove(animate)
        }
    }, [rainbowGradient.current, pandaTexture.current, wrapper.current])

    return (
        <container>
            {isPending ? <Loading /> : <container ref={wrapper} />}
        </container>
    )
})
