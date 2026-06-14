const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
    name: "status",
    alias: ["stats", "system", "check", "st"],
    description: "View operational status, security metrics, and AI injections.",
    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        if (!isOwner) return;

        await sock.sendMessage(chatId, { react: { text: '📊', key: message.key } });

        // 🟢 PATHS
        const badPath = path.join(__dirname, '../database/badwords.json');
        const schedPath = path.join(__dirname, '../database/schedules.json');

        // 🛡️ SECURITY STATUS
        let badActive = "𝚏𝚊𝚕𝚜𝚎";
        let badCount = 0;
        if (fs.existsSync(badPath)) {
            try {
                const bConf = JSON.parse(fs.readFileSync(badPath));
                badActive = bConf.active ? "𝚝𝚛𝚞𝚎" : "𝚏𝚊𝚕𝚜𝚎";
                badCount = bConf.words.length;
            } catch (e) { badActive = "𝚎𝚛𝚛𝚘𝚛"; }
        }

        // 📅 SCHEDULE
        let taskCount = 0;
        if (fs.existsSync(schedPath)) {
            try { taskCount = JSON.parse(fs.readFileSync(schedPath)).length; } catch (e) { taskCount = 0; }
        }

        // ⚙️ ENGINE METRICS
        const autoRead = global.botConfig.autoRead ? "𝚝𝚛𝚞𝚎" : "𝚏𝚊𝚕𝚜𝚎";
        const antiDelete = global.botConfig.antiDelete ? "𝚝𝚛𝚞𝚎" : "𝚏𝚊𝚕𝚜𝚎";
        const typDM = global.botConfig.autoTyping.dm ? "𝚘𝚗" : "𝚘𝚏𝚏";
        const typGC = global.botConfig.autoTyping.gc ? "𝚘𝚗" : "𝚘𝚏𝚏";
        const recDM = global.botConfig.autoRecording.dm ? "𝚘𝚗" : "𝚘𝚏𝚏";
        const recGC = global.botConfig.autoRecording.gc ? "𝚘𝚗" : "𝚘𝚏𝚏";

        const reactGC = global.botConfig.autoReactGC ? "𝚘𝚗" : "𝚘𝚏𝚏";
        const reactDM = global.botConfig.autoReactDM ? "𝚘𝚗" : "𝚘𝚏𝚏";

        // 🌡️ SYSTEM RAM
        const usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

        const statusReport = `📊 *YASEEN-ＭＤ ＳＹＳＴＥＭ ＲＥＰＯＲＴ*

> *“Precision is not an act, it is a habit of the code.”*

✦══════════════════════════════✦
🛰️ *Stealth & Automation:*
> Always-Online: [ ${global.botConfig.alwaysOnline ? "ON" : "OFF"} ]
> Auto-Read: [ ${autoRead} ]

⌨️ *Typing Presence:*
> DM: [ ${typDM} ] | GC: [ ${typGC} ]

🎙️ *Recording Presence:*
> DM: [ ${recDM} ] | GC: [ ${recGC} ]

🎭 *Reaction Logic:*
> Group React: [ ${reactGC} ]
> Private React: [ ${reactDM} ]
> Active Set: [ ${global.botConfig.reactEmojis.join(" ")} ]

🛡️ *Security Suite:*
> Anti-Delete: [ ${antiDelete} ]
> Anti-Badword: [ ${badActive} (Loaded: ${badCount}) ]
> Bot Mode: [ ${global.botConfig.isPublic ? "PUBLIC 🌎" : "PRIVATE 🔐"} ]

📅 *Operational Data:*
> Active Tasks: [ ${taskCount} ⏳ ]
> Memory Usage: [ ${usedRam}MB / ${totalRam}GB ]
> Session: [ 𝚊𝚞𝚝𝚑𝚎𝚗𝚝𝚒𝚌𝚊𝚝𝚎𝚍 ✅ ]
✦══════════════════════════════✦

📂 *Field Intel:*
> YASEEN Node: Synchronized.
> System: Operational 🚀

_© 2026 YAS-TECH • Core v3.0_`;

        await sock.sendMessage(chatId, { text: statusReport }, { quoted: message });
    }
};
