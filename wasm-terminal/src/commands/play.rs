use crate::commands::CommandContext;
use crate::js_api;

pub fn cmd_play(args: &[String], ctx: &CommandContext) -> Vec<String> {
    if args.is_empty() {
        return vec![
            "Usage: play <file|url>".to_string(),
            "Plays an audio or video file from filesystem or URL.".to_string(),
            "".to_string(),
            "Supported sources:".to_string(),
            "  - Files in virtual filesystem: play /path/to/audio.mp3".to_string(),
            "  - Direct URLs: play https://example.com/song.mp3".to_string(),
            "  - YouTube: play https://youtube.com/watch?v=...".to_string(),
            "  - YouTube: play https://youtu.be/...".to_string(),
        ];
    }

    let input = &args[0];

    // Check if input is a URL (including data URLs)
    if input.starts_with("http://") || input.starts_with("https://") || input.starts_with("data:") {
        // It's a URL - pass it directly to the JS API
        match js_api::play_url(input) {
            Ok(_) => vec![format!("Playing: {}", input)],
            Err(e) => vec![format!("play: {}", e)],
        }
    } else {
        // Try to resolve as filesystem path
        let resolved_path = ctx.fs.resolve_path(input, ctx.current_dir);

        // Check if file exists in the virtual filesystem
        match ctx.fs.get_entry(&resolved_path) {
            Some(entry) => {
                use crate::filesystem::FileType;
                match entry.file_type {
                    FileType::File => {
                        // Get the file content - it should contain the actual URL
                        match ctx.fs.read_file(&resolved_path) {
                            Some(content) => {
                                // If content looks like a URL (including data URLs), use it; otherwise use the path
                                let play_path = if content.starts_with("http://") || content.starts_with("https://") || content.starts_with("data:") {
                                    content
                                } else {
                                    resolved_path.clone()
                                };

                                // Use the filename as display name
                                match js_api::play_url_with_name(&play_path, &resolved_path) {
                                    Ok(_) => vec![format!("Playing: {}", resolved_path)],
                                    Err(e) => vec![format!("play: {}", e)],
                                }
                            }
                            None => {
                                vec![format!("play: {}: Cannot read file", input)]
                            }
                        }
                    }
                    FileType::Directory => {
                        vec![format!("play: {}: Is a directory", input)]
                    }
                }
            }
            None => {
                vec![format!("play: {}: No such file or directory", input)]
            }
        }
    }
}
