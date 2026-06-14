const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const check = require('syntax-error');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function run(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
            if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
            resolve((stdout || '').toString());
        });
    });
}

// 📊 PROGRESS BAR GENERATOR
const getBar = (pct) => {
    const total = 10;
    const filled = Math.floor(pct / 10);
    return "█".repeat(filled) + "░".repeat(total - filled);
};

async function updateViaZip(sock, chatId, editKey) {
    const zipUrl = "https://github.com/prologinac/YASEEN_laporte/archive/refs/heads/main.zip";
    const tmpDir = path.join(process.cwd(), 'tmp_update');

    const updateUI = async (pct, status) => {
        const screen = `[ ${getBar(pct)} ]  *${pct}%*\n` +
                       `_© 2026 YAS-TECH • ${status}_`;
        await sock.sendMessage(chatId, { edit: editKey, text: screen });
    };

    // 10% - INITIALIZE
    await updateUI(10, "Initializing...");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const zipPath = path.join(tmpDir, 'update.zip');

    // 30% - DOWNLOAD
    await updateUI(30, "Downloading Source...");
    await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(zipPath);
        https.get(zipUrl, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                https.get(res.headers.location, (res2) => {
                    res2.pipe(file);
                    file.on('finish', () => file.close(resolve));
                });
            } else {
                res.pipe(file);
                file.on('finish', () => file.close(resolve));
            }
        }).on('error', (err) => {
            fs.unlink(zipPath, () => reject(err));
        });
    });

    // 40% - EXTRACT
    await updateUI(40, "Extracting Core...");
    const extractTo = path.join(tmpDir, 'update_extract');
    if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
    await run(`unzip -o '${zipPath}' -d '${extractTo}'`);

    // 50% - LOCATE
    const folders = fs.readdirSync(extractTo);
    const root = path.join(extractTo, folders[0]); 

    // 60% - DIAGNOSTIC SCAN
    await updateUI(60, "Scanning Logic...");
    const checkFiles = (dir) => {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            if (fs.lstatSync(fullPath).isDirectory()) {
                if (entry !== 'node_modules' && entry !== '.git') checkFiles(fullPath);
            } else if (entry.endsWith('.js')) {
                const src = fs.readFileSync(fullPath, 'utf8');
                const err = check(src, entry);
                if (err) {
                    const diagnostic = `📂 *FILE:* ${entry}\n` +
                                     `📍 *LINE:* ${err.line}\n` +
                                     `⚠️ *ERROR:* ${err.message}`;
                    throw new Error(diagnostic);
                }
            }
        }
    };

    try {
        checkFiles(root);
    } catch (syntaxErr) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        throw syntaxErr; 
    }

    // 70% - TARGETED COMMAND SYNC & MIGRATION
    await updateUI(70, "Syncing Commands...");
    const ignore = ['node_modules', '.git', 'session', 'tmp', 'package-lock.json', 'baileys_store.json', 'settings.js', 'database'];

    const migrateAndSync = (src, dest) => {
        const isCommandFolder = path.basename(dest).toLowerCase() === 'commands';

        // Delete ghost files in 'commands' if they aren't in the update
        if (isCommandFolder && fs.existsSync(dest)) {
            const localFiles = fs.readdirSync(dest);
            for (const file of localFiles) {
                const localPath = path.join(dest, file);
                const remotePath = path.join(src, file);
                if (!fs.existsSync(remotePath)) {
                    fs.rmSync(localPath, { recursive: true, force: true });
                }
            }
        }

        // Copy new files
        const remoteEntries = fs.readdirSync(src);
        for (const entry of remoteEntries) {
            if (ignore.includes(entry)) continue;
            const srcPath = path.join(src, entry);
            const destPath = path.join(dest, entry);

            if (fs.lstatSync(srcPath).isDirectory()) {
                if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });
                migrateAndSync(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    };

    migrateAndSync(root, process.cwd());
    fs.rmSync(tmpDir, { recursive: true, force: true });

    // 80% - CLEANUP
    await updateUI(80, "Finalizing...");
    return true;
}

module.exports = {
    name: "update",
    alias: ["up", "upgrade"],
    execute: async (sock, chatId, message, args, { isOwner }) => {
        if (!isOwner) return;

        let { key } = await sock.sendMessage(chatId, { text: "> [ ░░░░░░░░░░ ]  *0%*\n_© 2026 YAS-TECH • Handshake_" });

        try {
            await updateViaZip(sock, chatId, key);

            // 90% - INSTALL DEPENDENCIES
            await sock.sendMessage(chatId, { edit: key, text: ` [ █████████░ ]  *90%*\n_© 2026 YAS-TECH • Finalizing_` });
            await run('npm install');

            // 100% - SUCCESS
            await sock.sendMessage(chatId, { edit: key, text: ` [ ██████████ ]  *100%*\n_© 2026 YAS-TECH • Evolution Success_` });

            await delay(2000);
            process.exit(0);

        } catch (err) {
            await sock.sendMessage(chatId, { 
                edit: key,
                text: `❌ *UPDATE BLOCKED*\n\n${err.message}` 
            });
        }
    }
};
