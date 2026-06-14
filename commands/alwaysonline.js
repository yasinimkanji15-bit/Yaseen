// Use a global variable to track status without needing settings.js

if (typeof global.alwaysOnline === 'undefined') {

    global.alwaysOnline = false;

}

module.exports = {

    name: "alwaysonline",

    alias: ["online"],

    description: "Toggle 24/7 online presence.",

    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner }) => {

        const input = args[0]?.toLowerCase();

        // 🟢 MANUAL / INSTRUCTIONS

        // If the user types just .online or .online help

        if (!input || input === 'help') {

            const manual = `🟢 *Always Online Manual*

This module keeps your WhatsApp presence set to "Online" (Available) 24/7.
It runs a background process that refreshes your status, making it look like you are active even when sleeping.
_Note: This command is restricted to the Bot Owner._
✦═════════◆═════════✦

*1. Enable / Disable*
Toggle the presence simulator.

\`.online on\`
> • _Action:_ Forces your status to "Online" immediately and keeps it there.

\`.online off\`
> • _Action:_ Stops the process. Your status will revert to normal WhatsApp behavior.
✦═════════◆═════════✦

*2. Checking Status*
Current Status: *${global.alwaysOnline ? 'ENABLED ✅' : 'DISABLED ❌'}*
«.online on | .online off»`;

            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });

        }

        // 🔐 OWNER CHECK

        if (!isOwner) return sock.sendMessage(chatId, { text: "❌ This command is restricted to the Bot Owner." });

        // 🚀 LOGIC: TURN ON

        if (input === 'on') {

            if (global.alwaysOnline) return sock.sendMessage(chatId, { text: "⚠️ Already enabled." });

            

            global.alwaysOnline = true;

            await sock.sendPresenceUpdate('available');

            

            // Set an interval to "ping" WhatsApp every 15 seconds

            global.onlineInterval = setInterval(async () => {

                if (global.alwaysOnline) {

                    await sock.sendPresenceUpdate('available');

                } else {

                    clearInterval(global.onlineInterval);

                }

            }, 15000);

            return await sock.sendMessage(chatId, { text: "✨ *Always Online:* ENABLED ✅\nYour status is now pinned to 'Online'." });

        }

        // 🛑 LOGIC: TURN OFF

        if (input === 'off') {

            global.alwaysOnline = false;

            clearInterval(global.onlineInterval);

            await sock.sendPresenceUpdate('unavailable');

            

            return await sock.sendMessage(chatId, { text: "✨ *Always Online:* DISABLED ❌\nYour status will now behave normally." });

        }

    }

};

