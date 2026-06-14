const axios = require('axios');

module.exports = {
    name: "ads",
    alias: ["advert", "billboard"],
    description: "Supports numbers with spaces and plus signs.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const prefix = message.message?.conversation?.charAt(0) || "/";
        const quoted = message.message?.extendedTextMessage?.contextInfo;
        
        // 🛠️ SMART SANITIZER: Combine all args and remove anything that isn't a number
        const fullInput = args.join(""); 
        const cleanNumber = fullInput.replace(/[^0-9]/g, ''); 

        let targetUser;

        // 🎯 TARGET LOGIC
        if (cleanNumber && cleanNumber.length > 8) {
            // Now works for "+255 617..." because cleanNumber is "255617..."
            targetUser = `${cleanNumber}@s.whatsapp.net`;
        } else if (quoted?.participant) {
            targetUser = quoted.participant;
        } else if (quoted?.mentionedJid?.[0]) {
            targetUser = quoted.mentionedJid[0];
        } else {
            targetUser = message.key.participant || chatId;
        }

        // 📜 --- MANUAL --- 📜
        if (!args[0] && !quoted) {
            const manual = `✦═════════◆═════════✦
🏢  *ＡＤ  ＧＥＮＥＲＡＴＯＲ* 🏢
✦═════════◆═════════✦

🛰️  *ＵＳＡＧＥ:*
> 1️⃣  ${prefix}ads (Self)
> 2️⃣  ${prefix}ads @user* (Tag) or reply to a message
> 3️⃣  ${prefix}ads +255 617...* (Number)

💡  *ＡＩ  ＷＩＳＤＯＭ:*
> _"Clean data is the key to a clean result."_

✦═════════◆═════════✦
_© 2026 YAS-TECH • Fun Node_`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '🏢', key: message.key } });

            let pfpUrl;
            try {
                pfpUrl = await sock.profilePictureUrl(targetUser, 'image');
            } catch {
                pfpUrl = 'https://cdn.popcat.xyz/avatar.png';
            }

            const adApi = `https://api.popcat.xyz/v2/ad?image=${encodeURIComponent(pfpUrl)}`;

            const caption = `✦═════════◆═════════✦
🏢  *ＳＴＲＥＥＴ  ＡＤＶＥＲＴ*
✦═════════◆═════════✦

💡 *ＡＩ  ＷＩＳＤＯＭ:*
> _"True power lies in the ability to be seen by everyone."_

✦═════════◆═════════✦
_© 2026 YAS-TECH `;

            return await sock.sendMessage(chatId, { 
                image: { url: adApi }, 
                caption: caption,
                mentions: [targetUser]
            }, { quoted: message });

        } catch (error) {
            console.error("AD ERROR:", error.message);
            return await sock.sendMessage(chatId, { text: "⚠️ *System Error:* Failed to reach the billboard server." });
        }
    }
};
