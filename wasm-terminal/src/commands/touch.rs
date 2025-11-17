use crate::commands::CommandContext;

pub fn cmd_touch(args: &[String], ctx: &mut CommandContext) -> Vec<String> {
    if args.is_empty() {
        return vec!["touch: missing file operand".to_string()];
    }

    let path = ctx.fs.resolve_path(&args[0], ctx.current_dir);

    match ctx.fs.create_file(&path, String::new()) {
        Ok(_) => vec![],
        Err(e) => vec![format!("touch: cannot create file '{}': {}", args[0], e)],
    }
}
