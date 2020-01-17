import React, { useState, useEffect } from 'react'
import * as d3 from 'd3'
import dirtyDataset from '../data/top50.json'
import { SpiralShell } from './SpiralShell'

function cleanData(dataset) {
  return dataset.map((datum, i) => {
    return {
      track: datum.track_name,
      artist: datum.artist_name,
      genre: datum.genre,
      bpm: Number(datum.bpm),
      loudness: Number(datum.loudness),
      songLength: Number(datum.length),
    }
  })
}

export default function SpiralMultiples(props) {
  const [debug, setDebug] = useState(false)
  useEffect(() => {
    window.addEventListener('keypress', e => {
      if (e.key === 'd') {
        setDebug(prevState => !prevState)
      }
    })
  }, [])

  const dataset = cleanData(dirtyDataset)

  // rename desired dataset columns to chart-specific properties
  // const dataset = sourceDataset.map((song, i) => {
  //   return {
  //     spiralColor: song.genre,
  //     spiralYCoord: song.bpm,
  //     spiralRadius: song.loudness,
  //     spiralAngle: song.length,
  //   }
  // })
  const datasetColumnNames = ['Genre', 'BPM', 'Loudness', 'Song Length']

  // svg constants
  const [margin] = useState({
    top: 80,
    right: 120,
    bottom: 160,
    left: 80,
  })
  const [width] = useState(2560)
  const [height] = useState(720)
  const [viewBox] = useState([0, 0, width, height])

  // graph constants
  // chart
  const spiralInternalRadius = 10
  const spiralMaxAngle = d3.max(dataset, d => d.songLength)
  const spiralLinesCount = 200
  const circleRadius = 3
  // texts
  const fontSize = 10
  const lineHeight = 1.2
  const maxStringLength = 36
  // bottom axis
  const axisBottomLabelsPadding = 12
  // legend
  const legendEntryWidth = 260

  // scales
  const colorScheme = d3.scaleOrdinal(d3.schemeCategory10)
  const xScale = d3
    .scaleLinear()
    .range([0, width - margin.right])
    .domain([0, dataset.length])
  const yScale = d3
    .scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain(d3.extent(dataset, d => d.bpm))

  const trimLongString = (str, maxLength) => {
    // console.log(str.slice(maxLength))
    return str
  }

  // axes
  // const xAxis = d3.axisBottom(xScale)
  // const yAxis = d3.axisLeft(yScale)

  return (
    <div className="chart">
      <h2>Responsive spiral Chart with React and D3</h2>
      {debug && <span className="debug">Debug Mode</span>}
      <svg width={width} height={height} viewBox={viewBox} preserveAspectRatio="xMidYMin meet">
        <g className="legend" transform={`translate(0, ${margin.top})`}>
          {datasetColumnNames.map((legendEntry, j) => {
            return (
              <g key={j} transform={`translate(${legendEntryWidth * j}, 0)`}>
                <text>{legendEntry}</text>
              </g>
            )
          })}
        </g>
        <g transform={`translate(${margin.left}, 0)`}>
          {dataset.map((datum, i) => (
            <>
              <g
                transform={`translate(${xScale(i) - fontSize / 2}, ${height -
                  margin.bottom / 2 +
                  axisBottomLabelsPadding}) rotate(45)`}
                fontSize={`${fontSize}px`}
              >
                <text y={fontSize * lineHeight * 0} fontWeight="500">
                  {trimLongString(datum.track, maxStringLength)}
                </text>
                <text y={fontSize * lineHeight * 1}>
                  {trimLongString(datum.artist, maxStringLength)}
                </text>
              </g>
              <g key={i} transform={`translate(${xScale(i)}, ${yScale(datum.bpm)})`}>
                <circle
                  opacity="1"
                  fill={colorScheme(datum.genre)}
                  cx="0"
                  cy="0"
                  r={circleRadius}
                />
                <line
                  stroke="black"
                  opacity="0.25"
                  x1="0"
                  y1={height - yScale(datum.bpm) - margin.bottom / 2}
                  x2="0"
                  y2={spiralInternalRadius}
                />
                <SpiralShell
                  debug={debug}
                  linesCount={spiralLinesCount}
                  color={colorScheme(datum.genre)}
                  angle={(datum.songLength / spiralMaxAngle) * (2 * Math.PI)}
                  internalRadius={spiralInternalRadius}
                />
              </g>
            </>
          ))}
        </g>
      </svg>
    </div>
  )
}
