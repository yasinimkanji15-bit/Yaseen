module.exports = {
    name: "kick",
    alias: ["remove"],
    description: "Kick a member from the group.",
    category: "group",

    execute: async (sock, chatId, message, args) => {
        const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                       message.message?.extendedTextMessage?.contextInfo?.participant;

        if (!target) {
            const manual = `👢 *ＫＩＣＫ ＭＡＮＵＡＬ*\n\nRemove a user from the group.\n\n> *Example:* Reply to a message or tag someone with \`.kick @user\``;
            return await sock.sendMessage(chatId, { text: manual });
        }

        await sock.groupParticipantsUpdate(chatId, [target], "remove");
        await sock.sendMessage(chatId, { text: "✅ User has been removed." });
    }
};
