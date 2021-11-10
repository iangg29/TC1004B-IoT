import React from 'react'

import {ForbiddenIcon} from '../icons'

function Page404() {
    return (
        <div className="flex flex-col items-center">
            <ForbiddenIcon className="w-12 h-12 mt-8 text-blue-200" aria-hidden="true"/>
            <h1 className="text-6xl font-semibold text-gray-700 dark:text-gray-200">404</h1>
            <p className="text-gray-700 dark:text-gray-300">
                Página no encontrada. Revisa la dirección ó{' '}
                <a className="text-main hover:underline dark:text-blue-300" href="/">
                    ve atrás
                </a>
                .
            </p>
        </div>
    )
}

export default Page404
