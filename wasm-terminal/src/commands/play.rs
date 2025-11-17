use crate::commands::CommandContext;
use crate::js_api;

pub fn cmd_play(args: &[String], ctx: &CommandContext) -> Vec<String> {
    if args.is_empty() {
        return vec![
            "Usage: play <file>".to_string(),
            "Plays an audio or video file.".to_string(),
        ];
    }

    let file_path = &args[0];
    let resolved_path = ctx.fs.resolve_path(file_path, ctx.current_dir);

    // Check if file exists in the virtual filesystem
    match ctx.fs.get_entry(&resolved_path) {
        Some(entry) => {
            use crate::filesystem::FileType;
            match entry.file_type {
                FileType::File => {
                    // Try to play the file using the JavaScript API
                    match js_api::play_file(&resolved_path) {
                        Ok(_) => vec![format!("Playing: {}", resolved_path)],
                        Err(e) => vec![format!("play: {}", e)],
                    }
                }
                FileType::Directory => {
                    vec![format!("play: {}: Is a directory", file_path)]
                }
            }
        }
        None => {
            vec![format!("play: {}: No such file or directory", file_path)]
        }
    }
}
