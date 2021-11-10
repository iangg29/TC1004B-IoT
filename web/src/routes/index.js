import {lazy} from 'react'

const Dashboard = lazy(() => import('../pages/Dashboard'))
const Forms = lazy(() => import('../pages/Forms'))
const Cards = lazy(() => import('../pages/Cards'))
const Charts = lazy(() => import('../pages/Charts'))
const Buttons = lazy(() => import('../pages/Buttons'))
const Modals = lazy(() => import('../pages/Modals'))
const Tables = lazy(() => import('../pages/Tables'))
const Page404 = lazy(() => import('../pages/404'))
const Blank = lazy(() => import('../pages/Blank'))

const routes = [
    {
        path: '/dashboard', // the url
        component: Dashboard, // view rendered
    },
    {
        path: '/forms',
        component: Forms,
    },
    {
        path: '/cards',
        component: Cards,
    },
    {
        path: '/charts',
        component: Charts,
    },
    {
        path: '/buttons',
        component: Buttons,
    },
    {
        path: '/modals',
        component: Modals,
    },
    {
        path: '/tables',
        component: Tables,
    },
    {
        path: '/404',
        component: Page404,
    },
    {
        path: '/blank',
        component: Blank,
    },
]

export default routes
