import * as PIXI from 'pixi.js'
import { h, render } from 'rexie'

import { Examples } from './Examples'
import { AppContext } from './AppContext'

async function mount() {
    const app = new PIXI.Application()
    await app.init({ background: '#ffffff', resizeTo: document.body })
    const container = new PIXI.Container()
    app.stage.addChild(container)
    document.body.appendChild(app.canvas)
    render(
        <AppContext.Provider value={app}>
            <Examples app={app} />
        </AppContext.Provider>,
        container,
    )
}

mount()
