import { html, css, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import Chart from 'chart.js/auto';

declare global {
  interface InputData {
    settings: Settings,
    dataseries: Data[],
    style: Style
  }

  interface Settings {
    title: string,
    subTitle: string,
    label: string
  }

  interface Style {
    backgroundColor: string[],
    borderColor: string[],
    borderWidth: number
  }

  interface Data {
    x: String,
    y: Number
  }

}

export class WidgetBarchart extends LitElement {

  @property() inputData = {} as InputData

  @state()
  private demoCanvas: HTMLCanvasElement | undefined = undefined;
  @state()
  private chartInstance: any | undefined = undefined;
  @state()
  private barTitle: string = 'Bar-chart';
  @state()
  private barDescription: string = 'This is a Bar-chart from the RE-Dahsboard';
  @state()
  private barLabel: string = 'Bar-chart label';
  @state()
  private dataseries: Data[] = []
  @state()
  private backgroundColor: string[] = []
  @state()
  private borderColor: string[] = []
  @state()
  private borderWidth: number = 0

  updated(changedProperties: Map<string, any>) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'inputData') {
            if(oldValue && oldValue?.data && oldValue?.data[0]) {
              this.createGaugeData()
              this.chartInstance?.update()
              return
            }
            this.createGaugeData()
            if(this.chartInstance) {
              this.chartInstance?.update()
            } else {
              this.renderChart()
            }
          return
      }
    })
  }

  createGaugeData() {
    if(this.inputData && (!this.inputData?.settings?.title || !this.inputData?.dataseries.length)) return

    // Generel
    this.barTitle = this.inputData.settings.title ? this.inputData.settings.title : this.barTitle
    this.barDescription = this.inputData.settings.subTitle ? this.inputData.settings.subTitle : this.barDescription
    this.barLabel = this.inputData.settings.label ? this.inputData.settings.label : this.barLabel
    this.dataseries = this.inputData.dataseries ? this.inputData.dataseries : []

    // Style
    this.backgroundColor = this.inputData.style.backgroundColor ? this.inputData.style.backgroundColor : this.backgroundColor
    this.borderColor = this.inputData.style.borderColor ? this.inputData.style.borderColor : this.borderColor
    this.borderWidth = this.inputData.style.borderWidth ? this.inputData.style.borderWidth : this.borderWidth

  }

  renderChart() {
		const demoCanvas: HTMLCanvasElement = this.shadowRoot?.querySelector('#acquisitions') as any;

		if(!demoCanvas) { return }
    this.chartInstance = new Chart(
			demoCanvas,
			{
				type: 'bar',
				data: {
					labels: this.dataseries.map(row => row.x),
					datasets: [
						{
              label: this.barLabel,
							data: this.dataseries.map(row => row.y),
              backgroundColor: this.backgroundColor,
              borderColor: this.borderColor,
              borderWidth: this.borderWidth
						}
					]
				}
			}
  	);
  }

  static styles = css`
    :host {
      display: inline-block;
      color: var(--re-bar-text-color, #000);
      font-family: sans-serif;
      padding: 16px;
      box-sizing: border-box;
      position: relative;
      margin: auto;
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
        <header>
          <h3>${this.barTitle}</h3>
          <p>${this.barDescription}</p>
        </header>
        <canvas id="acquisitions"></canvas>
    `;
  }
}
