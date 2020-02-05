import React, { useEffect, useState, useRef } from 'react'
import * as d3 from 'd3'
import { times } from 'lodash-es'
import { ParentSize } from '@vx/responsive'
import * as c from './constants.js'
import { numberOfDistinctElements, trimLongString } from '../lib/helpers'
import dirtyDataset from '../data/books.json'

// ****************************************** //

function cleanData(dataset) {
  return dataset.map((datum, i) => {
    return {
      title: datum.book_title,
      authors: datum.book_authors,
      main_author: datum.book_authors.split('|')[0],
      genres: datum.genres.split('|'),
      main_genre: datum.genres.split('|')[0],
      pages: Number(datum.book_pages.split(' ')[0]),
      rating: Number(datum.book_rating),
      rating_count: Number(datum.book_rating_count),
      review_count: Number(datum.book_review_count),
      isbn: Number(datum.book_isbn),
    }
  })
}

const xBalloonDimension = 'title'
const yBalloonDimension = 'rating'
const balloonArea = 'pages'
const xMountainDimension = 'main_genre'

const dataset = cleanData(dirtyDataset)
const genres = numberOfDistinctElements(dataset, xMountainDimension)

const genresPopularity = times(genres.length).map(() => Math.round(Math.random() * 100))

const mountainMaxHeight = 80
const MOUNTAIN_Y_SCALE = d3
  .scaleLinear()
  .domain([0, 100])
  .range([1, mountainMaxHeight])
const MOUNTAIN_COLOR_SCALE = d3.scaleSequential(d3.interpolateSpectral).domain([0, genres.length])

//
// **
// ****
// *******
// ************
// ****************
export function Balloons() {
  const [debug, setDebug] = useState(false)

  useEffect(() => {
    window.addEventListener('keypress', e => {
      if (e.code === 'KeyD' && e.altKey === true && e.repeat === false && e.isComposing === false) {
        setDebug(prevState => !prevState)
      }
    })
  }, [])

  const [chartWidth, setChartWidth] = useState(c.CHART_AREA_WIDTH)
  const [chartHeight, setChartHeight] = useState(c.CHART_AREA_HEIGHT)

  useEffect(() => {
    window.addEventListener('resize', e => {
      setChartWidth(
        e.srcElement.innerWidth -
          c.WINDOW_PADDING * 2 -
          c.MARGIN.left -
          c.MARGIN.right -
          c.Y_AXIS_WIDTH -
          c.LEGEND_WIDTH * 2
      )
      setChartHeight(
        e.srcElement.innerHeight - c.WINDOW_PADDING * 2 - c.MARGIN.top - c.MARGIN.bottom - c.X_AXIS_LABEL_PADDING
      )
    })
  }, [chartWidth, chartHeight])

  const BALLOON_AREA = chartHeight / 1.75
  const BALLOON_X_SCALE = d3
    .scalePoint()
    .domain(dataset.map(datum => datum[xBalloonDimension]))
    .range([0, chartWidth])
  const BALLOON_Y_SCALE = d3
    .scaleLinear()
    .domain(d3.extent(dataset, datum => datum[yBalloonDimension]))
    .range([BALLOON_AREA, 0])
  const BALLOON_AREA_SCALE = d3
    .scaleSqrt()
    .domain([0, d3.max(dataset, datum => datum.pages)])
    .range([0, (chartWidth * chartHeight) / 350])

  const mountainWidth = chartWidth / 30
  const MOUNTAIN_X_SCALE = d3
    .scalePoint()
    .domain(dataset.map(datum => datum[xMountainDimension]))
    .range([0, chartWidth / 2])
  const MOUNTAIN_BEZIER_SCALE = d3
    .scaleLinear()
    .domain([0, 100])
    .range([2, 3.5])

  return (
    <>
      <ParentSize>
        {parent => (
          <svg
            style={{
              border: '1px solid black',
              // overflow: 'visible',
            }}
            width={parent.width}
            height={parent.height}
          >
            <defs>
              <filter id="noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.75" stitchTiles="stitch" result="noise" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <radialGradient id="highlight-gradient" cx="0.5" cy="0.55" r="0.35" fx="0.5" fy="0.7">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="shadow-gradient" cx="0.5" cy="1.35" r="0.65" fx="0.5" fy="0.95">
                <stop offset="0%" stopColor="black" stopOpacity="1" />
                <stop offset="100%" stopColor="black" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="linear-shadow" x1="0" x2="0" y1="0" y2="2">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="100%" stopColor="black" stopOpacity="1" />
              </linearGradient>
            </defs>
            <g
              className="plot-area"
              transform={`translate(
                ${c.MARGIN.left}, ${c.MARGIN.top}
              )`}
            >
              <g className="links">
                {dataset.map((datum, i) => {
                  const r = Math.sqrt(BALLOON_AREA_SCALE(datum[balloonArea]) / Math.PI, 2)
                  const color = MOUNTAIN_COLOR_SCALE(genres.indexOf(datum.main_genre))
                  const xoffs = chartWidth / 4
                  const x1 = MOUNTAIN_X_SCALE(datum[xMountainDimension]) + xoffs
                  const y1 = chartHeight - MOUNTAIN_Y_SCALE(genresPopularity[genres.indexOf(datum.main_genre)])
                  const x2 = BALLOON_X_SCALE(datum[xBalloonDimension])
                  const y2 = BALLOON_Y_SCALE(datum[yBalloonDimension]) + r / 2
                  const hx1 = x1
                  const hy1 = (y1 + y2) / 2
                  const hx2 = x2
                  const hy2 = (y1 + y2) / 2
                  const linkPathData = `
                M ${x1} ${y1}
                C ${hx1} ${hy1} ${hx2} ${hy2} ${x2} ${y2}
              `

                  return (
                    <g key={`${datum[xMountainDimension]}-${datum[xBalloonDimension]}`}>
                      <path d={linkPathData} fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="1" />
                      <path d={linkPathData} fill="none" stroke={'black'} strokeWidth="0.5" strokeOpacity="0.5" />
                      {debug && (
                        <>
                          {/* HANDLE 1 */}
                          <circle fill="red" cx={hx1} cy={hy1} r="1" />
                          <path stroke="red" d={`M ${x1} ${y1} L ${hx1} ${hy1}`} />
                          {/* HANDLE 2 */}
                          <circle fill="blue" cx={hx2} cy={hy2} r="2" />
                          <path stroke="blue" d={`M ${x2} ${y2} L ${hx2} ${hy2}`} />
                        </>
                      )}
                    </g>
                  )
                })}
              </g>
              <g className="upper">
                {dataset.map((datum, i) => {
                  const r = Math.sqrt(BALLOON_AREA_SCALE(datum[balloonArea]) / Math.PI, 2)
                  const y = BALLOON_Y_SCALE(datum[yBalloonDimension])
                  const x = BALLOON_X_SCALE(datum[xBalloonDimension])
                  const color = MOUNTAIN_COLOR_SCALE(genres.indexOf(datum.main_genre))

                  return (
                    <g key={`${datum.isbn}-${datum[yBalloonDimension]}`}>
                      <clipPath id={i}>
                        <circle cx={x} cy={y} r={r} />
                      </clipPath>
                      <g clipPath={`url(#${i})`}>
                        <circle cx={x} cy={y} r={r} fill="white" filter="url(#noise)" opacity="0.5" />
                      </g>
                      <g transform={`translate(${x}, ${y})`}>
                        <circle r={r} fill={color} fillOpacity="0.5" stroke={color} />
                        <circle r={r} fill={'url(#linear-shadow)'} fillOpacity="0.25" />
                        <circle r={r} fill={'url(#shadow-gradient)'} fillOpacity="0.05" />
                        <circle r={r} fill={'url(#highlight-gradient)'} fillOpacity="0.25" />
                        <ellipse cx={0} cy={r / 2} rx={1} ry={0.65} fill={'black'} />
                        <text y={r / 2} dy={-c.FONT_SIZE / 2} textAnchor={'middle'} fontSize={c.FONT_SIZE / 1.25}>
                          {datum[balloonArea]}
                        </text>
                      </g>
                      <g transform={`translate(${x}, ${y})`}>
                        <text
                          y={-r - c.FONT_SIZE * c.LINE_HEIGHT * 2}
                          dy={-c.FONT_SIZE / 2}
                          textAnchor={'middle'}
                          fontSize={c.FONT_SIZE / 1.25}
                        >
                          {trimLongString(datum.main_author, 20)}
                        </text>
                        <text
                          y={-r - c.FONT_SIZE * c.LINE_HEIGHT * 1}
                          dy={-c.FONT_SIZE / 2}
                          textAnchor={'middle'}
                          fontSize={c.FONT_SIZE / 1.25}
                        >
                          {trimLongString(datum.title, 24)}
                        </text>
                        <text
                          y={-r - c.FONT_SIZE * c.LINE_HEIGHT * 0}
                          dy={-c.FONT_SIZE / 2}
                          textAnchor={'middle'}
                          fontSize={c.FONT_SIZE / 1.25}
                        >
                          {datum[yBalloonDimension]} / 5
                        </text>
                      </g>
                      {debug && (
                        <text x={x} y={y} textAnchor={'middle'} dy={-r} fontSize={c.FONT_SIZE}>
                          {datum.main_genre}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
              <g className="lower" transform={`translate(${chartWidth / 4}, ${chartHeight})`}>
                {genres.map((genre, i) => {
                  const mountainX = MOUNTAIN_X_SCALE(genre)
                  const mountainY = 0
                  const mountainHeight = MOUNTAIN_Y_SCALE(genresPopularity[i])
                  const bezierFactor1 = MOUNTAIN_BEZIER_SCALE(genresPopularity[i])
                  const bezierFactor2 = MOUNTAIN_BEZIER_SCALE(genresPopularity[i])
                  const color = MOUNTAIN_COLOR_SCALE(i)
                  const mountainPathData = `
                    M 
                    ${mountainX} ${mountainY}
                    L 
                    ${mountainX - mountainWidth} ${mountainY}
                    C 
                    ${mountainX - mountainWidth / bezierFactor1} ${mountainY} 
                    ${mountainX - mountainWidth / bezierFactor2} ${mountainY - mountainHeight} 
                    ${mountainX} ${mountainY - mountainHeight}
                    C 
                    ${mountainX + mountainWidth / bezierFactor1} ${mountainY - mountainHeight} 
                    ${mountainX + mountainWidth / bezierFactor2} ${mountainY} 
                    ${mountainX + mountainWidth} ${mountainY}
                    L 
                    ${mountainX} ${mountainY}
                  `

                  const maxTicks = 5
                  const numberOfHeightTicks = Math.floor((mountainHeight / mountainMaxHeight) * maxTicks)

                  return (
                    <g key={`${i}-genre`}>
                      <clipPath id={`${i}-genre`}>
                        <path d={mountainPathData} fill="white" stroke={color} filter="url(#noise)" opacity="0.5" />
                      </clipPath>
                      <text x={mountainX} y={20} textAnchor="middle" fontSize={c.FONT_SIZE}>
                        {genre}
                      </text>
                      <g>
                        <path
                          d={mountainPathData}
                          fill="white"
                          fillOpacity="0.5"
                          clipPath={`url(#${i}-genre)`}
                          filter="url(#noise)"
                        />
                        <path
                          d={mountainPathData}
                          fill={color}
                          fillOpacity="0.5"
                          stroke={color}
                          strokeWidth="2"
                          clipPath={`url(#${i}-genre)`}
                        />
                        {times(numberOfHeightTicks).map((tick, j) => {
                          const heightUnit = 15 * (j + 1)
                          const tickPathData = `
                            M 
                            ${mountainX - mountainWidth} ${mountainY}
                            C 
                            ${mountainX - mountainWidth / bezierFactor1} ${mountainY} 
                            ${mountainX - mountainWidth / bezierFactor2} ${mountainY - heightUnit} 
                            ${mountainX} ${mountainY - heightUnit}
                            C 
                            ${mountainX + mountainWidth / bezierFactor1} ${mountainY - heightUnit} 
                            ${mountainX + mountainWidth / bezierFactor2} ${mountainY} 
                            ${mountainX + mountainWidth} ${mountainY}
                          `
                          return (
                            <path
                              key={`${j}-mountainTick`}
                              d={tickPathData}
                              fill="none"
                              stroke="black"
                              strokeOpacity="0.15"
                              strokeDasharray={`${1} ${1 / (j + 1)}`}
                            />
                          )
                        })}
                      </g>
                      {debug && (
                        <>
                          <g>
                            {/* BEZIER 1 */}
                            <circle fill="red" cx={mountainX - mountainWidth / bezierFactor1} cy={mountainY} r="1" />
                            <path
                              stroke="red"
                              d={`
                                  M ${mountainX - mountainWidth} ${mountainY} 
                                  L ${mountainX - mountainWidth / bezierFactor1} ${mountainY}
                                `}
                            />
                            <circle
                              fill="blue"
                              cx={mountainX - mountainWidth / bezierFactor2}
                              cy={mountainY - mountainHeight}
                              r="1"
                            />
                            <path
                              stroke="blue"
                              d={`
                          M ${mountainX} ${mountainY - mountainHeight} 
                          L ${mountainX - mountainWidth / bezierFactor2} ${mountainY - mountainHeight}`}
                            />
                            {/* BEZIER 2 */}
                            <circle fill="red" cx={mountainX + mountainWidth / bezierFactor1} cy={mountainY} r="1" />
                            <path
                              stroke="red"
                              d={`
                          M ${mountainX + mountainWidth} ${mountainY} 
                          L ${mountainX + mountainWidth / bezierFactor1} ${mountainY}`}
                            />
                            <circle
                              fill="blue"
                              cx={mountainX + mountainWidth / bezierFactor2}
                              cy={mountainY - mountainHeight}
                              r="1"
                            />
                            <path
                              stroke="blue"
                              d={`
                          M ${mountainX} ${mountainY - mountainHeight} 
                          L ${mountainX + mountainWidth / bezierFactor2} ${mountainY - mountainHeight}`}
                            />
                          </g>
                        </>
                      )}
                    </g>
                  )
                })}
              </g>
            </g>
          </svg>
        )}
      </ParentSize>
    </>
  )
}
