const axios = require('axios');

module.exports = {
    name: "wordchain",
    alias: ["wc", "wordgame", "chain"],
    description: "Start a word chain game using only valid English words.",
    category: "games",

    execute: async (sock, chatId, message, args) => {
        const action = args[0]?.toLowerCase();

        // 📜 --- THE MANUAL (.wordchain) --- 📜
        if (!action) {
            const manual = `🎮 *YASEEN－ＭＤ  ＷＯＲＤ－ＣＨＡＩＮ*

> *“Language is the blood of the soul into which thoughts run and out of which they grow.”*

✦═════════════════════◆
📜 *ＩＮＴＥＬ:*
Connect English words by their letters. The next word must start with the letter the previous word ended with. 
⚠️ *ＮＯＴＥ:* Only valid English words are accepted.
✦═════════════════════◆

*⚙️ ＣＯＮＴＲＯＬＳ:*
• \`.wc start [word]\` -> Begin a new chain.
• \`.wc stop\` -> End the session.

*🛡️YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        if (!global.wordchain) global.wordchain = {};

        // 🟢 START GAME
        if (action === 'start') {
            const word = args[1]?.toLowerCase();
            if (!word) return sock.sendMessage(chatId, { text: "❌ *Provide a starting English word!*" });

            // Validate if the starting word is English
            try {
                const check = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                if (check.data) {
                    global.wordchain[chatId] = {
                        active: true,
                        lastWord: word,
                        lastLetter: word.slice(-1),
                    };
                    await sock.sendMessage(chatId, { 
                        text: `🎮 *GAME STARTED*\n\n> *Word:* ${word.toUpperCase()}\n> *Next starts with:* 【 ${word.slice(-1).toUpperCase()} 】` 
                    }, { quoted: message });
                }
            } catch (e) {
                return sock.sendMessage(chatId, { text: `❌ *"${word.toUpperCase()}" is not a valid English word.*` });
            }
        }

        // 🔴 STOP GAME
        if (action === 'stop') {
            delete global.wordchain[chatId];
            await sock.sendMessage(chatId, { text: "🏁 *Word Chain has been terminated.*" });
        }
    }
};
