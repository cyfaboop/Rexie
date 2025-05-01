import { useEffect, useLayout, useState } from 'src/hooks'

/**
 * subscribe to an external store.
 *
 * @param subscribe A function that takes a single callback argument and subscribes it to the store.
 * When the store changes, it should invoke the provided callback,
 * which will cause React to re-call getSnapshot and (if needed) re-render the component.
 * The subscribe function should return a function that cleans up the subscription.
 * @param getSnapshot A function that returns a snapshot of the data in the store that’s needed by the component.
 * While the store has not changed, repeated calls to getSnapshot must return the same value.
 * If the store changes and the returned value is different (as compared by Object.is), React re-renders the component.
 *
 * @returns The current snapshot of the store which you can use in your rendering logic.
 */
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

function didSnapshotChange<T>(instance: { value: T; getSnapshot: () => T }): boolean {
    const latestGetSnapshot = instance.getSnapshot
    const prevValue = instance.value
    try {
        const nextValue = latestGetSnapshot()
        return !Object.is(prevValue, nextValue)
    } catch (err) {
        if (__DEV__) {
            console.error(err)
        }
        return true
    }
}
