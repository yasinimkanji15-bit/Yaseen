const fs = require('fs');
const path = require('path');

module.exports = {
    name: "resetactive",
    alias: ["clearstats", "resetrank"],
    description: "Reset group activity rankings (No Admin required).",
    category: "group",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const statsPath = path.join(__dirname, '../database/group_stats.json');

        // 1. GROUP CHECK ONLY
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: "❌ Command hii inafanya kazi kwenye magroup pekee." });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🗑️', key: message.key } });

            // 2. CHECK IF DATABASE EXISTS
            if (fs.existsSync(statsPath)) {
                let stats = JSON.parse(fs.readFileSync(statsPath));

                if (stats[from]) {
                    // Delete this group's data
                    delete stats[from]; 
                    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

                    return await sock.sendMessage(from, { 
                        text: "✅ *YASEEN－ＭＤ  ＳＴＡＴＳ*\n\nTakwimu za group hili zimefutwa kikamilifu. Kila mtu anaanza upya sasa! 🕹️" 
                    }, { quoted: message });
                } else {
                    return await sock.sendMessage(from, { text: "📊 Hakuna data za kufuta kwa sasa." });
                }
            } else {
                return await sock.sendMessage(from, { text: "📂 Database haipo (group_stats.json)." });
            }

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "❌ *CORE ERROR:* Imeshindwa kufuta takwimu." });
        }
    }
};
