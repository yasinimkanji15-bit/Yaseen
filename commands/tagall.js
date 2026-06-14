module.exports = {
    name: "tagall",
    description: "Tag everyone with a visible list.",
    category: "group",

    execute: async (sock, chatId, message, args) => {
        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants;
        let text = args.join(" ") || "Announcement";
        
        let tagList = `📢 *ＴＡＧ ＡＬＬ*\n\n*Message:* ${text}\n\n`;
        for (let mem of participants) {
            tagList += `> @${mem.id.split('@')[0]}\n`;
        }

        await sock.sendMessage(chatId, { text: tagList, mentions: participants.map(a => a.id) });
    }
};
