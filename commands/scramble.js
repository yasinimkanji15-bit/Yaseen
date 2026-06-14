const axios = require('axios');

// Initialize Global Settings
if (!global.scrambleConfig) global.scrambleConfig = { timer: 60000, label: "60s", rawSeconds: 60 };

module.exports = {
    name: "scramble",
    alias: ["tegua", "wordgame", "scr"],
    description: "Timed scramble game with Owner-Only answers and hints.",
    category: "games",

    execute: async (sock, chatId, message, args, { isOwner, sender }) => {
        if (!global.scrambleAnswer) global.scrambleAnswer = {};
        const action = args[0]?.toLowerCase();

        // 📜 --- THE GHOST MANUAL --- 📜
        if (!action) {
            const manual = `🧩 *YASEEN－ＭＤ  ＳＣＲＡＭＢＬＥ*

> *“Chaos is just order waiting to be deciphered.”*

✦═════════════════════◆
📜 *ＩＮＴＥＬ:*
Status: Active
Current Limit: 【 ${global.scrambleConfig.label} 】
✦═════════════════════◆

*⚙️ ＣＯＮＴＲＯＬＳ:*
• \`.scramble start\` -> Initiate session.
• \`.scramble hint\` -> Reveal 2 letters (-15s penalty).
• \`.scramble rset [time][s/m]\`

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // 🛠️ --- TIMER CONFIGURATION --- 🛠️
        if (action === 'rset' && isOwner) {
            const timeInput = args[1]?.toLowerCase();
            if (!timeInput) return await sock.sendMessage(chatId, { text: "❌ Provide value (e.g. 30s)" });
            const value = parseInt(timeInput);
            const unit = timeInput.slice(-1);

            if (unit === 's') {
                global.scrambleConfig.timer = value * 1000;
                global.scrambleConfig.rawSeconds = value;
                global.scrambleConfig.label = `${value}s`;
            } else if (unit === 'm') {
                global.scrambleConfig.timer = value * 60000;
                global.scrambleConfig.rawSeconds = value * 60;
                global.scrambleConfig.label = `${value}m`;
            }
            return await sock.sendMessage(chatId, { text: `⚙️ *CONFIG UPDATED:* ${global.scrambleConfig.label}` });
        }

        // 💡 --- HINT LOGIC --- 💡
        if (action === 'hint') {
            const word = global.scrambleAnswer[chatId];
            if (!word) return await sock.sendMessage(chatId, { text: "❌ *ERROR:* No active session found." });
            
            // Subtract 15 seconds from the global timer variable (handled in the interval)
            global.scrambleTimeLeft[chatId] -= 15;
            const hintStr = word.slice(0, 2).toUpperCase();

            return await sock.sendMessage(chatId, { 
                text: `💡 *ＨＩＮＴ  ＤＥＰＬＯＹＥＤ*\n\n> *Letters:* \`${hintStr}...\`\n> *Penalty:* -15 Seconds Applied.` 
            }, { quoted: message });
        }

        // 🟢 --- START GAME LOGIC --- 🟢
        if (action === 'start') {
            if (global.scrambleAnswer[chatId]) return await sock.sendMessage(chatId, { text: "⚠️ Decryption in progress." });

            try {
                const res = await axios.get('https://random-word-api.herokuapp.com/word?number=1&length=6');
                const word = res.data[0].toLowerCase();
                const scrambled = word.split('').sort(() => 0.5 - Math.random()).join('');
                
                global.scrambleAnswer[chatId] = word;
                if (!global.scrambleTimeLeft) global.scrambleTimeLeft = {};
                global.scrambleTimeLeft[chatId] = global.scrambleConfig.rawSeconds;

                // 🕵️ --- OWNER BYPASS (DM the Answer) --- 🕵️
                const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                await sock.sendMessage(myNumber, { 
                    text: `🕵️ *ＡＤＭＩＮ  ＩＮＴＥＬ*\n\n> *Game in:* ${chatId.split('@')[0]}\n> *Target Word:* \`${word.toUpperCase()}\`` 
                });

                // Initial Message
                const { key } = await sock.sendMessage(chatId, { 
                    text: `🧩 *ＳＣＲＡＭＢＬＥ  ＤＡＴＡ*\n\n📦 *ＴＡＲＧＥＴ:* \`${scrambled.toUpperCase()}\`\n\n*💡 ＩＮＴＥＬ:* You have **${global.scrambleTimeLeft[chatId]}s** to bypass the lock.\n*🛡️ YASEEN－ＭＤ 🛡️*` 
                }, { quoted: message });

                // ⏲️ --- LIVE COUNTDOWN LOOP --- ⏲️
                let countdown = setInterval(async () => {
                    if (!global.scrambleAnswer[chatId]) {
                        clearInterval(countdown);
                        return;
                    }

                    global.scrambleTimeLeft[chatId] -= 5; 

                    if (global.scrambleTimeLeft[chatId] <= 0) {
                        clearInterval(countdown);
                        if (global.scrambleAnswer[chatId] === word) {
                            delete global.scrambleAnswer[chatId];
                            await sock.sendMessage(chatId, { 
                                edit: key, 
                                text: `⏰ *ＴＩＭＥ  ＥＸＰＩＲＥＤ*\n\n> *The link has been severed.*\n> *Correct word:* \`${word.toUpperCase()}\`\n\n*🛡️ YASEEN－ＭＤ 🛡️*` 
                            });
                        }
                    } else {
                        const header = global.scrambleTimeLeft[chatId] <= 15 ? "🚨 *ＣＲＩＴＩＣＡＬ  ＡＬＥＲＴ*" : "🧩 *ＳＣＲＡＭＢＬＥ  ＤＡＴＡ*";
                        const hint = global.scrambleTimeLeft[chatId] <= 15 ? "⚠️ *ＳＹＳＴＥＭ  ＣＯＭＰＲＯＭＩＳＥ  ＩＭＭＩＮＥＮＴ*" : `💡 *ＩＮＴＥＬ:* You have **${global.scrambleTimeLeft[chatId]}s** remaining...`;

                        await sock.sendMessage(chatId, { 
                            edit: key, 
                            text: `${header}\n\n📦 *ＴＡＲＧＥＴ:* \`${scrambled.toUpperCase()}\`\n\n${hint}\n*🛡️ YASEEN－ＭＤ 🛡️*` 
                        });
                    }
                }, 5000); 

            } catch (err) {
                return await sock.sendMessage(chatId, { text: "❌ *LINK FAILURE*" });
            }
        }
    }
};
