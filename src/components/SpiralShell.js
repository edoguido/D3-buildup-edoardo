import React from 'react'
import { times } from 'lodash-es'
import { circle, spiral } from '../lib/curveEquations'
import { angularModulus } from '../lib/helpers'

export function SpiralShell(props) {
  const { debug, linesCount, color, angle: endAngle, internalRadius } = props

  const spiralStartingRadius = 10
  const spiralGrowingFactor = 16
  const spiralLineAngleIncrement = (2 * Math.PI) / linesCount
  const startOpacityValue = 0.3

  return (
    <g>
      {times(linesCount).map(j => {
        const angle = spiralLineAngleIncrement * j
        const angularModulusValue = angularModulus(Math.PI / 5, angle, startOpacityValue)
        const modulusStart = angularModulusValue !== startOpacityValue
        if (angle > endAngle) return
        const circlePoints = circle(internalRadius, angle)
        const twistedSpiralPoints = spiral(
          internalRadius + spiralStartingRadius / 2,
          angle - (Math.PI / linesCount + (Math.PI / (linesCount * 5)) * j),
          // angle - spiralLineAngleIncrement * (linesCount / 10),
          spiralGrowingFactor / 2
        )
        const spiralPoints = spiral(
          internalRadius + spiralStartingRadius,
          angle,
          spiralGrowingFactor
        )
        const spiralModulus = modulusStart ? angularModulusValue : startOpacityValue

        return (
          <g key={j}>
            <path
              stroke={color}
              strokeWidth={debug ? 0.5 : 0.75}
              opacity={debug ? 0.5 : spiralModulus}
              fill="transparent"
              d={`
                M ${circlePoints.x} ${circlePoints.y}
                Q ${twistedSpiralPoints.x} ${twistedSpiralPoints.y} ${spiralPoints.x} ${spiralPoints.y}
              `}
            />
            {debug && j % 12 === 0 && (
              <>
                <line
                  opacity="0.5"
                  stroke="gray"
                  strokeWidth="0.5"
                  x1={circlePoints.x}
                  y1={circlePoints.y}
                  x2={twistedSpiralPoints.x}
                  y2={twistedSpiralPoints.y}
                />
                <line
                  opacity="0.5"
                  stroke="gray"
                  strokeWidth="0.5"
                  x1={twistedSpiralPoints.x}
                  y1={twistedSpiralPoints.y}
                  x2={spiralPoints.x}
                  y2={spiralPoints.y}
                />
                <circle
                  opacity="1"
                  fill="red"
                  cx={twistedSpiralPoints.x}
                  cy={twistedSpiralPoints.y}
                  r="1.5"
                />
                <circle opacity="1" fill="blue" cx={spiralPoints.x} cy={spiralPoints.y} r="1.5" />
              </>
            )}
          </g>
        )
      })}
    </g>
  )
}
