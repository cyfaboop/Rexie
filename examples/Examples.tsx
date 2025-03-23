import { FC, h, useContext, useEffect, useState } from 'rexie'

import { Button, useLayoutData } from './components/Button'
import { Basic } from './pages/Basic/Basic'
import { Advanced } from './pages/Advanced/Advanced'
import { AppContext } from 'examples'

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

const Components: Record<
    string,
    FC<{ screen: { width: number; height: number } }>
> = {
    Basic: Basic,
    Advanced: Advanced,
}

export const Examples = () => {
    const app = useContext(AppContext)
    const [screen, setScreen] = useState({
        width: app.screen.width,
        height: app.screen.height,
    })
    const { propsArr, lineWrapY, childScreen } = useLayoutData(pages, screen)

    const [currentPage, setCurrentPage] = useState('Basic')
    const DynamicComponent = Components[currentPage] || Basic

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect
                setScreen({ width, height })
            }
        })

        resizeObserver.observe(document.body)
        return () => {
            resizeObserver.unobserve(document.body)
            resizeObserver.disconnect()
        }
    }, [])

    return (
        <container>
            {propsArr.map(p => (
                <Button
                    {...p}
                    key={p.text}
                    active={currentPage === p.text}
                    onClick={() => {
                        setCurrentPage(p.text)
                    }}
                />
            ))}
            <container y={lineWrapY}>
                <DynamicComponent screen={childScreen} />
            </container>
        </container>
    )
}
