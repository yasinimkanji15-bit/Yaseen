const axios = require('axios');

module.exports = {
    name: "wanted",
    alias: ["outlaw", "prison"],
    description: "Create a Wanted poster for yourself or a friend.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // 🛠️ TARGET LOGIC
        let targetUser = message.message?.extendedTextMessage?.contextInfo?.participant || 
                         message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                         message.key.participant || chatId;

        // 📜 --- MANUAL --- 📜
        // Shows if user just types the command without tagging/quoting
        if (!quoted && !args[0] && !message.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            const manual = `✦═════════◆═════════✦
💰  *ＷＡＮＴＥＤ  ＰＯＳＴＥＲ* 💰
✦═════════◆═════════✦

📖  *ＤＥＳＣＲＩＰＴＩＯＮ:*
Generate a 'Dead or Alive' poster for a user.

🛰️  *ＵＳＡＧＥ:*
> 1️⃣  *${prefix}wanted* (Self)
> 2️⃣  *${prefix}wanted @user* (Tag)
> 3️⃣  Reply to a message with *${prefix}wanted*

💡  *ＡＩ  ＷＩＳＤＯＭ:*
> _"Every saint has a past, and every sinner has a future."_

✦═════════◆═════════✦
_© 2026 YAS-TECH • Prank Node_`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '🤠', key: message.key } });

            // Fetch Profile Picture
            let pfpUrl;
            try {
                pfpUrl = await sock.profilePictureUrl(targetUser, 'image');
            } catch {
                pfpUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';
            }

            const wantedApi = `https://api.popcat.xyz/v2/wanted?image=${encodeURIComponent(pfpUrl)}`;

            const caption = `✦═════════◆═════════✦
💰  *ＷＡＮＴＥＤ  ＰＯＳＴＥＲ*
✦═════════◆═════════✦

👤 *Criminal:* @${targetUser.split('@')[0]}
💵 *Reward:* $1,000,000
⚖️ *Status:* Wanted Dead or Alive

💡 *ＡＩ  ＷＩＳＤＯＭ:*
> _"The law is a fortress, but even fortresses have shadows."_

✦═════════◆═════════✦
_© 2026 YAS-TECH • Powered by Popcat_`;

            return await sock.sendMessage(chatId, { 
                image: { url: wantedApi }, 
                caption: caption,
                mentions: [targetUser]
            }, { quoted: message });

        } catch (error) {
            console.error(error);
            return await sock.sendMessage(chatId, { text: "⚠️ *Error:* Poster generation failed." }, { quoted: message });
        }
    }
};
