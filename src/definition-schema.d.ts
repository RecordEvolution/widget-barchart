/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type Title = string;
export type Subtitle = string;
export type XAxisLabel = string;
export type YAxisLabel = string;
export type HorizontalBars = boolean;
/**
 * When multiple charts are drawn, then they will be layed out horizontically or vertically.
 */
export type VerticalChartLayout = boolean;
/**
 * The name for this data series
 */
export type Label = string;
export type BorderWidth = number;
/**
 * Number in pixels for a rounding effect on the bars.
 */
export type BarCornerRadius = number;
/**
 * The Thickness of the bar in pixels
 */
export type BarThickness = number;
/**
 * If two dataseries have the same 'Chart' name, they will be drawn in the same chart. Otherwise they will get their own chart. If the name contains #split# as substring then a separat chart will be drawn for each split dataseries.
 */
export type Chart = string;
/**
 * To stack series on top of each other within one chart, give them the same stack name.
 */
export type Stack = string;
export type XValue = string;
export type YValue = string;
/**
 * You can specify a column in the input data to autogenerate dataseries for each distinct entry in this column. E.g. if you have a table with columns [city, timestamp, temperature] and specify 'city' as split column, then you will get a dataseries for each city.
 */
export type SplitDataBy = string;
/**
 * The data used to draw this data series.
 */
export type Data = {
  x?: XValue;
  y?: YValue;
  pivot?: SplitDataBy;
  [k: string]: unknown;
}[];
export type Dataseries = {
  label?: Label;
  backgroundColor?: BarColor;
  borderColor?: BorderColor;
  styling?: Styling;
  advanced?: AdvancedSettings;
  data?: Data;
  [k: string]: unknown;
}[];

export interface InputData {
  title?: Title;
  subTitle?: Subtitle;
  axis?: AxisSettings;
  dataseries?: Dataseries;
  [k: string]: unknown;
}
export interface AxisSettings {
  xAxisLabel?: XAxisLabel;
  yAxisLabel?: YAxisLabel;
  horizontal?: HorizontalBars;
  columnLayout?: VerticalChartLayout;
  [k: string]: unknown;
}
/**
 * The inner color of the bars.
 */
export interface BarColor {
  [k: string]: unknown;
}
/**
 * The border color of the bars.
 */
export interface BorderColor {
  [k: string]: unknown;
}
export interface Styling {
  borderWidth?: BorderWidth;
  borderRadius?: BarCornerRadius;
  barThickness?: BarThickness;
  [k: string]: unknown;
}
export interface AdvancedSettings {
  chartName?: Chart;
  stack?: Stack;
  [k: string]: unknown;
}
