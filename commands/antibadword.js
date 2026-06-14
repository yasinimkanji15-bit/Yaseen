const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/badwords.json');

module.exports = {
    name: "antibadword",
    alias: ["abw", "badword"],
    description: "Manage prohibited words in groups.",
    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        if (!isOwner) return;

        if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        let config = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : { active: false, words: [] };

        const manual = `🛡️ *YASEEN-ＭＤ ＡＮＴＩ-ＢＡＤＷＯＲＤ*

> *“Clean code requires a clean environment.”*

✦═════════════════════════════════✦
🛰️ *COMMAND CENTER:*
> 1️⃣ *SET:* .abw set fuck,shit,bad
> 2️⃣ *MODE:* .abw on | off
> 3️⃣ *DATA:* .abw list
✦═════════════════════════════════✦

📢 *STATUS:* [ ${config.active ? "ACTIVE ✅" : "OFF ❌"} ]
📝 *DATABASE:* ${config.words.length} Restricted Words

📂 *Field intel:*
> Monitoring all Group Nodes (@g.us).
> Auto-Delete: Enabled.
> Owner Immunity: Active.

_© 2026 YAS-TECH • Security Suite_`;

        if (!args[0]) return sock.sendMessage(chatId, { text: manual });

        const cmd = args[0].toLowerCase();

        if (cmd === 'on') {
            config.active = true;
            fs.writeFileSync(dbPath, JSON.stringify(config, null, 2));
            return sock.sendMessage(chatId, { text: "✅ *Security Protocol: ACTIVE.*" });
        }

        if (cmd === 'off') {
            config.active = false;
            fs.writeFileSync(dbPath, JSON.stringify(config, null, 2));
            return sock.sendMessage(chatId, { text: "🛑 *Security Protocol: DISABLED.*" });
        }

        if (cmd === 'set') {
            const rawWords = args.slice(1).join(" ");
            if (!rawWords) return sock.sendMessage(chatId, { text: "❌ *Usage:* .abw set word1,word2" });
            
            config.words = rawWords.split(',').map(w => w.trim().toLowerCase());
            fs.writeFileSync(dbPath, JSON.stringify(config, null, 2));
            return sock.sendMessage(chatId, { text: `🛡️ *Database Updated.* Locked ${config.words.length} words.` });
        }

        if (cmd === 'list') {
            const list = config.words.length > 0 ? config.words.join(', ') : "None";
            return sock.sendMessage(chatId, { text: `📝 *Restricted Registry:* \n\n${list}` });
        }

        return sock.sendMessage(chatId, { text: manual });
    }
};
