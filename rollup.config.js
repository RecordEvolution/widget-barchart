import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from '@rollup/plugin-typescript';
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";

export default {
    input: './src/re-bar-chart.ts',
    output: {
        dir: './dist',
        name: 're-bar-chart_bundle',
        banner: `/* @license Copyright (c) 2020 Record Evolution GmbH. All rights reserved.*/`,
        format: 'esm'
    },
    plugins: [
        typescript({ sourceMap: true }),
        nodeResolve(),
        commonjs({}),
        babel({ babelHelpers: 'bundled' })
    ]
};