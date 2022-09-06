import React, { FC } from 'react'
import Draggable from './components/common/Draggable'
import GlobalStyles from './globalStyles'

const App: FC = () => {
  return (
    <>
      <GlobalStyles />
      <Draggable handle={['.handle', '.handle2']} onEnd={(e) => console.log(e)}>
        <span style={{ display: 'block' }}>
          <div style={{ padding: '100px', background: 'aquamarine' }}>
            <div
              className="handle"
              style={{
                marginLeft: '10px',
                padding: '10px',
                background: '#a4b2ad',
              }}
            >
              Handle
            </div>
            <div
              className="empty"
              style={{
                marginLeft: '10px',
                padding: '10px',
                background: '#5f7875',
              }}
            >
              No handle
            </div>
            <div
              className="handle2"
              style={{
                marginLeft: '10px',
                padding: '10px',
                background: '#a6bab8',
              }}
            >
              Handle2
            </div>
          </div>
        </span>
      </Draggable>
    </>
  )
}

export default App
