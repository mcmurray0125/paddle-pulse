from flask import Flask, request
from flask_cors import CORS
import numpy as np
import scipy.signal as signal

app = Flask("paddle-pulse")
CORS(app)  # Enable CORS for all routes

def estimate_pitch(audio_data, sample_rate):
    # Normalize the audio data
    audio_data = audio_data / np.max(np.abs(audio_data))
    
    # Compute the autocorrelation of the audio signal
    autocorr = np.correlate(audio_data, audio_data, mode='full')
    
    # Keep only the positive part of the autocorrelation
    autocorr = autocorr[len(autocorr)//2:]
    
    # Find the first peak in the autocorrelation (excluding the first sample)
    peak_index = signal.argrelmax(autocorr, order=1)[0][0]
    
    # Convert the peak index to a frequency (in Hz)
    frequency = sample_rate / peak_index
    
    return frequency

@app.route("/pulse", methods=["POST"])
def pulse():
    audio_data = np.frombuffer(request.data, dtype=np.float32)  # Convert the raw audio data to a NumPy array
    sample_rate = 44100  # Sample rate of the audio (you may adjust this according to your setup)
    
    # Perform the pitch estimation
    frequency = estimate_pitch(audio_data, sample_rate)
    
    return f"The estimated pitch is: {frequency:.2f} Hz"

if __name__ == "__main__":
    app.run(debug=True)
