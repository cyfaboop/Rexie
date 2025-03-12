import * as PIXI from 'pixi.js'

import { FC, h, useMemo, useState } from 'src'
import { Button, calcButtonTextSize } from './components/Button'

const width = 60
const height = 30
const margin = 5
const padding = 10
const pages = [
    'Basic',
    'Advanced',
    'Sprite',
    'Text',
    'Graphics',
    'Ordering',
    'Events',
    'Masks',
    'Filters Basic',
    'Filters Advanced',
    'Mesh And Shaders',
    'Textures',
    'Assets',
    'Offscreen Canvas',
]

interface PageProps {
    key: string
    text: string
    x: number
    y: number
    width: number
    height: number
    textWidth: number
    textHeight: number
}

function calcY(line: number) {
    return (line - 1) * (height + margin)
}

export const Examples: FC<{
    screen: PIXI.Rectangle
}> = ({ screen }) => {
    const [currentPage, setCurrentPage] = useState('Basic')
    const { propsArr, line } = useMemo(() => {
        const propsArr: PageProps[] = []

        const { line } = pages.reduce(
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
                if (box > screen.width) {
                    x = 0
                    line += 1
                    props.x = x
                    props.y = calcY(line)
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

        return { propsArr, line }
    }, [screen.width])

    return (
        <container>
            {propsArr.map(props => {
                return (
                    <Button
                        {...props}
                        active={currentPage === props.text}
                        onClick={() => {
                            setCurrentPage(props.text)
                        }}
                    />
                )
            })}
            <container y={calcY(line + 1)}></container>
        </container>
    )
}
