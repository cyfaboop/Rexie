import { ExternalFC } from './component'
import { Children, ExternalPropsOf, Fiber } from './fiber'
import { h } from './h'
import { createContext, useContext, useEffect, useTransition } from './hooks'

interface SuspenseProps {
    fallback?: Children
    children?: Children
}

const SuspenseContenxt = createContext<Children>(null)

export function Suspense(props: SuspenseProps) {
    return h(
        SuspenseContenxt.Provider,
        { value: props.fallback },
        props.children,
    )
}

export function lazy<T extends ExternalFC>(
    load: () => Promise<{ default: T }>,
) {
    let error: any
    let component: any

    return (props: ExternalPropsOf<T>) => {
        const fallback = useContext(SuspenseContenxt)
        const [, startTransition] = useTransition()

        useEffect(() => {
            startTransition(async () => {
                try {
                    const module = await load()
                    component = module.default.bind(null, props)
                } catch (e) {
                    error = e
                }
            })
        }, [])

        if (error) throw error
        if (component) return component as T
        return fallback as Fiber
    }
}
