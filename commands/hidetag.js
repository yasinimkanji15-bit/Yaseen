module.exports = {
    name: "hidetag",
    alias: ["htag", "h", "tagall"],
    description: "Tag all members with a custom announcement style.",
    category: "group",

    execute: async (sock, chatId, message, args, { isGroup, isAdmin, isOwner }) => {
        // 🛡️ SECURITY CHECK
        if (!isGroup) return;
        if (!isAdmin && !isOwner) return;

        const text = args.join(" ");

        // 📜 --- THE MANUAL (.hidetag) --- 📜
        if (!text) {
            const manual = `👻 *YASEEN－ＭＤ  ＨＩＤＥＴＡＧ*

> *“True power is felt, not seen. Command the room from the shadows.”*

✦═════════════════════◆
📜 *ＩＮＴＥＬ:*
This node broadcasts a localized frequency that alerts every participant in the sector without cluttering the chat with visible IDs. 
✦═════════════════════◆

*⚙️ ＵＳＡＧＥ:*
• \`.h [emoji][message]\`

*💡 ＥＸＡＭＰＬＥＳ:*
> _.h 😎 Hello everyone_
> _.h 🙂 Today is Monday guys_

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // 🟢 EXECUTION LOGIC
        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants.map(v => v.id);

        // This sends exactly what you typed (Emoji + Text) but adds the hidden mentions
        await sock.sendMessage(chatId, { 
            text: text, 
            mentions: participants 
        });

        // Small reaction to confirm the broadcast
        await sock.sendMessage(chatId, { react: { text: '📢', key: message.key } });
    }
};
