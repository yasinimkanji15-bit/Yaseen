module.exports = {
    name: "re",
    alias: ["repeat", "echo"],
    description: "Replaces your command with repeated text/emojis.",
    category: "utility",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        if (!isOwner) return;

        // Default repeat count: 1
        if (global.botConfig.repeatCount === undefined) {
            global.botConfig.repeatCount = 1;
        }

        const action = args[0]?.toLowerCase();

        // 📜 --- THE REPEATER MANUAL --- 📜
        if (!action) {
            const manual = `🔄 *YASEEN－ＲＥＰＥＡＴＥＲ* 🔄

> *“Ghost mode: Command transformation.”*

✦═════════════════◆
  *ＣＵＲＲＥＮＴ  ＳＥＴ:* ${global.botConfig.repeatCount} Times
✦═════════════════◆

*⚙️ ＣＯＮＴＲＯＬ:*
• \`.re set [num]\` -> Set limit (Max 250).
• \`.re [text/emoji]\` -> Replace command with repeat.

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // 1. 🟢 SET REPEAT COUNT
        if (action === 'set') {
            const num = parseInt(args[1]);
            if (isNaN(num) || num < 1 || num > 250) {
                return await sock.sendMessage(chatId, { text: "⚠️ Use 1-250." });
            }
            global.botConfig.repeatCount = num;
            return await sock.sendMessage(chatId, { text: `✅ *Repeater set to:* ${num}` });
        }

        // 2. 🟢 GHOST REPLACEMENT LOGIC
        const textToRepeat = args.join(" ");
        const count = global.botConfig.repeatCount;
        
        let repeatedText = "";
        for (let i = 0; i < count; i++) {
            repeatedText += textToRepeat + (i === count - 1 ? "" : " ");
        }

        try {
            // STEP 1: Delete your command message (.re hi)
            // Note: Bot must be Admin if in a Group, or it works in DMs
            await sock.sendMessage(chatId, { delete: message.key });

            // STEP 2: Send the repeated text immediately
            // Since the command is gone, it looks like it "transformed"
            await sock.sendMessage(chatId, { text: repeatedText });

        } catch (e) {
            // If delete fails (e.g. not admin), just send the repeat
            await sock.sendMessage(chatId, { text: repeatedText });
        }
    }
};
