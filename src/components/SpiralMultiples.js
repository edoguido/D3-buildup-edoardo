import React, { useState } from 'react'
import * as d3 from 'd3'
import { times } from 'lodash-es'
import { circle, spiral } from '../lib/CurveEquations'
import _dataset from '../data/top50.json'

export default function SpiralMultiples(props) {
  // dataset
  const dataset = _dataset.map((datum, i) => {
    // Numerical data must be explicitly converted sometimes 🏄‍♂️
    return {
      spiralColor: datum.genre,
      spiralYCoord: Number(datum.bpm),
      spiralRadius: Number(datum.loudness),
      spiralNumberOfLines: Number(datum.length),
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
  const internalRadius = 10
  const startingSpiralRadius = 10
  const spiralGrowingFactor = 20
  const maxLengthValue = d3.max(dataset, d => d.spiralNumberOfLines)
  const spiralLineAngleIncrement = (2 * Math.PI) / maxLengthValue
  const opacityModulus = (constant, modulus, angle) => constant + ((angle + Math.PI) % modulus)

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
      <h1>Spiral Chart with React and D3</h1>

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
                {times(datum.spiralNumberOfLines).map(t => {
                  const angle = spiralLineAngleIncrement * t
                  const circlePoints = circle(internalRadius, angle)
                  const spiralPoints = spiral(
                    internalRadius + startingSpiralRadius,
                    angle,
                    spiralGrowingFactor
                  )

                  return (
                    <line
                      key={t}
                      stroke={colorScheme(datum.spiralColor)}
                      opacity={opacityModulus(0.1, Math.PI / 5, angle)}
                      x1={circlePoints.x}
                      y1={circlePoints.y}
                      x2={spiralPoints.x}
                      y2={spiralPoints.y}
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
