import { Fiber, Command } from './fiber'

export function reconcileChildren(currentFiber: Fiber, newChildren: Fiber[]) {
    let oldChild: Fiber | undefined
    let prevChild: Fiber | undefined
    const oldChildren = currentFiber.children || []
    const oldKeyIndexMap = createKeyIndexMap(oldChildren)
    const reservedIndexMap: Record<number, boolean | undefined> = {}

    currentFiber.children = newChildren
    newChildren.forEach((newChild, index) => {
        oldChild = oldChildren[index] as Fiber | undefined
        newChild.old = oldChild
        newChild.parent = currentFiber
        prevChild && (prevChild.sibling = newChild)

        const newChildKT = keyAndType(newChild)
        const matchOldIndex = oldKeyIndexMap[keyAndType(newChild)]

        if (oldChild && newChildKT === keyAndType(oldChild)) {
            mergeOldFiber(newChild, oldChild)
            newChild.cmd = Command.UPDATE
        } else {
            newChild.cmd = Command.PLACEMENT
            if (matchOldIndex !== undefined) {
                mergeOldFiber(newChild, oldChildren[matchOldIndex])
                reservedIndexMap[matchOldIndex] = true
            }
        }

        prevChild = newChild
    })

    if (oldChildren.length > newChildren.length) {
        if (currentFiber.deletions === undefined) currentFiber.deletions = []
        for (let i = newChildren.length; i < oldChildren.length; i++) {
            if (reservedIndexMap[i]) continue
            currentFiber.deletions.push(oldChildren[i])
        }
    }

    return newChildren[0]
}

function mergeOldFiber(target: Fiber, source: Fiber) {
    target.ref = source.ref
    target.node = source.node
    target.hooks = source.hooks
    target.children = source.children
}

function createKeyIndexMap(children: Fiber[]) {
    let map: Record<string, number | undefined> = {}
    for (let i = 0; i < children.length; i++) {
        if (children[i].key === undefined) continue
        map[keyAndType(children[i])] = i
    }
    return map
}

function keyAndType(v: Fiber) {
    return `${v.key?.toString() || ''}${v.type}`
}
