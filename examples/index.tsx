import * as PIXI from 'pixi.js'
import { h, render, createContext } from 'rexie'

import { Examples } from './Examples'

const app = new PIXI.Application()
export const AppContext = createContext<PIXI.Application<PIXI.Renderer>>(app)

async function mount() {
    const container = new PIXI.Container()
    app.stage.addChild(container)
    render(
        <AppContext.Provider value={app}>
            <Examples />
        </AppContext.Provider>,
        container,
    )
    await app.init({ background: '#ffffff', resizeTo: document.body })
    document.body.appendChild(app.canvas)
}

mount()
