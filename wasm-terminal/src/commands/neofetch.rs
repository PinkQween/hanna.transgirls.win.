use crate::commands::CommandContext;

pub fn cmd_neofetch(ctx: &CommandContext) -> Vec<String> {
    vec![
        "                    ".to_string(),
        "    Hanna Skairipa  ".to_string(),
        "    --------------  ".to_string(),
        format!("    User: {}", ctx.env.get("USER").unwrap_or(&"unknown".to_string())),
        "    Shell: bash-like".to_string(),
        "    Terminal: Rust+WASM".to_string(),
        "    Theme: Trans    ".to_string(),
        format!("    PWD: {}", ctx.current_dir),
        "                    ".to_string(),
    ]
}
