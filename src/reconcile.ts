import { isFunction } from './util'
import { Fiber, Command } from './fiber'

export function reconcileFiberChildrenShallowly(currentFiber: Fiber, newChildren: Fiber[]): void {
    let oldChild: Fiber | undefined
    let prevChild: Fiber | undefined
    const oldChildren = currentFiber.children || []
    const oldKeyIndexMap = createKeyIndexMap(oldChildren)
    const reservedIndexMap = new Map<number, boolean>()
    currentFiber.children = newChildren

    newChildren.forEach((newChild, index) => {
        oldChild = oldChildren[index] as Fiber | undefined
        newChild.old = oldChild
        newChild.parent = currentFiber
        if (prevChild) {
            prevChild.sibling = newChild
        }
        const newChildKT = generateKeyWithType(newChild)
        if (oldChild && newChildKT === generateKeyWithType(oldChild)) {
            newChild.cmd = Command.UPDATE
            extendFiber(newChild, oldChild)
            reservedIndexMap.set(index, true)
        } else {
            newChild.cmd = Command.PLACEMENT
            const matchOldIndex = oldKeyIndexMap.get(newChildKT)
            if (matchOldIndex !== undefined) {
                extendFiber(newChild, oldChildren[matchOldIndex])
                reservedIndexMap.set(matchOldIndex, true)
            }
        }

        prevChild = newChild
    })

    for (let i = 0; i < oldChildren.length; i++) {
        if (reservedIndexMap.get(i)) continue
        currentFiber.root!.deletions.push(oldChildren[i])
    }

    currentFiber.child = newChildren[0]
}

function createKeyIndexMap(children: readonly Readonly<Fiber>[]): Map<string, number> {
    const map = new Map<string, number>()
    for (let i = 0; i < children.length; i++) {
        if (children[i].key === undefined) continue
        map.set(generateKeyWithType(children[i]), i)
    }
    return map
}

function generateKeyWithType(v: Readonly<Fiber>): string {
    return `${v.key?.toString() || ''}${isFunction(v.type) ? v.type.id : v.type}`
}

function extendFiber(target: Fiber, source: Fiber): void {
    target.ref = source.ref
    target.node = source.node
    target.hooks = source.hooks
    target.child = source.child
    target.children = source.children
}
