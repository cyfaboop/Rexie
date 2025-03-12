import * as PIXI from 'pixi.js'
import { FC, h, useEffect, useMemo, useState } from 'rexie'

import { Button, generateButtonLayoutProps } from './components/Button'
import { Basic } from './pages/Basic/Basic'
import { Advanced } from './pages/Advanced/Advanced'

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

const Components: Record<string, FC<{ screenWidth: number }>> = {
    Basic: Basic,
    Advanced: Advanced,
}

export const Examples: FC<{
    app: PIXI.Application<PIXI.Renderer>
}> = ({ app }) => {
    const [currentPage, setCurrentPage] = useState('Basic')
    const [screenWidth, setScreenWidth] = useState(app.screen.width)
    const { propsArr, lineWrapY } = useMemo(
        () => generateButtonLayoutProps(pages, 60, 30, screenWidth),
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

    const DynamicComponent = useMemo(
        () => Components[currentPage] || Basic,
        [currentPage],
    )

    return (
        <container>
            {propsArr.map(props => (
                <Button
                    {...props}
                    active={currentPage === props.text}
                    onClick={() => {
                        setCurrentPage(props.text)
                    }}
                />
            ))}
            <container y={lineWrapY}>
                <DynamicComponent screenWidth={screenWidth} />
            </container>
        </container>
    )
}
