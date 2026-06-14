
const axios = require('axios');

if (!global.gameCache) global.gameCache = {};

module.exports = {
    name: "puzzle",
    alias: ["quiz", "guess"],
    description: "Brainrot/Quiz puzzle game with DM hints.",
    category: "games",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const sender = message.key.participant || message.key.remoteJid;
        const prefix = ".";
        const levelInput = args[0];

        // --- 🟢 1. OPERATIONAL MANUAL ---
        if (!levelInput && !global.gameCache[from]) {
            const manual = `✦═══════════════════════◆
🎮  *YASEEN  ＰＵＺＺＬＥ  ＮＯＤＥ*
✦═══════════════════════◆
🕹️  *ＨＯＷ  ＴＯ  ＰＬＡＹ:*
> 1. Type *${prefix}puzzle [level]* to start.
> 2. Analyze the transmitted image.
> 3. Reply to the image with the correct name.

🛰️  *ＣＯＭＭＡＮＤＳ:*
> *${prefix}puzzle 5* ➔ Level 5 Protocol
> *${prefix}puzzle random* ➔ Random Level
✦═══════════════════════◆`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        if (global.gameCache[from]) {
            return sock.sendMessage(from, { text: "⚠️ *SESSION ACTIVE:* Solve the current puzzle first." });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🧩', key: message.key } });

            const level = (levelInput === 'random') ? Math.floor(Math.random() * 20) + 1 : (parseInt(levelInput) || 1);
            const { data: res } = await axios.get(`https://apis.prexzyvilla.site/game/quizpuzzle?level=${level}`);

            if (!res.status || !res.data) throw new Error();

            const puzzle = res.data[Math.floor(Math.random() * res.data.length)];
            const rawAnswer = puzzle.answer[0];
            const cleanAnswer = rawAnswer.toLowerCase().trim();

            // --- 🕵️‍♂️ 2. THE SECRET DM HINT ---
            // Sends the answer to the person who started the game
            await sock.sendMessage(sender, { 
                text: `🤫 *ＰＵＺＺＬＥ  ＨＩＮＴ  (ADMIN ONLY)*\n\n> *Target:* ${rawAnswer}\n> *Level:* ${level}\n\nDon't leak it too fast, bro.` 
            });

            const dossier = `🧩 *ＮＥＵＲＡＬ  ＰＵＺＺＬＥ  ＩＮＴＥＲＦＡＣＥ*

> *Level:* ${res.level}
> *Time:* ${puzzle.timer} Seconds
> *Task:* Identify the subject.

💡 *Hint:* reply with your answer on this message
*🛡️ YASEEN－ＭＤ 🛡️*`;

            // --- 📥 3. SET GAME STATE ---
            global.gameCache[from] = {
                answer: cleanAnswer,
                timeout: setTimeout(() => {
                    if (global.gameCache[from]) {
                        sock.sendMessage(from, { text: `⏰ *ＴＩＭＥ  ＯＵＴ* \n\nTarget identification failed. \nCorrect Answer: *${rawAnswer}*` });
                        delete global.gameCache[from];
                    }
                }, puzzle.timer * 1000)
            };

            return await sock.sendMessage(from, { 
                image: { url: puzzle.image }, 
                caption: dossier 
            }, { quoted: message });

        } catch (e) {
            console.log(e);
            return sock.sendMessage(from, { text: "❌ *SYSTEM ERROR:* Failed to initialize neural game link." });
        }
    }
};
