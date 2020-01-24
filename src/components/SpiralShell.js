import React from 'react'
import { times } from 'lodash-es'
import * as d3 from 'd3'
import { circle, spiral } from '../lib/curveEquations'
import { opacityModulus } from '../lib/helpers'

//
// constants
const DOUBLE_PI = 2 * Math.PI
const CIRCLE_RADIUS = 3
const START_RADIUS = 10
const GROWING_FACTOR = 16
const MIN_OPACITY = 0.1
const MAX_OPACITY = 0.8
const MASK_ANCHOR_FACTOR = 1.2

export const SpiralShell = React.memo(function SpiralShell(props) {
  const { debug, color, angle: endAngle, internalRadius, modulus, linesCount } = props

  const numberOfModuli = DOUBLE_PI / modulus
  const modulusLinesCount = linesCount / numberOfModuli
  const computeControlPointShift = index => (1 + index) * (DOUBLE_PI / (numberOfModuli * 20))
  // const linesCount = numberOfModuli * modulusLinesCount
  // const spiralLineAngleIncrement = DOUBLE_PI / linesCount

  const colorScale = d3
    .scaleLinear()
    .domain([1, modulusLinesCount])
    .interpolate(d3.interpolateHcl)
    // .range([d3.rgb('#ffffff'), d3.rgb(color)])
    .range(color.map(c => d3.rgb(c)))

  const maskPoints = times(numberOfModuli + 1).map(j => {
    const angle = (DOUBLE_PI / numberOfModuli) * j
    const bezierControlPointShiftAmount = modulus / 2
    const spiralPoints = spiral(internalRadius + START_RADIUS, angle, GROWING_FACTOR)
    const spiralControlPoints = spiral(
      internalRadius + START_RADIUS,
      angle - bezierControlPointShiftAmount,
      GROWING_FACTOR / MASK_ANCHOR_FACTOR
    )
    return {
      point: {
        x: spiralPoints.x,
        y: spiralPoints.y,
      },
      control: {
        x: spiralControlPoints.x,
        y: spiralControlPoints.y,
      },
    }
  })

  return (
    <g className="spiral">
      <clipPath id={`clip-${endAngle}`}>
        <path
          d={`
            M 0 ${START_RADIUS}
            ${maskPoints
              .map(({ point: { x, y }, control: { x: cx, y: cy } }) => `Q ${cx} ${cy} ${x} ${y}`)
              .join('\n')}
            `}
        />
      </clipPath>
      {debug && (
        <>
          <path
            stroke="gray"
            strokeWidth="0.5"
            fill="none"
            d={`
            M 0 ${START_RADIUS}
            ${maskPoints
              .map(({ point: { x, y }, control: { x: cx, y: cy } }) => `Q ${cx} ${cy} ${x} ${y}`)
              .join('\n')}
            `}
          />
          {maskPoints.map(({ point: { x, y }, control: { x: cx, y: cy } }, i, arrayOfPoints) => {
            const lastIndex = i === 0 ? i + 1 : i - 1
            const lastPoint = arrayOfPoints[lastIndex].point
            return (
              <g key={i} className="mask-debug">
                <line
                  stroke="lightgreen"
                  strokeWidth="0.5"
                  x1={lastPoint.x}
                  y1={lastPoint.y}
                  x2={cx}
                  y2={cy}
                />
                <line stroke="lightgreen" strokeWidth="0.5" x1={x} y1={y} x2={cx} y2={cy} />
                <circle cx={cx} cy={cy} r="1.5" fill="green" />
              </g>
            )
          })}
        </>
      )}{' '}
      <line />
      <circle opacity="1" fill={color[color.length - 1]} cx="0" cy="0" r={CIRCLE_RADIUS} />
      {times(numberOfModuli).map(j => {
        const angle = (DOUBLE_PI / numberOfModuli) * j
        if (angle > endAngle) return
        const bezierControlPointShiftAmount = computeControlPointShift(j)
        // find curves points
        let circlePoints = circle(internalRadius, angle)
        let spiralControlPoints = spiral(
          internalRadius + START_RADIUS / 2,
          angle - bezierControlPointShiftAmount,
          GROWING_FACTOR / 2
        )
        let spiralPoints = spiral(internalRadius + START_RADIUS, angle, GROWING_FACTOR)

        return (
          <g key={j}>
            {/* <clipPath id={`clip-${endAngle}`}>
              <path
                d={`
                  M ${circlePoints.x} ${circlePoints.y}
                  L ${spiralPoints.x} ${spiralPoints.y}
                `}
              />
            </clipPath> */}
            <path
              stroke={debug ? 'black' : color}
              strokeWidth={debug ? 0.35 : MAX_OPACITY}
              strokeOpacity={debug ? 0.35 : MAX_OPACITY}
              fill="transparent"
              d={`
                  M ${circlePoints.x} ${circlePoints.y}
                  Q ${spiralControlPoints.x} ${spiralControlPoints.y} ${spiralPoints.x} ${spiralPoints.y}
                `}
            />
            {debug && (
              <>
                <line
                  opacity="1"
                  strokeWidth="0.75"
                  stroke="gray"
                  x1={circlePoints.x}
                  y1={circlePoints.y}
                  x2={spiralControlPoints.x}
                  y2={spiralControlPoints.y}
                />
                <line
                  opacity="1"
                  strokeWidth="0.75"
                  stroke="gray"
                  x1={spiralControlPoints.x}
                  y1={spiralControlPoints.y}
                  x2={spiralPoints.x}
                  y2={spiralPoints.y}
                />
                <circle
                  opacity="1"
                  fill="red"
                  r="1.5"
                  cx={spiralControlPoints.x}
                  cy={spiralControlPoints.y}
                />
                <circle opacity="1" fill="blue" cx={spiralPoints.x} cy={spiralPoints.y} r="1.5" />
              </>
            )}
            {times(modulusLinesCount).map(k => {
              const subModulusAngle = angle + (modulus / modulusLinesCount) * k
              const lineOpacity = opacityModulus(modulusLinesCount, k, MIN_OPACITY, MAX_OPACITY)
              const startOfModulus = lineOpacity === MIN_OPACITY
              if (startOfModulus) return
              circlePoints = circle(internalRadius, subModulusAngle)
              spiralControlPoints = spiral(
                internalRadius + START_RADIUS / 2,
                subModulusAngle - bezierControlPointShiftAmount,
                GROWING_FACTOR / 2
              )
              spiralPoints = spiral(internalRadius + START_RADIUS, subModulusAngle, GROWING_FACTOR)

              return (
                <g key={k} style={{ clipPath: `url(#clip-${endAngle})` }}>
                  <path
                    stroke={colorScale(k)}
                    strokeWidth={0.75}
                    strokeOpacity={debug ? 0.35 : lineOpacity}
                    fill="transparent"
                    d={`
                        M ${circlePoints.x} ${circlePoints.y}
                        Q ${spiralControlPoints.x} ${spiralControlPoints.y} ${spiralPoints.x} ${spiralPoints.y}
                      `}
                  />
                </g>
              )
            })}
          </g>
        )
      })}
    </g>
  )
})
