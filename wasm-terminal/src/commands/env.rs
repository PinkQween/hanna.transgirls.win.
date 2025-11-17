use crate::commands::CommandContext;

pub fn cmd_env(ctx: &CommandContext) -> Vec<String> {
    let mut entries: Vec<String> = ctx.env.iter()
        .map(|(k, v)| format!("{}={}", k, v))
        .collect();
    entries.sort();
    entries
}
