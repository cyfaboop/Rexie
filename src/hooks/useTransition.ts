import { useCallback, useState } from 'src/hooks'
import { schedule } from 'src/schedule'

export function useTransition() {
    const [pending, setPending] = useState(true)
    const startTransition = useCallback((action: () => void) => {
        if (!pending) {
            setPending(true)
        }

        schedule(action, () => {
            setPending(false)
        })
    })

    return [pending, startTransition]
}
