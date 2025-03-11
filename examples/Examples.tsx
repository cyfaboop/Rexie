import * as PIXI from 'pixi.js'

import { FC, h, useCallback, useMemo, useState } from 'src'
import { Button } from './components/Button'

const width = 60
const height = 30
const margin = 5
const unitWidth = width + margin
const unitHeight = height + margin
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
    screen: PIXI.Rectangle
}> = ({ screen }) => {
    const [currentPage, setCurrentPage] = useState('Basic')
    const total = useMemo(() => Math.floor(screen.width / unitWidth), [screen])
    const getLevelIndex = useCallback(
        (index: number) => {
            return [index % total, Math.floor(index / total) + 1] as [
                index: number,
                level: number,
            ]
        },
        [screen],
    )
    const createPageButtonProps = useCallback(() => {
        return pages.map((page, i) => {
            const [index, level] = getLevelIndex(i)
            return {
                key: page,
                text: page,
                x: index * unitWidth,
                y: level * unitHeight,
                width,
                height,
            }
        })
    }, [screen])

    return (
        <container>
            {createPageButtonProps().map(props => {
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
            <container
                y={Math.ceil(pages.length / total) * unitHeight}
            ></container>
        </container>
    )
}
