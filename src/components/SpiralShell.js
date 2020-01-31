import React from 'react'
import { times } from 'lodash-es'
import * as d3 from 'd3'
import { Group, Circle, Path, Line, Layer } from 'react-konva'
// import { AnimatedDataset } from 'react-animated-dataset'
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

function SpiralShellComp({
  debug,
  x = 0,
  y = 0,
  color,
  opacity,
  angle: endAngle,
  internalRadius,
  modulus,
  linesCount: totalLinesCount,
  onEnterFn = index => false,
  onLeaveFn = () => false,
}) {
  console.log('___RENDERING Shell')

  const linesCount = Math.floor((endAngle / DOUBLE_PI) * totalLinesCount)
  const moduliCount = DOUBLE_PI / modulus
  const modulusLinesCount = totalLinesCount / moduliCount
  const angleUnit = DOUBLE_PI / totalLinesCount
  const numberOfModuli = Math.floor(linesCount / moduliCount)

  const colorScale = d3
    .scaleLinear()
    .domain([1, modulusLinesCount])
    .interpolate(d3.interpolateHcl)
    .range(color.map(c => d3.rgb(c)))

  const maskPoints = times(numberOfModuli + 1).map(j => {
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
  const handleMouseEnter = index => onEnterFn(index)
  const handleMouseOut = () => onLeaveFn()

  // const clipPathId = `clip-${endAngle}`

  return (
    <Layer opacity={opacity}>
      <Group x={x} y={y}>
        {/* <clipPath id={clipPathId}>
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
        )}{' '} */}
        <Circle fill={color[color.length - 1]} x={0} y={0} radius={CIRCLE_RADIUS} />
        <Group onMouseEnter={e => handleMouseEnter(e)} onMouseLeave={e => handleMouseOut(e)}>
          {/* <AnimatedDataset
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
          /> */}
          <Path
            listening={true}
            fill={'transparent'}
            data={`
              M 0 ${START_RADIUS}
              ${maskPoints
                .map(({ point: { x, y }, control: { x: cx, y: cy } }) => `Q ${cx} ${cy} ${x} ${y}`)
                .join('\n')}
              `}
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
                <Group key={i} listening={false}>
                  <Path
                    // style={{ clipPath: `url(#clip-${endAngle})` }}
                    stroke={colorScale(i % modulusLinesCount)}
                    strokeWidth={0.35}
                    opacity={debug ? 0.35 : lineOpacity}
                    fill="transparent"
                    perfectDrawEnabled={false}
                    data={`
                      M ${innerX} ${innerY}
                      Q ${controlX} ${controlY} ${spiralX} ${spiralY}
                    `}
                  />
                  <Group>
                    {debug && (
                      <Group>
                        <Line
                          opacity={1}
                          strokeWidth={0.75}
                          stroke={'gray'}
                          points={[innerX, innerY, controlX, controlY]}
                        />
                        <Line
                          opacity={1}
                          strokeWidth={0.75}
                          stroke={'gray'}
                          points={[controlX, controlY, spiralX, spiralY]}
                        />
                        <Circle opacity={1} fill={'red'} radius={1.5} x={controlX} y={controlY} />
                        <Circle opacity={1} fill={'blue'} radius={1.5} x={spiralX} y={spiralY} />
                      </Group>
                    )}
                  </Group>
                </Group>
              )
            }
          )}
        </Group>
      </Group>
    </Layer>
  )
}

export const SpiralShell = React.memo(SpiralShellComp, (prevProps, nextProps) => {
  return prevProps.opacity === nextProps.opacity
})
