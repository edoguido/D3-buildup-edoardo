import React, { useState, useEffect } from 'react'
import * as d3 from 'd3'
import { find } from 'lodash-es'
import { Range } from 'rc-slider'
import 'rc-slider/assets/index.css'
import { Stage, Layer, Group, Line, Text } from 'react-konva'
// import { ParentSize } from '@vx/responsive'
import { Tooltip } from './CanvasTooltip'
import { SpiralShell } from './CanvasSpiralShell'
import { RangeDisplay } from './CanvasRangeDisplay'
import { YAxis } from './CanvasYAxis'
import { Legend } from './CanvasLegend'
import { numberOfDistinctElements, dataInRange, trimLongString } from '../lib/helpers'
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

const dataset = cleanData(dirtyDataset)

// const legendEntries = ['Genre', 'BPM', 'Loudness', 'Song Length']
//
const differentGenres = numberOfDistinctElements(dataset, 'genre')

//
// sizes constants
const MARGIN = {
  top: 60,
  right: 20,
  bottom: 140,
  left: 20,
}
// TODO use @vx/responsive
const CONTROLS_WIDTH = 200
const WIDTH = window.innerWidth - CONTROLS_WIDTH
const HEIGHT = window.innerHeight - 100
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom
const CHART_PADDING = 40
const LEGEND_WIDTH = 120
const Y_AXIS_WIDTH = 60

//
// texts
const FONT_SIZE = 10
const LINE_HEIGHT = 1.2
const MAX_STRING_LENGTH = 32
//
// bottom axis
const X_AXIS_LABEL_PADDING = 24

const CHART_AREA_WIDTH = INNER_WIDTH - Y_AXIS_WIDTH - LEGEND_WIDTH * 2
const CHART_AREA_HEIGHT = INNER_HEIGHT - X_AXIS_LABEL_PADDING

//
// graph constants
// chart
const SPIRAL_INTERNAL_RADIUS = 10
const SPIRAL_MAX_ANGLE = d3.max(dataset, d => d.songLength)
const SPIRAL_LINES_COUNT = 160
//

//
// scales
const X_SCALE = d3
  .scalePoint()
  .domain(dataset.map(datum => datum.track))
  .range([0, CHART_AREA_WIDTH])

const Y_SCALE = d3
  .scaleLinear()
  .domain([d3.min(dataset, d => d.bpm), d3.max(dataset, d => d.bpm)])
  .range([CHART_AREA_HEIGHT, 0])
const COLOR_SCHEME = d3.scaleSequential(d3.interpolateSinebow).domain([0, differentGenres.length])

// FOR THE SCIENCE
// const isInRange = inRange => (track, artist) => find(inRange, { track, artist })

//
//
// *
// ***
// ****
// *******
// ***********
// ***************
export default function SpiralMultiples() {
  const [hovered, setHovered] = useState(null)
  const [debug, setDebug] = useState(false)

  useEffect(() => {
    window.addEventListener('keypress', e => {
      if (e.code === 'KeyD' && e.altKey === true && e.repeat === false && e.isComposing === false) {
        setDebug(prevState => !prevState)
      }
    })
    window.addEventListener('resize', e =>
      console.log(e.currentTarget.innerWidth, e.currentTarget.innerHeight)
    )
  }, [])
  function onEnterSpiral(entry) {
    setHovered(entry)
  }
  function onLeaveSpiral() {
    setHovered(null)
  }

  //
  // for range selector
  const [datasetYScaleMin, datasetYScaleMax] = d3.extent(dataset, d => d.bpm)
  const [yRange, setYRange] = useState([datasetYScaleMin, datasetYScaleMax])
  const inRange = dataInRange(dataset, 'bpm', yRange)
  const inRangeDifferentGenres = numberOfDistinctElements(inRange, 'genre')
  const isInRange = ({ track, artist }) => find(inRange, { track, artist })
  // const isInRange = (datum) => inRange.find(d => d.track === datum.track && d.artist === datum.artist)

  return (
    <>
      <span>D3 Exercise — </span>
      <span>
        Data:
        <a
          href="https://www.kaggle.com/leonardopena/top50spotify2019"
          target="_blank"
          rel="noopener noreferrer"
        >
          Top 50 Spotify Songs - 2019
        </a>
      </span>
      <h2>Responsive spiral Chart with React and D3</h2>

      <Tooltip hovered={hovered} />
      <div className="chart" style={{ display: 'flex', flexDirection: 'row' }}>
        <div
          className="controls"
          style={{
            margin: '36px 16px',
            width: CONTROLS_WIDTH,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginBottom: '36px',
            }}
          >
            <div
              style={{
                height: '120px',
                width: '32px',
                margin: '12px 24px',
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
          <div>
            <span className="dataset-value">{inRange.length}</span> elements selected
          </div>
          <div>with a rhythm between </div>
          <div>
            <span className="dataset-value">{yRange[0]}</span> and{' '}
            <span className="dataset-value">{yRange[1]}</span> BPM
          </div>
        </div>
        <Stage width={WIDTH} height={HEIGHT}>
          <Layer>
            <Legend
              title={'Genres'}
              entries={differentGenres}
              entriesInRange={inRangeDifferentGenres}
              fontSize={FONT_SIZE}
              color={COLOR_SCHEME}
              x={INNER_WIDTH - LEGEND_WIDTH}
              y={MARGIN.top}
            />

            <YAxis
              title={'Beats Per Minute'}
              scale={Y_SCALE}
              width={Y_AXIS_WIDTH}
              svgHeight={CHART_AREA_HEIGHT}
              margin={MARGIN}
              fontSize={FONT_SIZE}
              x={MARGIN.left + Y_AXIS_WIDTH}
              y={MARGIN.top}
            />
          </Layer>

          <Layer>
            <Group x={MARGIN.left + Y_AXIS_WIDTH + CHART_PADDING} y={MARGIN.top}>
              {dataset.map(datum => {
                // console.log('___RENDERING SpiralsGroup')

                return (
                  <Group
                    key={`${datum.artist}-${datum.track}`}
                    x={X_SCALE(datum.track)}
                    y={Y_SCALE(datum.bpm)}
                  >
                    <Line
                      stroke={'black'}
                      opacity={0.25}
                      points={[
                        0,
                        CHART_AREA_HEIGHT - Y_SCALE(datum.bpm),
                        0,
                        SPIRAL_INTERNAL_RADIUS,
                      ]}
                    />
                  </Group>
                )
              })}
            </Group>
          </Layer>
          {dataset.map(datum => {
            // console.log('___RENDERING SpiralsGroup')

            const color = ['#ffffff', COLOR_SCHEME(differentGenres.indexOf(datum.genre))]
            const spiralOpacity = isInRange(datum) ? 1 : 0.1

            return (
              <SpiralShell
                key={`${datum.track}-${datum.artist}`}
                debug={debug}
                color={color}
                angle={(datum.songLength / SPIRAL_MAX_ANGLE) * (2 * Math.PI)}
                internalRadius={SPIRAL_INTERNAL_RADIUS}
                modulus={Math.PI / 6}
                linesCount={SPIRAL_LINES_COUNT}
                x={MARGIN.left + Y_AXIS_WIDTH + CHART_PADDING + X_SCALE(datum.track)}
                y={MARGIN.top + Y_SCALE(datum.bpm)}
                opacity={spiralOpacity}
                onEnterFn={() => onEnterSpiral(datum)}
                onLeaveFn={() => onLeaveSpiral()}
              />
            )
          })}

          <XAxis range={yRange} />

          <Layer>
            <Group x={MARGIN.left + Y_AXIS_WIDTH + CHART_PADDING} y={MARGIN.top}>
              <RangeDisplay
                x={-CHART_PADDING}
                y={0}
                width={CHART_AREA_WIDTH}
                height={CHART_AREA_HEIGHT}
                rangeStart={Y_SCALE(yRange[1])}
                rangeEnd={Y_SCALE(yRange[0])}
              />
            </Group>
          </Layer>
        </Stage>
      </div>
    </>
  )
}

const XAxis = React.memo(function XAxis({ range }) {
  return (
    <Layer>
      <Group
        x={MARGIN.left + Y_AXIS_WIDTH + CHART_PADDING}
        y={MARGIN.top + CHART_AREA_HEIGHT + X_AXIS_LABEL_PADDING}
      >
        {dataset.map((datum, i) => {
          const labelWidth = 400
          const anchor = 'right'
          const inRange = datum.bpm >= range[0] && datum.bpm <= range[1] ? 1 : 0.1
          return (
            <Group
              key={i}
              x={X_SCALE(datum.track) - FONT_SIZE / 2}
              rotation={-45}
              opacity={inRange}
            >
              <Text
                width={labelWidth}
                y={FONT_SIZE * LINE_HEIGHT * 0}
                x={FONT_SIZE * 0 - labelWidth}
                fontStyle={'bold'}
                align={anchor}
                text={trimLongString(datum.artist, MAX_STRING_LENGTH)}
              />
              <Text
                width={labelWidth}
                y={FONT_SIZE * LINE_HEIGHT * 1}
                x={FONT_SIZE / 1 - labelWidth}
                fontStyle={'normal'}
                align={anchor}
                text={trimLongString(datum.track, MAX_STRING_LENGTH)}
              />
            </Group>
          )
        })}
      </Group>
    </Layer>
  )
})
// ***************
// ***********
// *******
// ****
// ***
// *
//
