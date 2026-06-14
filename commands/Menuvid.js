const fs = require('fs');
const path = require('path');

const STYLE_PATH = path.join(__dirname, '../data/menuStyle.json');

// --- DATABASE YA VIDEO ZINAZOBADILIKA KILA MARA (Weka link zako za video za Catbox hapa) ---
const MENU_VIDEOS = [
    "https://files.catbox.moe/qu4682.mp4", // Mfano wa video link kutoka Catbox
    "https://files.catbox.moe/qu4682.mp4"
];

// --- FUNCTION YA KUBADILISHA MAANDISHI KUWA MADOGO ---
function toTinyFont(text) {
    const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const tiny   = "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９";
    
    return text.split('').map(char => {
        const index = normal.indexOf(char);
        return index !== -1 ? tiny[index] : char;
    }).join('');
}

module.exports = {
    name: "menuvid",
    alias: ["helpv", "listv"],
    description: "Tactical dynamic video command center for YAS-TECH",
    category: "main",

    execute: async (sock, chatId, message, args, { pushname, isOwner }) => {
        try {
            const prefix = global.botConfig?.prefix || ".";
            const input = (args[0] || '').toLowerCase();

            await sock.sendMessage(chatId, { react: { text: '📁', key: message.key } });
            
            const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            
            // Kuchagua video random
            const randomVideo = MENU_VIDEOS[Math.floor(Math.random() * MENU_VIDEOS.length)];

            let currentStyle = "3"; 
            if (fs.existsSync(STYLE_PATH)) {
                try {
                    const styleData = JSON.parse(fs.readFileSync(STYLE_PATH));
                    currentStyle = styleData.currentStyle || "3";
                } catch (e) { currentStyle = "3"; }
            }

            const categories = {
                "ai": { emoji: "🤖", title: "AI" },
                "anime": { emoji: "🎬", title: "ANIME" },
                "anime images": { emoji: "🖼", title: "ANIME IMAGES" },
                "automation": { emoji: "⚙️", title: "AUTOMATION" },
                "main": { emoji: "🖥", title: "Main Menu" },
                "owner": { emoji: "👑", title: "System & Owner" },
                "tools": { emoji: "🪛", title: "Cool Tools" },
                "group": { emoji: "👥", title: "Group Tools" },
                "search": { emoji: "🔍", title: "Intelligence & Search" },
                "download": { emoji: "📥", title: "Downloaders" }
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

            if (input === 'all' || !input) {
                finalMenuText += `🥷 *Madrin Supreme Menu*\n`;
                finalMenuText += `🥷 *Madrin 至尊菜单*\n\n`;
                finalMenuText += `我是至尊 https://w.Madrin\n\n`;

                for (const [key, info] of Object.entries(categories)) {
                    if (menuData[key] && menuData[key].length > 0) {
                        finalMenuText += `*${info.title.toUpperCase()}*\n`;
                        menuData[key].sort().forEach(name => {
                            finalMenuText += ` │ ⚙️ ${toTinyFont(name)}\n`;
                        });
                        finalMenuText += `\n`;
                    }
                }
            } else if (input && categories[input]) {
                const info = categories[input];
                finalMenuText += `*${info.title.toUpperCase()}*\n\n`;
                if (menuData[input] && menuData[input].length > 0) {
                    menuData[input].sort().forEach(name => {
                        finalMenuText += ` │ ⚙️ ${toTinyFont(name)}\n`;
                    });
                } else {
                    finalMenuText += ` _Empty sector_\n`;
                }
            }

            // ====================================================
            // KUTUMA VIDEO BADALA YA PICHA
            // ====================================================
            await sock.sendMessage(chatId, {
                video: { url: randomVideo },
                caption: finalMenuText,
                gifPlayback: true // Inafanya video ijicheze yenyewe (loop) kama GIF bila sauti
            }, { quoted: message });

        } catch (err) {
            console.error(err);
        }
    }
};