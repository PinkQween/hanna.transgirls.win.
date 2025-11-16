use sha2::{Sha256, Digest};
use std::collections::HashMap;

#[derive(Clone, Debug)]
pub struct User {
    pub username: String,
    pub password_hash: String,
    pub uid: u32,
    pub gid: u32,
    pub home: String,
    pub shell: String,
    pub groups: Vec<String>,
    pub fullname: String,
}

pub struct AuthSystem {
    users: HashMap<String, User>,
    ctf_password_hash: String,
    login_attempts: HashMap<String, u32>,
}

impl AuthSystem {
    pub fn new() -> Self {
        let mut users = HashMap::new();

        // Create skairipa user
        // Default hash is for the CTF password (will be replaced)
        users.insert("skairipa".to_string(), User {
            username: "skairipa".to_string(),
            password_hash: "REPLACE_WITH_CTF_PASSWORD_HASH".to_string(),
            uid: 1000,
            gid: 1000,
            home: "/home/skairipa".to_string(),
            shell: "/bin/bash".to_string(),
            groups: vec!["wheel".to_string(), "sudo".to_string(), "users".to_string()],
            fullname: "Hanna Skairipa".to_string(),
        });

        // Create root user
        // Temporary password: Tr4nsG1rlH4ck3r2024!R00t
        users.insert("root".to_string(), User {
            username: "root".to_string(),
            password_hash: "8f3e9a2c1b5d7f4e6a8c3b9d2f5e7a1c4d8b6e3f9a2c5d7e4b1f8a6c3e9d2b5f7".to_string(),
            uid: 0,
            gid: 0,
            home: "/root".to_string(),
            shell: "/bin/bash".to_string(),
            groups: vec!["root".to_string()],
            fullname: "System Administrator".to_string(),
        });

        AuthSystem {
            users,
            // CTF password double SHA-256 hash (split into segments for obfuscation)
            // REPLACE THIS WITH YOUR CTF PASSWORD HASH
            ctf_password_hash: "REPLACE_WITH_DOUBLE_SHA256_HASH".to_string(),
            login_attempts: HashMap::new(),
        }
    }

    pub fn set_ctf_password(&mut self, hash_segments: Vec<String>) {
        self.ctf_password_hash = hash_segments.join("");
    }

    pub fn set_user_password(&mut self, username: &str, hash: String) {
        if let Some(user) = self.users.get_mut(username) {
            user.password_hash = hash;
        }
    }

    pub fn verify_ctf_password(&self, password: &str) -> bool {
        let double_hash = Self::double_sha256(password);
        double_hash == self.ctf_password_hash
    }

    pub fn verify_user_password(&mut self, username: &str, password: &str) -> Result<User, String> {
        // Check login attempts
        let attempts = self.login_attempts.get(username).unwrap_or(&0);
        if *attempts >= 3 {
            return Err("Account locked. Too many failed attempts.".to_string());
        }

        match self.users.get(username) {
            Some(user) => {
                let password_hash = Self::sha256(password);
                if password_hash == user.password_hash {
                    // Reset attempts on successful login
                    self.login_attempts.insert(username.to_string(), 0);
                    Ok(user.clone())
                } else {
                    // Increment failed attempts
                    self.login_attempts.insert(username.to_string(), attempts + 1);
                    Err("Incorrect password".to_string())
                }
            }
            None => Err("User not found".to_string()),
        }
    }

    pub fn user_exists(&self, username: &str) -> bool {
        self.users.contains_key(username)
    }

    pub fn get_user(&self, username: &str) -> Option<&User> {
        self.users.get(username)
    }

    pub fn list_users(&self) -> Vec<String> {
        let mut usernames: Vec<String> = self.users.keys().cloned().collect();
        usernames.sort();
        usernames
    }

    // SHA-256 hash
    fn sha256(input: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(input.as_bytes());
        let result = hasher.finalize();
        hex::encode(result)
    }

    // Double SHA-256 hash (for CTF password)
    fn double_sha256(input: &str) -> String {
        let first_hash = Self::sha256(input);
        Self::sha256(&first_hash)
    }
}
