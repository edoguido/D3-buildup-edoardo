import React from 'react'
import { render } from 'react-dom'

export function YAxis(props) {
  const {
    width = 48,
    svgHeight,
    margins = { top: 0, right: 0, bottom: 0, left: 0 },
    fontSize = 10,
    ticks,
    transform,
  } = props

  return (
    <g className="y-axis" transform={transform}>
      <text className="y-axis title" transform={`rotate(-90)`} textAnchor="end" dy="0">
        Beats Per Minute
      </text>
      <line
        stroke="black"
        opacity="1"
        x1={width}
        y1="0"
        x2={width}
        y2={svgHeight - margins.bottom}
      />
      {ticks.reverse().map((tick, i) => {
        const tickLabelYOffset = ((svgHeight - margins.bottom) / ticks.length) * i
        return (
          <g
            key={i}
            className="tick"
            transform={`translate(${width}, 
              ${tickLabelYOffset})`}
          >
            <text fontSize={fontSize} textAnchor="end" x={-fontSize - 4} dy={fontSize / 2.5}>
              {tick}
            </text>
            <line stroke="black" opecity="1" x1={-fontSize} y1="0" x2="0" y2="0" />
          </g>
        )
      })}
      <line
        stroke="black"
        opecity="1"
        x1={-fontSize + width}
        y1={svgHeight - margins.bottom}
        x2={width}
        y2={svgHeight - margins.bottom}
      />
    </g>
  )
}
