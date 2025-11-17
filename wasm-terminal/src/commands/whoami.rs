use crate::commands::CommandContext;

pub fn cmd_whoami(ctx: &CommandContext) -> Vec<String> {
    vec![ctx.env.get("USER").cloned().unwrap_or_else(|| "unknown".to_string())]
}
