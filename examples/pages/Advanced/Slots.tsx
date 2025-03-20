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

export const Slots: FC<{
    screen: { width: number; height: number }
}> = memo(({ screen }) => {
    const app = useContext(AppContext)
    const reels = useRef<
        {
            container: PIXI.Container
            symbols: PIXI.Sprite[]
            position: number
            previousPosition: number
            blur: PIXI.BlurFilter
        }[]
    >([])
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

    useEffect(() => {
        if (!reels.current || !container.current) return

        const REEL_WIDTH = 160
        const SYMBOL_SIZE = 150

        const slotTextures = [
            PIXI.Texture.from('https://pixijs.com/assets/eggHead.png'),
            PIXI.Texture.from('https://pixijs.com/assets/flowerTop.png'),
            PIXI.Texture.from('https://pixijs.com/assets/helmlok.png'),
            PIXI.Texture.from('https://pixijs.com/assets/skully.png'),
        ]

        for (let i = 0; i < 5; i++) {
            const rc = new PIXI.Container()

            rc.x = i * REEL_WIDTH
            container.current.addChild(rc)

            const reel = {
                container: rc,
                symbols: [] as PIXI.Sprite[],
                position: 0,
                previousPosition: 0,
                blur: new PIXI.BlurFilter(),
            }

            reel.blur.blurX = 0
            reel.blur.blurY = 0
            rc.filters = [reel.blur]

            // Build the symbols
            for (let j = 0; j < 4; j++) {
                const symbol = new PIXI.Sprite(
                    slotTextures[
                        Math.floor(Math.random() * slotTextures.length)
                    ],
                )
                // Scale the symbol to fit symbol area.

                symbol.y = j * SYMBOL_SIZE
                symbol.scale.x = symbol.scale.y = Math.min(
                    SYMBOL_SIZE / symbol.width,
                    SYMBOL_SIZE / symbol.height,
                )
                symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2)
                reel.symbols.push(symbol)
                rc.addChild(symbol)
            }
            reels.current.push(reel)

            const margin = (screen.height - SYMBOL_SIZE * 3) / 2

            container.current.y = margin
            container.current.x = Math.round(screen.width - REEL_WIDTH * 5)
            const top = new PIXI.Graphics()
                .rect(0, 0, screen.width, margin)
                .fill({ color: 0x0 })
            const bottom = new PIXI.Graphics()
                .rect(0, SYMBOL_SIZE * 3 + margin, screen.width, margin)
                .fill({ color: 0x0 })

            // Create gradient fill
            const fill = new PIXI.FillGradient(0, 0, 0, 2)

            const colors = [0xffffff, 0x00ff99].map(color =>
                PIXI.Color.shared.setValue(color).toNumber(),
            )

            colors.forEach((number, index) => {
                const ratio = index / colors.length

                fill.addColorStop(ratio, number)
            })

            // Add play text
            const style = new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 36,
                fontStyle: 'italic',
                fontWeight: 'bold',
                fill: { fill },
                stroke: { color: 0x4a1850, width: 5 },
                dropShadow: {
                    color: 0x000000,
                    angle: Math.PI / 6,
                    blur: 4,
                    distance: 6,
                },
                wordWrap: true,
                wordWrapWidth: 440,
            })

            const playText = new PIXI.Text('Spin the wheels!', style)

            playText.x = Math.round((bottom.width - playText.width) / 2)
            playText.y =
                screen.height -
                margin +
                Math.round((margin - playText.height) / 2)
            bottom.addChild(playText)

            // Add header text
            const headerText = new PIXI.Text('PIXI MONSTER SLOTS!', style)

            headerText.x = Math.round((top.width - headerText.width) / 2)
            headerText.y = Math.round((margin - headerText.height) / 2)
            top.addChild(headerText)

            container.current.addChild(top)
            container.current.addChild(bottom)

            // Set the interactivity.
            bottom.eventMode = 'static'
            bottom.cursor = 'pointer'
            bottom.addListener('pointerdown', () => {
                startPlay()
            })

            let running = false

            // Function to start playing.
            function startPlay() {
                if (running) return
                running = true

                for (let i = 0; i < reels.current.length; i++) {
                    const r = reels.current[i]
                    const extra = Math.floor(Math.random() * 3)
                    const target = r.position + 10 + i * 5 + extra
                    const time = 2500 + i * 600 + extra * 600

                    tweenTo(
                        r,
                        'position',
                        target,
                        time,
                        backout(0.5),
                        null,
                        i === reels.current.length - 1 ? reelsComplete : null,
                    )
                }
            }

            // Reels done handler.
            function reelsComplete() {
                running = false
            }

            // Listen for animate update.
            app.ticker.add(() => {
                // Update the slots.
                for (let i = 0; i < reels.current.length; i++) {
                    const r = reels.current[i]
                    // Update blur filter y amount based on speed.
                    // This would be better if calculated with time in mind also. Now blur depends on frame rate.

                    r.blur.blurY = (r.position - r.previousPosition) * 8
                    r.previousPosition = r.position

                    // Update symbol positions on reel.
                    for (let j = 0; j < r.symbols.length; j++) {
                        const s = r.symbols[j]
                        const prevy = s.y

                        s.y =
                            ((r.position + j) % r.symbols.length) *
                                SYMBOL_SIZE -
                            SYMBOL_SIZE
                        if (s.y < 0 && prevy > SYMBOL_SIZE) {
                            // Detect going over and swap a texture.
                            // This should in proper product be determined from some logical reel.
                            s.texture =
                                slotTextures[
                                    Math.floor(
                                        Math.random() * slotTextures.length,
                                    )
                                ]
                            s.scale.x = s.scale.y = Math.min(
                                SYMBOL_SIZE / s.texture.width,
                                SYMBOL_SIZE / s.texture.height,
                            )
                            s.x = Math.round((SYMBOL_SIZE - s.width) / 2)
                        }
                    }
                }
            })

            // Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
            const tweening: any[] = []

            function tweenTo(
                object: any,
                property: any,
                target: any,
                time: any,
                easing: any,
                onchange: any,
                oncomplete: any,
            ) {
                const tween = {
                    object,
                    property,
                    propertyBeginValue: object[property],
                    target,
                    easing,
                    time,
                    change: onchange,
                    complete: oncomplete,
                    start: Date.now(),
                }

                tweening.push(tween)

                return tween
            }

            const animate = () => {
                const now = Date.now()
                const remove = []

                for (let i = 0; i < tweening.length; i++) {
                    const t = tweening[i]
                    const phase = Math.min(1, (now - t.start) / t.time)

                    t.object[t.property] = lerp(
                        t.propertyBeginValue,
                        t.target,
                        t.easing(phase),
                    )
                    if (t.change) t.change(t)
                    if (phase === 1) {
                        t.object[t.property] = t.target
                        if (t.complete) t.complete(t)
                        remove.push(t)
                    }
                }
                for (let i = 0; i < remove.length; i++) {
                    tweening.splice(tweening.indexOf(remove[i]), 1)
                }
            }
            // Listen for animate update.
            app.ticker.add(animate)

            return () => {
                app.ticker.remove(animate)
            }
        }
    }, [reels.current, container.current])

    return (
        <container ref={container}>
            {isPending ? <Loading /> : undefined}
        </container>
    )
})

// Basic lerp funtion.
function lerp(a1: number, a2: number, t: number) {
    return a1 * (1 - t) + a2 * t
}

// Backout function from tweenjs.
// https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
function backout(amount: number) {
    return (t: number) => --t * t * ((amount + 1) * t + amount) + 1
}
