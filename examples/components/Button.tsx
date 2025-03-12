import * as PIXI from 'pixi.js'

import { h, FC, memo, useCallback, useRef, useEffect, useState } from 'src'

export const buttonStyle = new PIXI.TextStyle({
    fill: '#fff',
    align: 'center',
    fontSize: 14,
    fontFamily: 'consolas',
})

export function calcButtonTextSize(text: string) {
    const textMetrics = PIXI.CanvasTextMetrics.measureText(text, buttonStyle)
    return {
        width: textMetrics.width,
        height: textMetrics.height,
    }
}

function getColor(state: 'normal' | 'hover' | 'active') {
    switch (state) {
        case 'normal':
            return 0x3498db
        case 'hover':
            return 0x2980b9
        case 'active':
            return 0xe67e22
    }
}

export const Button: FC<{
    x: number
    y: number
    width: number
    height: number
    textWidth: number
    textHeight: number
    active: boolean
    text: string
    onClick: () => void
}> = memo(
    ({ text, onClick, x, y, width, height, active, textWidth, textHeight }) => {
        const button = useRef<PIXI.Graphics>()
        const [state, setState] = useState<'normal' | 'hover' | 'active'>(
            active ? 'active' : 'normal',
        )
        const onOut = useCallback(() => !active && setState('normal'), [active])
        const onHover = useCallback(
            () => !active && setState('hover'),
            [active],
        )
        const onRelease = useCallback(() => {
            !active && setState('normal')
        }, [active])

        useEffect(() => {
            button.current
                ?.roundRect(0, 0, width, height, 5)
                .fill(getColor(state))
        }, [state, width, height])

        useEffect(() => {
            setState(active ? 'active' : 'normal')
        }, [active])

        return (
            <container
                options={{
                    width,
                    height,
                }}
                x={x}
                y={y}
            >
                <graphics
                    ref={button}
                    onClick={onClick}
                    onPointerover={onHover}
                    onPointerout={onOut}
                    onPointerup={onRelease}
                    onTap={onClick}
                    cursor="pointer"
                    eventMode="static"
                />
                <text
                    options={{
                        text,
                        style: buttonStyle.clone(),
                    }}
                    x={(width - textWidth) / 2}
                    y={(height - textHeight) / 2 - 1}
                    resolution={1.3}
                />
            </container>
        )
    },
)
