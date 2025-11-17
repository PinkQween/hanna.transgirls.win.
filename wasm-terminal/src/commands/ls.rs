use crate::commands::CommandContext;
use crate::filesystem::FileType;

pub fn cmd_ls(args: &[String], ctx: &CommandContext) -> Vec<String> {
    let path = if args.is_empty() {
        ctx.current_dir.clone()
    } else {
        ctx.fs.resolve_path(&args[0], ctx.current_dir)
    };

    match ctx.fs.list_directory(&path) {
        Some(entries) => {
            if entries.is_empty() {
                vec![]
            } else {
                // Show directories with trailing slash
                let formatted: Vec<String> = entries.iter().map(|name| {
                    let entry_path = if path == "/" {
                        format!("/{}", name)
                    } else {
                        format!("{}/{}", path, name)
                    };

                    if let Some(entry) = ctx.fs.get_entry(&entry_path) {
                        match entry.file_type {
                            FileType::Directory => format!("{}/", name),
                            FileType::File => name.clone(),
                        }
                    } else {
                        name.clone()
                    }
                }).collect();

                vec![formatted.join("  ")]
            }
        }
        None => {
            vec![format!("ls: cannot access '{}': No such file or directory", path)]
        }
    }
}
