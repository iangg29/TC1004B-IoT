import React, {useContext} from 'react'
import {SidebarContext} from '../context/SidebarContext'
import {MenuIcon, MoonIcon, SunIcon,} from '../icons'
import {WindmillContext} from '@windmill/react-ui'

function Header() {
    const {mode, toggleMode} = useContext(WindmillContext)
    const {toggleSidebar} = useContext(SidebarContext)

    return (
        <header className="z-40 py-4 bg-white shadow-bottom dark:bg-gray-800">
            <div
                className="container flex items-center justify-between h-full px-6 mx-auto text-main dark:text-blue-300">
                <button
                    className="p-1 mr-5 -ml-1 rounded-md lg:hidden focus:outline-none focus:shadow-outline-purple"
                    onClick={toggleSidebar}
                    aria-label="Menu"
                >
                    <MenuIcon className="w-6 h-6" aria-hidden="true"/>
                </button>
                <div className="flex justify-center flex-1 lg:mr-32">
                    <div className="relative w-full max-w-xl mr-6">
                    </div>
                </div>
                <ul className="flex items-center flex-shrink-0 space-x-6">
                    <li className="flex">
                        <button
                            className="rounded-md focus:outline-none focus:shadow-outline-main"
                            onClick={toggleMode}
                            aria-label="Toggle color mode"
                        >
                            {mode === 'dark' ? (
                                <SunIcon className="w-5 h-5" aria-hidden="true"/>
                            ) : (
                                <MoonIcon className="w-5 h-5" aria-hidden="true"/>
                            )}
                        </button>
                    </li>
                </ul>
            </div>
        </header>
    )
}

export default Header
