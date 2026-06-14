global.warnSettings = global.warnSettings || { limit: 3, message: "You have been warned for breaking the rules!" };
global.userWarns = global.userWarns || {};

module.exports = {
    name: "warn",
    alias: ["setwarn", "checkwarn"],
    description: "Manage group warnings.",
    category: "group",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const cmd = args[0];

        // 🟢 MANUAL / HELP
        if (!cmd || cmd === 'manual') {
            const manual = `⚠️ *YASEEN-ＭＤ ＷＡＲＮ ＳＹＳＴＥＭ*

✦═════════════════════✦
1️⃣ *Warn User:* Reply to message with \`.warn\`
2️⃣ *Set Message:* \`.setwarn m [your message]\`
3️⃣ *Set Count:* \`.setwarn c [number]\`
4️⃣ *Check:* \`.warn check\` (Check your warns)
✦═════════════════════✦`;
            return sock.sendMessage(from, { text: manual });
        }

        // ⚙️ SETTINGS MODE (.setwarn m or .setwarn c)
        if (cmd === 'm') {
            const newMsg = args.slice(1).join(" ");
            if (!newMsg) return sock.sendMessage(from, { text: "❌ Provide a message!" });
            global.warnSettings.message = newMsg;
            return sock.sendMessage(from, { text: `✅ Warn message set to: *${newMsg}*` });
        }

        if (cmd === 'c') {
            const count = parseInt(args[1]);
            if (isNaN(count)) return sock.sendMessage(from, { text: "❌ Provide a number!" });
            global.warnSettings.limit = count;
            return sock.sendMessage(from, { text: `✅ Warn limit set to: *${count}*` });
        }

        // 🔨 EXECUTE WARN (Reply to someone)
        const cited = message.message?.extendedTextMessage?.contextInfo?.participant;
        if (!cited) return sock.sendMessage(from, { text: "❌ Reply to the user you want to warn." });

        global.userWarns[cited] = (global.userWarns[cited] || 0) + 1;
        const currentWarns = global.userWarns[cited];

        if (currentWarns >= global.warnSettings.limit) {
            await sock.sendMessage(from, { text: `🚫 @${cited.split('@')[0]} reached the limit of ${global.warnSettings.limit} warns. Goodbye!`, mentions: [cited] });
            await sock.groupParticipantsUpdate(from, [cited], "remove");
            global.userWarns[cited] = 0; // Reset after kick
        } else {
            await sock.sendMessage(from, { 
                text: `⚠️ *WARNING*\n👤 *User:* @${cited.split('@')[0]}\n📉 *Count:* ${currentWarns}/${global.warnSettings.limit}\n📝 *Note:* ${global.warnSettings.message}`, 
                mentions: [cited] 
            });
        }
    }
};
