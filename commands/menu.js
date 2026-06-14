const fs = require('fs');
const path = require('path');

const STYLE_PATH = path.join(__dirname, '../data/menuStyle.json');

// --- DATABASE YA PICHA 4 TOFAUTI ZINAZOBADILIKA KILA MARA ---
const MENU_IMAGES = [
    "https://files.catbox.moe/038kef.jpg", // Pic 1 (YAS-TECH Default)
    "https://files.catbox.moe/038kef.jpg", // Pic 2
    "https://files.catbox.moe/038kef.jpg", // Pic 3
    "https://files.catbox.moe/038kef.jpg"  // Pic 4
];

module.exports = {
    name: "menu",
    alias: ["help", "m", "list"],
    description: "Tactical dynamic command center for YAS-TECH",
    category: "main",

    execute: async (sock, chatId, message, args, { pushname, isOwner }) => {
        try {
            const prefix = global.botConfig?.prefix || ".";
            const input = (args[0] || '').toLowerCase();

            await sock.sendMessage(chatId, { react: { text: '📁', key: message.key } });
            
            const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            
            // Mfumo wa kuchagua picha bila mpangilio (Random Rotation)
            const randomImg = MENU_IMAGES[Math.floor(Math.random() * MENU_IMAGES.length)];

            // Kusoma Menu Style kutoka JSON database
            let currentStyle = "1";
            if (fs.existsSync(STYLE_PATH)) {
                try {
                    const styleData = JSON.parse(fs.readFileSync(STYLE_PATH));
                    currentStyle = styleData.currentStyle || "1";
                } catch (e) { currentStyle = "1"; }
            }

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

            const speedTime = (Math.random() * (0.9999 - 0.1000) + 0.1000).toFixed(4);
            const fakeRamUsed = Math.floor(Math.random() * (115 - 90 + 1)) + 90;

            let finalMenuText = "";

            // ====================================================
            // SECTION 1: FULL COMMAND ARCHIVE (.menu all)
            // ====================================================
            if (input === 'all') {
                if (currentStyle === "3") {
                    finalMenuText = `Madrin Supreme Menu 💻\n\n`;
                    for (const [key, info] of Object.entries(categories)) {
                        if (menuData[key] && menuData[key].length > 0) {
                            finalMenuText += `${info.title.toUpperCase()}\n`;
                            menuData[key].sort().forEach(name => {
                                finalMenuText += ` ⚙️ ${name}\n`;
                            });
                            finalMenuText += `\n`;
                        }
                    }
                }
                else if (currentStyle === "5" || currentStyle === "6") {
                    finalMenuText = `┌◽▫️ ❖ YAS-BOT CORE ❖ ▫️◽\n`;
                    finalMenuText += `│ 👑 OWNER : Yaseen Mkanji\n`;
                    finalMenuText += `│ ⚙️ PREFIX : [ ${prefix || 'None'} ]\n`;
                    finalMenuText += `│ 💻 HOST : Pterodactyl Panel\n`;
                    finalMenuText += `│ 🗂️ PLUGINS : ${files.length}\n`;
                    finalMenuText += `│ ⏳ SPEED : ${speedTime} ms\n`;
                    finalMenuText += `│ 📊 USAGE : ${fakeRamUsed} MB / 128 GB\n`;
                    finalMenuText += `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n`;

                    for (const [key, info] of Object.entries(categories)) {
                        if (menuData[key] && menuData[key].length > 0) {
                            finalMenuText += `┌◽▫️ ❖ ${info.title.toUpperCase()} ❖ ▫️◽\n`;
                            menuData[key].sort().forEach(name => {
                                finalMenuText += `│ ⏩ ${name}\n`;
                            });
                            finalMenuText += `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n`;
                        }
                    }
                } 
                else if (currentStyle === "1") {
                    finalMenuText = `┏━━━〔 YASEEN FULL ARCHIVE 〕━━━┓\n`;
                    for (const [key, info] of Object.entries(categories)) {
                        finalMenuText += `┃\n┃  ${info.emoji} ${info.title.toUpperCase()}\n`;
                        if (menuData[key] && menuData[key].length > 0) {
                            menuData[key].sort().forEach(name => { finalMenuText += `┃  ➤ ${prefix}${name}\n`; });
                        } else { finalMenuText += `┃  ➤ No modules available\n`; }
                    }
                    finalMenuText += `┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━┛`;
                } 
                else {
                    finalMenuText = `📡 ──  *[ YASEEN ALL SYSTEM ]* ── 📡\n\n`;
                    for (const [key, info] of Object.entries(categories)) {
                        if (menuData[key] && menuData[key].length > 0) {
                            finalMenuText += `│ 💠 ${info.title}\n`;
                            menuData[key].sort().forEach(name => { finalMenuText += `│ ├ ▫️ ${prefix}${name}\n`; });
                            finalMenuText += `│\n`;
                        }
                    }
                    finalMenuText += `🌐 ──────────────────────────`;
                }
            } 
            // ====================================================
            // SECTION 2: SINGLE CATEGORY VIEW (.menu ai)
            // ====================================================
            else if (input && categories[input]) {
                const info = categories[input];
                
                if (currentStyle === "3") {
                    finalMenuText = `${info.title.toUpperCase()}\n\n`;
                    if (menuData[input] && menuData[input].length > 0) {
                        menuData[input].sort().forEach(name => { finalMenuText += ` ⚙️ ${name}\n`; });
                    } else { finalMenuText += ` Empty sector\n`; }
                }
                else if (currentStyle === "5" || currentStyle === "6") {
                    finalMenuText = `┌◽▫️ ❖ ${info.title.toUpperCase()} ❖ ▫️◽\n│\n`;
                    if (menuData[input] && menuData[input].length > 0) {
                        menuData[input].sort().forEach(name => { finalMenuText += `│ ⏩ ${name}\n`; });
                    } else { finalMenuText += `│ ⏩ No commands found.\n`; }
                    finalMenuText += `│\n└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽`;
                } 
                else if (currentStyle === "1") {
                    finalMenuText = `┏━━━〔 ${info.title.toUpperCase()} 〕━━━┓\n┃\n`;
                    if (menuData[input] && menuData[input].length > 0) {
                        menuData[input].sort().forEach(name => { finalMenuText += `┃  ➤ ${prefix}${name}\n`; });
                    } else { finalMenuText += `┃  ➤ No modules found.\n`; }
                    finalMenuText += `┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━┛`;
                } 
                else {
                    finalMenuText = `✦ ──────── ${info.title} ──────── ✦\n`;
                    if (menuData[input] && menuData[input].length > 0) {
                        finalMenuText += `\n` + menuData[input].sort().map(n => `• ${prefix}${n}`).join('\n') + `\n`;
                    } else { finalMenuText += `\nSector empty.\n`; }
                    finalMenuText += `\n✦ ──────────────────────── ✦`;
                }
            } 
            // ====================================================
            // SECTION 3: CORE DASHBOARDS (STYLES 1 TO 6)
            // ====================================================
            else {
                if (currentStyle === "1") {
                    finalMenuText = `┏━━━〔 YASEEN-MD CONTROL 〕━━━┓\n`;
                    finalMenuText += `┃\n`;
                    finalMenuText += `┃  👤 User: ${pushname}\n`;
                    finalMenuText += `┃  🕒 Time: ${time}\n`;
                    finalMenuText += `┃  📟 Status: Operational\n`;
                    finalMenuText += `┃  ⚙️ Total: ${files.length} Modules\n`;
                    finalMenuText += `┃\n`;
                    finalMenuText += `┣━━━〔 AVAILABLE SECTORS  〕━━━┫\n┃\n`;
                    for (const [key, info] of Object.entries(categories)) {
                        finalMenuText += `┃  ➤ ${prefix}menu ${key} (${info.title})\n`;
                    }
                    finalMenuText += `┃  ➤ ${prefix}menu all (Full Archive)\n`;
                    finalMenuText += `┃\n`;
                    finalMenuText += `┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
                    finalMenuText += `© 2026 YASEEN Laporte • Operational`;
                } 
                else if (currentStyle === "2") {
                    finalMenuText = `📡 *[ YASEEN-MD DASHBOARD ]* 📡\n`;
                    finalMenuText += `┌─────────────────────────┈\n`;
                    finalMenuText += `│ 👤 Operator: ${pushname}\n`;
                    finalMenuText += `│ ⏰ Sync Time: ${time}\n`;
                    finalMenuText += `│ 🗃️ Database: ${files.length} Scripts\n`;
                    finalMenuText += `└─────────────────────────┈\n\n`;
                    for (const [key, info] of Object.entries(categories)) {
                        finalMenuText += ` ├ ▫️ ${prefix}menu ${key}\n`;
                    }
                    finalMenuText += ` ├ ▫️ ${prefix}menu all\n`;
                    finalMenuText += `└─────────────────────────┈\n`;
                    finalMenuText += `© POWERED BY YASEEN-MD`;
                }
                else if (currentStyle === "3") {
                    finalMenuText = `Yaseen Supreme Menu 💻\n`;
                    finalMenuText += `╔══════════════════════╗\n`;
                    finalMenuText += `┆ 👤 Client: ${pushname}\n`;
                    finalMenuText += `┆ 🕒 Clock: ${time}\n`;
                    finalMenuText += `┆ 🗃️ Storage: ${files.length} Indices\n`;
                    finalMenuText += `╚══════════════════════╝\n\n`;
                    for (const [key, info] of Object.entries(categories)) {
                        finalMenuText += ` ${info.title.toUpperCase()}\n`;
                        finalMenuText += `  └ ⚙️ ${prefix}menu ${key}\n`;
                    }
                    finalMenuText += `  └ ⚙️ ${prefix}menu all\n\n`;
                    finalMenuText += `© yaseen laporte infrastructure`;
                }
                else if (currentStyle === "4") {
                    finalMenuText = `🏮 「 YAS-TECH MAINFRAME 」 🏮\n`;
                    finalMenuText += `===============================\n`;
                    finalMenuText += `🏮 Client: ${pushname}\n`;
                    finalMenuText += `🏮 Clock: ${time}\n`;
                    finalMenuText += `===============================\n\n`;
                    for (const [key, info] of Object.entries(categories)) {
                        finalMenuText += ` ⛩️  ${prefix}menu ${key}\n`;
                    }
                    finalMenuText += ` ⛩️  ${prefix}menu all\n`;
                    finalMenuText += `===============================`;
                }
                else if (currentStyle === "5") {
                    finalMenuText = `┌◽▫️ ❖ YAS-BOT CONTROL ❖ ▫️◽\n`;
                    finalMenuText += `│ 👤 OPERATOR : ${pushname}\n`;
                    finalMenuText += `│ ⏰ SYNC TIME : ${time}\n`;
                    finalMenuText += `│ ⚡ SPEED : ${speedTime} ms\n`;
                    finalMenuText += `│ 📟 STATUS : Operational\n`;
                    finalMenuText += `│ 🗃️ DATABASE : ${files.length} Modules\n`;
                    finalMenuText += `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n`;
                    finalMenuText += `┌◽▫️ ❖ AVAILABLE SECTORS ❖ ▫️◽\n`;
                    for (const [key, info] of Object.entries(categories)) {
                        finalMenuText += `│ ⏩ ${prefix}menu ${key} (${info.title})\n`;
                    }
                    finalMenuText += `│ ⏩ ${prefix}menu all\n`;
                    finalMenuText += `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n`;
                    finalMenuText += `© 2026 YASEEN LAPORTE • SYSTEM`;
                }
                else if (currentStyle === "6") {
                    finalMenuText = `┌◽▫️ ❖ YAS-TECH CONFIG ❖ ▫️◽\n`;
                    finalMenuText += `│ 👑 OWNER : yini mkanji\n`;
                    finalMenuText += `│ ⚙️ PREFIX : [ ${prefix || '@'} ]\n`;
                    finalMenuText += `│ 📊 RAM : [▓▓▓▓▓▓▓░░░] 75%\n`;
                    finalMenuText += `│ ⏳ SPEED : ${speedTime} ms\n`;
                    finalMenuText += `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n`;
                    finalMenuText += `┌◽▫️ ❖ SECTOR FILES ❖ ▫️◽\n`;
                    for (const [key, info] of Object.entries(categories)) {
                        finalMenuText += `│ ⏩ ${prefix}menu ${key}\n`;
                    }
                    finalMenuText += `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽`;
                }
            }

            // Kufunga menu nzima iliyochaguliwa ndani ya mtindo wa Monospace
            const cleanMonospaceMenu = `\`\`\`${finalMenuText}\`\`\``;

            // Kutuma ujumbe wenye picha na maneno tu (HAKUNA ADREPLY)
            await sock.sendMessage(chatId, {
                image: { url: randomImg },
                caption: cleanMonospaceMenu
            }, { quoted: message });

        } catch (err) {
            console.error(err);
        }
    }
};