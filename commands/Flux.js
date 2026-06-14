const axios = require('axios');

module.exports = {
    name: "flux",
    alias: ["fluxai", "generateflux"],
    description: "Generates high-quality AI images using NVIDIA Flux.",
    category: "ai",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;
        const query = args.join(" ");

        if (!query) {
            await sock.sendMessage(from, { react: { text: '⚠️', key: msg.key } });
            return sock.sendMessage(from, { text: "*Please provide a prompt for Flux.*\nExample: .flux a neon futuristic wolf" }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🎨', key: msg.key } });

            const apiKey = 'wxa_f_148271fcd7';
            const apiUrl = `https://apis.xwolf.space/api/nvidia/flux?prompt=${encodeURIComponent(query)}&key=${apiKey}`;
            
            const response = await axios.get(apiUrl);
            let generatedImageUrl = response.data?.result || response.data?.url || response.data?.data;

            if (!generatedImageUrl && response.status === 200) {
                if (typeof response.data === 'string' && response.data.startsWith('http')) {
                    generatedImageUrl = response.data;
                }
            }

            if (!generatedImageUrl) throw new Error("Empty image response");

            await sock.sendMessage(from, { react: { text: '🟢', key: msg.key } });
            
            // Inatuma picha moja kwa moja ikiwa na caption fupi sana
            await sock.sendMessage(from, { 
                image: { url: generatedImageUrl }, 
                caption: `✨ *Prompt:* ${query}` 
            }, { quoted: msg });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            return sock.sendMessage(from, { text: "❌ Error: Failed to generate Flux image." }, { quoted: msg });
        }
    }
};