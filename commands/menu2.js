const fs = require('fs');
const path = require('path');

module.exports = {
    name: "menu2",
    alias: ["help2", "m2", "list2"],
    description: "Tactical dynamic command center for YAS-TECH",
    category: "main",

    execute: async (sock, chatId, message, args, { pushname }) => {
        try {
            const prefix = global.botConfig?.prefix || ".";
            const input = (args[0] || '').toLowerCase();

            // 1. Reaction (Hapa ndipo bot inapoishia sasa hivi, hebu tuvuke hapa)
            await sock.sendMessage(chatId, { react: { text: '📁', key: message.key } });
            
            const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            const botImg = "https://files.catbox.moe/038kef.jpg";

            const categoryImages = {
                "main": "https://files.catbox.moe/iwk8at.jpg",
                "owner": "https://files.catbox.moe/42om6x.jpg",
                "tools": "https://files.catbox.moe/f4us63.jpg",
                "group": "https://files.catbox.moe/g085p1.png",
                "search": "https://files.catbox.moe/vjg0qq.jpg",
                "download": "https://files.catbox.moe/ools06.png",
                "fun": "https://files.catbox.moe/255wwt.png",
                "utility": "https://files.catbox.moe/20nogw.jpg",
                "image": "https://files.catbox.moe/duypun.jpg",
                "ai": "https://files.catbox.moe/injbfy.jpg",
                "games": "https://files.catbox.moe/055t55.jpg",
                "sports": "https://files.catbox.moe/ayi1rd.png",
                "christian": "https://files.catbox.moe/5qnqcl.jpg",
                "islam": "https://files.catbox.moe/wy43lz.jpg",
                "food": "https://files.catbox.moe/md5mr5.jpg",
                "location": "https://files.catbox.moe/sf2tal.jpg",
                "xv": "https://files.catbox.moe/97o88i.png"
            };

            const categories = {
                "main": { emoji: "🖥", title: "Main Menu" },
                "owner": { emoji: "👑", title: "System & Owner" },
                "tools": { emoji: "🪛", title: "Cool Tools" },
                "group": { emoji: "👥", title: "Group Tools" },
                "search": { emoji: "🔍", title: "Intelligence & Search" },
                "download": { emoji: "📥", title: "Downloaders" },
                "fun": { emoji: "🎭", title: "Fun & Pranks" },
                "utility": { emoji: "📺", title: "Media & Utility" },
                "image": { emoji: "🖼", title: "Image Generating" },
                "ai": { emoji: "🤖", title: "AI Tools" },
                "games": { emoji: "🎮", title: "Game Center" },
                "sports": { emoji: "⚽", title: "Football Center" },
                "christian": { emoji: "✝", title: "Christianity Hall" },
                "islam": { emoji: "🕋", title: "Islamic State" },
                "food": { emoji: "🍜", title: "Food & Nutrition" },
                "location": { emoji: "🗺", title: "Physical Geography" },
                "xv": { emoji: "🔞", title: "Eşek Core" }
            };

            const commandsDir = path.join(__dirname, '../commands');
            const files = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

            let menuData = {};
            files.forEach(file => {
                try {
                    const cmd = require(path.join(commandsDir, file));
                    if (cmd && cmd.name) {
                        const cat = (cmd.category || "other").toLowerCase();
                        if (!menuData[cat]) menuData[cat] = [];
                        menuData[cat].push(cmd.name);
                    }
                } catch (e) {}
            });

            let finalMenuText = "";
            let selectedImage = categoryImages[input] || botImg;

            if (input === 'all') {
                finalMenuText = `┏━━〔 *YASEEN FULL ARCHIVE* 〕━━┈\n┃\n`;
                for (const [key, info] of Object.entries(categories)) {
                    finalMenuText += `┣━ ${info.emoji} *${info.title.toUpperCase()}*\n`;
                    if (menuData[key] && menuData[key].length > 0) {
                        menuData[key].sort().forEach(name => {
                            finalMenuText += `┃  ➤ ${prefix}${name}\n`;
                        });
                    } else {
                        finalMenuText += `┃  ➤ _No modules available_\n`;
                    }
                    finalMenuText += `┃\n`;
                }
                finalMenuText += `┗━━━━━━━━━━━━━━━━━━━━━━━┈`;
            } 
            else if (input && categories[input]) {
                const info = categories[input];
                finalMenuText = `┏━━〔 *${info.title.toUpperCase()}* 〕━━┈\n┃\n`;
                if (menuData[input] && menuData[input].length > 0) {
                    menuData[input].sort().forEach(name => {
                        finalMenuText += `┃  ➤ ${prefix}${name}\n`;
                    });
                } else {
                    finalMenuText += `┃  ➤ _No modules found in this sector._\n`;
                }
                finalMenuText += `┃\n┗━━━━━━━━━━━━━━━━━━━━━━━┈`;
            } 
            else {
                finalMenuText = `┏━━〔 *YASEEN-ＭＤ ＣＯＮＴＲＯＬ* 〕━━┈\n┃\n`;
                finalMenuText += `┃  👤 *User:* ${pushname}\n`;
                finalMenuText += `┃  🕒 *Time:* ${time}\n`;
                finalMenuText += `┃  📟 *Status:* Operational\n`;
                finalMenuText += `┃  ⚙️ *Total:* ${files.length} Modules\n┃\n`;
                finalMenuText += `┣━━〔 *AVAILABLE SECTORS* 〕━━━┈\n┃\n`;
                for (const [key, info] of Object.entries(categories)) {
                    finalMenuText += `┃  ➤ ${prefix}m2 ${key} (${info.title})\n`;
                }
                finalMenuText += `┃  ➤ ${prefix}m2 all (Full Archive)\n┃\n`;
                finalMenuText += `┗━━━━━━━━━━━━━━━━━━━━━━━┈\n\n`;
                finalMenuText += `_© 2026 YASEEN Laporte_`;
            }

            // 2. Mfumo wa kutuma (Send Logic) - Tunajaribu picha, ikifeli tunatuma text pekee
            try {
                await sock.sendMessage(chatId, {
                    image: { url: selectedImage },
                    caption: finalMenuText
                }, { quoted: message });
            } catch (imgError) {
                // Ikiwa picha ina kosa, tuma maandishi tu ili bot isinyamaze
                await sock.sendMessage(chatId, { text: finalMenuText }, { quoted: message });
            }

        } catch (err) {
            console.error("Critical Menu Error:", err);
            // Hii inatuma ujumbe hata kama kosa ni kubwa kiasi gani
            await sock.sendMessage(chatId, { text: "⚠️ Technical error in menu system. Please check console." });
        }
    }
};
