module.exports = {
    name: "text",
    alias: ["leaderboard", "top"],
    description: "Display the top users based on letter count",
    category: "group",

    execute: async (sock, chatId, message, args) => {
        const fs = require('fs');
        const path = require('path');
        const statsPath = path.join(__dirname, '../database/group_stats.json');

        if (!fs.existsSync(statsPath)) return await sock.sendMessage(chatId, { text: "No data found yet!" });

        const stats = JSON.parse(fs.readFileSync(statsPath));
        if (!stats[chatId]) return await sock.sendMessage(chatId, { text: "No activity recorded in this group." });

        // Sort by letterCount (Highest to Lowest)
        const sorted = Object.entries(stats[chatId])
            .sort((a, b) => (b[1].letterCount || 0) - (a[1].letterCount || 0))
            .slice(0, 10);

        let response = `🏆 *L E T T E R  L E A D E R B O A R D*\n\n`;
        response += `*Sector:* _Group Activity Log_\n`;
        response += `*Tracker:* _Active_\n`;
        response += `────────────────────\n\n`;

        const mentions = [];
        sorted.forEach((user, i) => {
            const jid = user[0];
            const data = user[1];
            let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "👤";
            
            response += `${medal} @${jid.split('@')[0]} ➜ *${data.letterCount || 0}* letters\n`;
            mentions.push(jid);
        });

        response += `\n────────────────────\n`;
        response += `🛡️ *YASEEN—MD* 🛡️`;

        await sock.sendMessage(chatId, { text: response, mentions: mentions }, { quoted: message });
    }
};
