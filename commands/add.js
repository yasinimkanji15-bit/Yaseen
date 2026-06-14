module.exports = {
    name: "add",
    alias: ["invite"],
    description: "Adds a user to the group.",
    category: "group",

    execute: async (sock, chatId, message, args) => {
        try {
            // 1. Check if the command is being used in a group
            const isGroup = chatId.endsWith('@g.us');
            if (!isGroup) {
                return await sock.sendMessage(chatId, { text: "This command can only be used in groups!" });
            }

            // 2. Extract the phone number from arguments
            // Usage: .add 2557XXXXXXXX
            let phoneNumber = args[0] ? args[0].replace(/[^0-9]/g, '') : null;

            if (!phoneNumber) {
                return await sock.sendMessage(chatId, { 
                    text: "Please provide a phone number.\nExample: *.add 2557XXXXXXXX*" 
                });
            }
            // change 07... to 2557...
if (phoneNumber.startsWith('0')) {
    phoneNumber = '255' + phoneNumber.slice(1);
}


            // Format as WhatsApp JID
            const userJid = phoneNumber + '@s.whatsapp.net';

            // 3. Optional: Send a reaction to show the bot is processing
            await sock.sendMessage(chatId, { 
                react: { text: "⏳", key: message.key } 
            });

            // 4. Attempt to add the participant
            const response = await sock.groupParticipantsUpdate(chatId, [userJid], "add");

            /* Response Status Codes:
               200: Success
               403: User has private invite settings
               408: User recently left the group
               409: User is already in the group
            */

            if (response[0].status === "200") {
                await sock.sendMessage(chatId, { 
                    text: `Successfully added @${phoneNumber} to the group.`, 
                    mentions: [userJid] 
                });
            } else if (response[0].status === "403") {
                await sock.sendMessage(chatId, { 
                    text: "Failed: This user has private privacy settings. You must send them a group link instead." 
                });
            } else if (response[0].status === "409") {
                await sock.sendMessage(chatId, { text: "This user is already a member of this group." });
            } else {
                await sock.sendMessage(chatId, { 
                    text: "Failed to add user. Ensure the bot is an Admin or 'Add Members' is enabled for everyone." 
                });
            }

        } catch (error) {
            console.error("Add Command Error:", error);
            await sock.sendMessage(chatId, { text: "An error occurred while trying to add the member." });
        }
    }
};
