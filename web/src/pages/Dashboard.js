import React, {useEffect, useState} from 'react'
import axios from 'axios'
import Pusher from "pusher-js";
import CTA from '../components/CTA'
import InfoCard from '../components/Cards/InfoCard'
import ChartCard from '../components/Chart/ChartCard'
import {Line} from 'react-chartjs-2'
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


const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
    cluster: process.env.REACT_APP_PUSHER_CLUSTER,
    encrypted: true
});

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1)
    const [alive, setAlive] = useState(true);
    const [records, setRecords] = useState([])
    const [graphData, setGraphData] = useState([]);
    const [total, setTotal] = useState(0);

    const resultsPerPage = 50

    function onPageChange(p) {
        setPage(p)
    }

    useEffect(() => {
        const interval = setInterval(async () => {
            await axios.get("https://api.tc1004b.ian.software/health").then(res => {
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

    useEffect(() => {
        const channel = pusher.subscribe('data-fetch')
        channel.bind('new-record', data => {
            let newRecord = {
                id: total,
                temperature: data.record.temperature,
                humidity: data.record.humidity,
                created_at: data.record.created_at
            }
        });
    })

    async function getData(page, resultsPerPage) {
        setLoading(true);
        await axios.get("https://api.tc1004b.ian.software/data").then(res => {
            setGraphData(res.data)
            setTotal(res.data.length)
            setRecords(res.data.slice((page - 1) * resultsPerPage, page * resultsPerPage))
            setLoading(false);
        }).catch(err => {
            console.error(err)
            setLoading(true);
        })
    }

    const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

    return (
        <>
            <PageTitle>Internet of Things</PageTitle>
            <CTA/>
            {loading && <div>
                <h1>Cargando...</h1>
            </div>}
            {!loading && <div>
                <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
                    <InfoCard title="Total de registros" value={total}>
                        <RoundIcon
                            icon={TablesIcon}
                            iconColorClass="text-orange-500 dark:text-orange-100"
                            bgColorClass="bg-orange-100 dark:bg-orange-500"
                            className="mr-4"
                        />
                    </InfoCard>

                    <InfoCard title="Temperatura promedio"
                              value={average(graphData.map(record => record.temperature)).toFixed(2) + " ºC"}>
                        <RoundIcon
                            icon={SunIcon}
                            iconColorClass="text-green-500 dark:text-green-100"
                            bgColorClass="bg-green-100 dark:bg-green-500"
                            className="mr-4"
                        />
                    </InfoCard>

                    <InfoCard title="Humedad promedio"
                              value={average(graphData.map(record => record.humidity)).toFixed(2) + " %"}>
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
                <PageTitle>Historial de Registros</PageTitle>
                <div className="grid gap-6 mb-8 md:grid-cols-2">
                    <ChartCard title="Temperatura vs Humedad">
                        <Line {...{
                            data: {
                                labels: graphData.map(record => record.created_at),
                                datasets: [
                                    {
                                        label: 'Temperature',
                                        backgroundColor: '#0694a2',
                                        borderColor: '#0694a2',
                                        data: graphData.map(record => record.temperature),
                                        fill: false,
                                    },
                                    {
                                        label: 'Humidity',
                                        fill: false,
                                        backgroundColor: '#7e3af2',
                                        borderColor: '#7e3af2',
                                        data: graphData.map(record => record.humidity),
                                    },
                                ],
                            },
                            options: {
                                responsive: true,
                                tooltips: {
                                    mode: 'index',
                                    intersect: false,
                                },
                                hover: {
                                    mode: 'nearest',
                                    intersect: true,
                                },
                                scales: {
                                    x: {
                                        display: true,
                                        scaleLabel: {
                                            display: true,
                                            labelString: 'Tiempo',
                                        },
                                    },
                                    y: {
                                        display: true,
                                        scaleLabel: {
                                            display: true,
                                            labelString: 'Valor',
                                        },
                                    }
                                },
                            },
                            legend: {
                                display: false,
                            },
                        }} />
                        <ChartLegend legends={[
                            {title: 'Temperature', color: 'bg-teal-600'},
                            {title: 'Humidity', color: 'bg-purple-600'},
                        ]}/>
                    </ChartCard>

                    <ChartCard title="Temperatura">
                        <Line {...{
                            data: {
                                labels: graphData.map(record => record.created_at),
                                datasets: [
                                    {
                                        label: 'Temperatura',
                                        backgroundColor: '#0694a2',
                                        borderColor: '#0694a2',
                                        data: graphData.map(record => record.temperature),
                                        fill: false,
                                    },
                                ],
                            },
                            options: {
                                responsive: true,
                                tooltips: {
                                    mode: 'index',
                                    intersect: false,
                                },
                                hover: {
                                    mode: 'nearest',
                                    intersect: true,
                                },
                                scales: {
                                    x: {
                                        display: true,
                                        scaleLabel: {
                                            display: true,
                                            labelString: 'Tiempo',
                                        },
                                    },
                                    y: {
                                        display: true,
                                        scaleLabel: {
                                            display: true,
                                            labelString: 'Temperatura',
                                        },
                                    },
                                },
                            },
                            legend: {
                                display: false,
                            },
                        }} />
                        <ChartLegend legends={[
                            {title: 'Temperatura', color: 'bg-teal-600'},
                        ]}/>
                    </ChartCard>
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
            </div>}
        </>
    )
}

export default Dashboard
