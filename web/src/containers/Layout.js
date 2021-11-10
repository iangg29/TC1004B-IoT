import React, {lazy, Suspense, useContext, useEffect} from 'react'
import {Redirect, Route, Switch, useLocation} from 'react-router-dom'
import routes from '../routes'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Main from '../containers/Main'
import ThemedSuspense from '../components/ThemedSuspense'
import {SidebarContext} from '../context/SidebarContext'

const Page404 = lazy(() => import('../pages/404'))

function Layout() {
    const {isSidebarOpen, closeSidebar} = useContext(SidebarContext)
    let location = useLocation()

    useEffect(() => {
        closeSidebar()
    }, [location])

    return (
        <div
            className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${isSidebarOpen && 'overflow-hidden'}`}
        >
            <Sidebar/>

            <div className="flex flex-col flex-1 w-full">
                <Header/>
                <Main>
                    <Suspense fallback={<ThemedSuspense/>}>
                        <Switch>
                            {routes.map((route, i) => {
                                return route.component ? (
                                    <Route
                                        key={i}
                                        exact={true}
                                        path={`/app${route.path}`}
                                        render={(props) => <route.component {...props} />}
                                    />
                                ) : null
                            })}
                            <Redirect exact from="/app" to="/app/dashboard"/>
                            <Route component={Page404}/>
                        </Switch>
                    </Suspense>
                </Main>
                <div className="text-center my-5">
                    <p className="text-base text-gray-600">Derechos Reservados &copy; 2021 - <a
                        href="https://github.com/iangg29/TC1004B-IoT"
                        target="_blank" rel="noopener noreferrer">GitHub</a></p>
                </div>
            </div>
        </div>
    )
}

export default Layout
