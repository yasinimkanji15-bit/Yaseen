const fs = require('fs');
const isAdmin = require('../lib/isAdmin');
const configPath = './database/antilink.json';

module.exports = {
    name: "antilink",
    alias: ["al"],
    description: "Enable or disable link protection in groups.",
    category: "group",

    execute: async (sock, chatId, m, args) => {
        const senderId = m.key.participant || m.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');

        if (!isGroup) return sock.sendMessage(chatId, { text: "❌ This command is for groups only!" });

        try {
            const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
            if (!isSenderAdmin) return sock.sendMessage(chatId, { text: "❌ Admins only!" });
            if (!isBotAdmin) return sock.sendMessage(chatId, { text: "❌ I need to be an admin to delete links." });

            // Initialize database file if it doesn't exist
            if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({}));
            let antilinkData = JSON.parse(fs.readFileSync(configPath));

            const action = args[0]?.toLowerCase();

            if (action === 'on') {
                antilinkData[chatId] = { active: true };
                fs.writeFileSync(configPath, JSON.stringify(antilinkData, null, 2));
                return sock.sendMessage(chatId, { text: "✅ *ANTILINK ENABLED*\nI will now delete all external links from non-admins." });
            } 
            
            else if (action === 'off') {
                delete antilinkData[chatId];
                fs.writeFileSync(configPath, JSON.stringify(antilinkData, null, 2));
                return sock.sendMessage(chatId, { text: "✅ *ANTILINK DISABLED*" });
            } 

            else {
                return sock.sendMessage(chatId, { 
                    text: "🔍 *ANTILINK SETUP*\n\nUsage:\n*.antilink on* - To enable\n*.antilink off* - To disable" 
                }, { quoted: m });
            }

        } catch (e) {
            console.error(e);
            sock.sendMessage(chatId, { text: "❌ An error occurred!" });
        }
    }
};
