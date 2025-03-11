import * as PIXI from 'pixi.js'

import { h, FC, memo, useCallback, useRef, useEffect } from 'src'

const normalColor = 0x3498db
const hoverColor = 0x2980b9
const activeColor = 0xe67e22

export const Button: FC<{
    x?: number
    y?: number
    width?: number
    height?: number
    active?: boolean
    text?: string
    onClick?: () => void
}> = memo(props => {
    const {
        text,
        onClick,
        x = 0,
        y = 0,
        width = 50,
        height = 20,
        active = false,
    } = props
    const button = useRef<PIXI.Graphics>()
    const arr = [x, y, width, height, active]
    const onOut = useCallback(() => {
        if (active) return
        button.current?.roundRect(x, y, width, height, 5).fill(normalColor)
    }, arr)
    const onHover = useCallback(() => {
        if (active) return
        button.current?.roundRect(x, y, width, height, 5).fill(hoverColor)
    }, arr)
    const onRelease = useCallback(() => {
        if (active) return
        button.current?.roundRect(x, y, width, height, 5).fill(hoverColor)
    }, arr)

    useEffect(() => {
        button.current?.roundRect(x, y, width, height, 5).fill(normalColor)
    }, arr)

    useEffect(() => {
        if (active) {
            button.current?.roundRect(x, y, width, height, 5).fill(activeColor)
        } else {
            button.current?.roundRect(x, y, width, height, 5).fill(normalColor)
        }
    }, [active])

    return (
        <container>
            <graphics
                ref={button}
                onClick={onClick}
                onPointerover={onHover}
                onPointerout={onOut}
                onPointerup={onRelease}
                cursor="pointer"
                eventMode="static"
            />
            <text
                options={{
                    style: {
                        fill: '#fff',
                        fontSize: 14,
                        fontFamily: 'consolas',
                    },
                }}
                x={x}
                y={y + height / 4}
                resolution={1.3}
            >
                {text}
            </text>
        </container>
    )
})
