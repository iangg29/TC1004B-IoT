import React, {Suspense} from 'react'
import ReactDOM from 'react-dom'
import './assets/css/tailwind.output.css'
import App from './App'
import {SidebarProvider} from './context/SidebarContext'
import ThemedSuspense from './components/ThemedSuspense'
import {Windmill} from '@windmill/react-ui'


ReactDOM.render(
    <SidebarProvider>
        <Suspense fallback={<ThemedSuspense/>}>
            <Windmill usePreferences>
                <App/>
            </Windmill>
        </Suspense>
    </SidebarProvider>,
    document.getElementById('root')
)
