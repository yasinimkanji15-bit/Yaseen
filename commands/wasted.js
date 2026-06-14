const axios = require('axios');

module.exports = {
    name: "overlay",
    alias: ["passed", "jail", "wanted", "triggered", "wasted", "glass"],
    description: "Apply various neural overlays to a subject's profile.",
    category: "fun",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        
        // --- 🛰️ 1. DYNAMIC TYPE SELECTION ---
        // Uses the command name (or alias) as the effect type
        const body = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text || "";
        const command = body.split(' ')[0].slice(1).toLowerCase(); // Gets 'jail', 'wasted', etc.
        
        // Map common aliases to the API's endpoints
        const effectMap = {
            "wasted": "wasted",
            "passed": "mission-passed",
            "jail": "jail",
            "wanted": "wanted",
            "triggered": "triggered",
            "glass": "glass"
        };
        
        const type = effectMap[command] || "wasted";

        // --- 🎯 2. TARGET IDENTIFICATION ---
        let target;
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            target = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            target = message.message.extendedTextMessage.contextInfo.participant;
        }

        if (!target) {
            const manual = `✦═══════════════════════◆
🎨  *YASEEN  ＣＡＮＶＡＳ  ＮＯＤＥ*
✦═══════════════════════◆
🛰️  *ＯＰＥＲＡＴＩＯＮＡＬ  ＣＯＭＭＡＮＤＳ:*
> *.wasted @user* ➔ Status: Terminated
> *.jail @user* ➔ Status: Incarcerated
> *.wanted @user* ➔ Status: Fugitive
> *.triggered @user* ➔ Status: Unstable
> *.glass @user* ➔ Status: Fractured

🛰️  *ＴＡＳＫ:* Apply neural filter to target.
✦═══════════════════════◆`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🎨', key: message.key } });

            let profilePic;
            try {
                profilePic = await sock.profilePictureUrl(target, 'image');
            } catch {
                profilePic = 'https://i.imgur.com/2wzGhpF.jpeg';
            }

            // --- 🔍 API GENERATION ---
            const apiUrl = `https://some-random-api.com/canvas/overlay/${type}?avatar=${encodeURIComponent(profilePic)}`;
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            const dossier = `🎨 *ＮＥＵＲＡＬ  ＯＶＥＲＬＡＹ*

> *Target:* @${target.split('@')[0]}
> *Filter:* ${type.toUpperCase()}
> *Status:* Rendering Complete

According to my creator YASEEN, the dossier is complete.
*🛡️ YASEEN－ＭＤ 🛡️*`;

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

            return await sock.sendMessage(from, { 
                image: Buffer.from(response.data), 
                caption: dossier,
                mentions: [target]
            }, { quoted: message });

        } catch (e) {
            console.error("CANVAS ERROR:", e.message);
            return sock.sendMessage(from, { text: "❌ *SYSTEM FAILURE:* Could not process neural image." });
        }
    }
};
