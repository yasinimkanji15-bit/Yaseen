const axios = require('axios');

module.exports = {
    name: "dalle",
    alias: ["dall", "generateimg", "text2img"],
    description: "Generates AI images based on text prompts using DALL-E.",
    category: "ai",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;
        const query = args.join(" ");

        // 1. If no prompt query is provided, show the technical usage dashboard
        if (!query) {
            const usageText = `┌◽▫️ ❖ *DALL-E IMAGE GENERATOR* ❖ ▫️◽\n` +
                `│ ❌ *Error:* Missing Visual Blueprint Prompt!\n` +
                `│\n` +
                `│ 📝 *Usage Instructions:* \n` +
                `│ ⏩ \`dalle a futuristic neon city under the ocean\`\n` +
                `│ ⏩ \`dalle highly detailed anime character cyber-punk style\`\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n` +
                `*© YASEEN-MD CYBER CORE*`;
            
            await sock.sendMessage(from, { react: { text: '⚠️', key: msg.key } });
            return sock.sendMessage(from, { text: usageText }, { quoted: msg });
        }

        try {
            // Set terminal loading reaction
            await sock.sendMessage(from, { react: { text: '🎨', key: msg.key } });

            // 2. Querying the Xwolf DALL-E endpoint with your specific API key
            const apiKey = 'wxa_f_148271fcd7';
            const apiUrl = `https://apis.xwolf.space/api/ai/image/dall-e?key=${apiKey}&prompt=${encodeURIComponent(query)}`;
            
            const response = await axios.get(apiUrl);
            
            // Extract the image link based on standard API matrix response structures
            // (Usually found in response.data.result, response.data.url, or response.data.data)
            let generatedImageUrl = response.data?.result || response.data?.url || response.data?.data;

            // Alternative check: If the API returns a direct string or binary image directly, or another wrapper
            if (!generatedImageUrl && response.status === 200) {
                // If response itself is a URL string
                if (typeof response.data === 'string' && response.data.startsWith('http')) {
                    generatedImageUrl = response.data;
                }
            }

            if (!generatedImageUrl) throw new Error("Empty image matrix response.");

            // 3. Cyber Tree-Structure Layout Box Format for Caption
            const finalCaption = `┌◽▫️ ❖ *DALL-E FRAME GENERATION* ❖ ▫️◽\n` +
                `│ 💻 *OPERATOR:* Dark Developer\n` +
                `│ 📡 *UPLINK:* apis.xwolf.space\n` +
                `│ 📝 *PROMPT:* ${query}\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n` +
                `*© 2026 YASEEN LAPORTE • OPERATIONAL*`;

            // 4. Send success reaction and the final generated image
            await sock.sendMessage(from, { react: { text: '🟢', key: msg.key } });
            await sock.sendMessage(from, { 
                image: { url: generatedImageUrl }, 
                caption: finalCaption 
            }, { quoted: msg });

        } catch (error) {
            console.error("DALL-E Core Error:", error.message);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            
            const errorCaption = `┌◽▫️ ❖ *DALL-E SYSTEM FAILURE* ❖ ▫️◽\n` +
                `│ ❌ *Status:* Rendering Pipeline Failed\n` +
                `│ ⚠️ *Reason:* Host endpoint timeout or invalid API key authentication.\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽`;
            return sock.sendMessage(from, { text: errorCaption }, { quoted: msg });
        }
    }
};