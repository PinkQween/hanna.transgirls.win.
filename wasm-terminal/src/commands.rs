use crate::filesystem::{VirtualFileSystem, FileType};

pub struct CommandContext<'a> {
    pub fs: &'a mut VirtualFileSystem,
    pub current_dir: &'a mut String,
    pub env: &'a mut std::collections::HashMap<String, String>,
}

pub fn execute_command(cmd: &str, args: &[String], ctx: &mut CommandContext) -> Vec<String> {
    match cmd {
        "help" => cmd_help(),
        "echo" => cmd_echo(args),
        "clear" => vec![], // Special case - handled by terminal
        "pwd" => cmd_pwd(ctx),
        "cd" => cmd_cd(args, ctx),
        "ls" => cmd_ls(args, ctx),
        "cat" => cmd_cat(args, ctx),
        "mkdir" => cmd_mkdir(args, ctx),
        "touch" => cmd_touch(args, ctx),
        "whoami" => cmd_whoami(ctx),
        "env" => cmd_env(ctx),
        "date" => cmd_date(),
        "neofetch" => cmd_neofetch(ctx),
        "tree" => cmd_tree(args, ctx),
        _ => vec![format!("bash: {}: command not found", cmd)],
    }
}

fn cmd_help() -> Vec<String> {
    vec![
        "Available commands:".to_string(),
        "  help          Show this help message".to_string(),
        "  echo          Print text to terminal".to_string(),
        "  clear         Clear the terminal".to_string(),
        "  pwd           Print working directory".to_string(),
        "  cd            Change directory".to_string(),
        "  ls            List directory contents".to_string(),
        "  cat           Display file contents".to_string(),
        "  mkdir         Create a directory".to_string(),
        "  touch         Create a file".to_string(),
        "  whoami        Print current user".to_string(),
        "  env           Print environment variables".to_string(),
        "  date          Print current date and time".to_string(),
        "  neofetch      Display system information".to_string(),
        "  tree          Display directory tree".to_string(),
    ]
}

fn cmd_echo(args: &[String]) -> Vec<String> {
    vec![args.join(" ")]
}

fn cmd_pwd(ctx: &CommandContext) -> Vec<String> {
    vec![ctx.current_dir.clone()]
}

fn cmd_cd(args: &[String], ctx: &mut CommandContext) -> Vec<String> {
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

fn cmd_ls(args: &[String], ctx: &CommandContext) -> Vec<String> {
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

fn cmd_cat(args: &[String], ctx: &CommandContext) -> Vec<String> {
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

fn cmd_mkdir(args: &[String], ctx: &mut CommandContext) -> Vec<String> {
    if args.is_empty() {
        return vec!["mkdir: missing operand".to_string()];
    }

    let path = ctx.fs.resolve_path(&args[0], ctx.current_dir);

    match ctx.fs.create_directory(&path) {
        Ok(_) => vec![],
        Err(e) => vec![format!("mkdir: cannot create directory '{}': {}", args[0], e)],
    }
}

fn cmd_touch(args: &[String], ctx: &mut CommandContext) -> Vec<String> {
    if args.is_empty() {
        return vec!["touch: missing file operand".to_string()];
    }

    let path = ctx.fs.resolve_path(&args[0], ctx.current_dir);

    match ctx.fs.create_file(&path, String::new()) {
        Ok(_) => vec![],
        Err(e) => vec![format!("touch: cannot create file '{}': {}", args[0], e)],
    }
}

fn cmd_whoami(ctx: &CommandContext) -> Vec<String> {
    vec![ctx.env.get("USER").cloned().unwrap_or_else(|| "unknown".to_string())]
}

fn cmd_env(ctx: &CommandContext) -> Vec<String> {
    let mut entries: Vec<String> = ctx.env.iter()
        .map(|(k, v)| format!("{}={}", k, v))
        .collect();
    entries.sort();
    entries
}

fn cmd_date() -> Vec<String> {
    // Note: In WASM, we'll need to call out to JavaScript for the actual date
    vec!["[Date functionality requires JavaScript bridge]".to_string()]
}

fn cmd_neofetch(ctx: &CommandContext) -> Vec<String> {
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

fn cmd_tree(args: &[String], ctx: &CommandContext) -> Vec<String> {
    let path = if args.is_empty() {
        ctx.current_dir.clone()
    } else {
        ctx.fs.resolve_path(&args[0], ctx.current_dir)
    };

    match ctx.fs.get_entry(&path) {
        Some(entry) => {
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
