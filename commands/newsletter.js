module.exports = {
    name: "newsletter",
    alias: ["jid", "newsid"],
    description: "Extract raw Newsletter JID for YAS-TECH",
    category: "search",

    execute: async (sock, chatId, message, args) => {
        const query = args[0];

        // 📜 --- CLEAN MANUAL --- 📜
        // Only shows if you type the command WITHOUT a link
        if (!query || !query.includes("whatsapp.com/channel/")) {
            const manual = `🗞️ *NEWSLETTER ENGINE*

> *“Fetch the raw JID for any WhatsApp channel.”*

✦═════════════════◆
  *HOW TO USE:*
> .newsletter [Link]
> .jid [Link]
> .menu jid set (a newsletter)
> .menu jid remove

*OUTPUT:*
(Raw Newsletter JID only)
✦═════════════════◆

_© 2026 YAS-TECH_`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // 🚀 --- THE REAL LOGIC --- 🚀
        try {
            // Extract the Invite Code from the URL
            const inviteCode = query.split('whatsapp.com/channel/')[1];

            // Fetch the Metadata from WhatsApp Servers
            const res = await sock.newsletterMetadata("invite", inviteCode);
            
            // ✅ OUTPUT: ONLY THE RAW JID (As requested)
            await sock.sendMessage(chatId, { text: `${res.id}` });

        } catch (err) {
            console.error("Newsletter JID Error:", err);
            await sock.sendMessage(chatId, { text: "❌ *Error:* Link is invalid or revoked." });
        }
    }
};
