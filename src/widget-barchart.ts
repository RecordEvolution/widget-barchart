import { html, css, LitElement, PropertyValueMap } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { property, state } from 'lit/decorators.js'
import Chart from 'chart.js/auto'
import { ConfigureTheBarChart } from './definition-schema.js'

import tinycolor from 'tinycolor2'
// This does not work. See comments at the end of the file.
// import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm'
// import 'chartjs-adapter-moment'
// import 'chartjs-adapter-date-fns'

type Dataseries = Exclude<ConfigureTheBarChart['dataseries'], undefined>[number]
type Data = Exclude<Dataseries['data'], undefined>[number]

export class WidgetBarchart extends LitElement {
    @property({ type: Object })
    inputData?: ConfigureTheBarChart

    @state()
    private canvasList: Map<string, { chart?: any; dataSets: Dataseries[] }> = new Map()

    version: string = 'versionplaceholder'

    update(changedProperties: Map<string, any>) {
        changedProperties.forEach((oldValue, propName) => {
            if (propName === 'inputData') {
                this.transformInputData()
                this.applyInputData()
                return
            }
        })
        super.update(changedProperties)
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        this.transformInputData()
        this.applyInputData()
    }

    transformInputData() {
        if (!this?.inputData?.dataseries?.length) return

        // reset all existing chart dataseries
        this.canvasList.forEach((chartM) => (chartM.dataSets = []))
        this.inputData.dataseries.forEach((ds, j) => {
            ds.chartName = ds.chartName ?? ''

            // pivot data
            const distincts = [...new Set(ds.data?.map((d: Data) => d.pivot))].sort()
            const derivedBgColors = tinycolor(ds.backgroundColor)
                .monochromatic(distincts.length)
                .map((c: any) => c.toHexString())
            const derivedBdColors = tinycolor(ds.borderColor)
                .monochromatic(distincts.length)
                .map((c: any) => c.toHexString())

            const darker = 100 / distincts.length
            distincts.forEach((piv, i) => {
                const prefix = piv ? `${piv} - ` : ''
                const pds: any = {
                    label: prefix + ds.label ?? '',
                    stack: ds.stack || `${ds.label ?? ''}-${piv ?? ''}-${i}`,
                    barThickness: ds.barThickness,
                    backgroundColor: ds.chartName?.includes('#pivot#')
                        ? ds.backgroundColor
                        : derivedBgColors[i],
                    borderColor: ds.chartName?.includes('#pivot#') ? ds.borderColor : derivedBdColors[i],
                    borderWidth: ds.borderWidth,
                    borderRadius: ds.borderRadius,
                    borderSkipped: false,
                    data: (distincts.length === 1 ? ds.data : ds.data?.filter((d) => d.pivot === piv))?.map(
                        (d) => (this.inputData?.settings?.horizontal ? { x: d.y, y: d.x } : d)
                    ) // flip the data if layout is horizontal bars
                }
                // If the chartName ends with :pivot: then create a seperate chart for each pivoted dataseries
                const chartName = ds.chartName?.includes('#pivot#')
                    ? ds.chartName + '-' + piv
                    : ds.chartName ?? ''
                if (!this.canvasList.has(chartName)) {
                    // initialize new charts
                    this.canvasList.set(chartName, { chart: undefined, dataSets: [] as Dataseries[] })
                }
                this.canvasList.get(chartName)?.dataSets.push(pds)
            })
        })
        // prevent duplicate operations
        this.inputData.dataseries = []
    }

    applyInputData() {
        // console.log('barchart datasets', this.canvasList)
        // update chart info
        this.createChart()

        this.requestUpdate()
        this.canvasList.forEach(({ chart, dataSets }) => {
            if (chart) {
                chart.data.datasets = dataSets
                chart?.update('resize')
            }
        })
    }

    createChart() {
        this.canvasList.forEach((chartM, chartName) => {
            if (chartM.chart) return
            const canvas = this.shadowRoot?.querySelector(`[name="${chartName}"]`) as HTMLCanvasElement
            if (!canvas) return
            // console.log('chartM', canvas, chartM.chart)
            chartM.chart = new Chart(canvas, {
                type: 'bar',
                data: {
                    // @ts-ignore
                    datasets: chartM.dataSets
                },
                options: {
                    indexAxis: this.inputData?.settings?.horizontal ? 'y' : 'x',
                    responsive: true,
                    maintainAspectRatio: false,
                    animations: {
                        colors: false,
                        x: false,
                        y: false
                    },
                    transitions: {
                        active: {
                            animation: {
                                duration: 0
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: !!this.inputData?.settings?.xAxisLabel,
                                text: this.inputData?.settings?.horizontal
                                    ? this.inputData.settings.yAxisLabel
                                    : this.inputData?.settings?.xAxisLabel
                            },
                            stacked: true
                        },
                        y: {
                            title: {
                                display: !!this.inputData?.settings?.yAxisLabel,
                                text: this.inputData?.settings?.horizontal
                                    ? this.inputData.settings.xAxisLabel
                                    : this.inputData?.settings?.yAxisLabel
                            },
                            stacked: true
                        }
                    }
                }
            })
        })
    }

    static styles = css`
        :host {
            display: block;
            color: var(--re-line-text-color, #000);
            font-family: sans-serif;
            padding: 16px;
            box-sizing: border-box;
            margin: auto;
        }

        .paging:not([active]) {
            display: none !important;
        }

        .columnLayout {
            flex-direction: column;
        }

        .wrapper {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }

        .chart-container {
            display: flex;
            flex: 1;
            overflow: hidden;
            position: relative;
        }

        .sizer {
            flex: 1;
            overflow: hidden;
            position: relative;
        }

        header {
            display: flex;
            flex-direction: column;
            margin: 0 0 16px 0;
        }
        h3 {
            margin: 0;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        p {
            margin: 10px 0 0 0;
            max-width: 300px;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 17px;
        }
    `

    render() {
        return html`
            <div class="wrapper">
                <header>
                    <h3 class="paging" ?active=${this.inputData?.settings?.title}>
                        ${this.inputData?.settings?.title}
                    </h3>
                    <p class="paging" ?active=${this.inputData?.settings?.subTitle}>
                        ${this.inputData?.settings?.subTitle}
                    </p>
                </header>
                <div class="chart-container ${this?.inputData?.settings?.columnLayout ? 'columnLayout' : ''}">
                    ${repeat(
                        [...this.canvasList.entries()].sort(),
                        ([chartName, chartM]) => chartName,
                        ([chartName]) => html`
                            <div class="sizer">
                                <canvas name="${chartName}"></canvas>
                            </div>
                        `
                    )}
                </div>
            </div>
        `
    }
}
window.customElements.define('widget-barchart-versionplaceholder', WidgetBarchart)

// ############################################### WORKAROUND #######################################################################
//
// For some reason the import of that adapter is messed up. I suspect that rollup does things in the wrong order.
// Because this is an import that has side effects. i.e. it overrides the adapters of the previously imported Chart.js
// So the current solution is to execute the source code here in-line. (moving this to a local file and importing that does not work!)
// This is the source code of https://github.com/chartjs/chartjs-adapter-date-fns/blob/master/src/index.js

import { _adapters } from 'chart.js'

import {
    parse,
    parseISO,
    toDate,
    isValid,
    format,
    startOfSecond,
    startOfMinute,
    startOfHour,
    startOfDay,
    startOfWeek,
    startOfMonth,
    startOfQuarter,
    startOfYear,
    addMilliseconds,
    addSeconds,
    addMinutes,
    addHours,
    addDays,
    addWeeks,
    addMonths,
    addQuarters,
    addYears,
    differenceInMilliseconds,
    differenceInSeconds,
    differenceInMinutes,
    differenceInHours,
    differenceInDays,
    differenceInWeeks,
    differenceInMonths,
    differenceInQuarters,
    differenceInYears,
    endOfSecond,
    endOfMinute,
    endOfHour,
    endOfDay,
    endOfWeek,
    endOfMonth,
    endOfQuarter,
    endOfYear
} from 'date-fns'

const FORMATS = {
    datetime: 'MMM d, yyyy, h:mm:ss aaaa',
    millisecond: 'h:mm:ss.SSS aaaa',
    second: 'h:mm:ss aaaa',
    minute: 'h:mm aaaa',
    hour: 'ha',
    day: 'MMM d',
    week: 'PP',
    month: 'MMM yyyy',
    quarter: 'qqq - yyyy',
    year: 'yyyy'
}

_adapters._date.override({
    _id: 'date-fns', // DEBUG
    formats: function () {
        return FORMATS
    },

    parse: function (value, fmt) {
        if (value === null || typeof value === 'undefined') {
            return null
        }
        const type = typeof value
        if (type === 'number' || value instanceof Date) {
            // @ts-ignore
            value = toDate(value)
        } else if (type === 'string') {
            if (typeof fmt === 'string') {
                // @ts-ignore
                value = parse(value, fmt, new Date(), this.options)
            } else {
                // @ts-ignore
                value = parseISO(value, this.options)
            }
        }
        // @ts-ignore
        return isValid(value) ? value.getTime() : null
    },

    format: function (time, fmt) {
        return format(time, fmt, this.options)
    },

    // @ts-ignore
    add: function (time, amount, unit) {
        switch (unit) {
            case 'millisecond':
                return addMilliseconds(time, amount)
            case 'second':
                return addSeconds(time, amount)
            case 'minute':
                return addMinutes(time, amount)
            case 'hour':
                return addHours(time, amount)
            case 'day':
                return addDays(time, amount)
            case 'week':
                return addWeeks(time, amount)
            case 'month':
                return addMonths(time, amount)
            case 'quarter':
                return addQuarters(time, amount)
            case 'year':
                return addYears(time, amount)
            default:
                return time
        }
    },

    diff: function (max, min, unit) {
        switch (unit) {
            case 'millisecond':
                return differenceInMilliseconds(max, min)
            case 'second':
                return differenceInSeconds(max, min)
            case 'minute':
                return differenceInMinutes(max, min)
            case 'hour':
                return differenceInHours(max, min)
            case 'day':
                return differenceInDays(max, min)
            case 'week':
                return differenceInWeeks(max, min)
            case 'month':
                return differenceInMonths(max, min)
            case 'quarter':
                return differenceInQuarters(max, min)
            case 'year':
                return differenceInYears(max, min)
            default:
                return 0
        }
    },

    // @ts-ignore
    startOf: function (time, unit, weekday) {
        switch (unit) {
            case 'second':
                return startOfSecond(time)
            case 'minute':
                return startOfMinute(time)
            case 'hour':
                return startOfHour(time)
            case 'day':
                return startOfDay(time)
            case 'week':
                return startOfWeek(time)
            case 'isoWeek':
                // @ts-ignore
                return startOfWeek(time, { weekStartsOn: +weekday })
            case 'month':
                return startOfMonth(time)
            case 'quarter':
                return startOfQuarter(time)
            case 'year':
                return startOfYear(time)
            default:
                return time
        }
    },

    // @ts-ignore
    endOf: function (time, unit) {
        switch (unit) {
            case 'second':
                return endOfSecond(time)
            case 'minute':
                return endOfMinute(time)
            case 'hour':
                return endOfHour(time)
            case 'day':
                return endOfDay(time)
            case 'week':
                return endOfWeek(time)
            case 'month':
                return endOfMonth(time)
            case 'quarter':
                return endOfQuarter(time)
            case 'year':
                return endOfYear(time)
            default:
                return time
        }
    }
})
