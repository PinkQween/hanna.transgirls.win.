use crate::commands::CommandContext;

pub fn cmd_pwd(ctx: &CommandContext) -> Vec<String> {
    vec![ctx.current_dir.clone()]
}
