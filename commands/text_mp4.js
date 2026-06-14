const axios = require('axios');

// 🧠 Persistent session settings with YASEEN Defaults
let imgSettings = {
    background: "black",
    color: "white"
};

module.exports = {
    name: "textimg",
    alias: ["texttoimage", "t2i", "image"],
    description: "Synthesize static images from raw text data.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const action = args[0]?.toLowerCase();

        // --- 🟢 YASEEN－ＭＤ  ＶＩＳＵＡＬ  ＭＡＮＵＡＬ ---
        if (!args[0]) {
            const manual = `✦═══════════════════════◆\n🖼️  *YASEEN  ＴＥＸＴ－ＩＭＡＧＥ*\n✦═══════════════════════◆\n\n🛰️  *ＯＰＥＲＡＴＩＯＮＡＬ  ＣＯＭＭＡＮＤＳ:*\n> *${prefix}textimg [text]* ➔ Generate Image\n> *${prefix}textimg setbg [color]* ➔ Set BG\n> *${prefix}textimg setcolor [color]* ➔ Set Text\n\n⚙️  *ＣＯＮＦＩＧ:* ${imgSettings.background} | ${imgSettings.color}\n\n✦═══════════════════════◆\n_© 2026 YAS-TECH • Visual Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        // --- 🛠️ SETTINGS HANDLER ---
        if (action === "setbg") {
            imgSettings.background = args[1] || "black";
            return sock.sendMessage(from, { text: `✅ *SYSTEM:* BG set to _${imgSettings.background}_` });
        }
        if (action === "setcolor") {
            imgSettings.color = args[1] || "white";
            return sock.sendMessage(from, { text: `✅ *SYSTEM:* Color set to _${imgSettings.color}_` });
        }

        // --- 🚀 IMAGE GENERATION ---
        try {
            await sock.sendMessage(from, { react: { text: '🎨', key: message.key } });

            const textInput = args.join(" ");
            
            // 🛠️ FIXED URL CONSTRUCTION
            // We remove the "?" from the parameter names as the API usually wants "background=" not "background?="
            const apiURL = `https://apis.prexzyvilla.site/imagecreator/image?text=${encodeURIComponent(textInput)}&background=${imgSettings.background}&color=${imgSettings.color}`;

            // 🛡️ CAPTION WITH FORCED SIGNATURE
            const caption = `🖼️ *YASEEN  ＶＩＳＵＡＬ  ＩＮＴＥＬ*\n\nAccording to my creator YASEEN, the following sequence has been synthesized into an image.\n\n> 📍 *Source:* ${textInput}\n*🛡️ YASEEN－ＭＤ 🛡️*`;

            // 🚀 Send the Image
            await sock.sendMessage(from, { 
                image: { url: apiURL }, 
                caption: caption
            }, { quoted: message });

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error("Image Error:", err.message);
            await sock.sendMessage(from, { react: { text: '❌', key: message.key } });
            
            // Detailed error feedback
            const errorMsg = err.response?.status === 500 
                ? "❌ *CORE ERROR:* The image server is rejecting these parameters. Try different colors."
                : `❌ *CORE ERROR:* Connection failed. Server might be down.`;

            await sock.sendMessage(from, { text: errorMsg }, { quoted: message });
        }
    }
};
