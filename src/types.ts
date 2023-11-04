
export interface Settings {
    title: string,
    subTitle: string,
    label: string
}

export interface Style {
    backgroundColor: string[],
    borderColor: string[],
    borderWidth: number
}

export interface Data {
    x: String,
    y: Number
}

export interface InputData {
    settings: Settings,
    dataseries: Data[],
    style: Style
}
