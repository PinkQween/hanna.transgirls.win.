// JavaScript API Bridge for WASM Terminal
// This file provides the JavaScript implementations of functions that are called from Rust

// Audio player state
let audioPlayer = null;

// Audio playback functions
window.playAudioFile = function(path) {
    try {
        // Stop any currently playing audio
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer = null;
        }

        // Create new audio element
        audioPlayer = new Audio(path);
        audioPlayer.play();

        // Handle errors
        audioPlayer.onerror = function() {
            console.error('Failed to load audio file:', path);
        };

        return true;
    } catch (e) {
        console.error('Error playing audio:', e);
        return false;
    }
};

window.stopAudio = function() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer = null;
    }
};

window.pauseAudio = function() {
    if (audioPlayer) {
        audioPlayer.pause();
    }
};

window.resumeAudio = function() {
    if (audioPlayer) {
        audioPlayer.play();
    }
};

window.getAudioDuration = function() {
    return audioPlayer ? audioPlayer.duration : 0;
};

window.getAudioCurrentTime = function() {
    return audioPlayer ? audioPlayer.currentTime : 0;
};

window.setAudioVolume = function(volume) {
    if (audioPlayer) {
        audioPlayer.volume = Math.max(0, Math.min(1, volume));
    }
};

// Video playback functions
window.playVideoFile = function(path) {
    try {
        // Create or get video element
        let videoElement = document.getElementById('terminal-video-player');
        if (!videoElement) {
            videoElement = document.createElement('video');
            videoElement.id = 'terminal-video-player';
            videoElement.controls = true;
            videoElement.style.position = 'fixed';
            videoElement.style.top = '50%';
            videoElement.style.left = '50%';
            videoElement.style.transform = 'translate(-50%, -50%)';
            videoElement.style.maxWidth = '80%';
            videoElement.style.maxHeight = '80%';
            videoElement.style.zIndex = '1000';
            videoElement.style.backgroundColor = '#000';
            document.body.appendChild(videoElement);
        }

        videoElement.src = path;
        videoElement.style.display = 'block';
        videoElement.play();

        return true;
    } catch (e) {
        console.error('Error playing video:', e);
        return false;
    }
};

window.stopVideo = function() {
    const videoElement = document.getElementById('terminal-video-player');
    if (videoElement) {
        videoElement.pause();
        videoElement.style.display = 'none';
    }
};

// Get current date/time
window.getCurrentDateTime = function() {
    const now = new Date();
    return now.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

// Show notification
window.showNotification = function(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message });
    } else {
        console.log(`Notification: ${title} - ${message}`);
        alert(`${title}\n${message}`);
    }
};

// Open URL
window.openUrl = function(url) {
    window.open(url, '_blank');
};

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

console.log('Terminal API bridge loaded');
