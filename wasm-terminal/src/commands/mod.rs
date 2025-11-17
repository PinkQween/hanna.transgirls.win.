use crate::filesystem::VirtualFileSystem;
use std::collections::HashMap;

pub struct CommandContext<'a> {
    pub fs: &'a mut VirtualFileSystem,
    pub current_dir: &'a mut String,
    pub env: &'a mut HashMap<String, String>,
}

// Import all command modules
mod help;
mod echo;
mod pwd;
mod cd;
mod ls;
mod cat;
mod mkdir;
mod touch;
mod whoami;
mod env;
mod date;
mod neofetch;
mod tree;
mod play;

// Re-export command functions
pub use help::cmd_help;
pub use echo::cmd_echo;
pub use pwd::cmd_pwd;
pub use cd::cmd_cd;
pub use ls::cmd_ls;
pub use cat::cmd_cat;
pub use mkdir::cmd_mkdir;
pub use touch::cmd_touch;
pub use whoami::cmd_whoami;
pub use env::cmd_env;
pub use date::cmd_date;
pub use neofetch::cmd_neofetch;
pub use tree::cmd_tree;
pub use play::cmd_play;

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
        "play" => cmd_play(args, ctx),
        _ => vec![format!("bash: {}: command not found", cmd)],
    }
}
