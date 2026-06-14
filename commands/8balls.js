const eightBallResponses = [
    "Yes, definitely! ✅",
    "No way! ❌",
    "Ask again later. ⏳",
    "It is certain. 💎",
    "Very doubtful. 🤨",
    "Without a doubt. ✨",
    "My reply is no. 🛑",
    "Signs point to yes. 👍"
];

module.exports = {
    name: "8ball",
    alias: ["eightball", "oracle"],
    description: "Ask a question and the magic ball will answer.",
    category: "fun",

    execute: async (sock, chatId, m, args) => {
        const question = args.join(" ");

        if (!question) {
            return await sock.sendMessage(chatId, { 
                text: '❌ Please ask a question!\nExample: *.8ball Will I be rich today?*' 
            }, { quoted: m });
        }

        const randomResponse = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
        
        const replyText = `🔮 *MYSTICAL 8-BALL*\n\n` +
                          `❓ *Question:* ${question}\n` +
                          `🎱 *Answer:* ${randomResponse}`;

        await sock.sendMessage(chatId, { text: replyText }, { quoted: m });
    }
};