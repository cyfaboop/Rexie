import { h, FC, memo } from 'rexie'

export const Slots: FC<{
    screen: { width: number; height: number }
}> = memo(({ screen }) => {
    return (
        <container>
            <graphics width={screen.width} />
        </container>
    )
})
