const isAdmin = require('../lib/isAdmin'); // Make sure this path is correct in your folders

module.exports = {
    name: "mute",
    alias: ["lock", "close"],
    description: "Mute the group for a specific duration.",
    category: "group",

    execute: async (sock, chatId, m, args) => {
        const senderId = m.key.participant || m.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');

        // 1. Check if it is a group
        if (!isGroup) {
            return sock.sendMessage(chatId, { text: "❌ This command can only be used in groups." });
        }

        try {
            // 2. Check Admin Status using your lib
            const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

            if (!isBotAdmin) {
                return sock.sendMessage(chatId, { text: '❌ Please make the bot an admin first.' }, { quoted: m });
            }

            if (!isSenderAdmin) {
                return sock.sendMessage(chatId, { text: '❌ Only group admins can use the mute command.' }, { quoted: m });
            }

            // 3. Get duration from arguments
            const durationInMinutes = parseInt(args[0]);

            // 4. Mute Logic
            await sock.groupSettingUpdate(chatId, 'announcement');

            if (durationInMinutes && durationInMinutes > 0) {
                const durationInMilliseconds = durationInMinutes * 60 * 1000;
                await sock.sendMessage(chatId, { 
                    text: `🔒 *The group has been muted for ${durationInMinutes} minutes.*` 
                }, { quoted: m });

                // Set timeout to unmute after duration
                setTimeout(async () => {
                    try {
                        await sock.groupSettingUpdate(chatId, 'not_announcement');
                        await sock.sendMessage(chatId, { text: '🔓 *The group has been unmuted automatically.*' });
                    } catch (unmuteError) {
                        console.error('Error unmuting group:', unmuteError);
                    }
                }, durationInMilliseconds);
            } else {
                await sock.sendMessage(chatId, { text: '🔒 *The group has been muted.*' }, { quoted: m });
            }

        } catch (error) {
            console.error('Error in mute command:', error);
            await sock.sendMessage(chatId, { text: '⚠️ An error occurred while trying to mute the group.' }, { quoted: m });
        }
    }
};
