// import React from 'react'
// import ReactDOM from 'react-dom'
// import {
//   App
// } from './components/App'
import 'modern-normalize'
import '@accurat/tachyons-lite'
import 'tachyons-extra'
import './reset.css'
import './style.css'

import * as d3 from 'd3'
import {
  times,
} from 'lodash'

function renderApp() {
  // ReactDOM.render(<App />, document.getElementById('root'))

  //
  // set the initial properties of the chart
  //
  // like the margins, the width and the height of the svg
  const margin = {
    top: 20,
    right: 20,
    bottom: 20,
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
  // set scales
  const x = d3.scaleLinear().range([0, width - margin.right])
  // const xAxis = d3.axisBottom(x)
  // svgContainer
  //   .append('g')
  //   .attr('class', 'x-axis')
  //   .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)

  const y = d3.scaleLinear().range([0, height - margin.top - margin.bottom])
  // const yAxis = d3.axisLeft(y)
  // svgContainer
  //   .append('g')
  //   .attr('class', 'y-axis')
  //   .attr('transform', `translate(${margin.left / 1.3}, 0)`)

  const r = d3.scaleLinear().range([3, 40])

  const colorScheme = d3.scaleOrdinal(d3.schemeCategory10)

  //
  //
  // load the external data file
  import('./data/top50.json').then(response => {
    return response.default.map(d => {
      return {
        track_name: d.track_name,
        artist_name: d.artist_name,
        genre: d.genre,
        bpm: Number(d.bpm),
        energy: Number(d.energy),
        danceability: Number(d.danceability),
        loudness: Number(d.loudness),
        liveness: Number(d.liveness),
        valence: Number(d.valence),
        length: Number(d.length),
        acousticness: Number(d.acousticness),
        speechiness: Number(d.speechiness),
        popularity: Number(d.popularity),
      }
    })
  }).then(dataset => {
    x.domain([0, 50])
    y.domain([0, d3.max(dataset, d => d.bpm)])
    r.domain([d3.min(dataset, d => d.loudness), 0])

    const datapoints = chartArea
      .selectAll('g')
      .data(dataset)
      .join('g')
      .attr('class', 'datapoint')
      .attr('transform', (d, i) => `translate(${x(i)}, ${y(d.bpm)})`)

    // append circles to every single group
    datapoints
      .append('circle')
      .attr('opacity', 1)
      .attr('fill', d => colorScheme(d.genre))
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 2)

    // append lines to every single group
    datapoints
      .append('line')
      .attr('stroke', 'black')
      .attr('opacity', 0.25)
      .attr('x1', 0)
      .attr('y1', (d, i) => height - y(d.bpm))
      .attr('x2', 0)
      .attr('y2', 5)

    const maxLengthValue = d3.max(dataset, d => d.length)
    const internalRadius = 5
    const startingSpiralRadius = 10
    const spiralGrowingFactor = 20

    function circle(r, a) {
      return {
        x: r * Math.sin(a),
        y: r * -Math.cos(a),
      }
    }

    function spiral(rStart, a, factor) {
      return {
        x: (rStart + a * factor) * Math.sin(a),
        y: (rStart + a * factor) * -Math.cos(a),
      }
    }

    times(maxLengthValue).forEach(i => {
      const angle = ((2 * Math.PI) / maxLengthValue) * i
      const opacityModulus = (constant, modulus) =>
        constant + ((angle + Math.PI) % modulus)

      const circlePoints = circle(internalRadius, angle)
      const spiralPoints = spiral(
        internalRadius + startingSpiralRadius,
        angle,
        spiralGrowingFactor,
      )

      // console.log(Math.round(angle * (maxLengthValue % 4)))
      datapoints
        .append('line')
        .attr('opacity', 0)
        .attr('stroke', d => colorScheme(d.genre))
        .attr('x1', circlePoints.x)
        .attr('y1', circlePoints.y)
        .attr('x2', spiralPoints.x)
        .attr('y2', spiralPoints.y)
        .attr('opacity', d =>
          angle < 2 * Math.PI * (d.length / maxLengthValue) ?
            opacityModulus(0.1, Math.PI / 5) :
            0,
        )
    })
  })

  document.getElementById('chart').appendChild(svgContainer.node())

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