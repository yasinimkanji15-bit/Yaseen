const fs = require('fs');
const path = './database/antileave.json';
// Hakikisha path ya file lako la isadmin.js iko sahihi hapa
const isAdmin = require('../lib/isAdmin'); 

module.exports = {
    name: "antileave",
    alias: ["al"],
    description: "Toggle Anti-Leave on or off for this group.",
    category: "admin",

    execute: async (sock, chatId, m, args) => {
        try {
            if (!chatId.endsWith('@g.us')) return;

            const sender = m.key.participant || m.key.remoteJid;

            // --- HAPA NDIPO TUNATUMIA FILE LAKO ---
            // Tunaita function na inapokea (sock, chatId, sender)
            const check = await isAdmin(sock, chatId, sender);
            
            // File lako linarudisha object, tunachukua isSenderAdmin
            if (!check.isSenderAdmin) {
                return sock.sendMessage(chatId, { text: "❌ Only admins can use this command!" });
            }

            // --- DATABASE LOGIC ---
            if (!fs.existsSync('./database')) fs.mkdirSync('./database');
            let data = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {};

            if (!args[0]) return sock.sendMessage(chatId, { text: "Usage: *.antileave on* or *.antileave off*" });

            if (args[0] === 'on') {
                data[chatId] = true;
                fs.writeFileSync(path, JSON.stringify(data, null, 2));
                await sock.sendMessage(chatId, { text: "✅ *Anti-Leave ENABLED* for this group." });
            } else if (args[0] === 'off') {
                data[chatId] = false;
                fs.writeFileSync(path, JSON.stringify(data, null, 2));
                await sock.sendMessage(chatId, { text: "✅ *Anti-Leave DISABLED* for this group." });
            }

        } catch (e) {
            console.error("Antileave Error:", e);
        }
    }
};
