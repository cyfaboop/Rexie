import { Dependencies, useLayout } from 'src/hooks'
import { Ref } from 'src/ref'
import { isFunction, NULL } from 'src/util'

/**
 * @param ref The ref that will be mutated
 * @param create The function that will be executed to get the value that will be attached to ref.current
 * @param dependencies If present, effect will only activate if the values in the list change (using Object.is).
 */
export function useImperativeHandle<T, R extends T>(
    ref: Ref<T>,
    create: () => R,
    dependencies?: Dependencies,
) {
    useLayout(
        () => {
            if (isFunction(ref)) {
                const result = ref(create())
                return () => {
                    ref(NULL)
                    isFunction(result) && result()
                }
            } else if (ref) {
                ref.current = create()
                return () => {
                    ref.current = NULL
                }
            }
        },
        dependencies == NULL ? dependencies : dependencies.concat(ref),
    )
}
