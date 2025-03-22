<h1 align="center">Rexie</h1>
<p align="center">轻量级 PixiJS 框架 | 类 React Hooks | 3KB 极简内核</p>
<div align="center">
    <img width="600" alt="preview" src="https://raw.githubusercontent.com/wooloo26/rexie/refs/heads/main/docs/examples.gif">
</div>

## 特性

### 开发体验

- **React Hooks** - `useState`, `useEffect`...`useTransition`, `useSyncExternalStore`
- **组件化开发** - 原生 JSX/TSX 支持，完善的类型提示系统
- **专注核心逻辑** - 专注核心逻辑，把烦人的套路绘图代码放进 rexie
- **Sync/Concurrent** - 每一次更新都能自选模式

### 轻如鸿毛

- **3KB 极简内核** - 没有重量级 runtime 和语法糖，不再选择困难
- **无冗余依赖** - 仅依赖 PixiJS 核心库
- **原生接口** - 直接暴露 PixiJS 原生 API
- **按需渲染**：多实例独立渲染，灵活挂载至任意容器节点，也可随时销毁

### 不只是pixijs

- **renderer无关** - 一百行搞定增删查改，极速适配
- **框架移植** - 用渲染和注销函数灵活嵌入任意其它框架
- **平台无关** - 修改 renderer 即可移植其它平台

## 快速开始

alpha

```tsx
import * as PIXI from 'pixi.js'
import { h, createRoot, createContext } from 'rexie'

const app = new PIXI.Application()
export const AppContext = createContext(app)

async function mount() {
    const container = new PIXI.Container()
    createRoot(container).render(
        <AppContext.Provider value={app}>
            <container>
                <graphics />
                {'app'}
            </container>
        </AppContext.Provider>,
    )
    app.stage.addChild(container)
    await app.init({ background: '#ffffff', resizeTo: document.body })
    document.body.appendChild(app.canvas)
}

mount()
```

## API Reference

### Hooks

`useState`, `useReducer`, `useEffect`, `useLayoutEffect`, `useCallback`, `useRef`, `useMemo`, `useContext`, `useTransition`, `useImperativeHandle`, `useSyncExternalStore`

### Components

`<Fragment>`, `<Suspense>`

### APIs

`createContext`, `createRoot`, `lazy`, `memo`

## FAQ

### Texture不会销毁

请手动管理 `Texture` 的生命周期。

### 关于options属性

对应构造函数的 `options`，该属性只有初始化，任何改变都不做更新。

```ts
<text options={textStyle} width={200} />
// 等同于
const text = new PIXI.Text(textStyle)
text.width = 200
```

### 极多的 `ViewContainer`

如果有成千上万个甚至更多的 `ViewContainer` 创建需求，虚拟DOM的性能会非常糟糕，而且会比 react-dom 更容易堆栈爆炸，因为 PixiJS 的接口有更深的函数调用。尽管 rexie 可以改为 preact 那样的队列更新，但其性能仍然会非常糟糕，所以最好使用 `useRef` 获取 `Container` 引用并手动 `addChild` `ViewContainer`，组件注销时依然会自动销毁它们，不必担心。

### props的先后顺序

PixiJS的部分setter存在先后调用顺序的说法，props非正整数键会按照创建顺序遍历，参考 [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in#description)

```ts
// 1. text先于width设置或放到构造函数的options里，正常生效
<text
    options={{
        text,
    }}
    width={width}
/>
<text
    text={text}
    width={width}
/>
<text
    options={{
        text,
        width,
    }}
/>
// 2. width先于text，text不会改变宽度
<text
    options={{
        width,
    }}
    text={text}
/>
<text
    width={width}
    text={text}
/>
<text
    width={width}
>{text}</text>
```
