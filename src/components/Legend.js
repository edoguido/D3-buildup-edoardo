import React from 'react'

const legendSymbolSize = 6

export function Legend(props) {
  const { title, entries, fontSize, color: colorScheme, transform } = props
  const legendEntryHeight = fontSize * 1.8
  return (
    <g className="legend" transform={transform}>
      <text fontSize={fontSize * 2.2}>{title}</text>
      {entries.map((legendEntry, j) => {
        return (
          <g key={j} transform={`translate(0, ${legendEntryHeight * (j + 2)})`}>
            <circle fill={colorScheme(j)} cx="0" cy={-legendSymbolSize} r={legendSymbolSize / 2}>
              {legendEntry}
            </circle>
            <text x={legendSymbolSize * 1.5} fontSize={fontSize * 1.5}>
              {legendEntry}
            </text>
          </g>
        )
      })}
    </g>
  )
}
