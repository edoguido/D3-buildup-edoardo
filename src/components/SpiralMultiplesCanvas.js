import React, { useState, useEffect } from 'react'
import * as d3 from 'd3'
import { Range } from 'rc-slider'
import { Stage, Layer, Group, Line } from 'react-konva'
import 'rc-slider/assets/index.css'
import { SpiralShell } from './SpiralShell'
import { RangeDisplay } from './RangeDisplay'
import { YAxis } from './YAxis'
import { Legend } from './Legend'
import { numberOfDistinctElements, trimLongString } from '../lib/helpers'
import dirtyDataset from '../data/top50.json'

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

  const [dataset, updateDataset] = useState(cleanData(dirtyDataset))

  const legendEntries = ['Genre', 'BPM', 'Loudness', 'Song Length']
  //
  // convert a discrete scale in a continuous one
  const differentGenres = numberOfDistinctElements(dataset, 'genre')

  //
  // sizes constants
  const [margin] = useState({
    top: 60,
    right: 20,
    bottom: 140,
    left: 20,
  })
  // TODO use @vx/responsive
  const [width] = useState(window.innerWidth - 166)
  const [height] = useState(960)
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const globalPadding = 40
  const legendWidth = 120
  const yAxisWidth = 60
  const chartAreaWidth = innerWidth - yAxisWidth - legendWidth * 2
  const chartAreaHeight = innerHeight

  //
  // scales
  const colorScheme = d3.scaleSequential(d3.interpolateSinebow).domain([0, differentGenres.length])
  const xScale = d3
    .scalePoint()
    .domain(dataset.map(datum => datum.track))
    .range([0, chartAreaWidth])

  //
  // range selector
  const [datasetYScaleMin, datasetYScaleMax] = d3.extent(dataset, d => d.bpm)
  const [yRange, setYRange] = useState([datasetYScaleMin, datasetYScaleMax])

  const yScale = d3
    .scaleLinear()
    .domain([d3.min(dataset, d => d.bpm), d3.max(dataset, d => d.bpm)])
    .range([chartAreaHeight, 0])

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
      <Stage width={width} height={height}>
        <Layer>
          <Legend
            title={'Genres'}
            entries={differentGenres}
            fontSize={fontSize}
            color={colorScheme}
            x={innerWidth - legendWidth}
            y={margin.top}
          />

          <YAxis
            title={'Beats Per Minute'}
            ticks={yScale.ticks()}
            width={yAxisWidth}
            svgHeight={chartAreaHeight}
            margin={margin}
            fontSize={fontSize}
            x={margin.left + yAxisWidth}
            y={margin.top}
          />

          <Group x={margin.left + yAxisWidth + globalPadding} y={margin.top}>
            <RangeDisplay
              x={-globalPadding}
              y={0}
              width={chartAreaWidth}
              height={chartAreaHeight}
              rangeStart={yScale(yRange[1])}
              rangeEnd={yScale(yRange[0])}
            />
          </Group>
        </Layer>

        <Shells />
      </Stage>
    </div>
  )
}

function ShellsLayer() {
  const dataset = cleanData(dirtyDataset)

  const legendEntries = ['Genre', 'BPM', 'Loudness', 'Song Length']
  //
  // convert a discrete scale in a continuous one
  const differentGenres = numberOfDistinctElements(dataset, 'genre')

  //
  // sizes constants
  const margin = {
    top: 60,
    right: 20,
    bottom: 140,
    left: 20,
  }

  // TODO use @vx/responsive
  const [width] = useState(window.innerWidth - 166)
  const [height] = useState(960)
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  const globalPadding = 40
  const legendWidth = 120
  const yAxisWidth = 60
  const chartAreaWidth = innerWidth - yAxisWidth - legendWidth * 2
  const chartAreaHeight = innerHeight

  //
  // scales
  const colorScheme = d3.scaleSequential(d3.interpolateSinebow).domain([0, differentGenres.length])
  const xScale = d3
    .scalePoint()
    .domain(dataset.map(datum => datum.track))
    .range([0, chartAreaWidth])

  //
  // range selector
  const [datasetYScaleMin, datasetYScaleMax] = d3.extent(dataset, d => d.bpm)
  const [yRange, setYRange] = useState([datasetYScaleMin, datasetYScaleMax])

  const yScale = d3
    .scaleLinear()
    .domain([d3.min(dataset, d => d.bpm), d3.max(dataset, d => d.bpm)])
    .range([chartAreaHeight, 0])

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
  // axes
  // const xAxis = d3.axisBottom(xScale)
  // const yAxis = d3.axisLeft(yScale)

  return (
    <Layer>
      <Group x={margin.left + yAxisWidth + globalPadding} y={margin.top}>
        {dataset.map((datum, i) => {
          const color = ['#ffffff', colorScheme(differentGenres.indexOf(datum.genre))]
          const inRange = datum.bpm >= yRange[0] && datum.bpm <= yRange[1] ? 1 : 0.25
          return (
            <Group key={i} opacity={inRange} x={xScale(datum.track)} y={yScale(datum.bpm)}>
              <Line
                stroke="black"
                opacity="0.25"
                points={[0, chartAreaHeight - yScale(datum.bpm), 0, spiralInternalRadius]}
              />
              <Group opacity={inRange}>
                <SpiralShell
                  debug={false}
                  color={color}
                  angle={(datum.songLength / spiralMaxAngle) * (2 * Math.PI)}
                  internalRadius={spiralInternalRadius}
                  modulus={Math.PI / 6}
                  linesCount={spiralLinesCount}
                />
              </Group>
            </Group>
          )
        })}
        {/* <g
      className="x-axis"
      transform={`translate(0, ${chartAreaHeight + axisBottomLabelsPadding})`}
    >
      {dataset.map((datum, i) => {
        const anchor = 'end'
        const inRange = datum.bpm >= yRange[0] && datum.bpm <= yRange[1] ? 1 : 0.1
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
    </g> */}
      </Group>
    </Layer>
  )
}

const Shells = React.memo(ShellsLayer)
