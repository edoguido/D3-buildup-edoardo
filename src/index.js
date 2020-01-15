import React from 'react'
import ReactDOM from 'react-dom'
import 'modern-normalize'
import '@accurat/tachyons-lite'
import 'tachyons-extra'
import './reset.css'
import './style.css'
import * as d3 from 'd3'
import { times } from 'lodash'
import { App } from './components/App'
import { circle, spiral } from '../src/lib/curveEquations'

function renderApp() {
  makeSpirals()

  ReactDOM.render(<App />, document.getElementById('root'))
}

// First render
renderApp()

// Hot module reloading
if (module.hot) {
  module.hot.accept('components/App', () => {
    console.clear()
    renderApp()
  })
}

function makeSpirals() {
  //
  // set the initial properties of the chart
  //
  // eg the margins, the width and the height of the svg
  const margin = {
    top: 80,
    right: 80,
    bottom: 80,
    left: 80,
  }
  const width = 1420
  const height = 720

  // create the svg
  const svgContainer = d3
    .create('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [
      0,
      0,
      width + margin.left + margin.right,
      height + margin.top + margin.bottom,
    ])

  const chartArea = svgContainer
    .append('g')
    .attr('class', 'chart-area')
    .attr('transform', `translate(${margin.left}, 0)`)

  //
  // set scales and axes
  const xScale = d3.scaleLinear().range([0, width - margin.right])
  // const xAxis = d3.axisBottom(xScale)
  // svgContainer
  //   .append('g')
  //   .attr('class', 'x-axis')
  //   .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)

  const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top])
  // const yAxis = d3.axisLeft(yScale)
  // svgContainer
  //   .append('g')
  //   .attr('class', 'y-axis')
  //   .attr('transform', `translate(${margin.left / 1.3}, 0)`)

  const rScale = d3.scaleLinear().range([3, 40])

  const colorScheme = d3.scaleOrdinal(d3.schemeCategory10)

  //
  // load dataset
  import('./data/top50.json')
    .then(response => {
      return response.default.map(d => {
        return {
          spiralColor: d.genre,
          spiralYCoord: Number(d.bpm),
          spiralRadius: Number(d.loudness),
          spiralNumberOfLines: Number(d.length),
          // track_name: d.track_name,
          // artist_name: d.artist_name,
          // energy: Number(d.energy),
          // danceability: Number(d.danceability),
          // liveness: Number(d.liveness),
          // valence: Number(d.valence),
          // acousticness: Number(d.acousticness),
          // speechiness: Number(d.speechiness),
          // popularity: Number(d.popularity),
        }
      })
    })
    .then(dataset => {
      // constants
      const maxLengthValue = d3.max(dataset, d => d.spiralNumberOfLines)
      const internalRadius = 10
      const startingSpiralRadius = 10
      const spiralGrowingFactor = 20

      // set scales according to dataset features
      xScale.domain([0, dataset.length])
      yScale.domain(d3.extent(dataset, d => d.spiralYCoord))
      rScale.domain([d3.min(dataset, d => d.spiralRadius), 0])

      // make group that contains the plot
      const datapoints = chartArea
        .selectAll('g')
        .data(dataset)
        .join('g')
        .attr('class', 'datapoint')
        .attr('transform', (d, i) => `translate(${xScale(i)}, ${yScale(d.spiralYCoord)})`)

      // append circles to every single group
      datapoints
        .append('circle')
        .attr('opacity', 1)
        .attr('fill', d => colorScheme(d.spiralColor))
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 4)

      // append lines to every single group
      datapoints
        .append('line')
        .attr('stroke', 'black')
        .attr('opacity', 0.25)
        .attr('x1', 0)
        .attr('y1', (d, i) => height - yScale(d.spiralYCoord))
        .attr('x2', 0)
        .attr('y2', internalRadius)

      datapoints.each((datum, i, svgArray) => {
        times(datum.spiralNumberOfLines).forEach(j => {
          const angle = ((2 * Math.PI) / maxLengthValue) * j
          const opacityModulus = (constant, modulus) => constant + ((angle + Math.PI) % modulus)
          const numberOfLinesScale = d3
            .scaleLinear()
            .range([0, Math.PI * 2])
            .domain([0, maxLengthValue])

          const circlePoints = circle(internalRadius, angle)
          const spiralPoints = spiral(
            internalRadius + startingSpiralRadius,
            angle,
            spiralGrowingFactor
          )

          d3.select(svgArray[i])
            .append('line')
            .attr('opacity', 0)
            .attr('stroke', d => colorScheme(d.spiralColor))
            .attr('x1', circlePoints.x)
            .attr('y1', circlePoints.y)
            .attr('x2', spiralPoints.x)
            .attr('y2', spiralPoints.y)
            .attr('opacity', d =>
              angle < numberOfLinesScale(d.spiralNumberOfLines)
                ? opacityModulus(0.1, Math.PI / 5)
                : 0
            )
        })
      })

      const d3ChartTitle = document.createElement('H1')
      d3ChartTitle.innerHTML = 'Spiral chart with pure D3'

      document.getElementById('chart').appendChild(svgContainer.node())
    })
}
