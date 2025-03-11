import * as PIXI from 'pixi.js'

import { Fragment, h, memo } from 'src/h'
import { useCallback, useState } from 'src/hooks'
import { render } from 'src/render'
import { ExternalFC } from 'src/component'

async function mount() {
    const app = new PIXI.Application()
    await app.init({ width: 640, height: 360, background: '#ffffff' })
    const container = new PIXI.Container()
    app.stage.addChild(container)
    document.body.appendChild(app.canvas)

    render(<Counters />, container)
}

mount()

const Counter: ExternalFC<{ i: number }> = ({ i }) => {
    const [count, setCount] = useState(0)
    const onClick = useCallback(() => setCount(c => c + 1))

    return (
        <Fragment>
            <text
                onClick={onClick}
                cursor="pointer"
                eventMode="static"
                options={{}}
                x={i * 50}
                y={i * 50}
            >
                {count}
            </text>
        </Fragment>
    )
}

const Button: ExternalFC<{
    x?: number
    y?: number
    text: string
    onClick: () => void
}> = memo(props => {
    const { text, onClick, x = 0, y = 0 } = props

    return (
        <container>
            <text
                options={{
                    style: {
                        fill: 'red',
                        fontSize: 14,
                        fontFamily: 'consolas',
                    },
                }}
                onClick={onClick}
                cursor="pointer"
                eventMode="static"
                x={x}
                y={y}
            >
                {text}
            </text>
        </container>
    )
})

const Counters = () => {
    const [count, setCount] = useState(3)
    const increase = useCallback(() => setCount(c => c + 1))
    const decrease = useCallback(() => setCount(c => c - 1))

    return (
        <container>
            <Button x={0} y={0} text={'increase'} onClick={increase} />
            <Button x={150} y={0} text={'decrease'} onClick={decrease} />
            {new Array(count < 0 ? 0 : count).fill(0).map((_, index) => (
                <Counter i={index + 1} />
            ))}
        </container>
    )
}
