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
import { circle, spiral, twistedSpiral } from '../src/lib/curveEquations'
import { opacityModulus } from '../src/lib/helpers'

function renderApp() {
  ReactDOM.render(<App />, document.getElementById('root'))

  makeSpirals()
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
  // set initial properties of the chart
  const margin = {
    top: 80,
    right: 80,
    bottom: 80,
    left: 80,
  }
  const width = 1920
  const height = 540

  // create the svg
  const svgContainer = d3
    .create('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

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
      const internalRadius = 10
      const startingSpiralRadius = 10
      const spiralGrowingFactor = 20
      const maxLengthValue = d3.max(dataset, d => d.spiralNumberOfLines)
      const spiralLineAngleIncrement = (2 * Math.PI) / maxLengthValue

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

      // .each gives access to data properties of every single element
      datapoints.each((datum, i, svgArray) => {
        // for each datapoint, draw lines following data
        times(datum.spiralNumberOfLines).forEach(j => {
          const angle = spiralLineAngleIncrement * j
          const circlePoints = circle(internalRadius, angle)
          const spiralPoints = spiral(
            internalRadius + startingSpiralRadius,
            angle,
            spiralGrowingFactor
          )
          const twistedSpiralPoints = twistedSpiral(
            internalRadius + startingSpiralRadius,
            angle,
            spiralGrowingFactor,
            j
          )
          const spiralModulus = opacityModulus(0.3, Math.PI / 5, angle)

          d3.select(svgArray[i])
            // .append('line')
            // .attr('opacity', 0)
            // .attr('stroke', d => colorScheme(d.spiralColor))
            // .attr('x1', circlePoints.x)
            // .attr('y1', circlePoints.y)
            // .attr('x2', spiralPoints.x)
            // .attr('y2', spiralPoints.y)
            // .attr('opacity', spiralModulus)
            // .attr('stroke-width', spiralModulus)
            .append('path')
            .attr('fill', 'none')
            .attr('stroke', d => colorScheme(d.spiralColor))
            .attr('opacity', spiralModulus)
            .attr('stroke-width', spiralModulus)
            .attr(
              'd',
              `m ${circlePoints.x} ${circlePoints.y} 
              q ${twistedSpiralPoints.x} ${twistedSpiralPoints.y} ${spiralPoints.x} ${spiralPoints.y}`
            )
        })
      })

      const d3ChartTitle = document.createElement('H2')
      d3ChartTitle.innerHTML = 'Spiral chart with pure D3'

      const chartEl = document.getElementById('chart')
      chartEl.appendChild(d3ChartTitle)
      chartEl.appendChild(svgContainer.node())
    })
}
