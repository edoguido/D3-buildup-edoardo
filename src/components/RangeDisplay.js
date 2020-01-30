import React from 'react'
import { Group, Line, Rect, Pattern } from 'react-konva'

export function RangeDisplay(props) {
  const { x, /* y, */ width, height, rangeStart, rangeEnd } = props

  return (
    <Group>
      <Rect
        // fill={'url(#pattern-circles)'}
        fill={'black'}
        opacity={0.25}
        x={x}
        y={0}
        width={width + Math.abs(x)}
        height={rangeStart}
      />
      <Rect
        // fill={'url(#pattern-circles)'}
        fill={'black'}
        opacity={0.25}
        x={x}
        y={rangeEnd}
        width={width + Math.abs(x)}
        height={height - rangeEnd}
      />
      <Line
        stroke={'black'}
        opacity="0.25"
        strokeWidth="1"
        points={[x, rangeStart, width, rangeStart]}
      />
      <Line
        stroke={'black'}
        opacity="0.25"
        strokeWidth="1"
        points={[x, rangeEnd, width, rangeEnd]}
      />
      {/* <Pattern
        id="pattern-circles"
        x="0"
        y="0"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <Line stroke="black" strokeWidth="0.25" points={[-5, -5, 25, 25]} />
        <Rect x="0" y="0" width="20" height="20" style={{ fill: 'var(--bg)' }} fillOpacity="0.5" />
      </Pattern> */}
    </Group>
  )
}
