import React from 'react'

export function RangeDisplay(props) {
  const { x, /* y, */ width, height, rangeStart, rangeEnd } = props

  return (
    <g className="range-display">
      <line
        stroke={'black'}
        strokeOpacity="0.25"
        strokeWidth="1"
        x1={x}
        y1={rangeStart}
        x2={width}
        y2={rangeStart}
      />
      <line
        stroke={'black'}
        opacity="0.25"
        strokeWidth="1"
        x1={x}
        y1={rangeEnd}
        x2={width}
        y2={rangeEnd}
      />
      <rect
        fill={'url(#pattern-circles)'}
        fillOpacity={1}
        x={x}
        y={0}
        width={width + Math.abs(x)}
        height={rangeStart}
      />
      <rect
        fill={'url(#pattern-circles)'}
        fillOpacity={1}
        x={x}
        y={rangeEnd}
        width={width + Math.abs(x)}
        height={height - rangeEnd}
      />
      <pattern
        id="pattern-circles"
        x="0"
        y="0"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <line x1="-5" y1="-5" x2="25" y2="25" stroke="black" strokeWidth="0.25" />
        <rect x="0" y="0" width="20" height="20" style={{ fill: 'var(--bg)' }} fillOpacity="0.5" />
      </pattern>
    </g>
  )
}
