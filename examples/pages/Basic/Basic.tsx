import { h, FC, useState, memo } from 'rexie'

import { Button, useLayoutData } from '../../components/Button'
import { Tinting } from './Tinting'
import { Container } from './Container'
import { Particle } from './Particle'
import { BlendModes } from './BlendModes'
import { MeshPlane } from './MeshPlane'
import { RenderGroup } from './RenderGroup'
import { CacheAsTexture } from './CacheAsTexture'

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
    'Particle Container': Particle,
    'Blend Modes': BlendModes,
    'Mesh Plane': MeshPlane,
    'Render Group': RenderGroup,
    'Cache As Texture': CacheAsTexture,
}

export const Basic: FC<{
    screen: { width: number; height: number }
}> = memo(({ screen }) => {
    const [currentPage, setCurrentPage] = useState('Container')
    const { propsArr, lineWrapY, childScreen } = useLayoutData(pages, screen)

    const DynamicComponent = Components[currentPage]

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
})
