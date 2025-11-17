use crate::commands::CommandContext;
use crate::filesystem::FileType;

pub fn cmd_cat(args: &[String], ctx: &CommandContext) -> Vec<String> {
    if args.is_empty() {
        return vec!["cat: missing file operand".to_string()];
    }

    let path = ctx.fs.resolve_path(&args[0], ctx.current_dir);

    match ctx.fs.read_file(&path) {
        Some(content) => {
            content.lines().map(|s| s.to_string()).collect()
        }
        None => {
            match ctx.fs.get_entry(&path) {
                Some(entry) => match entry.file_type {
                    FileType::Directory => vec![format!("cat: {}: Is a directory", args[0])],
                    FileType::File => vec![format!("cat: {}: Permission denied", args[0])],
                },
                None => vec![format!("cat: {}: No such file or directory", args[0])],
            }
        }
    }
}
