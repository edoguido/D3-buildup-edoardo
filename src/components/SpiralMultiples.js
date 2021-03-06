import React, { useState, useEffect } from 'react'
import * as d3 from 'd3'
import { Range } from 'rc-slider'
import 'rc-slider/assets/index.css'
import dirtyDataset from '../data/top50.json'
import { SpiralShell } from './SpiralShell'
import { RangeDisplay } from './RangeDisplay'
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

const dataset = cleanData(dirtyDataset)
const legendEntries = ['Genre', 'BPM', 'Loudness', 'Song Length']
//
// single entries for 'genre' column
const differentGenres = numberOfDistinctElements(dataset, 'genre')

//
// sizes constants
const margin = {
  top: 60,
  right: 20,
  bottom: 140,
  left: 20,
}
const width = 2160
const height = 960
const innerWidth = width - margin.left - margin.right
const innerHeight = height - margin.top - margin.bottom
const globalPadding = 40
const legendWidth = 120
const yAxisWidth = 60
const chartAreaWidth = innerWidth - yAxisWidth - legendWidth * 2
const chartAreaHeight = innerHeight
const viewBox = [0, 0, width, height]
const spiralMaxAngle = d3.max(dataset, d => d.songLength)

//
// scales
const xScale = d3
  .scalePoint()
  .domain(dataset.map(datum => datum.track))
  .range([0, chartAreaWidth])
const yScale = d3
  .scaleLinear()
  .domain([d3.min(dataset, d => d.bpm), d3.max(dataset, d => d.bpm)])
  .range([chartAreaHeight, 0])
const colorScheme = d3.scaleSequential(d3.interpolateSinebow).domain([0, differentGenres.length])
//

//
// texts
const fontSize = 10
const lineHeight = 1.2
const maxStringLength = 32
//

//
//
// ***
//
export default function SpiralMultiples(props) {
  const [debug, setDebug] = useState(false)
  useEffect(() => {
    window.addEventListener('keypress', e => {
      if (e.code === 'KeyD' && e.altKey === true && e.repeat === false && e.isComposing === false) {
        setDebug(prevState => !prevState)
      }
    })
  }, [])

  //
  // range selector
  const [datasetYScaleMin, datasetYScaleMax] = d3.extent(dataset, d => d.bpm)
  const [yRange, setYRange] = useState([datasetYScaleMin, datasetYScaleMax])

  //
  // axes
  // const xAxis = d3.axisBottom(xScale)
  // const yAxis = d3.axisLeft(yScale)

  return (
    <div className="chart" style={{ display: 'flex', flexDirection: 'row' }}>
      <div
        className="controls"
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
            width: '32px',
            margin: '12px 24px 0px 0px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '.8em',
          }}
        >
          <span>{yRange[1]}</span>
          <span> | </span>
          <span>{yRange[0]}</span>
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
            reverse={false}
            onChange={range => setYRange(range)}
          />
        </div>
      </div>
      <svg width={width} height={height} preserveAspectRatio="xMidYMin meet">
        <Legend
          title={'Genres'}
          entries={differentGenres}
          fontSize={fontSize}
          color={colorScheme}
          transform={`translate(${innerWidth - legendWidth}, ${margin.top})`}
        />
        <YAxis
          title={'Beats Per Minute'}
          scale={yScale}
          width={yAxisWidth}
          svgHeight={chartAreaHeight}
          margin={margin}
          fontSize={fontSize}
          transform={`translate(${margin.left + yAxisWidth}, ${margin.top})`}
        />
        <g
          className="chart-area"
          transform={`translate(${margin.left + yAxisWidth + globalPadding}, ${margin.top})`}
        >
          <RangeDisplay
            x={-globalPadding}
            y={0}
            width={chartAreaWidth}
            height={chartAreaHeight}
            range={yRange}
            rangeFn={yScale}
          />
          <SpiralGroup />
          <XAxis range={yRange} />
        </g>
      </svg>
    </div>
  )
}

const SpiralGroup = React.memo(function SpiralElement() {
  const spiralInternalRadius = 10
  const spiralLinesCount = 120

  return (
    <g>
      {dataset.map((datum, i) => {
        const color = ['#ffffff', colorScheme(differentGenres.indexOf(datum.genre))]
        // const inRange = datum.bpm >= selectedRange[0] && datum.bpm <= selectedRange[1] ? 1 : 0.25
        return (
          <g
            key={i}
            opacity={1}
            transform={`translate(${xScale(datum.track)}, ${yScale(datum.bpm)})`}
          >
            <line
              stroke="black"
              opacity="0.25"
              x1="0"
              y1={chartAreaHeight - yScale(datum.bpm)}
              x2="0"
              y2={spiralInternalRadius}
            />
            <SpiralShell
              debug={false}
              color={color}
              angle={(datum.songLength / spiralMaxAngle) * (2 * Math.PI)}
              internalRadius={spiralInternalRadius}
              modulus={Math.PI / 6}
              linesCount={spiralLinesCount}
            />
          </g>
        )
      })}
    </g>
  )
})

const XAxis = React.memo(function XAXis({ range }) {
  const axisBottomLabelsPadding = 12
  return (
    <g className="x-axis" transform={`translate(0, ${chartAreaHeight + axisBottomLabelsPadding})`}>
      {dataset.map((datum, i) => {
        const anchor = 'end'
        const inRange = datum.bpm >= range[0] && datum.bpm <= range[1] ? 1 : 0.1
        return (
          <g
            key={i}
            transform={`translate(${xScale(datum.track) - fontSize / 2}, 0) rotate(-45)`}
            fontSize={`${fontSize}px`}
            opacity={inRange}
          >
            <text
              y={fontSize * lineHeight * 0}
              x={fontSize * 0}
              fontWeight="300"
              textAnchor={anchor}
            >
              {trimLongString(datum.artist, maxStringLength)}
            </text>
            <text
              y={fontSize * lineHeight * 1}
              x={fontSize * 1}
              fontWeight="500"
              textAnchor={anchor}
            >
              {trimLongString(datum.track, maxStringLength)}
            </text>
          </g>
        )
      })}
    </g>
  )
})
