import { useState, useEffect } from 'react'
import { Card } from 'react-bootstrap'
import { useAudioContext } from "../audio/AudioContext"

export default function RallyCounter({ isListening, setIsListening }) {
    const { count } = useAudioContext();

    
  return (
    <>
        <Card className='counter text-center'>
            <Card.Header className='counter-header fs-3 text-decoration-underline'>RALLY</Card.Header>
            <Card.Body className='counter-body'>
              <span className='count'>{count}</span>
            </Card.Body>
            <Card.Footer className='counter-footer'>
              <span className='fs-3'>hits</span>
            </Card.Footer>
            <div className={`ripple-wrapper`}>
              <button></button>
              <button></button>
              <button></button>
            </div>
        </Card>
    </>
  )
}
