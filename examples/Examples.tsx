import * as PIXI from 'pixi.js'

import { FC, h, useEffect, useMemo, useState } from 'src'
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
    app: PIXI.Application<PIXI.Renderer>
}> = ({ app }) => {
    const [currentPage, setCurrentPage] = useState('Basic')
    const [screenWidth, setScreenWidth] = useState(app.screen.width)
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

        return { propsArr, line }
    }, [screenWidth])

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width } = entry.contentRect
                setScreenWidth(width)
            }
        })

        resizeObserver.observe(document.body)
        return () => {
            resizeObserver.unobserve(document.body)
            resizeObserver.disconnect()
        }
    }, [app])

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
