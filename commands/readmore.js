module.exports = {
    name: "readmore",
    alias: ["spoiler", "more"],
    description: "Create a 'Read More' message prank using a comma separator.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const text = args.join(" ");

        // 📜 --- THE GHOST MANUAL ---
        if (!text || !text.includes(",")) {
            const manual = `🎭 *YASEEN－ＭＤ  ＳＰＯＩＬＥＲ*

> *“Injecting invisible data buffer.”*

✦═════════════════════◆
📑 *ＵＳＡＧＥ:*
> • .readmore [Visible Text] , [Hidden Text]

💡 *ＥＸＡＭＰＬＥ:*
> .readmore Guess what , I am a pro coder 💻
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🎭', key: message.key } });

            // 🛠️ --- THE INVISIBLE BUFFER ---
            // Special character that triggers the Read More button
            const readMoreChar = String.fromCharCode(8206).repeat(4000);
            
            // Splitting by comma now
            const [part1, ...part2Array] = text.split(",");
            const part2 = part2Array.join(",").trim(); // Handles cases if there are more commas in the text

            // Combine Part 1 + 4000 Invisible Chars + Part 2
            const finalMessage = `${part1.trim()}${readMoreChar}${part2}`;

            await sock.sendMessage(from, { text: finalMessage });
            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            await sock.sendMessage(from, { text: "❌ *SPOILER ERROR:* Node failed to inject buffer." });
        }
    }
};
