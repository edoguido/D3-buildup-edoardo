import React, { useState } from 'react'
import * as d3 from 'd3'
import { times } from 'lodash-es'
import { circle, spiral, twistedSpiral } from '../lib/curveEquations'
import { opacityModulus } from '../lib/helpers'
import _dataset from '../data/top50.json'

export default function SpiralMultiples(props) {
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
  const [height] = useState(540)
  const [viewBox] = useState([0, 0, width, height])

  // graph constants
  const internalRadius = 10
  const startingSpiralRadius = 10
  const spiralGrowingFactor = 20
  const maxSpiralAngle = d3.max(dataset, d => d.spiralAngle)
  const spiralLinesCount = 300
  const spiralLineAngleIncrement = (2 * Math.PI) / spiralLinesCount

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

  return (
    <div className="chart">
      <h2>Spiral Chart with React and D3</h2>

      <svg width={width} height={height} viewBox={viewBox}>
        <g transform={`translate(${margin.left}, 0)`}>
          {dataset.map((datum, i) => (
            <g key={i} transform={`translate(${xScale(i)}, ${yScale(datum.spiralYCoord)})`}>
              <circle
                key={i}
                opacity="1"
                fill={colorScheme(datum.spiralColor)}
                cx="0"
                cy="0"
                r="4"
              />
              <line
                stroke="black"
                opacity="0.25"
                x1="0"
                y1={height - yScale(datum.spiralYCoord)}
                x2="0"
                y2={internalRadius}
              />
              <g>
                {times(spiralLinesCount).map(j => {
                  const angle = spiralLineAngleIncrement * j
                  if (angle > (datum.spiralAngle / maxSpiralAngle) * (2 * Math.PI)) return
                  const circlePoints = circle(internalRadius, angle)
                  const spiralPoints = spiral(
                    internalRadius + startingSpiralRadius,
                    angle,
                    spiralGrowingFactor
                  )
                  const twistedSpiralPoints = twistedSpiral(
                    internalRadius + startingSpiralRadius,
                    angle,
                    spiralGrowingFactor,
                    100
                  )
                  const spiralModulus = opacityModulus(0.3, Math.PI / 5, angle)

                  return (
                    // <line
                    //   key={j}
                    //   stroke={colorScheme(datum.spiralColor)}
                    //   strokeWidth={spiralModulus}
                    //   opacity={spiralModulus}
                    //   x1={circlePoints.x}
                    //   y1={circlePoints.y}
                    //   x2={spiralPoints.x}
                    //   y2={spiralPoints.y}
                    // />
                    <path
                      key={j}
                      stroke={colorScheme(datum.spiralColor)}
                      strokeWidth={spiralModulus}
                      opacity={spiralModulus}
                      fill="transparent"
                      d={`m ${circlePoints.x} ${circlePoints.y}
                      q ${twistedSpiralPoints.x} ${twistedSpiralPoints.y} ${spiralPoints.x} ${spiralPoints.y}`}
                    />
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
