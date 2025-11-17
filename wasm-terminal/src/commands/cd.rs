use crate::commands::CommandContext;
use crate::filesystem::FileType;

pub fn cmd_cd(args: &[String], ctx: &mut CommandContext) -> Vec<String> {
    let target = if args.is_empty() {
        "~"
    } else {
        &args[0]
    };

    let new_path = ctx.fs.resolve_path(target, ctx.current_dir);

    match ctx.fs.get_entry(&new_path) {
        Some(entry) => {
            match entry.file_type {
                FileType::Directory => {
                    *ctx.current_dir = new_path;
                    vec![]
                }
                FileType::File => {
                    vec![format!("cd: {}: Not a directory", target)]
                }
            }
        }
        None => {
            vec![format!("cd: {}: No such file or directory", target)]
        }
    }
}
