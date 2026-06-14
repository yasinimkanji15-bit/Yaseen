module.exports = {
    name: "save",
    alias: ["sv", "contact"],
    description: "Sends the owner's contact card for easy saving.",
    category: "main",

    execute: async (sock, chatId, m, args, { pushname }) => {
        // Taarifa zako
        const myNumber = "255617387573"; // Weka namba yako hapa (anza na kodi ya nchi)
        const myName = "YASEEN"; // Jina lako litakalotokea kwenye simu yao
        const organization = "YAS-TECH";

        // Kutengeneza mfumo wa VCard (Contact Card)
        const vcard = 'BEGIN:VCARD\n' 
            + 'VERSION:3.0\n' 
            + 'FN:' + myName + '\n' 
            + 'ORG:' + organization + ';\n' 
            + 'TEL;type=CELL;type=VOICE;waid=' + myNumber + ':+' + myNumber + '\n' 
            + 'END:VCARD';

        // 1. Tuma kadi ya mawasiliano (Contact Card)
        await sock.sendMessage(chatId, {
            contacts: {
                displayName: myName,
                contacts: [{ vcard }]
            }
        }, { quoted: m });

        // 2. Tuma ujumbe wa maelezo kama wa MR DILA
        const caption = `🙄Here i am YASEEN Now it's super easy.. 🤗\n`
            + `Just click the *Add Contact* button on the card above and you can save me in a second! 👀\n\n`
            + `● *Name* — ${myName} 🕊️\n`
            + `● *From* — Tanzania 🌍\n`
            + `● *age* — 17 ⚙️\n\n`
            + `If you want us to be friends you can save my number 😊 🚀`;

        // Picha ya kutuma (Tumia ile picha yako ya botImg)
        const myImage = "https://files.catbox.moe/eg3met.jpg";

        await sock.sendMessage(chatId, {
            image: { url: myImage },
            caption: caption
        }, { quoted: m });
    }
};
