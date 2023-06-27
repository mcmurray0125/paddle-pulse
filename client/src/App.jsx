import { useState, useEffect } from 'react';
import { Button, Container } from 'react-bootstrap'
import "./app.css"
import RallyCounter from './components/RallyCounter';
import Header from './components/Header';
import { useAudioContext } from "./audio/AudioContext"

function App() {
  const [isListening, setIsListening] = useState(false);
  const { count, setCount } = useAudioContext();


  const playLeft = count !== 0 && count % 2 !== 0;
  const playRight = count !== 0 && count % 2 === 0;

  // useEffect(() => {
  //   if (playLeft && leftVideoRef.current) {
  //     leftVideoRef.current.play();
  //   }
  //   if (playRight && rightVideoRef.current) {
  //     rightVideoRef.current.play();
  //   }
  // }, [playLeft, playRight]);

  function resetCount(e) {
    e.preventDefault();
    setCount(0)
  }

  return (
    <>
      <Container className="main-container d-flex align-items-center flex-column pt-5 gap-5">
        <Header isListening={isListening} setIsListening={setIsListening}/>
        <RallyCounter isListening={isListening} setIsListening={setIsListening}/>
        <Button
          className='play-button fs-5'
          onClick={(e) => {resetCount(e)}}
          style={{filter: "hue-rotate(185deg)"}}
        >
          RESET COUNT
        </Button>
      </Container>
    </>
  );
}

export default App
