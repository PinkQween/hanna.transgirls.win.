use crate::commands::CommandContext;

pub fn cmd_mkdir(args: &[String], ctx: &mut CommandContext) -> Vec<String> {
    if args.is_empty() {
        return vec!["mkdir: missing operand".to_string()];
    }

    let path = ctx.fs.resolve_path(&args[0], ctx.current_dir);

    match ctx.fs.create_directory(&path) {
        Ok(_) => vec![],
        Err(e) => vec![format!("mkdir: cannot create directory '{}': {}", args[0], e)],
    }
}
