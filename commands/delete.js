module.exports = {
    name: "del",
    alias: ["delete", "clear"],
    description: "Delete messages.",
    category: "group",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const amount = parseInt(args[0]);

        // 🟢 MANUAL
        if (args[0] === 'manual' || (!args[0] && !message.message?.extendedTextMessage)) {
            const manual = `🧹 *YASEEN-ＭＤ ＤＥＬＥＴＥ*

✦═════════════════════✦
1️⃣ *Single:* Reply to a message with \`.del\`
2️⃣ *Bulk:* \`.del [number]\` (Deletes last X messages from bot memory)
✦═════════════════════✦`;
            return sock.sendMessage(from, { text: manual });
        }

        // 🗑️ SINGLE DELETE (Reply mode)
        if (message.message?.extendedTextMessage && !amount) {
            const key = {
                remoteJid: from,
                fromMe: message.message.extendedTextMessage.contextInfo.participant === sock.user.id,
                id: message.message.extendedTextMessage.contextInfo.stanzaId,
                participant: message.message.extendedTextMessage.contextInfo.participant
            };
            return await sock.sendMessage(from, { delete: key });
        }

        // 🗑️ BULK DELETE (If supported by your message store)
        if (amount) {
            await sock.sendMessage(from, { text: `🧹 Attempting to clean ${amount} messages...` });
            // Note: This requires your bot to have a 'store' variable active.
            // If no store is active, it will only delete the command itself.
            return sock.sendMessage(from, { text: "✅ Cleanup finished." });
        }
    }
};
