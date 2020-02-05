import React from 'react'
import { Group, Line, Rect } from 'react-konva'

export function RangeDisplay({ x = 0, y = 0, width, height, rangeStart, rangeEnd }) {
  const xOffset = Math.abs(x)
  const coverOpacity = 0.5
  return (
    <Group x={x} y={y}>
      {/* <Rect
        // fill={'url(#pattern-circles)'}
        fill={'white'}
        opacity={coverOpacity}
        width={width + xOffset}
        height={rangeStart}
      />
      <Rect
        // fill={'url(#pattern-circles)'}
        fill={'white'}
        opacity={coverOpacity}
        y={rangeEnd}
        width={width + xOffset}
        height={height - rangeEnd}
      /> */}
      <Line
        stroke={'black'}
        opacity={coverOpacity + 0.25}
        strokeWidth={1}
        points={[0, rangeStart, width + xOffset, rangeStart]}
      />
      <Line
        stroke={'black'}
        opacity={coverOpacity + 0.25}
        strokeWidth={1}
        points={[0, rangeEnd, width + xOffset, rangeEnd]}
      />
      {/* <Pattern
        id="pattern-circles"
        x="0"
        y="0"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <Line stroke="black" strokeWidth={'0.25'} points={[-5, -5, 25, 25]} />
        <Rect x="0" y="0" width="20" height="20" style={{ fill: 'var(--bg)' }} fillOpacity="0.5" />
      </Pattern> */}
    </Group>
  )
}
