import React, { useState, useEffect } from 'react'
import * as d3 from 'd3'
import { times } from 'lodash-es'
import { circle, spiral } from '../lib/curveEquations'
import { opacityModulus } from '../lib/helpers'
import _dataset from '../data/top50.json'

export default function SpiralMultiples(props) {
  const [debug, setDebug] = useState(false)
  useEffect(() => {
    window.addEventListener('keypress', e => {
      if (e.key === 'd') {
        setDebug(prevState => !prevState)
      }
    })
  }, [])

  // dataset
  const dataset = _dataset.map((datum, i) => {
    // Numerical data must be explicitly converted sometimes 🏄‍♂️
    return {
      spiralColor: datum.genre,
      spiralYCoord: Number(datum.bpm),
      spiralRadius: Number(datum.loudness),
      spiralAngle: Number(datum.length),
    }
  })

  // svg constants
  const [margin] = useState({
    top: 80,
    right: 80,
    bottom: 80,
    left: 80,
  })
  const [width] = useState(1920)
  const [height] = useState(640)
  const [viewBox] = useState([0, 0, width, height])

  // graph constants
  const spiralInternalRadius = 10
  const spiralStartingRadius = 10
  const spiralGrowingFactor = 20
  const spiralMaxAngle = d3.max(dataset, d => d.spiralAngle)
  const spiralLinesCount = 200
  const spiralLineAngleIncrement = (2 * Math.PI) / spiralLinesCount
  const circleRadius = 3

  // scales
  const colorScheme = d3.scaleOrdinal(d3.schemeCategory10)
  const xScale = d3
    .scaleLinear()
    .range([0, width - margin.right])
    .domain([0, dataset.length])
  const yScale = d3
    .scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain(d3.extent(dataset, d => d.spiralYCoord))

  //axes
  // const xAxis = d3.axisBottom(xScale)
  // const yAxis = d3.axisLeft(yScale)

  return (
    <div className="chart">
      <h2>Responsive spiral Chart with React and D3</h2>

      <svg width={width} height={height} viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
        <g transform={`translate(${margin.left}, 0)`}>
          {dataset.map((datum, i) => (
            <g key={i} transform={`translate(${xScale(i)}, ${yScale(datum.spiralYCoord)})`}>
              <circle
                opacity="1"
                fill={colorScheme(datum.spiralColor)}
                cx="0"
                cy="0"
                r={circleRadius}
              />
              <line
                stroke="black"
                opacity="0.25"
                x1="0"
                y1={height - yScale(datum.spiralYCoord)}
                x2="0"
                y2={spiralInternalRadius}
              />
              <g>
                {times(spiralLinesCount).map(j => {
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

                  return (
                    <g key={j}>
                      <path
                        stroke={colorScheme(datum.spiralColor)}
                        strokeWidth={debug ? 0.5 : spiralModulus}
                        opacity={debug ? 0.5 : spiralModulus}
                        fill="transparent"
                        d={`
                          M ${circlePoints.x} ${circlePoints.y}
                          Q ${twistedSpiralPoints.x} ${twistedSpiralPoints.y} ${spiralPoints.x} ${spiralPoints.y}
                        `}
                      />
                      {debug && (
                        <>
                          <line
                            opacity="1"
                            stroke="gray"
                            strokeWidth="0.5"
                            x1={circlePoints.x}
                            y1={circlePoints.y}
                            x2={twistedSpiralPoints.x}
                            y2={twistedSpiralPoints.y}
                          />
                          <line
                            opacity="0.5"
                            stroke="gray"
                            strokeWidth="0.5"
                            x1={twistedSpiralPoints.x}
                            y1={twistedSpiralPoints.y}
                            x2={spiralPoints.x}
                            y2={spiralPoints.y}
                          />
                          <circle
                            opacity="1"
                            fill="red"
                            cx={twistedSpiralPoints.x}
                            cy={twistedSpiralPoints.y}
                            r="1.5"
                          />
                          <circle
                            opacity="1"
                            fill="blue"
                            cx={spiralPoints.x}
                            cy={spiralPoints.y}
                            r="1.5"
                          />
                        </>
                      )}
                    </g>
                  )
                })}
              </g>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
