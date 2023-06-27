import { Button } from 'react-bootstrap'
import { useAudioContext } from "../audio/AudioContext"

export default function Header({ isListening, setIsListening }) {
    const { streamRef, contextRef, setupAudioContext, stopAudioContext } = useAudioContext();

    const handlePingPongClick = async () => {
        if (!isListening) {
          setupAudioContext();
          setIsListening(true);
        } else {
          setIsListening(false);
          if (streamRef) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
          if (contextRef) {
            contextRef.current.close();
            stopAudioContext();
          }
        }
      };

  return (
    <div className='action-wrapper d-flex flex-column align-items-center gap-2'>
        <h2 className='m-0'>Click to start/stop Listening</h2>
        <Button onClick={handlePingPongClick} className='play-button fs-3'>
        {isListening ? 'STOP' : 'START'}
        </Button>
    </div>
  )
}
