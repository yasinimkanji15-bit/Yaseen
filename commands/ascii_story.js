const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    name: "ascii_story",
    alias: ["sstory"],
    description: "Systematic animated emoji story sequence.",
    category: "fun",

    execute: async (sock, chatId, message, args, { prefix }) => {
        const from = chatId;

        // --- THE SYSTEMATIC FRAMES ---
        const frames = [
            "_A short story_ 🙂\n\n1.\n 😐        😕\n/👕\\    <👗\\\n 👖         /\\",
            "2.\n 😉       😒 \n/👕\\   /👗\\\n 👖        /\\",
            "3.\n 😚         😳\n/👕\\    <👗>\n  👖        /\\",
            "4.\n  😍       😌\n/👕\\    /👗\\\n  👖        /\\",
            "5.\n 😍    😍\n/👕\\/👗\\\n  👖    /\\",
            "6.\n 😘     ☺\n/👕\\ /👗\\\n  👖     /\\",
            "7.\n 😳 😏\n  /|\\/👙\\\n  👖 / \\",
            "8.\n😈      😰\n<|\\     /👙\\\n /🍆    / \\",
            "9.\n😅\n/() \n  ||🍆 😮\n  \\\\        /\\\\/\\",
            "10.\n😎\n/\\\\         \n  // 🍆 ____😫\n //       //       \\\\",
            "11.\n😖\n/\\\\    \n  //🍆        \n //       💦____☺  \n | |           /        \\",
            "12.\n😰    😍\n/|\\   /(👶)\\\n /\\       / \\\n\n*ＴＨＥ  ＥＮＤ* 😁"
        ];

        try {
            // 1. Initial Message
            const { key } = await sock.sendMessage(from, { text: frames[0] }, { quoted: message });

            // 2. Systematic Animation Loop
            for (let i = 1; i < frames.length; i++) {
                await delay(1500); // ⏱️ 1.5s delay for smooth viewing
                await sock.sendMessage(from, { 
                    text: frames[i], 
                    edit: key 
                });
            }

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "❌ *CORE ERROR:* Animation pulse failed." });
        }
    }
};
