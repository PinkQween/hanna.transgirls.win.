use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FileType {
    File,
    Directory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub file_type: FileType,
    pub content: Option<String>,
    pub children: HashMap<String, FileEntry>,
}

impl FileEntry {
    pub fn new_file(name: String, content: String) -> Self {
        FileEntry {
            name,
            file_type: FileType::File,
            content: Some(content),
            children: HashMap::new(),
        }
    }

    pub fn new_directory(name: String) -> Self {
        FileEntry {
            name,
            file_type: FileType::Directory,
            content: None,
            children: HashMap::new(),
        }
    }
}

pub struct VirtualFileSystem {
    root: FileEntry,
}

impl VirtualFileSystem {
    pub fn new() -> Self {
        let mut root_dir = FileEntry::new_directory("/".to_string());

        // Create home directory structure
        let mut home = FileEntry::new_directory("home".to_string());
        let mut skairipa = FileEntry::new_directory("skairipa".to_string());

        // Skairipa's home files
        skairipa.children.insert(
            ".bashrc".to_string(),
            FileEntry::new_file(
                ".bashrc".to_string(),
                "# Hanna's bash configuration\nalias ls=\"ls --color=auto\"\nexport PS1=\"\\u@\\h:\\w$ \"\necho \"Welcome, Hanna!\"\n".to_string()
            )
        );

        skairipa.children.insert(
            "welcome.txt".to_string(),
            FileEntry::new_file(
                "welcome.txt".to_string(),
                "Welcome to Hanna Skairipa's Terminal System!\n\nYou've successfully completed the Shadow Assets CTF.\nThis terminal is a fully functional Rust WASM-powered environment.\n\nTry these commands:\n  • ls - List files\n  • cat <file> - Read files\n  • cd <dir> - Change directory\n  • pwd - Print working directory\n  • help - Show available commands\n\nEnjoy exploring! 🏴‍☠️\n".to_string()
            )
        );

        // Skairipa's subdirectories
        let mut desktop = FileEntry::new_directory("Desktop".to_string());
        let mut documents = FileEntry::new_directory("Documents".to_string());
        let mut downloads = FileEntry::new_directory("Downloads".to_string());
        let mut projects = FileEntry::new_directory("Projects".to_string());
        let mut secrets = FileEntry::new_directory(".secrets".to_string());

        // Documents files
        documents.children.insert(
            "README.md".to_string(),
            FileEntry::new_file(
                "README.md".to_string(),
                "# Hanna's Documents\n\nThis directory contains various documentation and notes.\n\nFeel free to explore!\n".to_string()
            )
        );

        // Projects files
        projects.children.insert(
            "shadow-assets.txt".to_string(),
            FileEntry::new_file(
                "shadow-assets.txt".to_string(),
                "Shadow Assets CTF Project\n\nThis was my deliberately vulnerable system for security training.\nThe fragments, encryption, and steganography were all intentional.\n\nIf you're reading this, you solved it. Nice work!\n\n- H.S.\n".to_string()
            )
        );

        // Music file - exclusive content for elite terminal users
        // Embedded as base64 to prevent easy theft from GitHub
        // The play command will decode this and play it
        const AUTUMN_LEAVES_BASE64: &str = include_str!("../autumn_leaves_base64.txt");
        projects.children.insert(
            "Autumn Leaves in Tokyo.mp3".to_string(),
            FileEntry::new_file(
                "Autumn Leaves in Tokyo.mp3".to_string(),
                format!("data:audio/mpeg;base64,{}", AUTUMN_LEAVES_BASE64)
            )
        );

        // Secret flag file
        secrets.children.insert(
            "flag.txt".to_string(),
            FileEntry::new_file(
                "flag.txt".to_string(),
                "🏴‍☠️ CONGRATULATIONS! 🏴‍☠️\n\nYou completed the Shadow Assets CTF!\n\nFlag: HANNA{Sh4d0w_4ss3ts_M4st3r_H4ck3r_2024}\n\nYou've demonstrated:\n  ✓ Steganography (audio spectrograms, LSB images)\n  ✓ Cryptography (AES-256, RSA, XOR)\n  ✓ Code analysis (algorithm reconstruction)\n  ✓ Web exploitation (XSS)\n  ✓ Persistence and problem-solving\n\nWell done, hacker. You earned this.\n\n- Hanna Skairipa 💀\n".to_string()
            )
        );

        skairipa.children.insert("Desktop".to_string(), desktop);
        skairipa.children.insert("Documents".to_string(), documents);
        skairipa.children.insert("Downloads".to_string(), downloads);
        skairipa.children.insert("Projects".to_string(), projects);
        skairipa.children.insert(".secrets".to_string(), secrets);

        home.children.insert("skairipa".to_string(), skairipa);
        root_dir.children.insert("home".to_string(), home);

        // Create root user directory
        let mut root_user = FileEntry::new_directory("root".to_string());
        root_user.children.insert(
            ".bashrc".to_string(),
            FileEntry::new_file(
                ".bashrc".to_string(),
                "# Root bash configuration\nexport PS1=\"\\[\\033[01;31m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]# \"\nalias rm=\"rm -i\"\nalias cp=\"cp -i\"\nalias mv=\"mv -i\"\n".to_string()
            )
        );

        root_user.children.insert(
            "admin-notes.txt".to_string(),
            FileEntry::new_file(
                "admin-notes.txt".to_string(),
                "ADMIN NOTES - CONFIDENTIAL\n\nSystem: Hanna's Terminal v1.0\nStatus: Production\n\nSecurity measures:\n  • CTF authentication required\n  • Multi-user login system\n  • Virtual filesystem\n  • WASM-powered terminal\n\nTODO:\n  [ ] Rotate root password\n  [ ] Add more users\n  [ ] Implement sudo command\n  [ ] Add file upload/download\n\n- Root Admin\n".to_string()
            )
        );

        root_dir.children.insert("root".to_string(), root_user);

        // Create system directories
        let mut etc = FileEntry::new_directory("etc".to_string());
        etc.children.insert(
            "passwd".to_string(),
            FileEntry::new_file(
                "passwd".to_string(),
                "root:x:0:0:root:/root:/bin/bash\nskairipa:x:1000:1000:Hanna Skairipa:/home/skairipa:/bin/bash\n".to_string()
            )
        );

        etc.children.insert(
            "hostname".to_string(),
            FileEntry::new_file(
                "hostname".to_string(),
                "hanna-terminal\n".to_string()
            )
        );

        etc.children.insert(
            "motd".to_string(),
            FileEntry::new_file(
                "motd".to_string(),
                "╔═══════════════════════════════════════════════╗\n║   HANNA SKAIRIPA'S TERMINAL SYSTEM v1.0       ║\n║   Unauthorized access prohibited              ║\n╚═══════════════════════════════════════════════╝\n".to_string()
            )
        );

        root_dir.children.insert("etc".to_string(), etc);
        root_dir.children.insert("bin".to_string(), FileEntry::new_directory("bin".to_string()));
        root_dir.children.insert("tmp".to_string(), FileEntry::new_directory("tmp".to_string()));
        root_dir.children.insert("var".to_string(), FileEntry::new_directory("var".to_string()));

        let mut usr = FileEntry::new_directory("usr".to_string());
        usr.children.insert("bin".to_string(), FileEntry::new_directory("bin".to_string()));
        root_dir.children.insert("usr".to_string(), usr);

        VirtualFileSystem { root: root_dir }
    }

    pub fn resolve_path(&self, path: &str, current_dir: &str) -> String {
        if path.starts_with('/') {
            // Absolute path
            path.to_string()
        } else if path.starts_with("~/") {
            // Home directory
            format!("/home/skairipa/{}", &path[2..])
        } else if path == "~" {
            "/home/skairipa".to_string()
        } else {
            // Relative path
            let mut resolved = current_dir.to_string();
            if !resolved.ends_with('/') {
                resolved.push('/');
            }
            resolved.push_str(path);
            self.normalize_path(&resolved)
        }
    }

    fn normalize_path(&self, path: &str) -> String {
        let mut parts: Vec<&str> = Vec::new();
        for part in path.split('/') {
            match part {
                "" | "." => continue,
                ".." => { parts.pop(); },
                _ => parts.push(part),
            }
        }
        if parts.is_empty() {
            "/".to_string()
        } else {
            format!("/{}", parts.join("/"))
        }
    }

    pub fn get_entry(&self, path: &str) -> Option<&FileEntry> {
        if path == "/" {
            return Some(&self.root);
        }

        let normalized = self.normalize_path(path);
        let parts: Vec<&str> = normalized.split('/').filter(|s| !s.is_empty()).collect();

        let mut current = &self.root;
        for part in parts {
            current = current.children.get(part)?;
        }
        Some(current)
    }

    pub fn get_entry_mut(&mut self, path: &str) -> Option<&mut FileEntry> {
        if path == "/" {
            return Some(&mut self.root);
        }

        let normalized = self.normalize_path(path);
        let parts: Vec<&str> = normalized.split('/').filter(|s| !s.is_empty()).collect();

        let mut current = &mut self.root;
        for part in parts {
            current = current.children.get_mut(part)?;
        }
        Some(current)
    }

    pub fn list_directory(&self, path: &str) -> Option<Vec<String>> {
        let entry = self.get_entry(path)?;
        match entry.file_type {
            FileType::Directory => {
                let mut entries: Vec<String> = entry.children.keys().cloned().collect();
                entries.sort();
                Some(entries)
            }
            FileType::File => None,
        }
    }

    pub fn read_file(&self, path: &str) -> Option<String> {
        let entry = self.get_entry(path)?;
        match entry.file_type {
            FileType::File => entry.content.clone(),
            FileType::Directory => None,
        }
    }

    pub fn create_file(&mut self, path: &str, content: String) -> Result<(), String> {
        let normalized = self.normalize_path(path);
        let parts: Vec<&str> = normalized.split('/').filter(|s| !s.is_empty()).collect();

        if parts.is_empty() {
            return Err("Cannot create file at root".to_string());
        }

        let filename = parts[parts.len() - 1];
        let parent_path = if parts.len() == 1 {
            "/"
        } else {
            &normalized[..normalized.rfind('/').unwrap()]
        };

        let parent = self.get_entry_mut(parent_path)
            .ok_or_else(|| format!("Parent directory not found: {}", parent_path))?;

        parent.children.insert(
            filename.to_string(),
            FileEntry::new_file(filename.to_string(), content)
        );

        Ok(())
    }

    pub fn create_directory(&mut self, path: &str) -> Result<(), String> {
        let normalized = self.normalize_path(path);
        let parts: Vec<&str> = normalized.split('/').filter(|s| !s.is_empty()).collect();

        if parts.is_empty() {
            return Err("Cannot create directory at root".to_string());
        }

        let dirname = parts[parts.len() - 1];
        let parent_path = if parts.len() == 1 {
            "/"
        } else {
            &normalized[..normalized.rfind('/').unwrap()]
        };

        let parent = self.get_entry_mut(parent_path)
            .ok_or_else(|| format!("Parent directory not found: {}", parent_path))?;

        parent.children.insert(
            dirname.to_string(),
            FileEntry::new_directory(dirname.to_string())
        );

        Ok(())
    }
}
