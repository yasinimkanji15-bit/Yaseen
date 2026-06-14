module.exports = {
    name: "promote",
    description: "Give a user admin rights.",
    category: "group",

    execute: async (sock, chatId, message) => {
        const contextInfo = message.message?.extendedTextMessage?.contextInfo;
        const target = contextInfo?.mentionedJid?.[0] || contextInfo?.participant;

        if (!target) {
            const manual = `👮 *ＰＲＯＭＯＴＥ ＭＡＮＵＡＬ*\n\nMake someone an admin.\n\n> *Usage:*\n> 1. Reply to a message with \`.promote\`\n> 2. Or \`.promote @user\``;
            return await sock.sendMessage(chatId, { text: manual });
        }

        try {
            await sock.groupParticipantsUpdate(chatId, [target], "promote");

            // Tag the user 
            await sock.sendMessage(chatId, {
                text: `✅ Successfully promoted @${target.split('@')[0]} to admin.`,
                mentions: [target] // This makes the @mention clickable
            });

        } catch (e) {
            console.error("Promote Error:", e);
            await sock.sendMessage(chatId, {
                text: "❌ Failed to promote. Make sure I'm admin and the user is in this group."
            });
        }
    }
};