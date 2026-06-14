const fs = require('fs');
const path = require('path');

module.exports = {
    name: "alive",
    alias: ["about", "intro", "yaseen", "status"],
    description: "Introduce the bot system status, total commands, and developer info.",
    category: "main",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;

        // 1. Resolve identity: Check if the user replied to someone or tagged someone
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const targetUser = quotedParticipant || mentionedJid || msg.key.participant || msg.key.remoteJid;

        try {
            await sock.sendMessage(from, { react: { text: '⚡', key: msg.key } });

            // 2. Dynamic Clock System configured to strictly use Tanzania/East Africa Time
            const time = new Date().toLocaleTimeString('en-GB', { 
                timeZone: 'Africa/Dar_es_Salaam', 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            // 3. Dynamic Command Counter: Scans the directory to get total operational commands
            const commandsPath = path.join(__dirname, '../commands');
            let totalCommands = 0;
            if (fs.existsSync(commandsPath)) {
                const files = fs.readdirSync(commandsPath);
                totalCommands = files.filter(file => file.endsWith('.js')).length;
            }

            const prefix = global.botConfig?.prefix || "None";

            // 4. Premium Plain-Text Architecture
            const introMessage = `👋 *YASEEN-MD SYSTEM INTERFACE* ✨\n\n` +
                `Hello @${targetUser.split('@')[0]}, the core automation framework is successfully loaded and operating at maximum bandwidth.\n\n` +
                `👑 *Lead Developer:* YASINI HASSAN\n` +
                `🗂️ *Total Loaded Commands:* ${totalCommands} Active Modules\n` +
                `🕒 *Tanzania Local Time:* ${time} (EAT)\n` +
                `⚙️ *Active Prefix:* [ ${prefix} ]\n` +
                `💻 *Engine Environment:* Termux Linux x64\n` +
                `🛡️ *Mainframe Security:* Operational / Firewall Active\n\n` +
                `*💡 SYSTEM FEATURES:* \n` +
                `• Embedded Cyber Tools (Subdomain Lookup, Network Mapping)\n` +
                `• Advanced Node.js Registry Integration (NPM Spec Search)\n` +
                `• Secure Math Engine, GitHub Archive Downloader & Entertainment Modules\n\n` +
                `Type \`${prefix === "None" ? "" : prefix}menu\` to deploy the full command registry.\n\n` +
                `_© 2026 YASEEN LAPORTE • POWERED BY YASINI HASSAN_`;

            // 5. Fire payload with accurate user mentions
            await sock.sendMessage(from, { 
                text: introMessage, 
                mentions: [targetUser] 
            }, { quoted: msg });

            await sock.sendMessage(from, { react: { text: '🟢', key: msg.key } });

        } catch (error) {
            console.error("Alive Injection System Error:", error.message);
            return sock.sendMessage(from, { text: "❌ *Engine Error:* Failed to pull metadata from directory structure." }, { quoted: msg });
        }
    }
};