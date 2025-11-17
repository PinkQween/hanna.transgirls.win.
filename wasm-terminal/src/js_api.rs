use wasm_bindgen::prelude::*;

// JavaScript API imports - these functions will be provided by JavaScript
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    pub fn error(s: &str);

    // Audio playback API
    #[wasm_bindgen(js_name = playAudioFile)]
    pub fn play_audio_file(path: &str) -> bool;

    #[wasm_bindgen(js_name = stopAudio)]
    pub fn stop_audio();

    #[wasm_bindgen(js_name = pauseAudio)]
    pub fn pause_audio();

    #[wasm_bindgen(js_name = resumeAudio)]
    pub fn resume_audio();

    #[wasm_bindgen(js_name = getAudioDuration)]
    pub fn get_audio_duration() -> f64;

    #[wasm_bindgen(js_name = getAudioCurrentTime)]
    pub fn get_audio_current_time() -> f64;

    #[wasm_bindgen(js_name = setAudioVolume)]
    pub fn set_audio_volume(volume: f64);

    // Video playback API
    #[wasm_bindgen(js_name = playVideoFile)]
    pub fn play_video_file(path: &str) -> bool;

    #[wasm_bindgen(js_name = stopVideo)]
    pub fn stop_video();

    // Get current date/time
    #[wasm_bindgen(js_name = getCurrentDateTime)]
    pub fn get_current_date_time() -> String;

    // Show alert/notification
    #[wasm_bindgen(js_name = showNotification)]
    pub fn show_notification(title: &str, message: &str);

    // Open URL in new tab
    #[wasm_bindgen(js_name = openUrl)]
    pub fn open_url(url: &str);
}

// Helper functions that can be used from Rust commands
pub fn play_file(path: &str) -> Result<(), String> {
    if play_audio_file(path) {
        Ok(())
    } else {
        Err(format!("Failed to play file: {}", path))
    }
}

pub fn get_date_time() -> String {
    get_current_date_time()
}
