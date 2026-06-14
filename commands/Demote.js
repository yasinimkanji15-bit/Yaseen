module.exports = {
    name: "demote",
    description: "Remove admin rights from a user.",
    category: "group",

    execute: async (sock, chatId, message) => {
        const contextInfo = message.message?.extendedTextMessage?.contextInfo;
        const target = contextInfo?.mentionedJid?.[0] || contextInfo?.participant;

        if (!target) {
            const manual = `📉 *ＤＥＭＯＴＥ ＭＡＮＵＡＬ*\n\nRemove admin status.\n\n> *Usage:*\n> 1. Reply to an admin's message with \`.demote\`\n> 2. Or \`.demote @user\``;
            return await sock.sendMessage(chatId, { text: manual });
        }

        try {
            await sock.groupParticipantsUpdate(chatId, [target], "demote");

            // Tag the user
            await sock.sendMessage(chatId, {
                text: `✅ @${target.split('@')[0]} has been demoted from admin.`,
                mentions: [target]
            });

        } catch (e) {
            console.error("Demote Error:", e);
            await sock.sendMessage(chatId, {
                text: "❌ Failed to demote. Make sure I'm admin and the user is actually an admin."
            });
        }
    }
};