import * as PIXI from 'pixi.js'
import { h, createRoot, createContext } from 'rexie'

import { Examples } from './Examples'

const app = new PIXI.Application()
export const AppContext = createContext(app)

async function mount() {
    const container = new PIXI.Container()
    createRoot(container).render(
        <AppContext.Provider value={app}>
            <Examples />
        </AppContext.Provider>,
    )
    app.stage.addChild(container)
    await app.init({ background: '#ffffff', resizeTo: document.body })
    document.body.appendChild(app.canvas)
}

mount()
