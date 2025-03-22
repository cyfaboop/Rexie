<h1 align="center">Rexie</h1>
<p align="center">PixiJS | React Hooks | 3kB</p>
<p align="center">
  <a href="https://github.com/wooloo26/rexie/tree/main/docs/ZH.md">中文</a>
</p>
<div align="center">
    <img width="600" alt="preview" src="https://raw.githubusercontent.com/wooloo26/rexie/refs/heads/main/docs/examples.gif">
</div>

## Features

### Development

- **React Hooks** - `useState`, `useEffect`...`useTransition`, `useSyncExternalStore`
- **Component-Based** - Native JSX/TSX support with full type system
- **Focus on Core Logic** - Dedicate to core logic while rexie handles tedious drawing routines
- **Sync/Concurrent** - Choose your update strategy per render

### Feather-Light

- **3kB Core** - No heavyweight runtime or syntax sugar, simplicity first
- **Zero Dependencies** - Only depends on PixiJS core
- **Direct API Access** - Full exposure of native PixiJS APIs
- **On-Demand Rendering** - Independent multi-instance rendering, mountable to any container, disposable anytime

### Beyond PixiJS

- **Renderer Agnostic** - Create new renderers with <100 lines of code
- **Framework Integration** - Built for seamless embedding in React/Vue/etc
- **Universal Core** - Platform-agnostic core with browser/Canvas/WebGL extensions

## Quick Start

alpha

```tsx
import * as PIXI from 'pixi.js'
import { h, render, createContext } from 'rexie'

import App from './App'

const app = new PIXI.Application()
export const AppContext = createContext(app)

async function mount() {
    const container = new PIXI.Container()
    render(
        <AppContext.Provider value={app}>
            <App />
        </AppContext.Provider>,
        container,
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

`memo`, `createContext`, `lazy`

## FAQ

### Textures

Textures will not be automatically destroyed. You need to manually manage their lifecycle.

### About the `options` Property

Corresponds to the constructor's `options`. This property is only set during initialization and will not update with any subsequent changes.

```ts
<text options={textStyle} width={200} />
// equivalent to
const text = new PIXI.Text(textStyle)
text.width = 200
```

### Handling a Massive Number of `ViewContainer`

If there is a need to create thousands or even more `ViewContainer`, the performance of virtual DOM will be extremely poor. Compared to react-dom, it is more prone to stack overflow due to the deeper function call chains in PixiJS's API. Although rexie can adopt queue-based updates like Preact, the performance will still be severely degraded. Therefore, it is recommended to use `useRef` to obtain a `Container` reference and manually `addChild` `ViewContainer`. When the component unmounts, these `ViewContainer` will still be automatically destroyed, so no manual cleanup is required.

### Order of Props

Some setters in PixiJS have execution order dependencies. Props with non-positive-integer keys are traversed in creation order, refer to [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in#description).

```ts
// 1. When text is set before width or placed in constructor options, width affect text
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
        width,
        text,
    }}
/>
// 2. When width is set before text, width won't affect text
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
