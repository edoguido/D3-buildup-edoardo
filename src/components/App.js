import React, { useState } from 'react'
import SpiralMultiplesCanvas from './SpiralMultiplesCanvas'
import { Tooltip } from './Tooltip'

export function App() {
  const [hovered, setHovered] = useState(null)
  return (
    <>
      <span>D3 Exercise — </span>
      <span>
        Data:
        <a
          href="https://www.kaggle.com/leonardopena/top50spotify2019"
          target="_blank"
          rel="noopener noreferrer"
        >
          Top 50 Spotify Songs - 2019
        </a>
      </span>
      <h2>Responsive spiral Chart with React and D3</h2>

      <Tooltip hovered={hovered} />
      <SpiralMultiplesCanvas hoveredFn={datum => setHovered(datum)} />
    </>
  )
}
