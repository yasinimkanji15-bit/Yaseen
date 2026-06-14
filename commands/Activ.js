const fs = require('fs');
const path = require('path');

module.exports = {
    name: "active",
    alias: ["top", "listactive", "rank"],
    description: "Check group activity ranking and message counts.",
    category: "group",

    execute: async (sock, chatId, message, args, { prefix, pushname }) => {
        const from = chatId;
        const statsPath = path.join(__dirname, '../database/group_stats.json');

        // 📜 --- THE TACTICAL ACTIVITY MANUAL ---
        // If they use the command in DM, show them how it works
        if (!from.endsWith('@g.us')) {
            const manual = `📊 *YASEEN－ＭＤ ＳＴＡＴＳ ＭＡＮＵＡＬ*

> *“Tracking group engagement metrics in real-time.”*

✦═════════════════════◆
📝 *ＨＯＷ ＩＴ ＷＯＲＫＳ:*
> The bot counts every message sent
> in groups where it is present.

🚀 *ＣＯＭＭＡＮＤＳ:*
> • \`.active\` ➔ View Top 15 Chatters

⚠️ *ＮＯＴＥ:*
> Only works inside Group Chats.
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '📈', key: message.key } });

            if (!fs.existsSync(statsPath)) {
                return await sock.sendMessage(from, { text: "📊 No data recorded yet. Start chatting!" });
            }

            const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
            const groupData = stats[from];

            if (!groupData ||!Object.keys(groupData).length) {
                return await sock.sendMessage(from, { text: "📊 No activity tracked in this sector yet." });
            }

            // Fixed: Define medals array
            const medals = ["🥇", "🥈", "🥉", "🏅", "🏅", "🏅", "🏅", "🏅", "🏅", "🏅", "🏅"];

            // Sort by message count (Descending)
            const sorted = Object.entries(groupData)
               .sort((a, b) => (b[1].msgCount || 0) - (a[1].msgCount || 0))
               .slice(0, 15);

            if (!sorted.length) {
                return await sock.sendMessage(from, { text: "📊 No valid message counts found." });
            }

            let report = `🏆 *YASEEN－ＭＤ ＬＥＡＤＥＲＢＯＡＲＤ*\n\n`;
            report += `*Sector:* _Group Activity Log_\n`;
            report += `*Tracker:* _Active_\n`;
            report += `✦═════════════════════◆\n\n`;

            sorted.forEach((mem, i) => {
                const jid = mem[0];
                const count = mem[1].msgCount || 0;
                const num = jid.split('@')[0];
                const medalStr = medals[i] || "◾";

                report += `${medalStr} ${i+1} @${num}\n`;
                report += `   👉 *messages* : *${count}* *msgs*\n`;
            });

            report += `\n✦═════════════════════◆\n*🛡️ YASEEN－ＭＤ 🛡️*\n`;
            report += `_*keep messaging to climb at the peak*_\n\n`;

            await sock.sendMessage(from, {
                text: report,
                mentions: sorted.map(m => m[0])
            }, { quoted: message });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "❌ *CORE ERROR:* Failed to generate activity report." });
        }
    }
};