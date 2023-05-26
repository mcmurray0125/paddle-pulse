import React from 'react'
import { Button, Card, Container } from 'react-bootstrap'
import { useAudioContext } from "../audio/AudioContext"

export default function RallyCounter({ isListening, setIsListening }) {
    const { stream, context, count, setupAudioContext, stopAudioContext } = useAudioContext();

    const handlePingPongClick = async () => {
      if (!isListening) {
        setIsListening(true);
        setupAudioContext();
      } else {
        setIsListening(false);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (context) {
          context.close();
          stopAudioContext();
        }
      }
    };
  return (
    <>
        <h2>Click to start/stop Listening</h2>
        <Button onClick={handlePingPongClick}>
            {isListening ? 'Stop Listening' : 'Start Listening'}
        </Button>
        <Card className='rally-counter text-center'>
            <Card.Header className='fs-3'>Rally</Card.Header>
            <Card.Body className='fs-1'>{count} Hits</Card.Body>
        </Card>
    </>
  )
}
