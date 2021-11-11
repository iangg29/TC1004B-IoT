import React, {useEffect, useState} from 'react'
import axios from 'axios'

import CTA from '../components/CTA'
import InfoCard from '../components/Cards/InfoCard'
import ChartCard from '../components/Chart/ChartCard'
import {Doughnut, Line} from 'react-chartjs-2'
import ChartLegend from '../components/Chart/ChartLegend'
import PageTitle from '../components/Typography/PageTitle'
import {HeartIcon, MoonIcon, SunIcon, TablesIcon} from '../icons'
import RoundIcon from '../components/RoundIcon'
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
    const [alive, setAlive] = useState(true);
    const [records, setRecords] = useState([])
    const [total, setTotal] = useState(0);

    const resultsPerPage = 10

    function onPageChange(p) {
        setPage(p)
    }

    useEffect(() => {
        const interval = setInterval(async () => {
            await axios.get("https://api.ian.software/health").then(res => {
                setAlive(res.data.alive)
            }).catch(err => {
                setAlive(false)
            });
        }, 2000);
        return () => clearInterval(interval)
    });

    useEffect(() => {
        getData(page, resultsPerPage)
    }, [page, resultsPerPage])

    async function getData(page, resultsPerPage) {
        await axios.get("https://api.ian.software/data").then(res => {
            setRecords(res.data.slice((page - 1) * resultsPerPage, page * resultsPerPage))
            setTotal(records.length)
        }).catch(err => {
            console.error(err)
        })
    }

    return (
        <>
            <PageTitle>Internet of Things</PageTitle>

            <CTA/>

            {/* <!-- Cards --> */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard title="Total de registros" value={total}>
                    <RoundIcon
                        icon={TablesIcon}
                        iconColorClass="text-orange-500 dark:text-orange-100"
                        bgColorClass="bg-orange-100 dark:bg-orange-500"
                        className="mr-4"
                    />
                </InfoCard>

                <InfoCard title="Temperatura promedio" value="00 ºC">
                    <RoundIcon
                        icon={SunIcon}
                        iconColorClass="text-green-500 dark:text-green-100"
                        bgColorClass="bg-green-100 dark:bg-green-500"
                        className="mr-4"
                    />
                </InfoCard>

                <InfoCard title="Humedad promedio" value="00%">
                    <RoundIcon
                        icon={MoonIcon}
                        iconColorClass="text-blue-500 dark:text-blue-100"
                        bgColorClass="bg-blue-100 dark:bg-blue-500"
                        className="mr-4"
                    />
                </InfoCard>

                <InfoCard title="Estatus" value={(alive ? "ON" : "OFF")}>
                    <RoundIcon
                        icon={HeartIcon}
                        iconColorClass={(alive ? "text-teal-500 dark:text-teal-100" : "text-red-500 dark:text-red-100")}
                        bgColorClass={(alive ? "bg-teal-100 dark:bg-teal-500" : "bg-red-100 dark:bg-red-500")}
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
                        {records.map((record, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <span className="text-sm">{record.id}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">{record.temperature} ºC</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">{record.humidity}%</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">{record.created_at}</span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TableFooter>
                    <Pagination
                        totalResults={total}
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
