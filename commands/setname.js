module.exports = {
    name: "setname",
    alias: ["setbotname", "setprofile"],
    description: "To change the WhatsApp profile name of the bot.",
    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        // 1. Security check
        if (!isOwner) return message.reply("This command is for the **Owner** only!");

        // 2. Extract the new name from args
        const newName = args.join(" ");

        if (!newName) {
            return message.reply("Please provide a new name.\nExample: .setname MyBotName");
        }

        try {
            // 3. Update the Profile Name
            await sock.updateProfileName(newName);
            
            message.reply(`✅ Successfully updated bot name to: *${newName}*`);
        } catch (e) {
            console.log(e);
            message.reply("❌ Error updating name. Please try again later.");
        }
    }
};
