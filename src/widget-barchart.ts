import { html, css, LitElement } from 'lit'
import { property, state } from 'lit/decorators.js'
import Chart, { ChartDataset } from 'chart.js/auto'
// @ts-ignore
import tinycolor from "tinycolor2"
// This does not work. See comments at the end of the file.
// import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm'
// import 'chartjs-adapter-moment'
// import 'chartjs-adapter-date-fns'
import { InputData, Data, Dataseries } from './types.js'

export class WidgetBarchart extends LitElement {
  
  @property({type: Object}) 
  inputData = {} as InputData

  @state()
  private chartInstance: Chart | undefined = undefined
  @state()
  private barTitle: string = 'Bar-chart'
  @state()
  private barDescription: string = 'This is a Bar-chart'

  @state()
  private dataSets: Dataseries[] = []

  updated(changedProperties: Map<string, any>) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'inputData') {
        this.applyInputData()
        return
      }
    })
  }

  applyInputData() {

    if(!this?.inputData?.settings?.title || !this?.inputData?.dataseries.length) return

    this.barTitle = this.inputData.settings.title ?? this.barTitle
    this.barDescription = this.inputData.settings.subTitle ?? this.barDescription
    this.dataSets = []
    this.inputData.dataseries.forEach((ds, j) => {
      if (ds.borderDash) ds.borderDash = JSON.parse(ds.borderDash)

      // pivot data
      const distincts = [...new Set(ds.data.map((d: Data) => d.pivot))]
      if (distincts.length > 1) {
        const darker = 100 / distincts.length
        distincts.forEach((piv, i) => {
          const pds: any = {
            label: ds.label + ' ' + piv,
            order: ds.order,
            stack: ds.stack || `${ds.label}-${piv}-${i}`,
            barThickness: ds.barThickness,
            backgroundColor: tinycolor(ds.backgroundColor).darken(darker * i).toString(),
            borderColor: tinycolor(ds.borderColor).darken(darker * i).toString(),
            borderWidth: ds.borderWidth,
            borderDash: ds.borderDash,
            borderRadius: ds.borderRadius,
            borderSkipped: false,
            data: ds.data.filter(d => d.pivot === piv).map(d => this.inputData.settings.horizontal ? {x: d.y, y: d.x}: d)
          }
          this.dataSets.push(pds)
        })
      } else {
        ds.data = ds.data.map(d => this.inputData.settings.horizontal ? {x: d.y, y: d.x}: d)
        ds.borderSkipped = false
        ds.stack = ds.stack || `${ds.label}-${j}`
        this.dataSets.push(ds)
      }

    })
    // console.log('barchart datasets', this.dataSets)
    // update chart info
    if (this.chartInstance) {
      // @ts-ignore
      this.chartInstance.data.datasets = this.dataSets
      // @ts-ignore
      // this.chartInstance.options.scales.x.type = this.xAxisType()
      this.chartInstance.update('none')
    } else {
      this.createChart()
    }
  }

  xAxisType() {
    const onePoint = this.inputData.dataseries?.[0].data?.[0]
    // @ts-ignore
    if (onePoint && !isNaN(onePoint.x)) return 'linear'
    return 'category'
  }

  createChart() {
    const canvas = this.shadowRoot?.querySelector('#barChart') as HTMLCanvasElement;
		if(!canvas ) return
      // @ts-ignore
      this.chartInstance = new Chart(
        canvas,
        {
          type: 'bar',
          data: {
      // @ts-ignore
            datasets: this.dataSets
          },
          options: {
            indexAxis: this.inputData.settings.horizontal ? 'y': 'x',
            responsive: true,
            maintainAspectRatio: false,
            animations: {
              "colors": false,
              "x": false,
              "y": false
            },
            transitions: {
              "active": {
                "animation": {
                  "duration": 0
                }
              }
            },
            scales: {
              x: {
                // type: this.xAxisType(),
                title: {
                  display: !!this.inputData.settings.xAxisLabel,
                  text: this.inputData.settings.horizontal ? this.inputData.settings.yAxisLabel : this.inputData.settings.xAxisLabel
                }
                , stacked: true
              },
              y: {
                title: {
                  display: !!this.inputData.settings.yAxisLabel,
                  text: this.inputData.settings.horizontal ? this.inputData.settings.xAxisLabel : this.inputData.settings.yAxisLabel
                }
                , stacked: true
              }

            },
          },
        }
      );
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

  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  #sizer {
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
    line-height: 17px;
  }
`; 

  render() {
    return html`
      <div class="wrapper">
        <header>
          <h3>${this.barTitle}</h3>
          <p>${this.barDescription}</p>
        </header>
        <div id="sizer">
          <canvas id="barChart"></canvas>
        </div>
      </div>
    `;
  }
}
window.customElements.define('widget-barchart', WidgetBarchart)

// ############################################### WORKAROUND #######################################################################
//
// For some reason the import of that adapter is messed up. I suspect that rollup does things in the wrong order.
// Because this is an import that has side effects. i.e. it overrides the adapters of the previously imported Chart.js
// So the current solution is to execute the source code here in-line. (moving this to a local file and importing that does not work!)
// This is the source code of https://github.com/chartjs/chartjs-adapter-date-fns/blob/master/src/index.js

import {_adapters} from 'chart.js';

import {
  parse, parseISO, toDate, isValid, format,
  startOfSecond, startOfMinute, startOfHour, startOfDay,
  startOfWeek, startOfMonth, startOfQuarter, startOfYear,
  addMilliseconds, addSeconds, addMinutes, addHours,
  addDays, addWeeks, addMonths, addQuarters, addYears,
  differenceInMilliseconds, differenceInSeconds, differenceInMinutes,
  differenceInHours, differenceInDays, differenceInWeeks,
  differenceInMonths, differenceInQuarters, differenceInYears,
  endOfSecond, endOfMinute, endOfHour, endOfDay,
  endOfWeek, endOfMonth, endOfQuarter, endOfYear
} from 'date-fns';

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
};

_adapters._date.override({
  _id: 'date-fns', // DEBUG
  formats: function() {
    return FORMATS;
  },

  parse: function(value, fmt) {
    if (value === null || typeof value === 'undefined') {
      return null;
    }
    const type = typeof value;
    if (type === 'number' || value instanceof Date) {
// @ts-ignore
      value = toDate(value);
    } else if (type === 'string') {
      if (typeof fmt === 'string') {
// @ts-ignore
        value = parse(value, fmt, new Date(), this.options);
      } else {
// @ts-ignore
        value = parseISO(value, this.options);
      }
    }
// @ts-ignore
    return isValid(value) ? value.getTime() : null;
  },

  format: function(time, fmt) {
    return format(time, fmt, this.options);
  },

// @ts-ignore
  add: function(time, amount, unit) {
    switch (unit) {
    case 'millisecond': return addMilliseconds(time, amount);
    case 'second': return addSeconds(time, amount);
    case 'minute': return addMinutes(time, amount);
    case 'hour': return addHours(time, amount);
    case 'day': return addDays(time, amount);
    case 'week': return addWeeks(time, amount);
    case 'month': return addMonths(time, amount);
    case 'quarter': return addQuarters(time, amount);
    case 'year': return addYears(time, amount);
    default: return time;
    }
  },

  diff: function(max, min, unit) {
    switch (unit) {
    case 'millisecond': return differenceInMilliseconds(max, min);
    case 'second': return differenceInSeconds(max, min);
    case 'minute': return differenceInMinutes(max, min);
    case 'hour': return differenceInHours(max, min);
    case 'day': return differenceInDays(max, min);
    case 'week': return differenceInWeeks(max, min);
    case 'month': return differenceInMonths(max, min);
    case 'quarter': return differenceInQuarters(max, min);
    case 'year': return differenceInYears(max, min);
    default: return 0;
    }
  },

// @ts-ignore
  startOf: function(time, unit, weekday) {
    switch (unit) {
    case 'second': return startOfSecond(time);
    case 'minute': return startOfMinute(time);
    case 'hour': return startOfHour(time);
    case 'day': return startOfDay(time);
    case 'week': return startOfWeek(time);
// @ts-ignore
    case 'isoWeek': return startOfWeek(time, {weekStartsOn: +weekday});
    case 'month': return startOfMonth(time);
    case 'quarter': return startOfQuarter(time);
    case 'year': return startOfYear(time);
    default: return time;
    }
  },

// @ts-ignore
  endOf: function(time, unit) {
    switch (unit) {
    case 'second': return endOfSecond(time);
    case 'minute': return endOfMinute(time);
    case 'hour': return endOfHour(time);
    case 'day': return endOfDay(time);
    case 'week': return endOfWeek(time);
    case 'month': return endOfMonth(time);
    case 'quarter': return endOfQuarter(time);
    case 'year': return endOfYear(time);
    default: return time;
    }
  }
});