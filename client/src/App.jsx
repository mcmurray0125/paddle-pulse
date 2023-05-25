import { useState } from 'react';
import { Button, Card, Container } from 'react-bootstrap'
import "./app.css"

import setupAudioContext from './audio/AudioContext';

function App() {
  const [rallyCount, setRallyCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);

  const handlePingPongClick = async () => {
    if (!isListening) {
      const { stream, context } = await setupAudioContext();
      if (context && stream) {
        setIsListening(true);
        setMediaStream(stream);
        setAudioContext(context);
      }
    } else {
      setIsListening(false);
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
      if (audioContext) {
        audioContext.close();
        setAudioContext(null);
      }
    }
  };

  return (
    <>
      <Container className="d-flex align-items-center justify-content-center flex-column mt-5 gap-5">
        <h2>Click to start/stop Listening</h2>
        <Button onClick={handlePingPongClick}>
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </Button>
        <Card className='rally-counter text-center'>
          <Card.Header className='fs-3'>Rally</Card.Header>
          <Card.Body className='fs-1'>{rallyCount} Hits</Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default App
