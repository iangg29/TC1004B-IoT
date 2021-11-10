import React from 'react'

import ChartCard from '../components/Chart/ChartCard'
import {Bar, Doughnut, Line} from 'react-chartjs-2'
import ChartLegend from '../components/Chart/ChartLegend'
import PageTitle from '../components/Typography/PageTitle'
import {
    barLegends,
    barOptions,
    doughnutLegends,
    doughnutOptions,
    lineLegends,
    lineOptions,
} from '../utils/demo/chartsData'

function Charts() {
    return (
        <>
            <PageTitle>Charts</PageTitle>

            <div className="grid gap-6 mb-8 md:grid-cols-2">
                <ChartCard title="Doughnut">
                    <Doughnut {...doughnutOptions} />
                    <ChartLegend legends={doughnutLegends}/>
                </ChartCard>

                <ChartCard title="Lines">
                    <Line {...lineOptions} />
                    <ChartLegend legends={lineLegends}/>
                </ChartCard>

                <ChartCard title="Bars">
                    <Bar {...barOptions} />
                    <ChartLegend legends={barLegends}/>
                </ChartCard>
            </div>
        </>
    )
}

export default Charts
