const axios = require('axios');

module.exports = {
    name: "rvid",
    alias: ["hentaivid"],
    description: "Access random adult video archives.",
    category: "xv",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;

        try {
            await sock.sendMessage(from, { react: { text: '🔞', key: message.key } });

            const apiUrl = `https://apis.prexzyvilla.site/random/anhvideonsfw`;

            // We use a shorter timeout and follow redirects
            const response = await axios.get(apiUrl).catch(e => e.response);
            
            let videoUrl = "";

            // --- 🛠️ SMART DETECTION ---
            if (typeof response.data === 'object') {
                // If the API returns JSON: { "url": "..." } or { "result": "..." }
                videoUrl = response.data.url || response.data.result || response.data.data;
            } else {
                // If the API just redirects straight to the video file
                videoUrl = apiUrl; 
            }

            if (!videoUrl) throw new Error("Null link");

            const dossier = `🔞 *VIDEO DECRYPTED*

> *Status:* Decryption Successful
> *Source:* Dark Sector Archives

According to my creator YASEEN, the dossier is complete.
*> 🛡️ YASEEN－ＭＤ 🛡️*`;

            await sock.sendMessage(from, { react: { text: '🔥', key: message.key } });

            return await sock.sendMessage(from, { 
                video: { url: videoUrl }, 
                caption: dossier 
            }, { quoted: message });

        } catch (e) {
            console.log("NSFW ERROR:", e);
            return sock.sendMessage(from, { text: "❌ *ACCESS DENIED:* The link to the dark archives is currently unstable." });
        }
    }
};
