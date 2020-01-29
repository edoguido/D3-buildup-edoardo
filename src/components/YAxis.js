import React from 'react'
import { render } from 'react-dom'

export function YAxis(props) {
  const {
    title,
    width = 48,
    svgHeight,
    margin = { top: 0, right: 0, bottom: 0, left: 0 },
    fontSize = 10,
    ticks,
    transform,
  } = props

  return (
    <g className="y-axis" transform={transform}>
      <text
        className="y-axis title"
        transform={`translate(${fontSize - width}, 0) rotate(-90)`}
        textAnchor="end"
        dy="0"
      >
        {title}
      </text>
      <line stroke="black" opacity="1" x1={0} y1={0} x2={0} y2={svgHeight} />
      {ticks.reverse().map((tick, i) => {
        const tickLabelYOffset = (svgHeight / ticks.length) * i
        return (
          <g
            key={i}
            className="tick"
            transform={`translate(0, 
              ${tickLabelYOffset})`}
          >
            <text fontSize={fontSize} textAnchor="end" x={-fontSize - 4} dy={fontSize / 2.5}>
              {tick}
            </text>
            <line stroke="black" opecity="1" x1={-fontSize} y1="0" x2="0" y2="0" />
          </g>
        )
      })}
      <line stroke="black" opecity="1" x1={-fontSize} y1={svgHeight} x2={0} y2={svgHeight} />
    </g>
  )
}
