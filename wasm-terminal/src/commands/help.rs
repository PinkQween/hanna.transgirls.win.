pub fn cmd_help() -> Vec<String> {
    vec![
        "Available commands:".to_string(),
        "  help          Show this help message".to_string(),
        "  echo          Print text to terminal".to_string(),
        "  clear         Clear the terminal".to_string(),
        "  pwd           Print working directory".to_string(),
        "  cd            Change directory".to_string(),
        "  ls            List directory contents".to_string(),
        "  cat           Display file contents".to_string(),
        "  mkdir         Create a directory".to_string(),
        "  touch         Create a file".to_string(),
        "  whoami        Print current user".to_string(),
        "  env           Print environment variables".to_string(),
        "  date          Print current date and time".to_string(),
        "  neofetch      Display system information".to_string(),
        "  tree          Display directory tree".to_string(),
        "  play          Play an audio or video file".to_string(),
    ]
}
