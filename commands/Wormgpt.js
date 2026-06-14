const axios = require('axios');

module.exports = {
    name: "wormgpt",
    alias: ["worm", "blackhat", "hackgpt"],
    description: "Uncensored dark-net AI engine powered by MadrinsAPI.",
    category: "ai",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;
        const query = args.join(" ");

        // 1. If no query is provided, show the technical usage dashboard
        if (!query) {
            const usageText = `┌◽▫️ ❖ *WORMGPT INTELLIGENCE* ❖ ▫️◽\n` +
                `│ ❌ *Error:* Missing Query Input!\n` +
                `│\n` +
                `│ 📝 *Usage:* \n` +
                `│ ⏩ \`wormgpt how to secure a server\`\n` +
                `│ ⏩ \`wormgpt write a python keylogger explanation\`\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n` +
                `*© YASEEN-MD CYBER CORE*`;
            return sock.sendMessage(from, { text: usageText }, { quoted: msg });
        }

        try {
            // Set terminal loading reaction
            await sock.sendMessage(from, { react: { text: '💻', key: msg.key } });

            // 2. Querying your official MadrinsAPI endpoint
            const apiUrl = `https://madrinsapi.vercel.app/ai/wormgpt?prompt=${encodeURIComponent(query)}`;
            const response = await axios.get(apiUrl);
            
            // Extract the result based on your JSON structure: data -> result -> response
            let aiResponse = response.data?.result?.response;

            if (!aiResponse) throw new Error("Empty mainframe matrix response.");

            // 3. Cyber Tree-Structure Layout Box Format (Matching Style 5 & 6)
            const finalPayload = `┌◽▫️ ❖ *WORMGPT TERMINAL v2.5* ❖ ▫️◽\n` +
                `│ 💻 *QUERIED BY:* Dark Operator\n` +
                `│ 📡 *UPLINK:* yaseen.vercel.app\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n` +
                `${aiResponse}\n\n` +
                `┌◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n` +
                `*© 2026 YASEEN LAPORTE • OPERATIONAL*`;

            // 4. Send the response back to the WhatsApp chat
            await sock.sendMessage(from, { text: finalPayload }, { quoted: msg });
            await sock.sendMessage(from, { react: { text: '🟢', key: msg.key } });

        } catch (error) {
            console.error("WormGPT Core Error:", error.message);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            
            const errorCaption = `┌◽▫️ ❖ *WORMGPT SYSTEM FAILURE* ❖ ▫️◽\n` +
                `│ ❌ *Status:* Decryption Failed\n` +
                `│ ⚠️ *Reason:* Vercel host timeout or invalid query structure.\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽`;
            return sock.sendMessage(from, { text: errorCaption }, { quoted: msg });
        }
    }
};