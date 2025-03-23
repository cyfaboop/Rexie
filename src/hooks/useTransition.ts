import { useCallback, useEffect, useRef, useState } from 'src/hooks'
import { schedule } from 'src/schedule'

/**
 * @returns useTransition returns an array with exactly two items:
 * 1. The isPending flag that tells you whether there is a pending Transition.
 * 2. The startTransition function that lets you mark updates as a Transition.
 */
export function useTransition() {
    const [isPending, setPending] = useState(true)
    const unmounts = useRef<(() => void)[]>([])

    const startTransition = useCallback((action: () => void | Promise<void>) => {
        if (!isPending) {
            setPending(true)
        }

        unmounts.current.push(
            schedule(action, () => {
                setPending(false)
                unmounts.current.shift()
            }),
        )
    })

    useEffect(() => {
        return () => {
            unmounts.current.forEach(fn => fn())
        }
    }, [])

    return [isPending, startTransition] as [boolean, typeof startTransition]
}
