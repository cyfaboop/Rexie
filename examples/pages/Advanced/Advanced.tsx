import { h, FC, useMemo, useState, memo } from 'rexie'

import { Button, generateButtonLayoutProps } from '../../components/Button'
import { Slots } from './Slots'

const pages = [
    'Slots',
    'Scratch Card',
    'Star Warp',
    'Mouse Trail',
    'Screen Shot',
    'Collision Detection',
    'Spinners',
]

const Components: Record<
    string,
    FC<{
        screenWidth: number
    }>
> = {
    Slots: Slots,
}

export const Advanced: FC<{
    screenWidth: number
}> = memo(({ screenWidth }) => {
    const [currentPage, setCurrentPage] = useState('Slots')
    const { propsArr, lineWrapY } = useMemo(
        () => generateButtonLayoutProps(pages, 60, 30, screenWidth),
        [screenWidth],
    )

    const DynamicComponent = useMemo(
        () => Components[currentPage] || Slots,
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
})
