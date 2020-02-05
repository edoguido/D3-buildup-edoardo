import React from 'react'
import { Group, Text, Line } from 'react-konva'

export function YAxis({
  title,
  width = 48,
  svgHeight,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
  fontSize = 10,
  scale,
  ...props
}) {
  const ticks = scale.ticks()
  return (
    <Group {...props}>
      <Text
        // className="y-axis title"
        x={fontSize - width}
        y={88}
        rotation={-90}
        text={title}
      />

      <Line stroke={'black'} points={[0, 0, 0, svgHeight]} />
      {ticks.reverse().map((tick, i) => {
        const tickLabelYOffset = (svgHeight / ticks.length) * i
        return (
          <Group
            key={i}
            // className="tick"
            x={0}
            y={tickLabelYOffset}
          >
            <Text fontSize={fontSize} verticalAlign={'middle'} height={1} x={-30} text={tick} />
            <Line stroke={'black'} points={[-fontSize, 0, 0, 0]} />
          </Group>
        )
      })}
      <Line stroke={'black'} points={[-fontSize, svgHeight, 0, svgHeight]} />
    </Group>
  )
}
