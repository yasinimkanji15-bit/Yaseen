const fs = require('fs');
const isAdmin = require('../lib/isAdmin'); // Path to your admin check helper
const jailPath = './database/jail.json';

module.exports = {
    name: "jaill",
    alias: ["unjail", "lock"],
    description: "Toggle jail status for a user.",
    category: "group",

    execute: async (sock, chatId, m, args) => {
        const senderId = m.key.participant || m.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');

        // 1. Check if it's a group
        if (!isGroup) return sock.sendMessage(chatId, { text: "❌ This command can only be used in groups!" });

        try {
            // 2. Check Permissions
            const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
            if (!isSenderAdmin) return sock.sendMessage(chatId, { text: "❌ Only admins can use this command." });
            if (!isBotAdmin) return sock.sendMessage(chatId, { text: "❌ I need to be an admin to delete messages!" });

            // 3. Identify the Target (Tag or Reply)
            let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                         m.message?.extendedTextMessage?.contextInfo?.participant;

            if (!target) return sock.sendMessage(chatId, { text: "❌ Please tag a user or reply to their message to jail/unjail them." });

            // 4. Load/Initialize Database
            if (!fs.existsSync('./database')) fs.mkdirSync('./database');
            if (!fs.existsSync(jailPath)) fs.writeFileSync(jailPath, JSON.stringify({}));

            let jailData = JSON.parse(fs.readFileSync(jailPath));
            if (!jailData[chatId]) jailData[chatId] = [];

            // 5. Toggle Logic
            const userIndex = jailData[chatId].indexOf(target);

            if (userIndex === -1) {
                // TURN ON: Put in jail
                jailData[chatId].push(target);
                fs.writeFileSync(jailPath, JSON.stringify(jailData, null, 2));
                
                await sock.sendMessage(chatId, { 
                    text: `🔒 *JAILED!*\n\n👤 @${target.split('@')[0]} has been placed in jail🤫.\n\nAll there messages will be trashed until they left the Group and know how to behave 🤏😎.`, 
                    mentions: [target] 
                }, { quoted: m });

            } else {
                // TURN OFF: Release from jail
                jailData[chatId].splice(userIndex, 1);
                fs.writeFileSync(jailPath, JSON.stringify(jailData, null, 2));

                await sock.sendMessage(chatId, { 
                    text: `🔓 *RELEASED!*\n\n👤 @${target.split('@')[0]} is no longer in jail.`, 
                    mentions: [target] 
                }, { quoted: m });
            }

        } catch (e) {
            console.error("Jail Cmd Error:", e);
            sock.sendMessage(chatId, { text: "❌ An error occurred while processing the command." });
        }
    }
};
