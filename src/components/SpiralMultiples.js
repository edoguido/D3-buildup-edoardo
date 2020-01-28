import React, { useState, useEffect } from 'react'
import * as d3 from 'd3'
import { Range } from 'rc-slider'
import 'rc-slider/assets/index.css'
import dirtyDataset from '../data/top50.json'
import { SpiralShell } from './SpiralShell'
import { YAxis } from './YAxis'
import { Legend } from './Legend'
import { numberOfDistinctElements, trimLongString } from '../lib/helpers'

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
      if (e.code === 'KeyD' && e.altKey === true && e.repeat === false && e.isComposing === false) {
        setDebug(prevState => !prevState)
      }
    })
  }, [])

  const dataset = cleanData(dirtyDataset)

  const legendEntries = ['Genre', 'BPM', 'Loudness', 'Song Length']
  //
  // convert a discrete scale in a continuous one
  const differentGenres = numberOfDistinctElements(dataset, 'genre')

  //
  // svg constants
  const [margin] = useState({
    top: 60,
    right: 130,
    bottom: 100,
    left: 60,
  })
  const [width] = useState(2160)
  const [height] = useState(960)
  const [viewBox] = useState([0, 0, width + margin.right, height + margin.bottom])

  //
  // scales
  const colorScheme = d3.scaleSequential(d3.interpolateSinebow).domain([0, differentGenres.length])
  const xScale = d3
    .scalePoint()
    .domain(dataset.map(datum => datum.track))
    .range([0, width - margin.right])

  const [datasetYScaleMin, datasetYScaleMax] = d3.extent(dataset, d => d.bpm)
  const [yRange, setYRange] = useState([datasetYScaleMin, datasetYScaleMax])
  const yScale = d3
    .scaleLinear()
    .domain([d3.min(dataset, d => d.bpm) - 10, d3.max(dataset, d => d.bpm)])
    .range([height - margin.bottom, 0])

  const yAxisTitlePadding = 16
  const yAxisWidth = 30 + yAxisTitlePadding

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
  const maxStringLength = 32
  //
  // bottom axis
  const axisBottomLabelsPadding = 12
  //
  // legend
  const legendMargin = {
    top: 0,
    right: 80,
    bottom: 40,
    left: 120,
  }
  //
  // axes
  // const xAxis = d3.axisBottom(xScale)
  // const yAxis = d3.axisLeft(yScale)

  return (
    <div className="chart" style={{ display: 'flex', flexDirection: 'row' }}>
      <div
        style={{
          margin: '36px 16px 0px 16px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            height: '120px',
            margin: '12px 24px 0px 0px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{yRange[0]}</span>
          <span> | </span>
          <span>{yRange[1]}</span>
        </div>
        <div style={{ height: '240px', margin: '12px 32px 0px 0px' }}>
          <Range
            min={datasetYScaleMin}
            max={datasetYScaleMax}
            defaultValue={[datasetYScaleMin, datasetYScaleMax]}
            step={1}
            allowCross={false}
            pushable={10}
            vertical={true}
            reverse={true}
            onAfterChange={range => setYRange(range)}
          />
        </div>
      </div>
      <svg
        width={width}
        /* height={height} */ viewBox={viewBox}
        preserveAspectRatio="xMidYMin meet"
      >
        <Legend
          title={'Genres'}
          entries={differentGenres}
          fontSize={fontSize}
          color={colorScheme}
          transform={`translate(${width + legendMargin.left - margin.right}, ${margin.top +
            legendMargin.top})`}
        />
        <YAxis
          ticks={yScale.ticks()}
          width={yAxisWidth}
          svgHeight={height}
          margins={margin}
          fontSize={fontSize}
          transform={`translate(${margin.left - yAxisWidth + yAxisTitlePadding}, ${margin.top})`}
        />
        <g
          className="chart-area"
          transform={`translate(${margin.left + yAxisWidth * 1.5}, ${margin.top})`}
        >
          {dataset.map((datum, i) => {
            const color = ['#ffffff', colorScheme(differentGenres.indexOf(datum.genre))]
            return (
              <g key={i} opacity={datum.bpm >= yRange[0] && datum.bpm <= yRange[1] ? 1 : 0.1}>
                <g transform={`translate(${xScale(datum.track)}, ${yScale(datum.bpm)})`}>
                  <line
                    stroke="black"
                    opacity="0.25"
                    x1="0"
                    y1={height - yScale(datum.bpm) - margin.bottom}
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
                  transform={`translate(${xScale(datum.track) - fontSize / 2}, ${height +
                    axisBottomLabelsPadding -
                    margin.bottom}) rotate(45)`}
                  fontSize={`${fontSize}px`}
                >
                  <text y={fontSize * lineHeight * 0} fontWeight="500">
                    {trimLongString(datum.track, maxStringLength)}
                  </text>
                  <text y={fontSize * lineHeight * 1} fontWeight="300">
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
