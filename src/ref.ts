export type Ref<T = any> = RefObject<T> | RefCallback<T> | null
export type RefObject<T> = { current: T | null }
export type RefCallback<T> = (instance: T | null) => any
