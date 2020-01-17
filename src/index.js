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
import { circle, spiral } from './lib/curveEquations'
import { opacityModulus } from './lib/helpers'

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

let debug = false
window.addEventListener('keypress', e => (e.key === 'd' ? !debug : null))

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
  const height = 480

  // create the svg
  const svgContainer = d3
    .create('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .attr('preserveAspectRatio', 'xMidYMin meet')

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
          spiralAngle: Number(d.length),
        }
      })
    })
    .then(dataset => {
      // constants
      const spiralInternalRadius = 10
      const spiralStartingRadius = 10
      const spiralGrowingFactor = 20
      const spiralMaxAngle = d3.max(dataset, d => d.spiralAngle)
      const spiralLinesCount = 200
      const spiralLineAngleIncrement = (2 * Math.PI) / spiralLinesCount
      const circleRadius = 3

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
        .attr('r', circleRadius)

      // append lines to every single group
      datapoints
        .append('line')
        .attr('stroke', 'black')
        .attr('opacity', 0.25)
        .attr('x1', 0)
        .attr('y1', (d, i) => height - yScale(d.spiralYCoord))
        .attr('x2', 0)
        .attr('y2', spiralInternalRadius)

      // .each gives access to data properties of every single element
      datapoints.each((datum, i, svgArray) => {
        // for each datapoint, draw lines following data
        times(spiralLinesCount).forEach(j => {
          const angle = spiralLineAngleIncrement * j
          if (angle > (datum.spiralAngle / spiralMaxAngle) * (2 * Math.PI)) return
          const circlePoints = circle(spiralInternalRadius, angle)
          const spiralPoints = spiral(
            spiralInternalRadius + spiralStartingRadius,
            angle,
            spiralGrowingFactor
          )
          const twistedSpiralPoints = spiral(
            spiralInternalRadius + spiralStartingRadius / 2,
            angle - (Math.PI / spiralLinesCount + (Math.PI / (spiralLinesCount * 5)) * j),
            // angle - spiralLineAngleIncrement * (spiralLinesCount / 10),
            spiralGrowingFactor / 2
          )
          const spiralModulus = opacityModulus(0.3, Math.PI / 5, angle)

          const singleSpiralSelection = d3.select(svgArray[i])
          singleSpiralSelection
            .append('path')
            .attr('stroke', d => colorScheme(d.spiralColor))
            .attr('stroke-width', spiralModulus)
            .attr('opacity', spiralModulus)
            .attr('fill', 'transparent')
            .attr(
              'd',
              `M ${circlePoints.x} ${circlePoints.y} 
              Q ${twistedSpiralPoints.x} ${twistedSpiralPoints.y} ${spiralPoints.x} ${spiralPoints.y}`
            )

          //
          // should repaint chart if debug is true
          //
          // if (debug === true) {
          //   singleSpiralSelection
          //     .append('line')
          //     .attr('opacity', 1)
          //     .attr('stroke', 'gray')
          //     .attr('stroke-width', 0.5)
          //     .attr('x1', circlePoints.x)
          //     .attr('y1', circlePoints.y)
          //     .attr('x2', twistedSpiralPoints.x)
          //     .attr('y2', twistedSpiralPoints.y)
          //   singleSpiralSelection
          //     .append('line')
          //     .attr('opacity', 1)
          //     .attr('stroke', 'gray')
          //     .attr('stroke-width', 0.5)
          //     .attr('x1', twistedSpiralPoints.x)
          //     .attr('y1', twistedSpiralPoints.y)
          //     .attr('x2', spiralPoints.x)
          //     .attr('y2', spiralPoints.y)

          //   singleSpiralSelection
          //     .append('circle')
          //     .attr('opacity', 1)
          //     .attr('fill', 'red')
          //     .attr('cx', twistedSpiralPoints.x)
          //     .attr('cy', twistedSpiralPoints.y)
          //     .attr('r', 1.5)
          // }
          //   singleSpiralSelection
          //     .append('circle')
          //     .attr('opacity', 1)
          //     .attr('fill', 'red')
          //     .attr('cx', circlePoints.x)
          //     .attr('cy', circlePoints.y)
          //     .attr('r', 1.5)
          // }
        })
      })

      const d3ChartTitle = document.createElement('H2')
      d3ChartTitle.innerHTML = 'Responsive spiral chart with pure D3'

      const chartEl = document.getElementById('chart')
      chartEl.appendChild(d3ChartTitle)
      chartEl.appendChild(svgContainer.node())
    })
}
