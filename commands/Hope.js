module.exports = {
    name: "hop",
    alias: ["moyo", "hekima", "encourage"],
    description: "Sends a word of wisdom and hope to encourage someone in the group.",
    category: "group",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;

        // 1. Kutambua nani anatakiwa kutagged (Aliyetagged, Aliyereplywa, au aliyetuma command)
        let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     msg.message?.extendedTextMessage?.contextInfo?.participant || 
                     msg.key.participant || msg.key.remoteJid;

        // Kuhakikisha tunapata namba safi kwa ajili ya caption (bila @s.whatsapp.net)
        const targetNumber = target.split("@")[0];

        // 2. Database ya maneno ya hekima na matumaini (Random Quotes)
        const wisdomQuotes = [
            "Giza liwe nene kiasi gani, halitazuia jua kuchomoza. Simama imara, wakati wako unakuja. ✨",
            "Mambo makubwa huchukua muda. Usiangalie nyuma ulikoka, angalia mbele unakokwenda. Mafanikio yapo njiani. ⏳",
            "Hata mbuyu ulianza kama mchicha kwaiyo bado uko na nafasi ya kutenda makubwa 😊", 
            "Kushindwa kwa leo sio mwisho wa safari, bali ni somo la kukufanya uwe imara zaidi kesho. Una nguvu kubwa ndani yako! 💪",
            "Kila hatua ndogo unayopiga leo inakupeleka karibu na ndoto zako. Usikate tamaa, endelea kupambana. 🚀",
            "Mungu hawezi kukupa mtihani ambao hauna uwezo nao. Vumilia, dhoruba ikipita utaona upinde wa mvua.",
            "haba na haba hujaza kibaba usikate tamaa kumaliza ulichokianza 🤗", 
            "kumbuka kwenye kila jambo kuna kusudio lake kwaiyo kuwa tayari na utachokipata😜", 
            "Wewe ni wa kipekee na una thamani kubwa. Usiruhusu maneno ya watu yakubadilishe au yakurudishe nyuma. 👑",
            "Kumbuka, hata mti mkubwa ulianza kama mbegu ndogo ardhini. Kuwa na subira, unakua vizuri sana. 🌱"
        ];

        // Kuchagua neno moja bila mpangilio
        const randomQuote = wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)];

        try {
            // Reaction ya kutoa upendo/moyo
            await sock.sendMessage(from, { react: { text: '❤️', key: msg.key } });

            // Muundo fupi na safi uliotagged mtumiaji husika
            const messageText = `✨ *WORDS OF WISDOM* ✨\n\n` +
                `Habari @${targetNumber}, pokea neno hili la hekima leo kutoka kwangu:\n\n` +
                `_"${randomQuote}"_\n\n` +
                `*Keep moving forward!* 🌟`;

            // Kutuma ujumbe ukiwa umemtag muhusika moja kwa moja (mentions)
            await sock.sendMessage(from, { 
                text: messageText, 
                mentions: [target] 
            }, { quoted: msg });

        } catch (error) {
            console.error("Hope Cmd Error:", error);
            return sock.sendMessage(from, { text: "❌ Failed to send encouragement." }, { quoted: msg });
        }
    }
};