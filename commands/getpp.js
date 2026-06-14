module.exports = {
    name: "getpp",
    alias: ["getpic", "profilepic"],
    description: "Fetch a user's profile picture with special modes.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const text = args.join(" ").toLowerCase();
        const isSilent = text.endsWith(' s') || text === 's';
        const isEdit = text.endsWith(' e') || text === 'e';

        // 🟢 INSTRUCTION MANUAL WITH EXAMPLES
        const isReply = !!message.message?.extendedTextMessage?.contextInfo?.participant;
        if (!isReply && !args[0] || args[0] === 'help') {
            const manual = `👤 *Profile Picture Manual*

Fetch high-resolution profile pictures instantly.

✦═════════◆═════════✦

*1. Standard Modes:*
> • \`.getpp\` (Reply to a message)
> • \`.getpp 255xxx...\` (Fetch by number)

*2. Stealth Modes:*
> • \`.getpp s\` - Sends photo to your DMs only.
> • \`.getpp e\` - Sends to DMs and edits your text to 🕶.

✦═════════◆═════════✦

*Examples:*
💡 \`.getpp 255653583366\`
💡 \`.getpp 255653583366 s\`
💡 \`.getpp e\` (while replying to someone)

«.getpp | .getpp e»`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        try {
            let target;
            const cleanArgs = text.replace(/ [se]$| [se]$|^[se]$/i, "").trim();

            // 1. Determine Target
            if (isReply) {
                target = message.message.extendedTextMessage.contextInfo.participant;
            } else if (cleanArgs && !isNaN(cleanArgs.replace(/[^0-9]/g, ''))) {
                target = cleanArgs.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
            } else if (!chatId.endsWith('@g.us')) {
                target = chatId;
            } else {
                target = message.key.participant || message.key.remoteJid;
            }

            // 2. Fetch the Image URL
            let ppUrl;
            try {
                ppUrl = await sock.profilePictureUrl(target, 'image');
            } catch (e) {
                return await sock.sendMessage(chatId, { text: "❌ High-res photo unavailable or hidden by privacy settings." }, { quoted: message });
            }

            // 3. Determine Destination
            const myJid = sock.user.id.split(':')[0] + "@s.whatsapp.net";
            const destination = (isSilent || isEdit) ? myJid : chatId;

            // 4. Send the Picture
            await sock.sendMessage(destination, { 
                image: { url: ppUrl }, 
                caption: `👤 *Profile Picture:* @${target.split('@')[0]}\n*Mode:* ${isEdit ? 'Spy 🕶' : isSilent ? 'Silent 🤫' : 'Public'}`,
                mentions: [target]
            });

            // 5. Handle Feedback
            if (isEdit) {
                await sock.sendMessage(chatId, { 
                    edit: message.key, 
                    text: "🕶" 
                });
            } else if (isSilent) {
                await sock.sendMessage(chatId, { react: { text: '🤫', key: message.key } });
            } else {
                await sock.sendMessage(chatId, { react: { text: '🖼️', key: message.key } });
            }

        } catch (err) {
            console.error("GetPP Error:", err);
            await sock.sendMessage(chatId, { text: "❌ Error: Could not retrieve profile picture." });
        }
    }
};
