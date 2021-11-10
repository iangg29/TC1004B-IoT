import React, {useEffect, useState} from 'react'

import CTA from '../components/CTA'
import InfoCard from '../components/Cards/InfoCard'
import ChartCard from '../components/Chart/ChartCard'
import {Doughnut, Line} from 'react-chartjs-2'
import ChartLegend from '../components/Chart/ChartLegend'
import PageTitle from '../components/Typography/PageTitle'
import {HeartIcon, MoonIcon, SunIcon, TablesIcon} from '../icons'
import RoundIcon from '../components/RoundIcon'
import response from '../utils/demo/tableData'
import {
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHeader,
    TableRow,
} from '@windmill/react-ui'

import {doughnutLegends, doughnutOptions, lineLegends, lineOptions,} from '../utils/demo/chartsData'

function Dashboard() {
    const [page, setPage] = useState(1)
    const [data, setData] = useState([])

    // pagination setup
    const resultsPerPage = 10
    const totalResults = response.length

    // pagination change control
    function onPageChange(p) {
        setPage(p)
    }

    // on page change, load new sliced data
    // here you would make another server request for new data
    useEffect(() => {
        setData(response.slice((page - 1) * resultsPerPage, page * resultsPerPage))
    }, [page])

    return (
        <>
            <PageTitle>Internet of Things</PageTitle>

            <CTA/>

            {/* <!-- Cards --> */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard title="Total de registros" value="6389">
                    <RoundIcon
                        icon={TablesIcon}
                        iconColorClass="text-orange-500 dark:text-orange-100"
                        bgColorClass="bg-orange-100 dark:bg-orange-500"
                        className="mr-4"
                    />
                </InfoCard>

                <InfoCard title="Temperatura promedio" value="19 ºC">
                    <RoundIcon
                        icon={SunIcon}
                        iconColorClass="text-green-500 dark:text-green-100"
                        bgColorClass="bg-green-100 dark:bg-green-500"
                        className="mr-4"
                    />
                </InfoCard>

                <InfoCard title="Humedad promedio" value="36%">
                    <RoundIcon
                        icon={MoonIcon}
                        iconColorClass="text-blue-500 dark:text-blue-100"
                        bgColorClass="bg-blue-100 dark:bg-blue-500"
                        className="mr-4"
                    />
                </InfoCard>

                <InfoCard title="Estatus" value="OFF">
                    <RoundIcon
                        icon={HeartIcon}
                        iconColorClass="text-teal-500 dark:text-teal-100"
                        bgColorClass="bg-teal-100 dark:bg-teal-500"
                        className="mr-4"
                    />
                </InfoCard>
            </div>

            <TableContainer>
                <Table>
                    <TableHeader>
                        <tr>
                            <TableCell>ID</TableCell>
                            <TableCell>Temperatura</TableCell>
                            <TableCell>Humedad</TableCell>
                            <TableCell>Fecha</TableCell>
                        </tr>
                    </TableHeader>
                    <TableBody>
                        {data.map((user, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <span className="text-sm">$ {user.amount}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">$ {user.amount}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">$ {user.amount}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">{new Date(user.date).toLocaleDateString()}</span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TableFooter>
                    <Pagination
                        totalResults={totalResults}
                        resultsPerPage={resultsPerPage}
                        label="Table navigation"
                        onChange={onPageChange}
                    />
                </TableFooter>
            </TableContainer>

            <PageTitle>Charts</PageTitle>
            <div className="grid gap-6 mb-8 md:grid-cols-2">
                <ChartCard title="Revenue">
                    <Doughnut {...doughnutOptions} />
                    <ChartLegend legends={doughnutLegends}/>
                </ChartCard>

                <ChartCard title="Traffic">
                    <Line {...lineOptions} />
                    <ChartLegend legends={lineLegends}/>
                </ChartCard>
            </div>
        </>
    )
}

export default Dashboard
