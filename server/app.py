from flask import Flask, request
from flask_cors import CORS
import numpy as np
from scipy import signal
import scipy.signal as signal

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def preprocess_audio(audio_data):
    # Apply a moving average filter to reduce noise
    window_size = 10
    filtered_data = signal.convolve(audio_data, np.ones(window_size) / window_size, mode='same')
    
    return filtered_data

def estimate_pitch(audio_data, sample_rate):
    preprocessed_data = preprocess_audio(audio_data)
    
    # Normalize the preprocessed audio data
    preprocessed_data = preprocessed_data / np.max(np.abs(preprocessed_data))
    
    # Compute the autocorrelation of the audio signal
    autocorr = np.correlate(preprocessed_data, preprocessed_data, mode='full')
    
    # Keep only the positive part of the autocorrelation
    autocorr = autocorr[len(autocorr)//2:]
    
    # Find the first peak in the autocorrelation (excluding the first sample)
    peak_index = signal.argrelmax(autocorr, order=1)[0][0]
    
    # Convert the peak index to a frequency (in Hz)
    frequency = sample_rate / peak_index
    
    return frequency


threshold_db = -30  # Adjust the threshold level as per your requirements

def calculate_db(audio_data):
    rms = np.sqrt(np.mean(np.square(audio_data)))
    db = 20 * np.log10(rms)
    return db

@app.route("/pulse", methods=["POST"])
def pulse():
    audio_data = np.frombuffer(request.data, dtype=np.float32)  # Convert the raw audio data to a NumPy array
    sample_rate = 44100  # Sample rate of the audio (you may adjust this according to your setup)
    
    # Perform the pitch estimation
    frequency = estimate_pitch(audio_data, sample_rate)
    
    # Check if the frequency is within the desired range and above the threshold dB level
    if 875 <= frequency <= 1000 and calculate_db(audio_data) >= threshold_db:
        return "hit"
    else:
        return "..."




if __name__ == "__main__":
    app.run(debug=True)
