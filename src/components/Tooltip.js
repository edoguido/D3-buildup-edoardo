import React, { useState, useEffect } from 'react'

export function Tooltip({ hovered }) {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)

  useEffect(() => {
    window.addEventListener('mousemove', e => {
      setMouseX(e.clientX)
      setMouseY(e.clientY)
    })
  }, [])

  const tooltipWidth = 240
  const tooltipHeight = 300
  const cursorOffset = 16

  const infoAvailable = hovered !== null
  const tooltipContent = hovered
  const opacity = infoAvailable ? 1 : 0

  const mouseConstraint = (mouseCoord, size, constraint) =>
    mouseCoord + size > constraint ? mouseCoord - Math.abs(constraint - (mouseCoord + size)) : mouseCoord

  return (
    <div
      className="tooltip"
      style={{
        display: 'block',
        position: 'fixed',
        minWidth: tooltipWidth / 1.5,
        maxWidth: tooltipWidth,
        maxHeight: tooltipHeight,
        lineHeight: '1.5em',
        backgroundColor: 'white',
        left: mouseConstraint(mouseX + cursorOffset, tooltipWidth, window.innerWidth),
        top: mouseConstraint(mouseY + cursorOffset, tooltipHeight, window.innerHeight),
        opacity: opacity,
        padding: '12px',
        border: '1px solid rgba(200, 200, 200, 1)',
        borderRadius: '8px',
        boxShadow: '0px 8px 8px -4px rgba(0, 0, 0, 0.1)',
        zIndex: '999',
        // transition: 'opacity 350ms ease',
      }}
    >
      {infoAvailable && (
        <>
          <div>{tooltipContent.track}</div>
          <div style={{ fontWeight: '500' }}>{tooltipContent.artist}</div>
          <div style={{ textTransform: 'capitalize' }}>{tooltipContent.genre}</div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div>
              {Math.round(tooltipContent.songLength / 60)}:{tooltipContent.songLength % 60}
            </div>
            –<div>{tooltipContent.bpm} BPM</div>
          </div>
        </>
      )}
    </div>
  )
}
