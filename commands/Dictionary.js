const axios = require('axios');

module.exports = {
    name: "dictionary",
    alias: ["dict", "meaning", "kamusi"],
    description: "Searches for the definition and meaning of an English word.",
    category: "search",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;
        const query = args.join(" ");

        if (!query) {
            await sock.sendMessage(from, { react: { text: '⚠️', key: msg.key } });
            return sock.sendMessage(from, { text: "*Please provide a word to search.*\nExample: .dictionary resilience" }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { react: { text: '📖', key: msg.key } });

            // Kutumia Free Dictionary API - Bure na haina haja ya Key
            const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`;
            const response = await axios.get(apiUrl);
            
            const wordData = response.data?.[0];

            if (!wordData) {
                await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
                return sock.sendMessage(from, { text: `❌ Word "${query}" not found.` }, { quoted: msg });
            }

            const word = wordData.word;
            const phonetic = wordData.phonetic || '';
            
            // Kuchukua maana ya kwanza kabisa inayopatikana
            const meaningInfo = wordData.meanings?.[0];
            const partOfSpeech = meaningInfo?.partOfSpeech || 'N/A';
            const definition = meaningInfo?.definitions?.[0]?.definition || 'No definition available.';
            const example = meaningInfo?.definitions?.[0]?.example ? `\n💬 *Example:* _"${meaningInfo.definitions[0].example}"_` : '';

            const dictionaryText = `🔤 *Word:* ${word} ${phonetic}\n` +
                `⚙️ *Part of Speech:* ${partOfSpeech}\n\n` +
                `📖 *Definition:* ${definition}${example}`;

            await sock.sendMessage(from, { react: { text: '🟢', key: msg.key } });
            await sock.sendMessage(from, { text: dictionaryText }, { quoted: msg });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            return sock.sendMessage(from, { text: `❌ Error: Word "${query}" not found or API issue.` }, { quoted: msg });
        }
    }
};