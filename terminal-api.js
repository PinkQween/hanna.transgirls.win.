// JavaScript API Bridge for WASM Terminal
// This file provides the JavaScript implementations of functions that are called from Rust

// Audio/Video player state
let audioPlayer = null;
let videoPlayer = null;
let mediaContainer = null;

// Helper function to extract YouTube video ID
function extractYouTubeId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
        /youtube\.com\/shorts\/([^&\?\/]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Helper function to detect media type
function getMediaType(url) {
    const lower = url.toLowerCase();

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'youtube';
    }

    // Audio formats
    if (lower.match(/\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/)) {
        return 'audio';
    }

    // Video formats
    if (lower.match(/\.(mp4|webm|ogv|mov)(\?|$)/)) {
        return 'video';
    }

    // Default to audio for unknown URLs
    return 'audio';
}

// Create or get media container
function getMediaContainer() {
    if (!mediaContainer) {
        mediaContainer = document.createElement('div');
        mediaContainer.id = 'terminal-media-container';
        mediaContainer.style.position = 'fixed';
        mediaContainer.style.top = '50%';
        mediaContainer.style.left = '50%';
        mediaContainer.style.transform = 'translate(-50%, -50%)';
        mediaContainer.style.zIndex = '10000';
        mediaContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        mediaContainer.style.padding = '20px';
        mediaContainer.style.borderRadius = '10px';
        mediaContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        mediaContainer.style.maxWidth = '90%';
        mediaContainer.style.maxHeight = '90%';
        mediaContainer.style.display = 'none';

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕ Close';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.padding = '8px 16px';
        closeBtn.style.backgroundColor = '#f0f';
        closeBtn.style.color = '#000';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '5px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.onclick = () => {
            window.stopAudio();
            window.stopVideo();
        };

        mediaContainer.appendChild(closeBtn);
        document.body.appendChild(mediaContainer);
    }
    return mediaContainer;
}

// Helper function to convert data URL to Blob URL (using fetch for efficiency)
async function dataUrlToBlob(dataUrl) {
    try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (e) {
        console.error('Failed to convert data URL to blob:', e);
        // Fallback to manual conversion
        try {
            const parts = dataUrl.split(',');
            const mime = parts[0].match(/:(.*?);/)[1];
            const bstr = atob(parts[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while(n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return URL.createObjectURL(new Blob([u8arr], {type: mime}));
        } catch (e2) {
            console.error('Fallback conversion also failed:', e2);
            throw e2;
        }
    }
}

// Universal media playback function
window.playMediaUrl = async function(url, displayName) {
    try {
        // Convert data URLs to blob URLs to avoid browser size limits
        let playUrl = url;
        if (url.startsWith('data:')) {
            console.log('Converting data URL to blob URL (size:', url.length, 'bytes)');
            playUrl = await dataUrlToBlob(url);
            console.log('Blob URL created:', playUrl);
        }

        const mediaType = getMediaType(url);
        console.log('Playing media:', mediaType);
        console.log('Display name:', displayName);

        // Stop any currently playing media
        window.stopAudio();
        window.stopVideo();

        const container = getMediaContainer();
        container.style.display = 'block';

        // Remove old content (except close button)
        while (container.children.length > 1) {
            container.removeChild(container.lastChild);
        }

        // Determine what to display as the title
        let displayTitle = displayName || url;
        if (url.startsWith('data:')) {
            displayTitle = displayName || 'Embedded Audio File';
        }

        if (mediaType === 'youtube') {
            const videoId = extractYouTubeId(url);
            if (!videoId) {
                console.error('Could not extract YouTube video ID from:', url);
                container.style.display = 'none';
                return false;
            }

            // Create audio-only element for YouTube using hidden iframe
            const iframe = document.createElement('iframe');
            iframe.width = '0';
            iframe.height = '0';
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.style.display = 'none';

            // Create audio UI for YouTube
            const audioDiv = document.createElement('div');
            audioDiv.style.marginTop = '40px';
            audioDiv.style.color = '#f0f';
            audioDiv.style.textAlign = 'center';

            const title = document.createElement('h2');
            title.textContent = '🎵 Now Playing (Audio Only)';
            title.style.color = '#f0f';
            title.style.marginBottom = '20px';

            const urlText = document.createElement('p');
            urlText.textContent = displayTitle;
            urlText.style.color = '#fff';
            urlText.style.wordBreak = 'break-all';
            urlText.style.marginBottom = '20px';

            audioDiv.appendChild(title);
            audioDiv.appendChild(urlText);
            container.appendChild(audioDiv);
            container.appendChild(iframe);
            videoPlayer = iframe;

        } else if (mediaType === 'video') {
            // For video files, use audio element instead of video to hide visuals
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.autoplay = true;
            audio.style.width = '100%';
            audio.style.maxWidth = '600px';
            audio.src = playUrl;

            audio.onerror = function(e) {
                console.error('Failed to load video. Error details:', e);
                console.error('Audio element error code:', audio.error ? audio.error.code : 'unknown');
                console.error('Audio element error message:', audio.error ? audio.error.message : 'unknown');
            };

            // Create audio UI
            const audioDiv = document.createElement('div');
            audioDiv.style.marginTop = '40px';
            audioDiv.style.color = '#f0f';
            audioDiv.style.textAlign = 'center';

            const title = document.createElement('h2');
            title.textContent = '🎵 Now Playing (Audio Only)';
            title.style.color = '#f0f';
            title.style.marginBottom = '20px';

            const urlText = document.createElement('p');
            urlText.textContent = displayTitle;
            urlText.style.color = '#fff';
            urlText.style.wordBreak = 'break-all';
            urlText.style.marginBottom = '20px';

            audioDiv.appendChild(title);
            audioDiv.appendChild(urlText);
            audioDiv.appendChild(audio);
            container.appendChild(audioDiv);
            audioPlayer = audio;

        } else {
            // Audio
            audioPlayer = new Audio(playUrl);
            audioPlayer.autoplay = true;

            // Create audio UI
            const audioDiv = document.createElement('div');
            audioDiv.style.marginTop = '40px';
            audioDiv.style.color = '#f0f';
            audioDiv.style.textAlign = 'center';

            const title = document.createElement('h2');
            title.textContent = '🎵 Now Playing';
            title.style.color = '#f0f';
            title.style.marginBottom = '20px';

            const urlText = document.createElement('p');
            urlText.textContent = displayTitle;
            urlText.style.color = '#fff';
            urlText.style.wordBreak = 'break-all';
            urlText.style.marginBottom = '20px';

            const controls = document.createElement('audio');
            controls.controls = true;
            controls.src = playUrl;
            controls.autoplay = true;
            controls.style.width = '100%';
            controls.style.maxWidth = '600px';

            audioDiv.appendChild(title);
            audioDiv.appendChild(urlText);
            audioDiv.appendChild(controls);
            container.appendChild(audioDiv);

            audioPlayer = controls;

            audioPlayer.onerror = function(e) {
                console.error('Failed to load audio. Error details:', e);
                console.error('Audio element error code:', audioPlayer.error ? audioPlayer.error.code : 'unknown');
                console.error('Audio element error message:', audioPlayer.error ? audioPlayer.error.message : 'unknown');
            };
        }

        return true;
    } catch (e) {
        console.error('Error playing media:', e);
        return false;
    }
};

// Audio playback functions (legacy support)
window.playAudioFile = function(path) {
    return window.playMediaUrl(path);
};

window.stopAudio = function() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer = null;
    }

    if (mediaContainer) {
        mediaContainer.style.display = 'none';
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
    return window.playMediaUrl(path);
};

window.stopVideo = function() {
    if (videoPlayer) {
        if (videoPlayer.pause) {
            videoPlayer.pause();
        }
        videoPlayer = null;
    }

    if (mediaContainer) {
        mediaContainer.style.display = 'none';
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
