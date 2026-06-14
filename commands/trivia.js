const axios = require('axios');

module.exports = {
    name: "trivia",
    description: "General knowledge quiz.",
    category: "games",

    execute: async (sock, chatId, message, args) => {
        if (args[0] === 'help') {
            return await sock.sendMessage(chatId, { text: ">💡 *Trivia Manual*\n\nType \`.trivia\` to get a question. The answer is hidden in a spoiler!" });
        }

        try {
            const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
            const data = res.data.results[0];
            
            const text = `> 💡 *TRIVIA QUIZ*\n\n*Category:* ${data.category}\n*Question:* ${data.question}\n\n*Answer:* ||${data.correct_answer}||`;
            await sock.sendMessage(chatId, { text }, { quoted: message });
        } catch {
            await sock.sendMessage(chatId, { text: "❌ Error fetching trivia." });
        }
    }
};
