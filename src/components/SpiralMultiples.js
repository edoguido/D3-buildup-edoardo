import React, { useState, useEffect } from 'react'
import * as d3 from 'd3'
import dirtyDataset from '../data/top50.json'
import { SpiralShell } from './SpiralShell'
import { numberOfDistinctElements } from '../lib/helpers'

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
  //
  // convert a discrete scale in a continuous one
  const differentGenres = numberOfDistinctElements(dataset, 'genre')

  //
  // svg constants
  const [margin] = useState({
    top: 80,
    right: 120,
    bottom: 480,
    left: 240,
  })
  const [width] = useState(2560)
  const [height] = useState(960)
  const [viewBox] = useState([0, 0, width + margin.right, height + margin.bottom])

  //
  // graph constants
  // chart
  const spiralInternalRadius = 10
  const spiralMaxAngle = d3.max(dataset, d => d.songLength)
  const spiralLinesCount = 120
  //
  // texts
  const fontSize = 10
  const lineHeight = 1.2
  const maxStringLength = 36
  //
  // bottom axis
  const axisBottomLabelsPadding = 12
  //
  // legend
  const legendEntryWidth = 260
  const legendEntryHeight = 18
  const legendSymbolSize = 6
  //
  // scales
  const colorScheme = d3.scaleSequential(d3.interpolateSinebow).domain([0, differentGenres.length])
  const xScale = d3
    .scaleLinear()
    .range([0, width - margin.right])
    .domain([0, dataset.length])
  const yScale = d3
    .scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain(d3.extent(dataset, d => d.bpm))

  //
  // trim string only if trimmed character is a space
  const trimLongString = (str, maxLength) => {
    // console.log(str.slice(maxLength))
    return str
  }

  //
  // axes
  // const xAxis = d3.axisBottom(xScale)
  // const yAxis = d3.axisLeft(yScale)

  return (
    <div className="chart">
      <h2>Responsive spiral Chart with React and D3</h2>
      <svg width={width} height={height} viewBox={viewBox} preserveAspectRatio="xMidYMin meet">
        {/* <g className="legend" transform={`translate(0, ${margin.top})`}>
          {datasetColumnNames.map((legendEntry, j) => {
            return (
              <g key={j} transform={`translate(${legendEntryWidth * j}, 0)`}>
                <text x={legendRectSize * 1.5}>{legendEntry}</text>
              </g>
            )
          })}
        </g> */}

        <g className="legend" transform={`translate(0, ${margin.top})`}>
          {differentGenres.map((legendEntry, j) => {
            console.log(legendEntry, colorScheme(j))
            return (
              <g key={j} transform={`translate(0, ${legendEntryHeight * j})`}>
                <circle
                  fill={colorScheme(j)}
                  cx={legendSymbolSize / 2}
                  cy={-legendSymbolSize}
                  r={legendSymbolSize / 2}
                >
                  {legendEntry}
                </circle>
                <text x={legendSymbolSize * 1.5}>{legendEntry}</text>
              </g>
            )
          })}
        </g>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {dataset.map((datum, i) => {
            const color = ['#ffffff', colorScheme(differentGenres.indexOf(datum.genre))]
            return (
              <g key={i}>
                <g transform={`translate(${xScale(i)}, ${yScale(datum.bpm)})`}>
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
                    color={color}
                    angle={(datum.songLength / spiralMaxAngle) * (2 * Math.PI)}
                    internalRadius={spiralInternalRadius}
                    modulus={Math.PI / 6}
                    linesCount={spiralLinesCount}
                  />
                </g>
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
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
