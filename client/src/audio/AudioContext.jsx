import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import Wad from 'web-audio-daw';

export const AudioContext = createContext();

const AudioContextProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  const streamRef = useRef(null);
  const voiceRef = useRef(null);
  const tunerRef = useRef(null);

  const setupAudioContext = () => {
    const voice = new Wad({source : 'mic' }); // At this point, your browser will ask for permission to access your microphone.
    const tuner = new Wad.Poly();
    tuner.setVolume(0); // If you're not using headphones, you can eliminate microphone feedback by muting the output from the tuner.
    tuner.add(voice);
    
    voice.play(); // You must give your browser permission to access your microphone before calling play().
    
    tuner.updatePitch() // The tuner is now calculating the pitch and note name of its input 60 times per second. These values are stored in <code>tuner.pitch</code> and <code>tuner.noteName</code>.
    
    const logPitch = function(){
        console.log(tuner.pitch, tuner.noteName)
        requestAnimationFrame(logPitch)
    };
    logPitch();
    // If you sing into your microphone, your pitch will be logged to the console in real time.
      };

  const stopAudioContext = () => {
    voice.stop()
    tuner.stopUpdatingPitch()
  };

  const logPitch = () => {
    const tuner = tunerRef.current;
    if (tuner) {
      console.log(tuner.pitch);
      tuner.pitch = undefined; // Reset the pitch to undefined
      requestAnimationFrame(logPitch);
    }
  };


  return (
    <AudioContext.Provider value={{ count, setCount, setupAudioContext, stopAudioContext }}>
      {children}
    </AudioContext.Provider>
  );
};

const useAudioContext = () => {
  return useContext(AudioContext);
};

export { AudioContextProvider, useAudioContext };
