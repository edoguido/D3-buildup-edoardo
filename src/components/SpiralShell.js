import React from 'react'
import { times } from 'lodash-es'
import * as d3 from 'd3'
import { AnimatedDataset } from 'react-animated-dataset'
import { circle, spiral } from '../lib/curveEquations'
import { opacityModulus } from '../lib/helpers'

//
// constants
const DOUBLE_PI = 2 * Math.PI
const CIRCLE_RADIUS = 3
const START_RADIUS = 10
const GROWING_FACTOR = 16
const MIN_OPACITY = 0.25
const MAX_OPACITY = 1
const MASK_ANCHOR_FACTOR = 1.2

export function SpiralShell(props) {
  const {
    debug,
    color,
    angle: endAngle,
    internalRadius,
    modulus,
    linesCount: totalLinesCount,
  } = props

  const linesCount = Math.floor((endAngle / DOUBLE_PI) * totalLinesCount)
  const moduliCount = DOUBLE_PI / modulus
  const modulusLinesCount = totalLinesCount / moduliCount
  const angleUnit = DOUBLE_PI / totalLinesCount

  const colorScale = d3
    .scaleLinear()
    .domain([1, modulusLinesCount])
    .interpolate(d3.interpolateHcl)
    .range(color.map(c => d3.rgb(c)))

  const maskPoints = times(moduliCount + 1).map(j => {
    const angle = (DOUBLE_PI / moduliCount) * j
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

  const spiralPointsArray = times(linesCount).map(i => {
    const angle = angleUnit * i
    const bezierControlPointShiftAmount = Math.PI / 12
    const lineOpacity = opacityModulus(modulusLinesCount, i, MIN_OPACITY, MAX_OPACITY)
    // const startOfModulus = lineOpacity === MIN_OPACITY
    const circlePoints = circle(internalRadius, angle)
    const spiralControlPoints = spiral(
      internalRadius + START_RADIUS / 2,
      angle - bezierControlPointShiftAmount,
      GROWING_FACTOR / 2
    )
    const spiralOuterPoints = spiral(internalRadius + START_RADIUS, angle, GROWING_FACTOR)

    return {
      inner: {
        x: circlePoints.x,
        y: circlePoints.y,
      },
      outer: {
        x: spiralOuterPoints.x,
        y: spiralOuterPoints.y,
      },
      control: {
        x: spiralControlPoints.x,
        y: spiralControlPoints.y,
      },
      lineOpacity: lineOpacity,
    }
  })

  const clipPathId = `clip-${endAngle}`

  return (
    <g className="spiral">
      <clipPath id={clipPathId}>
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
      <g className="spiral-lines">
        <AnimatedDataset
          dataset={spiralPointsArray}
          tag="path"
          init={{ opacity: 0 }}
          attrs={{
            d: (
              {
                inner: { x: innerX, y: innerY },
                outer: { x: spiralX, y: spiralY },
                control: { x: controlX, y: controlY },
                lineOpacity,
              },
              i
            ) => `
                M ${innerX} ${innerY}
                Q ${controlX} ${controlY} ${spiralX} ${spiralY}
              `,
            style: `clip-path: url(#${clipPathId})`,
            stroke: (d, i) => colorScale(i % modulusLinesCount),
            'stroke-width': 0.35,
            'stroke-opacity': debug ? 0.35 : 1,
            fill: 'none',
            opacity: 1,
          }}
          keyFn={(d, i) => i}
        />
        {spiralPointsArray.map(
          (
            {
              inner: { x: innerX, y: innerY },
              outer: { x: spiralX, y: spiralY },
              control: { x: controlX, y: controlY },
              lineOpacity,
            },
            i
          ) => {
            return (
              <g key={i}>
                {/* <path
                  key={i}
                  style={{ clipPath: `url(#clip-${endAngle})` }}
                  stroke={colorScale(i % modulusLinesCount)}
                  strokeWidth={0.35}
                  strokeOpacity={debug ? 0.35 : lineOpacity}
                  fill="none"
                  d={`
                M ${innerX} ${innerY}
                Q ${controlX} ${controlY} ${spiralX} ${spiralY}
              `}
                /> */}
                <g>
                  {debug && (
                    <>
                      <line
                        opacity="1"
                        strokeWidth="0.75"
                        stroke="gray"
                        x1={innerX}
                        y1={innerY}
                        x2={controlX}
                        y2={controlY}
                      />
                      <line
                        opacity="1"
                        strokeWidth="0.75"
                        stroke="gray"
                        x1={controlX}
                        y1={controlY}
                        x2={spiralX}
                        y2={spiralY}
                      />
                      <circle opacity="1" fill="red" r="1.5" cx={controlX} cy={controlY} />
                      <circle opacity="1" fill="blue" cx={spiralX} cy={spiralY} r="1.5" />
                    </>
                  )}{' '}
                </g>
              </g>
            )
          }
        )}
      </g>
    </g>
  )
}
