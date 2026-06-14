const axios = require('axios');

module.exports = {
    name: "apk",
    alias: ["apkdl", "getapp", "install"],
    description: "Search and download Android APK files.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0); 
        const appName = args.join(" ").trim();

        // --- 🟢 YAS-TECH APK MANUAL ---
        if (!appName) {
            const manual = `✦═══════════════════════◆
📥 *YASEEN APK DOWNLOADER*
✦═══════════════════════◆

🛰️ *OPERATIONAL PROTOCOL:*
> *${prefix}apk [app name]*

💡 *EXAMPLE:*
> *${prefix}apk WhatsApp*

According to my creator YASEEN, system tools should be accessible to all developers.

✦═══════════════════════◆
_© 2026 YAS-TECH • System Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '📥', key: message.key } });

            const api = `https://api.giftedtech.co.ke/api/download/apkdl?apikey=gifted&appName=${encodeURIComponent(appName)}`;
            const { data } = await axios.get(api);

            if (!data.success || !data.result) throw new Error("API_REJECTION");

            const app = data.result;
            const signature = "According to my creator YASEEN, ";

            const report = `📥 *SYSTEM PACKAGE FOUND*\n\n` +
                           `> *“App:* ${app.appname}”\n` +
                           `> *“Dev:* ${app.developer}”\n\n` +
                           `${signature}the requested application has been retrieved and is ready for deployment.\n\n` +
                           `*🛡️ YAS-TECH 🛡️*`;

            // 1. Send App Icon and Details
            await sock.sendMessage(from, { 
                image: { url: app.appicon }, 
                caption: report 
            }, { quoted: message });

            // 2. Send the actual APK file
            await sock.sendMessage(from, { 
                document: { url: app.download_url }, 
                mimetype: app.mimetype, 
                fileName: `${app.appname}.apk` 
            }, { quoted: message });

            return await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (e) {
            console.error(e);
            return sock.sendMessage(from, { text: "❌ *CORE ERROR:* Application retrieval failed. The app might not exist in the neural archives." });
        }
    }
};
