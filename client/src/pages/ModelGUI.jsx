import { useState } from "react";
import { useAudioContext } from "../audio/AudioContext"
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function ModelGUI() {
    const { collect, listen, train, saveModel } = useAudioContext();
    const [saveButtonPressed, setSaveButtonPressed] = useState(false);

    const buttonStyles = {
      width: "300px",
      height: "3rem",
      fontSize: "1.25rem",
      fontWeight: "bold"
    }

    let saveTimeout;

    const handleSaveButtonDown = () => {
      saveTimeout = setTimeout(() => {
        setSaveButtonPressed(true);
        saveModel();
      }, 3000);
    };
  
    const handleSaveButtonUp = () => {
      clearTimeout(saveTimeout);
      setSaveButtonPressed(false);
    };
  

  return (
    <>
    <Container className="d-flex flex-column gap-5 mt-5 align-items-center">
    <Link to="/" className="text-black align-self-start fs-5">Homepage</Link>
      <h3 id="console" className="text-center">Logs</h3>
      <h3 id="counter" className="text-center">Counter</h3>
      <button id="left" onMouseDown={() => collect(0)} onMouseUp={() => collect(null)} style={buttonStyles}>Left</button>
      <button id="right" onMouseDown={() => collect(1)} onMouseUp={() => collect(null)} style={buttonStyles}>Right</button>
      <button id="noise" onMouseDown={() => collect(2)} onMouseUp={() => collect(null)} style={buttonStyles}>Noise</button>
      <button id="train" onClick={train} style={buttonStyles}>Train</button>
      <button id="listen" onClick={listen} style={buttonStyles}>Listen</button>
      <input type="range" id="output" min="0" max="10" step="0.1" style={{width: "330px"}}/>
      <button
          id="listen"
          onMouseDown={handleSaveButtonDown}
          onMouseUp={handleSaveButtonUp}
          style={buttonStyles}
        >
          {saveButtonPressed ? "Saving..." : "Save Model"}
        </button>
        <p className="m-0 text-black">Hold for 3 seconds to save model.</p>
    </Container>
    </>
  )
}
