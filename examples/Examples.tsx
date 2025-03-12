import * as PIXI from 'pixi.js'
import { FC, h, useEffect, useMemo, useState } from 'rexie'

import { Button, generateButtonLayoutProps } from './components/Button'

const width = 60
const height = 30
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

export const Examples: FC<{
    app: PIXI.Application<PIXI.Renderer>
}> = ({ app }) => {
    const [currentPage, setCurrentPage] = useState('Basic')
    const [screenWidth, setScreenWidth] = useState(app.screen.width)
    const { propsArr, lineWrapY } = useMemo(
        () => generateButtonLayoutProps(pages, width, height, screenWidth),
        [screenWidth],
    )

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
            <container y={lineWrapY}></container>
        </container>
    )
}
