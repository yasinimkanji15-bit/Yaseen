const axios = require('axios');

module.exports = {
    name: "enhance",
    alias: ["promptenhance", "improve", "hdprompt"],
    description: "Enhances simple text prompts into detailed AI art blueprints.",
    category: "ai",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;
        const query = args.join(" ");

        if (!query) {
            await sock.sendMessage(from, { react: { text: '⚠️', key: msg.key } });
            return sock.sendMessage(from, { text: "*Please provide a prompt to enhance.*\nExample: .enhance a wolf in a city" }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { react: { text: '⚙️', key: msg.key } });

            const apiKey = 'wxa_f_148271fcd7';
            const apiUrl = `https://apis.xwolf.space/api/ai/tools/prompt-enhance?prompt=${encodeURIComponent(query)}&key=${apiKey}`;
            
            const response = await axios.get(apiUrl);
            let enhancedPrompt = response.data?.result || response.data?.enhanced || response.data?.data || response.data;

            if (!enhancedPrompt) throw new Error("Empty response");

            await sock.sendMessage(from, { react: { text: '🟢', key: msg.key } });
            // Inatuma jibu la maneno tu bila mapambo marefu
            await sock.sendMessage(from, { text: enhancedPrompt }, { quoted: msg });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            return sock.sendMessage(from, { text: "❌ Error: Failed to enhance prompt." }, { quoted: msg });
        }
    }
};