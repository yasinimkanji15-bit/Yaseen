module.exports = {
    name: "ayat",
    alias: ["kursi", "ayatulkursi", "throne"],
    description: "Ayat al-Kursi Manual, Text, and Interactive Audio selection.",
    category: "islam",

    execute: async (sock, chatId, message, args) => {
        const action = args[0]?.toLowerCase();
        
        // 🔗 CATBOX LINKS
        const audio1 = "https://files.catbox.moe/h4pli0.mp3"; // Sheikh Raad Al Kurdi
        const audio2 = "https://files.catbox.moe/s673oa.mp3"; // Muft Menk

        // 1. 📜 --- THE MANUAL (.ayat) --- 📜
        if (!action) {
            const manual = `📖 *ＡＹＡＴ  ＡＬ－ＫＵＲＳＩ  ＭＡＮＵＡＬ*

> *“Everything has a peak, and the peak of the Qur'an is Surah al-Baqarah.”*

✦═════════════════════◆
📜 *ＩＮＴＥＬ:*
Ayat al-Kursi (2:255) is the master of all verses. Recite for protection.
✦═════════════════════◆

*⚙️ ＣＯＮＴＲＯＬＳ:*
• \`.ayat s\` -> Send Text (Ar/Sw/En).
• \`.ayat p\` -> Open Audio Selection Menu.

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // 2. 🎧 --- AUDIO SELECTION (.ayat p) --- 📜
        if (action === 'p' || action === 'play') {
            const menu = `🎧 *ＡＹＡＴ  ＡＬ－ＫＵＲＳＩ  ＡＵＤＩＯ*

Please select a reciter by replying to this message with the number:

1️⃣ *Sheikh Raad Al Kurdi*
2️⃣ *Mufti Menk*

> _Reply with 1 or 2 to play._`;
            
            return await sock.sendMessage(chatId, { text: menu }, { quoted: message });
        }

        // 3. 🟢 --- THE FULL TEXT ONLY (.ayat s) --- 📜
        if (action === 's' || action === 'send') {
            await sock.sendMessage(chatId, { react: { text: '🌙', key: message.key } });

            const ayatText = `📖 *ＡＹＡＴ  ＡＬ－ＫＵＲＳＩ* 📖

*ＡＲＡＢＩＣ:*
اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ

*ＴＲＡＮＳＬＩＴＥＲＡＴＩＯＮ:*
_Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā taʾkhudhuhu sinatun walā nawm, lahu mā fis-samāwāti wamā fil-arḍ, man dhalladhī yashfaʿu ʿindahu illā bi-idhnih, yaʿlamu mā bayna aydīhim wamā khalfahum, walā yuḥīṭūna bishayʾin min ʿilmihi illā bimā shāʾ, wasiʿa kursiyyuhu as-samāwāti wal-arḍ, walā yaʾūduhu ḥifẓuhumā wa huwal-ʿaliyyul-ʿaẓīm_

*ＫＩＳＷＡＨＩＬＩ:*
> "Mwenyezi Mungu, hapana mungu ila Yeye, Aliye hai, Msimamia mambo milele. Hapatwi na kusinzia wala kulala. Ni Vyake pekee vyote vilivyomo mbinguni na vilivyomo duniani. Ni nani huyo awezaye kuombea mbele Yake bila ya idhini Yake? Anayajua yaliyo mbele yao na yaliyo nyuma yao; wala wao hawajui chochote katika elimu Yake ila kwa atakalo Yeye. Enzi Yake imeenea mbinguni na duniani; wala hakuchoshwi na kuvilinda hivyo. Na Yeye ndiye Aliye juu, Mkuu."

*ＥＮＧＬＩＳＨ:*
> "Allah! There is no god but He, the Living, the Self-subsisting, Eternal. No slumber can seize Him nor sleep. His are all things in the heavens and on earth... His Throne doth extend over the heavens and the earth, and He feeleth no fatigue in guarding them."

✦═════════════════════◆
_© 2026 YAS-TECH • Verse Node_`;

            return await sock.sendMessage(chatId, { text: ayatText }, { quoted: message });
        }
    }
};
