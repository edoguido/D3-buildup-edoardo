import React from 'react'
import SpiralMultiples from './SpiralMultiples'

export class App extends React.Component {
  render() {
    return (
      <>
        <span>D3 Exercise — </span>
        <span>
          Data:{' '}
          <a
            href="https://www.kaggle.com/leonardopena/top50spotify2019"
            target="_blank"
            rel="noopener noreferrer"
          >
            Top 50 Spotify Songs - 2019
          </a>
        </span>
        <SpiralMultiples />
      </>
    )
  }
}
