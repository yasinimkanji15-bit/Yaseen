const fs = require('fs');
const path = require('path');

module.exports = {
    name: "help",
    alias: ["manual", "guide", "YASEEN"],
    description: "Access sector-specific manuals with tactical quoting.",
    category: "main",

    execute: async (sock, chatId, message, args) => {
        try {
            await sock.sendMessage(chatId, { react: { text: '📑', key: message.key } });

            const prefix = global.botConfig?.prefix || ".";
            const defaultImg = "https://files.catbox.moe/yb43pn.jpg";
            const botImg = global.botConfig?.menuThumb || defaultImg;
            const commandsDir = path.join(__dirname, '../commands');
            const files = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

            // 🛠️ CATEGORY DEFINITIONS (Matches menu.js)
            const categories = {
                "main": { emoji: "🏠", title: "Main Menu" },
                "owner": { emoji: "🛡️", title: "System & Owner" },
                "tools": { emoji: "🕹️", title: "Cool Tools" },
                "group": { emoji: "👥", title: "Group Tools" },
                "search": { emoji: "🤖", title: "Intelligence & Search" },
                "download": { emoji: "📥", title: "Downloaders" },
                "fun": { emoji: "🎭", title: "Fun & Pranks" },
                "utility": { emoji: "🎨", title: "Media & Utility" },
                "sports": { emoji: "⚽️", title: "Sports & Games" },
                "islamic": { emoji: "🕌", title: "Islamic Center" },
                "religious": { emoji: "⛪", title: "Religious Center" },
                "18": { emoji: "🔞", title: "yaşlıların core" },

                "games": { emoji: "🎮", title: "Game Center" }
            };

            const input = args.join(' ').toLowerCase();
            let masterManual = "";
            let bodyStatus = "System Documentation Synchronized";

            // 🟢 FUNCTION: SCAN FILES FOR MANUAL BLOCKS
            const scanManuals = (filterCategory = null) => {
                let text = "";
                files.forEach(file => {
                    const filePath = path.join(commandsDir, file);
                    const cmd = require(filePath);
                    
                    // Filter by category if requested
                    if (filterCategory && cmd.category?.toLowerCase() !== filterCategory) return;

                    const content = fs.readFileSync(filePath, 'utf8');
                    const manualMatch = content.match(/const (manual|cmdManual|list|index|guide|listGuide) = `([\s\S]*?)`;/);

                    if (manualMatch && manualMatch[2]) {
                        text += `📡 *ＮＯＤＥ: ${file.replace('.js', '').toUpperCase()}*\n\n`;
                        text += `${manualMatch[2].trim()}\n\n`;
                        text += `✦═════════════════════✦\n\n`;
                    }
                });
                return text;
            };

            // 🟢 CASE 1: FULL MANUAL (.help all)
            if (input === 'all') {
                bodyStatus = "Full System Manual Active";
                masterManual = `🤖 *YASEEN-ＭＤ  ＭＡＳＴＥＲ  ＭＡＮＵＡＬ*\n\n> *“Intelligence is the only currency.”*\n\n✦═════════════════════✦\n\n`;
                masterManual += scanManuals();
            } 
            // 🟢 CASE 2: CATEGORY MANUAL (.help tools, .help fun, etc)
            else if (input && categories[input]) {
                const info = categories[input];
                bodyStatus = `${info.title} Manual Active`;
                masterManual = `🤖 *YASEEN-ＭＤ  ${info.title.toUpperCase()}  ＧＵＩＤＥ*\n\n`;
                masterManual += `✦═════════════════════✦\n\n`;
                const results = scanManuals(input);
                masterManual += results || `> _No manual data found in this sector._\n\n`;
                masterManual += `\n_Type ${prefix}help to return to index._`;
            } 
            // 🟢 CASE 3: MANUAL INDEX (Vertical Quote Style)
            else {
                masterManual = `🤖 *YASEEN-ＭＤ  ＭＡＮＵＡＬ  ＩＮＤＥＸ*\n\n`;
                masterManual += `> *“Select a sector to view internal protocols.”*\n\n`;
                masterManual += `*📑 ＡＶＡＩＬＡＢＬＥ  ＳＥＣＴＯＲＳ:* \n\n`;

                for (const [key, info] of Object.entries(categories)) {
                    masterManual += `> • \`${prefix}help ${key}\` (${info.title})\n`;
                }
                masterManual += `> • \`${prefix}help all\` (Full Manual)\n`;
                masterManual += `\n*⚙️ ＵＳＡＧＥ:* \nType a command above to read documentation.`;
            }

            masterManual += `\n\n_© 2026 YASEEN Laporte • Operational_`;

            // 🚀 UNIVERSAL DISPATCH (With Small Thumbnail)
            await sock.sendMessage(chatId, {
                text: masterManual,
                contextInfo: {
                    externalAdReply: {
                        title: "YASEEN-ＭＤ  ＭＡＮＵＡＬ",
                        body: bodyStatus,
                        thumbnailUrl: botImg,
                        sourceUrl: "", 
                        mediaType: 1, 
                        renderLargerThumbnail: false 
                    }
                }
            }, { quoted: message });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(chatId, { text: "❌ *MANUAL ERROR:* Sector scanning failed." });
        }
    }
};
