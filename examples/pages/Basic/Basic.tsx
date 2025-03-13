import { h, FC, useMemo, useState, memo } from 'rexie'

import { Button, useLayoutData } from '../../components/Button'
import { Tinting } from './Tinting'
import { Container } from './Container'

const pages = [
    'Container',
    'Tinting',
    'Particle Container',
    'Blend Modes',
    'Mesh Plane',
    'Render Group',
    'Cache As Texture',
]

const Components: Record<
    string,
    FC<{
        screen: { width: number; height: number }
    }>
> = {
    Container: Container,
    Tinting: Tinting,
    'Particle Container': Container,
    'Blend Modes': Container,
    'Mesh Plane': Container,
    'Render Group': Container,
    'Cache As Texture': Container,
}

export const Basic: FC<{
    screen: { width: number; height: number }
}> = memo(({ screen }) => {
    const [currentPage, setCurrentPage] = useState('Container')
    const { propsArr, lineWrapY, childScreen } = useLayoutData(pages, screen)

    const DynamicComponent = useMemo(
        () => Components[currentPage],
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
                <DynamicComponent screen={childScreen} />
            </container>
        </container>
    )
})
