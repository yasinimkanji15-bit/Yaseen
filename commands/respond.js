const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/respond_config.json');

module.exports = {
    name: "respond",
    alias: ["rp"],
    description: "Simple one-time auto-responder.",
    category: "automation",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        if (!isOwner) return;

        if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        let config = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : { active: false, msg: "Busy." };

        const manual = `🤖 *YASEEN-ＭＤ ＲＥＳＰＯＮＤＥＲ*
✦═════════════════════════════✦
1️⃣ *SET:* .respond <message>
2️⃣ *ON:* .respond on
3️⃣ *OFF:* .respond off
4️⃣ *RESET:* .respond clear
✦═════════════════════════════✦
> 📢 *Status:* [ ${config.active ? "ON ✅" : "OFF ❌"} ]
> 💬 *Msg:* ${config.msg}`;

        if (!args[0]) return sock.sendMessage(chatId, { text: manual });

        const cmd = args[0].toLowerCase();

        if (cmd === 'on') {
            config.active = true;
            fs.writeFileSync(dbPath, JSON.stringify(config, null, 2));
            return sock.sendMessage(chatId, { text: "🚀 *Responder ON*" });
        }
        if (cmd === 'off') {
            config.active = false;
            fs.writeFileSync(dbPath, JSON.stringify(config, null, 2));
            return sock.sendMessage(chatId, { text: "🛑 *Responder OFF*" });
        }
        if (cmd === 'clear') {
            if (global.respondMemory) global.respondMemory.clear();
            return sock.sendMessage(chatId, { text: "🗑️ *Memory Cleared*" });
        }

        // Set message: .respond Hi
        config.msg = args.join(" ");
        fs.writeFileSync(dbPath, JSON.stringify(config, null, 2));
        return sock.sendMessage(chatId, { text: `✅ *Updated:* ${config.msg}` });
    }
};
