const fs = require('fs');
const isAdmin = require('../lib/isAdmin');
const configPath = './database/antistatus.json';

module.exports = {
    name: "antistatus",
    alias: ["astatus"],
    description: "Manage anti-status mention actions.",
    category: "group",

    execute: async (sock, chatId, m, args) => {
        const senderId = m.key.participant || m.key.remoteJid;
        if (!chatId.endsWith('@g.us')) return;

        try {
            const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
            if (!isSenderAdmin) return sock.sendMessage(chatId, { text: "❌ Admins only!" });
            if (!isBotAdmin) return sock.sendMessage(chatId, { text: "❌ Make me admin first!" });

            if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({}));
            let data = JSON.parse(fs.readFileSync(configPath));

            const action = args[0]?.toLowerCase(); // delete, warn, kick, off

            if (['delete', 'warn', 'kick'].includes(action)) {
                data[chatId] = action;
                fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
                return sock.sendMessage(chatId, { text: `✅ *ANTI-STATUS SET TO ${action.toUpperCase()}*` });
            } 
            else if (action === 'off') {
                delete data[chatId];
                fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
                return sock.sendMessage(chatId, { text: "✅ *ANTI-STATUS DISABLED*" });
            } 
            else {
                return sock.sendMessage(chatId, { 
                    text: "🔍 *USAGE*\n*.antistatus delete*\n*.antistatus warn*\n*.antistatus kick*\n*.antistatus off*" 
                });
            }
        } catch (e) { console.error(e); }
    }
};
