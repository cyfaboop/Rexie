import { useEffect, useLayout, useState } from './hooks'

export function useSyncExternalStore<T>(
    subscribe: (flush: () => void) => () => void,
    getSnapshot: () => T,
): T {
    const value = getSnapshot()
    const [{ instance }, forceUpdate] = useState({
        instance: { value, getSnapshot },
    })

    useLayout(() => {
        instance.value = value
        instance.getSnapshot = getSnapshot

        if (didSnapshotChange(instance)) {
            forceUpdate({ instance })
        }
    }, [subscribe, value, getSnapshot])

    useEffect(() => {
        if (didSnapshotChange(instance)) {
            forceUpdate({ instance })
        }

        return subscribe(() => {
            if (didSnapshotChange(instance)) {
                forceUpdate({ instance })
            }
        })
    }, [subscribe])

    return value
}

function didSnapshotChange<T>(instance: { value: T; getSnapshot: () => T }) {
    const latestGetSnapshot = instance.getSnapshot
    const prevValue = instance.value
    try {
        const nextValue = latestGetSnapshot()
        return !Object.is(prevValue, nextValue)
    } catch (error) {
        return true
    }
}
