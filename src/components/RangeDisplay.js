import React from 'react'

export function RangeDisplay(props) {
  const { x, width, height, range, rangeFn } = props

  console.log('___RENDERING RangeDisplay')
  return (
    <g className="range-display">
      <line
        stroke={'black'}
        strokeOpacity="0.25"
        strokeWidth="1"
        x1={x}
        y1={rangeFn(range[1])}
        x2={width}
        y2={rangeFn(range[1])}
      />
      <line
        stroke={'black'}
        strokeOpacity="0.25"
        strokeWidth="1"
        x1={x}
        y1={rangeFn(range[0])}
        x2={width}
        y2={rangeFn(range[0])}
      />
      <rect
        // fill={'lightgray'}
        fill={'url(#pattern-circles)'}
        fillOpacity={1}
        x={x}
        y={0}
        width={width + Math.abs(x)}
        height={rangeFn(range[1])}
      />
      <rect
        // fill={'lightgray'}
        fill={'url(#pattern-circles)'}
        fillOpacity={1}
        x={x}
        y={rangeFn(range[0])}
        width={width + Math.abs(x)}
        height={height - rangeFn(range[0])}
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
