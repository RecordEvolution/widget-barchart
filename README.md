# \<re-bar-chart>

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation

```bash
npm i re-bar-chart
```

## Usage

```html
<script type="module">
  import 're-bar-chart/widget-barchart.js';
</script>

<re-bar-chart></re-bar-chart>
```

## Expected data format

The following format represents the available data :
```
data: {
  settings: {
    title: string,
    subTitle: string,
    label: string,
    style: {
      backgroundColor: string[],
      borderColor: string[],
      borderWidth: number
    }
  }
  data: [
    {x: string, y: number}
  ]
}
```

## Interfaces

```
  interface InputData {
    settings: Settings
    data: Data[]
  }
```
```
  interface Settings {
    title: string,
    subTitle: string,
    label: string,
    style: Style
  }
```
```
  interface Style {
    backgroundColor: string[],
    borderColor: string[],
    borderWidth: number
  }
```
```
  interface Data {
    x: string,
    y: number,
  }
```

## Style options
The following options are available for styling the bar graph.
A color string is provided in the `backgroundColor` array for each data object.
The same counts for the `borderColor` array

```
  interface Style {
    backgroundColor: string[],
    borderColor: string[],
    borderWidth: number
  }
```

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```


## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`
