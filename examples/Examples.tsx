import { FC, h, useContext, useEffect, useMemo, useState } from 'rexie'

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
    const [currentPage, setCurrentPage] = useState('Basic')
    const DynamicComponent = useMemo(
        () => Components[currentPage] || Basic,
        [currentPage],
    )

    const app = useContext(AppContext)
    const [screen, setScreen] = useState({
        width: app.screen.width,
        height: app.screen.height,
    })
    const { propsArr, lineWrapY, childScreen } = useLayoutData(pages, screen)

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
    }, [app])

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
                <DynamicComponent screen={childScreen} />
            </container>
        </container>
    )
}
