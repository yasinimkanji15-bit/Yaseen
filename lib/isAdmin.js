/**
 * Utility to check if the bot and the sender are group admins.
 * Supports standard JID and the new LID format.
 */
async function isAdmin(sock, chatId, senderId) {
    try {
        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants || [];

        // 🤖 Bot Identification Logic
        const botId = sock.user?.id || '';
        const botLid = sock.user?.lid || '';
        
        const botNumber = botId.split(':')[0].split('@')[0];
        const botLidNumeric = botLid.split(':')[0].split('@')[0];

        // 👤 Sender Identification Logic
        const senderNumber = senderId.split(':')[0].split('@')[0];

        // 🛡️ Check if Bot is Admin
        const isBotAdmin = participants.some(p => {
            const pId = p.id ? p.id.split('@')[0] : '';
            const pLid = p.lid ? p.lid.split('@')[0] : '';
            const pLidNumeric = pLid.split(':')[0];
            const pPhoneNumber = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';

            const botMatches = (
                botId === p.id || 
                botLid === p.lid || 
                botLidNumeric === pLidNumeric || 
                botNumber === pPhoneNumber || 
                botNumber === pId
            );
            
            return botMatches && (p.admin === 'admin' || p.admin === 'superadmin');
        });

        // 🛡️ Check if Sender is Admin
        const isSenderAdmin = participants.some(p => {
            const pId = p.id ? p.id.split('@')[0] : '';
            const pLid = p.lid ? p.lid.split('@')[0] : '';
            const pPhoneNumber = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';

            const senderMatches = (
                senderId === p.id || 
                senderNumber === pPhoneNumber || 
                senderNumber === pId ||
                (pLid && senderNumber === pLid)
            );
            
            return senderMatches && (p.admin === 'admin' || p.admin === 'superadmin');
        });

        return { isSenderAdmin, isBotAdmin };
    } catch (err) {
        console.error('❌ Error in isAdmin utility:', err);
        return { isSenderAdmin: false, isBotAdmin: false };
    }
}

// Exporting the function to be used in other files
module.exports = isAdmin;
