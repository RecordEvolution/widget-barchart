
export interface Settings {
    title: string
    subTitle: string
    horizontal: boolean
    xAxisLabel: string
    yAxisLabel: string
    columnLayout: boolean
}

export interface Data {
    x: string | number,
    y: string | number,
    pivot?: string
}

export interface Dataseries {
    label: string
    chartName: string
    stack: string
    barThickness: number
    backgroundColor: string
    borderColor: string
    borderWidth: number
    borderRadius: number
    data: Data[]
    borderSkipped: boolean
}

export interface InputData {
    settings: Settings,
    dataseries: Dataseries[]
}