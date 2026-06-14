module.exports = {
    name: "inspect",
    alias: ["ginfo", "checkgroup", "searchgroup","findgc","group"],
    description: "Inspects and fetches basic WhatsApp group details using an invite link without joining.",
    category: "search",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;
        
        // 1. CHAGUA NJIA YA KUPATA TEXT (Kutoka kwenye args au kwenye Reply message)
        let text = args.join(" ");
        
        // Kama mtumiaji amereply ujumbe, angalia kama kuna text kwenye huo ujumbe ulioreplywa
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quotedMessage) {
            const quotedText = quotedMessage.conversation || 
                               quotedMessage.extendedTextMessage?.text || 
                               quotedMessage.imageMessage?.caption || 
                               quotedMessage.videoMessage?.caption || "";
            
            // Kama args ziko tupu lakini kwenye reply kuna text, tumia ya kwenye reply
            if (!text && quotedText) {
                text = quotedText;
            }
        }

        // 2. KAMA HAKUNA LINK KIKAMILIFU, BOT INAMUULIZA MTUMIAJI
        if (!text || !text.includes("chat.whatsapp.com")) {
            await sock.sendMessage(from, { react: { text: '❓', key: msg.key } });
            return sock.sendMessage(from, { text: "Which group do you want me to inspect? Please provide a WhatsApp group invite link." }, { quoted: msg });
        }

        // 3. Kuchuja na kuchukua msimbo (code) wa link pekee kutoka kwenye text
        const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;
        const match = text.match(linkRegex);

        if (!match) {
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            return sock.sendMessage(from, { text: "*❌ Invalid Link:* Please provide a valid WhatsApp group invite link." }, { quoted: msg });
        }

        const groupCode = match[1];

        try {
            await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } });

            // 4. Fetching group metadata from Baileys without joining
            const groupMetadata = await sock.groupGetInviteInfo(groupCode);

            if (!groupMetadata) throw new Error("Could not fetch metadata.");

            // Extracting details
            const gId = groupMetadata.id;
            const gSubject = groupMetadata.subject;
            const gCreator = groupMetadata.owner || groupMetadata.creator || "Unknown";
            const gCreationTime = groupMetadata.creation ? new Date(groupMetadata.creation * 1000).toLocaleString('en-GB') : "Unknown";
            const gSize = groupMetadata.size || groupMetadata.participants?.length || "0";
            const gDesc = groupMetadata.desc || "No description available.";

            let reportText = `📊 *WHATSAPP GROUP INSPECTOR* 📊\n\n` +
                `📝 *Name:* ${gSubject}\n` +
                `🆔 *Group ID:* ${gId}\n` +
                `👑 *Creator:* @${gCreator.split('@')[0]}\n` +
                `📅 *Created On:* ${gCreationTime}\n` +
                `👥 *Total Members:* ${gSize} participants\n\n` +
                `📑 *Description:* \n${gDesc}`;

            // Attempt to fetch group profile picture
            let profilePicUrl;
            try {
                profilePicUrl = await sock.profilePictureUrl(gId, 'image');
            } catch (e) {
                profilePicUrl = null;
            }

            await sock.sendMessage(from, { react: { text: '🟢', key: msg.key } });

            if (profilePicUrl) {
                await sock.sendMessage(from, { 
                    image: { url: profilePicUrl }, 
                    caption: reportText,
                    mentions: [gCreator]
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { 
                    text: reportText,
                    mentions: [gCreator]
                }, { quoted: msg });
            }

        } catch (error) {
            console.error("Group Inspect Error:", error);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            return sock.sendMessage(from, { text: `❌ *Error:* Failed to inspect the group. The link might be revoked, or the group does not exist anymore.` }, { quoted: msg });
        }
    }
};