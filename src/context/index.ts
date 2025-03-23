import { useEffect, useMemo, useState } from 'src/hooks'
import { ExternalFC } from 'src/component'

type Subscriber = () => void
type ContextStack<T> = T[]
export interface Context<T> {
    Provider: ExternalFC<{
        value: T
    }>
    useContext: () => T
}

export function createContext<T>(defaultValue: T) {
    const contextStack: ContextStack<T> = []
    const subscribers = new Set<Subscriber>()

    const getCurrentValue = () => {
        return contextStack.length > 0 ? contextStack[contextStack.length - 1] : defaultValue
    }

    return {
        Provider: (({ value, children }) => {
            useMemo(() => {
                contextStack.push(value)
                subscribers.forEach(notify => notify())
            }, [value])

            useEffect(() => {
                return () => {
                    contextStack.pop()
                    subscribers.forEach(notify => notify())
                }
            }, [value])

            return children
        }) as ExternalFC<{
            value: T
        }>,
        useContext: () => {
            const [value] = useState(getCurrentValue)
            return value
        },
    }
}

/**
 * Returns the current context value, as given by the nearest context provider for the given context.
 * When the provider updates, this Hook will trigger a rerender with the latest context value.
 *
 * @param context The context you want to use
 */
export function useContext<T>(contextType: Context<T>) {
    return contextType.useContext()
}
