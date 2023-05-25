import { useState } from 'react';
import { Button, Card, Container } from 'react-bootstrap'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import "./app.css"

import setupAudioContext from './audio/AudioContext';

function App() {
  const [rallyCount, setRallyCount] = useState(0);
  const [isListening, setIsListening] = useState(false);

  // Initialize audio context
  let audioContext = null;

  const handlePingPongClick = () => {
    if (!isListening) {
      // Start audio context only if not already listening
      audioContext = setupAudioContext();
      setIsListening(true);
    }
    // Handle hit detection logic and update rally count
    setRallyCount(prevCount => prevCount + 1);
  };

  return (
    <>
    <Container className="d-flex align-items-center justify-content-center flex-column mt-5 gap-5">
      <h2>Click to start Listening</h2>
      <Button onClick={handlePingPongClick}>Ping Pong!</Button>
      <Card className='rally-counter text-center'>
        <Card.Header className='fs-3'>Rally</Card.Header>
        <Card.Body className='fs-1'>{rallyCount} Hits</Card.Body>
      </Card>
    </Container>
    </>
  )
}

export default App
