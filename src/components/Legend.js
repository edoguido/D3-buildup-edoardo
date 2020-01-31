import React from 'react'
import { Group, Text, Circle } from 'react-konva'

const legendSymbolSize = 6

export function Legend({ title, entries, entriesInRange, fontSize, color: colorScheme, ...props }) {
  const legendEntryHeight = fontSize * 1.8

  return (
    <Group {...props}>
      <Text fontSize={fontSize * 2.2} text={title} />
      {entries.map((legendEntry, j) => {
        const isInRange = entriesInRange.includes(legendEntry) ? 1 : 0.1

        return (
          <Group key={j} x={0} y={legendEntryHeight * (j + 2)} opacity={isInRange}>
            <Circle
              fill={colorScheme(j)}
              x={0}
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
