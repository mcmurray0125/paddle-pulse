import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap'
import "./app.css"
import RallyCounter from './components/RallyCounter';
import Header from './components/Header';
import { useAudioContext } from "./audio/AudioContext"

function App() {
  const [isListening, setIsListening] = useState(false);
  const { count } = useAudioContext();


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

  return (
    <>
      <Container className="main-container d-flex align-items-center flex-column pt-5 gap-4">
        <Header isListening={isListening} setIsListening={setIsListening}/>
        <RallyCounter isListening={isListening} setIsListening={setIsListening}/>
      </Container>
    </>
  );
}

export default App
