const settings = require('../settings');
const { isSudo } = require('../index'); // Hakikisha index.js ya lib ina isSudo

async function isOwnerOrSudo(senderId, sock = null, chatId = null) {
    try {
        const ownerJid = settings.ownerNumber + "@s.whatsapp.net";
        const ownerNumberClean = settings.ownerNumber.split(':')[0].split('@')[0];
        
        if (senderId === ownerJid) return true;
        
        const senderIdClean = senderId.split(':')[0].split('@')[0];
        const senderLidNumeric = senderId.includes('@lid') ? senderId.split('@')[0].split(':')[0] : '';
        
        if (senderIdClean === ownerNumberClean) return true;
        
        if (sock && chatId && chatId.endsWith('@g.us') && senderId.includes('@lid')) {
            const botLid = sock.user?.lid || '';
            const botLidNumeric = botLid.includes(':') ? botLid.split(':')[0] : (botLid.includes('@') ? botLid.split('@')[0] : botLid);
            
            if (senderLidNumeric && botLidNumeric && senderLidNumeric === botLidNumeric) return true;
            
            const metadata = await sock.groupMetadata(chatId);
            const participants = metadata.participants || [];
            
            const participant = participants.find(p => {
                const pLid = p.lid || '';
                const pLidNumeric = pLid.includes(':') ? pLid.split(':')[0] : (pLid.includes('@') ? pLid.split('@')[0] : pLid);
                const pId = p.id || '';
                const pIdClean = pId.split(':')[0].split('@')[0];
                return (p.lid === senderId || p.id === senderId || pLidNumeric === senderLidNumeric || pIdClean === senderIdClean || pIdClean === ownerNumberClean);
            });
            
            if (participant) {
                const pIdClean = (participant.id || '').split(':')[0].split('@')[0];
                if (pIdClean === ownerNumberClean) return true;
            }
        }
        
        if (senderId.includes(ownerNumberClean)) return true;

        return await isSudo(senderId);
    } catch (e) {
        console.error('❌ [isOwner] Error:', e);
        return false;
    }
}

module.exports = isOwnerOrSudo;
