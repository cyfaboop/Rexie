import * as PIXI from 'pixi.js'
import {
    h,
    FC,
    memo,
    useCallback,
    useRef,
    useEffect,
    useState,
    useMemo,
} from 'rexie'

export const buttonStyle = new PIXI.TextStyle({
    fill: '#fff',
    align: 'center',
    fontSize: 14,
    fontFamily: 'consolas',
})

interface ButtonLayoutProps {
    x: number
    y: number
    width: number
    height: number
    textWidth: number
    textHeight: number
    text: string
}

export function generateButtonLayoutProps(
    texts: string[],
    width: number,
    height: number,
    screenWidth: number,
    margin = 5,
    padding = 10,
) {
    const propsArr: ButtonLayoutProps[] = []

    const calcY = (line: number) => {
        return (line - 1) * (height + margin)
    }

    const { line } = texts.reduce(
        (prev, cur) => {
            let x = prev.x
            let line = prev.line
            let text = calcButtonTextSize(cur)
            let btnWidth = Math.max(text.width, width) + padding
            const props = {
                key: cur,
                text: cur,
                x,
                y: calcY(line),
                width: btnWidth,
                height,
                textWidth: text.width,
                textHeight: text.height,
            }
            const box = btnWidth + margin + x
            if (box > screenWidth) {
                x = 0
                line += 1
                props.x = x
                props.y = calcY(line)
                x += btnWidth + margin
            } else {
                x = box
            }

            propsArr.push(props)

            return {
                x,
                line,
            }
        },
        { x: 0, line: 1 },
    )

    return { propsArr, line, lineWrapY: calcY(line + 1) }
}

export function useLayoutData(
    pages: string[],
    screen: { width: number; height: number },
) {
    return useMemo(() => {
        const props = generateButtonLayoutProps(pages, 60, 30, screen.width)
        return {
            ...props,
            childScreen: {
                width: screen.width,
                height: screen.height - props.lineWrapY,
            },
        }
    }, [screen.width, screen.height])
}

function calcButtonTextSize(text: string) {
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
