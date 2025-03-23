import { h, FC, useMemo, useState, memo } from 'rexie'

import { Button, useLayoutData } from '../../components/Button'
import { Slots } from './Slots'

const pages = [
    'Slots',
    'Scratch Card',
    'Star Warp',
    'Three.js and PixiJS',
    'Mouse Trail',
    'Screen Shot',
    'Collision Detection',
    'Spinners',
]

const Components: Record<
    string,
    FC<{
        screen: { width: number; height: number }
    }>
> = {
    Slots: Slots,
}

export const Advanced: FC<{
    screen: { width: number; height: number }
}> = memo(({ screen }) => {
    const [currentPage, setCurrentPage] = useState('Slots')
    const { propsArr, lineWrapY, childScreen } = useLayoutData(pages, screen)

    const DynamicComponent = useMemo(() => Components[currentPage] || Slots, [currentPage])

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
