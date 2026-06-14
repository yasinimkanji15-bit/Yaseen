const axios = require('axios');

module.exports = {
    name: "jaila",
    alias: ["arrest", "prison"],
    description: "Incarcerate a user visually and restrict their access.",
    category: "image",

    execute: async (sock, chatId, message, args) => {
        const msg = message.message;
        const quoted = msg?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedParticipant = msg?.extendedTextMessage?.contextInfo?.participant;
        const mentioned = msg?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        // 🎯 --- TARGET IDENTIFICATION LOGIC ---
        let target;
        if (quotedParticipant) {
            target = quotedParticipant; // By Reply
        } else if (mentioned) {
            target = mentioned; // By @Tag
        } else if (args[0] && args[0].length > 5) {
            // By Number (handles 255780309253 or +255...)
            target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        }

        // 📜 --- THE GHOST MANUAL (If no target found) --- 📜
        if (!target) {
            const manual = `⛓️ *YASEEN－ＭＤ  ＪＡＩＬ*

> *“Escape is an illusion; the bars are digital.”*

✦═════════════════════◆
📜 *ＩＮＴＥＬ:*
This protocol overlays prison bars on a target's profile and flags them.
✦═════════════════════◆

*⚙️ ＣＯＮＴＲＯＬＳ:*
• Reply to a message with \`.jail\`
• \`.jail @user\` -> Tagged arrest.
• \`.jail 255xxxxxxxxx\` -> Direct ID arrest.

*🔐 YASEEN－ＭＤ 🔐*`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '⚖️', key: message.key } });

            // 📸 --- PROFILE PICTURE FETCH ---
            let ppUrl;
            try {
                ppUrl = await sock.profilePictureUrl(target, 'image');
            } catch (e) {
                // Fallback to the PopCat default if PP is hidden
                ppUrl = "https://cdn.popcat.xyz/popcat.png"; 
            }

            // 🛠️ --- GENERATE JAILED IMAGE ---
            const jailedImg = `https://api.popcat.xyz/v2/jail?image=${encodeURIComponent(ppUrl)}`;

            // 📝 --- THE SENTENCING REPORT ---
            const report = `⚖️ *ＪＵＳＴＩＣＥ  ＳＹＳＴＥＭ*

> *“The law of the YAS-TECH is absolute.”*

*🔐 YASEEN－ＭＤ 🔐*`;

            // 🚀 --- DISPATCH TO CHAT ---
            await sock.sendMessage(chatId, { 
                image: { url: jailedImg }, 
                caption: report,
                mentions: [target]
            }, { quoted: message });

            // 💾 --- OPTIONAL: ADD TO JAIL LIST ---
            if (!global.jailList) global.jailList = [];
            if (!global.jailList.includes(target)) global.jailList.push(target);

        } catch (err) {
            console.error(err);
            await sock.sendMessage(chatId, { text: "❌ *SYSTEM ERROR:* Detention center unreachable." });
        }
    }
};
