import { h } from './h'
import { useEffect } from './hooks'
import { Children, ExternalPropsOf, Fiber, FiberFC } from './fiber'
import { createContext, useContext } from './context'
import { ExternalFC } from './component'
import { useTransition } from './hooks/useTransition'

interface SuspenseProps {
    fallback?: Children
    children?: Children
}

const SuspenseContenxt = createContext<Children>(null)

/**
 * Suspense is a component that allows you to "suspend" rendering of a component tree until some condition is met.
 *
 * @param props The props for the Suspense component. It can include:
 * - `fallback`: The fallback content to display while the component tree is suspended.
 * - `children`: The children of the Suspense component. This is the component tree that will be suspended.
 *
 * @returns A Fiber component that represents the Suspense component.
 */
export function Suspense(props: SuspenseProps): FiberFC {
    return h(SuspenseContenxt.Provider, { value: props.fallback }, props.children)
}

/**
 * lazy is a function that allows you to load a component asynchronously.
 * It returns a function that can be used to render the component.
 *
 * @param load A function that returns a promise that resolves to a module containing the component.
 *
 * @returns A function that can be used to render the component.
 */
export function lazy<T extends ExternalFC>(load: () => Promise<{ default: T }>) {
    let error: unknown
    let component: undefined | ExternalFC

    return (props: ExternalPropsOf<T>): Fiber => {
        const fallback = useContext(SuspenseContenxt)
        const [, startTransition] = useTransition()

        useEffect(() => {
            startTransition(async () => {
                try {
                    const module = await load()
                    component = module.default
                } catch (e) {
                    error = e
                }
            })
        }, [])

        if (error) throw error
        if (component) return component(props)
        return fallback as Fiber
    }
}
