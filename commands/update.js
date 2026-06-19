const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
    name: 'update',
    alias: ['upgrade', 'gitpull', 'refresh'],
    async execute(sock, chatId, msg, args, { isOwner, sender }) {
        
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: "❌ Access Denied!\nThis command is only for the bot owner." 
            });
            return;
        }

        const GITHUB_TOKEN = "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";
        const REPO_URL = `https://${GITHUB_TOKEN}@github.com/yasinimkanji15-bit/Yaseen.git`;

        await sock.sendMessage(chatId, { 
            text: "🔄 Updating Yaseen-MD...\nPlease wait..." 
        });

        try {
            let isGitRepo = false;
            try {
                await execPromise('git rev-parse --git-dir');
                isGitRepo = true;
            } catch (e) {
                isGitRepo = false;
            }

            if (!isGitRepo) {
                await sock.sendMessage(chatId, { text: "📦 Initializing Git repository..." });
                
                await execPromise('git init');
                await execPromise(`git remote add origin ${REPO_URL}`);
                await execPromise('git fetch origin');
                await execPromise('git reset --hard origin/main');
                
                await sock.sendMessage(chatId, { 
                    text: "✅ Git repository initialized and synced!\nRestarting bot..." 
                });
                setTimeout(() => process.exit(0), 2000);
                return;
            }

            await execPromise(`git remote set-url origin ${REPO_URL}`);

            let currentBranch = 'main';
            try {
                const { stdout } = await execPromise('git rev-parse --abbrev-ref HEAD');
                currentBranch = stdout.trim();
            } catch (e) {}

            await sock.sendMessage(chatId, { text: "📡 Fetching latest updates..." });
            await execPromise('git fetch origin');

            const { stdout: statusOutput } = await execPromise(`git status origin/${currentBranch} --porcelain`);

            if (!statusOutput.trim()) {
                await sock.sendMessage(chatId, { 
                    text: `✅ Bot is already updated!\nBranch: ${currentBranch}` 
                });
                return;
            }

            await sock.sendMessage(chatId, { text: "⬇️ Pulling changes..." });
            
            const { stdout: pullOutput } = await execPromise(`git pull origin ${currentBranch}`);

            if (pullOutput.includes('package.json')) {
                await sock.sendMessage(chatId, { text: "📦 Installing dependencies..." });
                await execPromise('npm install --no-audit --no-fund');
            }

            const changes = pullOutput.split('\n').slice(0, 4).join('\n');
            
            await sock.sendMessage(chatId, {
                text: `✅ UPDATE SUCCESSFUL!\n\n📝 Changes:\n${changes.substring(0, 200)}\n\n🔄 Restarting bot...`
            });

            setTimeout(() => {
                process.exit(0);
            }, 2000);

        } catch (error) {
            console.error("Update Error:", error);
            
            let errorMsg = "❌ Update Failed!\n\n";
            
            if (error.message.includes('uncommitted changes')) {
                errorMsg += "You have local changes.\nRun: git stash\nThen try .update again";
            } else if (error.message.includes('Authentication')) {
                errorMsg += "Token expired or invalid.\nGenerate new token at github.com/settings/tokens";
            } else if (error.message.includes('rate limit')) {
                errorMsg += "GitHub rate limit exceeded.\nTry again in an hour";
            } else {
                errorMsg += error.message.substring(0, 150);
            }
            
            await sock.sendMessage(chatId, { text: errorMsg });
        }
    }
};
