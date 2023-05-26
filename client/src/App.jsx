import { useState, useRef, useEffect } from 'react';
import { Container } from 'react-bootstrap'
import "./app.css"
import RallyCounter from './components/RallyCounter';
import { useAudioContext } from "./audio/AudioContext"
import pulseLeft from "./assets/pulse-left.mp4"
import pulseRight from "./assets/pulse-right.mp4"

function App() {
  const [isListening, setIsListening] = useState(false);
  const { count } = useAudioContext();

  const leftVideoRef = useRef(null);
  const rightVideoRef = useRef(null);

  const playLeft = count !== 0 && count % 2 !== 0;
  const playRight = count !== 0 && count % 2 === 0;

  useEffect(() => {
    if (playLeft && leftVideoRef.current) {
      leftVideoRef.current.play();
    }
    if (playRight && rightVideoRef.current) {
      rightVideoRef.current.play();
    }
  }, [playLeft, playRight]);

  return (
    <>
      <video
        ref={leftVideoRef}
        src={pulseLeft}
        type="video/mp4"
        className='pulse-video-left'
      />
      <video
        src={pulseRight}
        ref={rightVideoRef}
        type="video/mp4"
        className='pulse-video-right'
      />
      <Container className="d-flex align-items-center justify-content-center flex-column pt-5 gap-5">
        <RallyCounter isListening={isListening} setIsListening={setIsListening}/>
      </Container>
    </>
  );
}

export default App
