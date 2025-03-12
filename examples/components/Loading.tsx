import { h } from 'rexie'

export const Loading = () => {
    return (
        <text
            options={{
                text: 'loading……',
                style: {
                    align: 'center',
                    fontSize: 16,
                    fontFamily: 'consolas',
                },
            }}
        />
    )
}
