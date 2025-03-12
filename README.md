<h1 align="center">Rexie</h1>
<p align="center">PixiJS | React Hooks | 3kB</p>
<p align="center">
  <a href="https://github.com/wooloo26/rexie/tree/main/docs/ZH.md">中文</a>
</p>

## Quick Start

alpha

## Features

### Development

- **React Hooks** - `useState`, `useEffect`...`useTransition`, `useSyncExternalStore`
- **Component-Based** - Native JSX/TSX support with full type system
- **Focus on Core Logic** - Dedicate to core logic while Rexie handles tedious drawing routines
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

## Hooks API

### No/Minor Differences

`useState`, `useReducer`, `useEffect`, `useLayoutEffect`, `useCallback`, `useRef`, `useMemo`, `useImperativeHandle`, `useSyncExternalStore`

### Differences

`useTransition`: After the `startTransition` task completes, `isPending` will be updated after the nearest UI render update. If there is no rendering task, it updates immediately.

## PIXI Issues

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
