module.exports = {
    name: 'chatbot',
    category: 'owner',
    description: 'Turn chatbot ON or OFF for Groups or DMs and check status.',
    execute: async (sock, chatId, msg, args) => {
        try {
            const isGroup = chatId.endsWith('@g.us');
            const action = args[0]?.toLowerCase();

            // Ensure global variables are initialized
            if (!global.chatbot) {
                global.chatbot = { gc: true, dm: true };
            }

            // Get current status based on chat type
            const currentStatus = isGroup ? global.chatbot.gc : global.chatbot.dm;

            // If no action is provided (just typing .chatbot), show status and instructions
            if (!action) {
                const statusText = currentStatus ? "🟩 ON (Active)" : "🟥 OFF (Inactive)";
                const chatType = isGroup ? "Group Chats (GC)" : "Direct Messages (DM)";
                
                const responseMessage = `🤖 *CHATBOT STATUS & INSTRUCTIONS* 🤖\n\n` +
                    `• *Current Chat Type:* ${chatType}\n` +
                    `• *Global Status for this type:* ${statusText}\n\n` +
                    `*Available Commands:*\n` +
                    ` │ \n` +
                    ` ├── _.chatbot on_  → Turn ON chatbot globally for this chat type.\n` +
                    ` └── _.chatbot off_ → Turn OFF chatbot globally for this chat type.`;

                return await sock.sendMessage(chatId, { text: responseMessage }, { quoted: msg });
            }

            // Handle ON / OFF actions
            if (action === 'on' || action === 'off') {
                const statusBool = action === 'on';

                if (isGroup) {
                    global.chatbot.gc = statusBool;
                    const msgText = statusBool 
                        ? "✅ *Chatbot has been turned ON for all Groups globally!*" 
                        : "❌ *Chatbot has been turned OFF for all Groups globally!*";
                    return await sock.sendMessage(chatId, { text: msgText }, { quoted: msg });
                } else {
                    global.chatbot.dm = statusBool;
                    const msgText = statusBool 
                        ? "✅ *Chatbot has been turned ON for all DMs/Inbox globally!*" 
                        : "❌ *Chatbot has been turned OFF for all DMs/Inbox globally!*";
                    return await sock.sendMessage(chatId, { text: msgText }, { quoted: msg });
                }
            }

            // If user types an invalid action (e.g. .chatbot something)
            return await sock.sendMessage(chatId, { 
                text: `*Invalid usage!*\n\nUse:\n• _${global.botConfig?.prefix || '.'}chatbot on_ to enable\n• _${global.botConfig?.prefix || '.'}chatbot off_ to disable` 
            }, { quoted: msg });

        } catch (err) {
            console.error("Chatbot Command Error:", err.message);
            await sock.sendMessage(chatId, { text: "An error occurred while changing chatbot settings." }, { quoted: msg });
        }
    }
};