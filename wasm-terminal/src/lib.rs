mod filesystem;
mod commands;
mod auth;
pub mod js_api;

use wasm_bindgen::prelude::*;
use std::collections::HashMap;
use filesystem::VirtualFileSystem;
use commands::{execute_command, CommandContext};
use auth::{AuthSystem, User};

#[wasm_bindgen]
pub struct RustTerminal {
    fs: VirtualFileSystem,
    current_dir: String,
    env: HashMap<String, String>,
    history: Vec<String>,
    lines: Vec<String>,
    prompt: String,
    current_user: Option<User>,
    auth: AuthSystem,
    // Authentication state
    auth_state: String, // "ctf_auth", "login_username", "login_password", "active"
    login_username_buffer: String,
    ctf_authenticated: bool,
}

#[wasm_bindgen]
impl RustTerminal {
    #[wasm_bindgen(constructor)]
    pub fn new() -> RustTerminal {
        // Initialize console_error_panic_hook for better error messages
        #[cfg(feature = "console_error_panic_hook")]
        console_error_panic_hook::set_once();

        let env = HashMap::new();

        RustTerminal {
            fs: VirtualFileSystem::new(),
            current_dir: "/".to_string(),
            env,
            history: Vec::new(),
            lines: Vec::new(),
            prompt: "".to_string(),
            current_user: None,
            auth: AuthSystem::new(),
            auth_state: "login_username".to_string(),
            login_username_buffer: String::new(),
            ctf_authenticated: false,
        }
    }

    /// Execute a command and return the new lines to display
    #[wasm_bindgen(js_name = executeCommand)]
    pub fn execute_command(&mut self, input: String) -> String {
        // Handle authentication states
        match self.auth_state.as_str() {
            "login_username" => {
                // Store username and ask for password
                let username = input.trim();
                if self.auth.user_exists(username) {
                    self.login_username_buffer = username.to_string();
                    self.auth_state = "login_password".to_string();
                    return "USERNAME_OK".to_string();
                } else {
                    return format!("User '{}' does not exist", username);
                }
            }
            "login_password" => {
                // Verify password and login
                match self.auth.verify_user_password(&self.login_username_buffer, &input) {
                    Ok(user) => {
                        self.current_user = Some(user.clone());
                        self.current_dir = user.home.clone();
                        self.env.insert("USER".to_string(), user.username.clone());
                        self.env.insert("HOME".to_string(), user.home.clone());
                        self.env.insert("SHELL".to_string(), user.shell.clone());
                        self.env.insert("PATH".to_string(), "/usr/bin:/bin".to_string());
                        self.auth_state = "active".to_string();
                        return format!("LOGIN_SUCCESS:{}", user.username);
                    }
                    Err(err) => {
                        self.auth_state = "login_username".to_string();
                        self.login_username_buffer.clear();
                        return format!("LOGIN_FAILED:{}", err);
                    }
                }
            }
            "active" => {
                // Normal terminal operation
                if input.trim().is_empty() {
                    return "".to_string();
                }

                // Add to history
                self.history.push(input.clone());

                // Parse command and arguments
                let parts: Vec<String> = input.trim().split_whitespace()
                    .map(|s| s.to_string())
                    .collect();

                if parts.is_empty() {
                    return "".to_string();
                }

                let cmd = &parts[0];
                let args = &parts[1..];

                // Special case for clear command
                if cmd == "clear" {
                    self.lines.clear();
                    return "CLEAR".to_string();
                }

                // Special case for logout
                if cmd == "logout" || cmd == "exit" {
                    self.current_user = None;
                    self.auth_state = "login_username".to_string();
                    self.env.clear();
                    return "LOGOUT".to_string();
                }

                // Execute command
                let mut ctx = CommandContext {
                    fs: &mut self.fs,
                    current_dir: &mut self.current_dir,
                    env: &mut self.env,
                };

                let output = execute_command(cmd, args, &mut ctx);

                // Return output as newline-separated string
                output.join("\n")
            }
            _ => "INVALID_STATE".to_string(),
        }
    }

    /// Get the current prompt string
    #[wasm_bindgen(js_name = getPrompt)]
    pub fn get_prompt(&self) -> String {
        match self.auth_state.as_str() {
            "login_username" => "Terminal Emulator login: ".to_string(),
            "login_password" => "Password: ".to_string(),
            "active" => {
                if let Some(ref user) = self.current_user {
                    let symbol = if user.uid == 0 { "#" } else { "$" };
                    format!("{}@hanna-terminal:{} {} ", user.username, self.current_dir, symbol)
                } else {
                    "$ ".to_string()
                }
            }
            _ => "$ ".to_string(),
        }
    }

    /// Get current working directory
    #[wasm_bindgen(js_name = getCurrentDir)]
    pub fn get_current_dir(&self) -> String {
        self.current_dir.clone()
    }

    /// Get command history
    #[wasm_bindgen(js_name = getHistory)]
    pub fn get_history(&self) -> Vec<String> {
        self.history.clone()
    }

    /// Get a specific history item
    #[wasm_bindgen(js_name = getHistoryItem)]
    pub fn get_history_item(&self, index: usize) -> Option<String> {
        self.history.get(index).cloned()
    }

    /// Get history length
    #[wasm_bindgen(js_name = getHistoryLength)]
    pub fn get_history_length(&self) -> usize {
        self.history.len()
    }

    /// Get current authentication state
    #[wasm_bindgen(js_name = getAuthState)]
    pub fn get_auth_state(&self) -> String {
        self.auth_state.clone()
    }

    /// Get current username (if logged in)
    #[wasm_bindgen(js_name = getCurrentUsername)]
    pub fn get_current_username(&self) -> String {
        self.current_user.as_ref().map(|u| u.username.clone()).unwrap_or_default()
    }

    /// Check if user is root
    #[wasm_bindgen(js_name = isRoot)]
    pub fn is_root(&self) -> bool {
        self.current_user.as_ref().map(|u| u.uid == 0).unwrap_or(false)
    }

    /// Set user password hash (for configuration)
    #[wasm_bindgen(js_name = setUserPassword)]
    pub fn set_user_password(&mut self, username: String, hash: String) {
        self.auth.set_user_password(&username, hash);
    }

    /// List all users
    #[wasm_bindgen(js_name = listUsers)]
    pub fn list_users(&self) -> Vec<String> {
        self.auth.list_users()
    }

    /// Load filesystem from JSON (for persistence)
    #[wasm_bindgen(js_name = loadFilesystem)]
    pub fn load_filesystem(&mut self, json: &str) -> Result<(), JsValue> {
        // TODO: Implement filesystem serialization/deserialization
        Ok(())
    }

    /// Save filesystem to JSON (for persistence)
    #[wasm_bindgen(js_name = saveFilesystem)]
    pub fn save_filesystem(&self) -> Result<String, JsValue> {
        // TODO: Implement filesystem serialization/deserialization
        Ok("{}".to_string())
    }

    /// Add a file to the filesystem (called from JavaScript)
    #[wasm_bindgen(js_name = addFile)]
    pub fn add_file(&mut self, path: String, content: String) -> Result<(), JsValue> {
        self.fs.create_file(&path, content)
            .map_err(|e| JsValue::from_str(&e))
    }

    /// Add a directory to the filesystem (called from JavaScript)
    #[wasm_bindgen(js_name = addDirectory)]
    pub fn add_directory(&mut self, path: String) -> Result<(), JsValue> {
        self.fs.create_directory(&path)
            .map_err(|e| JsValue::from_str(&e))
    }

    /// List files in a directory (called from JavaScript)
    #[wasm_bindgen(js_name = listDirectory)]
    pub fn list_directory(&self, path: String) -> Result<Vec<String>, JsValue> {
        self.fs.list_directory(&path)
            .ok_or_else(|| JsValue::from_str("Not a directory or doesn't exist"))
    }

    /// Read a file (called from JavaScript)
    #[wasm_bindgen(js_name = readFile)]
    pub fn read_file(&self, path: String) -> Result<String, JsValue> {
        self.fs.read_file(&path)
            .ok_or_else(|| JsValue::from_str("File not found or is a directory"))
    }
}

// Initialize the terminal when the module is loaded
#[wasm_bindgen(start)]
pub fn main() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
