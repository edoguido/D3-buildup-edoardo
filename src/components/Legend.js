import React from 'react'
import { Group, Text, Circle } from 'react-konva'

const legendSymbolSize = 6

export function Legend({ title, entries, fontSize, color: colorScheme, ...props }) {
  const legendEntryHeight = fontSize * 1.8
  return (
    <Group className="legend" {...props}>
      <Text fontSize={fontSize * 2.2} text={title} />
      {entries.map((legendEntry, j) => {
        return (
          <Group key={j} x={0} y={legendEntryHeight * (j + 2)}>
            <Circle
              fill={colorScheme(j)}
              x="0"
              y={legendSymbolSize}
              radius={legendSymbolSize / 2}
            />

            <Text x={legendSymbolSize * 1.5} fontSize={fontSize * 1.5} text={legendEntry} />
          </Group>
        )
      })}
    </Group>
  )
}
