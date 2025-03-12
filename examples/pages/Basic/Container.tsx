import { h, FC, memo } from 'rexie'

export const Container: FC<{
    screenWidth: number
}> = memo(({ screenWidth }) => {
    return (
        <container>
            <graphics width={screenWidth} />
        </container>
    )
})
