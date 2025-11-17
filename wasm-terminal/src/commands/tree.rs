use crate::commands::CommandContext;
use crate::filesystem::{VirtualFileSystem, FileType};

pub fn cmd_tree(args: &[String], ctx: &CommandContext) -> Vec<String> {
    let path = if args.is_empty() {
        ctx.current_dir.clone()
    } else {
        ctx.fs.resolve_path(&args[0], ctx.current_dir)
    };

    match ctx.fs.get_entry(&path) {
        Some(_entry) => {
            let mut lines = vec![path.clone()];
            build_tree(ctx.fs, &path, "", &mut lines, true);
            lines
        }
        None => {
            vec![format!("tree: {}: No such file or directory", path)]
        }
    }
}

fn build_tree(fs: &VirtualFileSystem, path: &str, prefix: &str, lines: &mut Vec<String>, is_last: bool) {
    if let Some(entries) = fs.list_directory(path) {
        for (i, name) in entries.iter().enumerate() {
            let is_last_entry = i == entries.len() - 1;
            let connector = if is_last_entry { "└── " } else { "├── " };

            let entry_path = if path == "/" {
                format!("/{}", name)
            } else {
                format!("{}/{}", path, name)
            };

            if let Some(entry) = fs.get_entry(&entry_path) {
                let display_name = match entry.file_type {
                    FileType::Directory => format!("{}/", name),
                    FileType::File => name.clone(),
                };

                lines.push(format!("{}{}{}", prefix, connector, display_name));

                if matches!(entry.file_type, FileType::Directory) {
                    let new_prefix = format!("{}{}   ", prefix, if is_last_entry { " " } else { "│" });
                    build_tree(fs, &entry_path, &new_prefix, lines, is_last_entry);
                }
            }
        }
    }
}
