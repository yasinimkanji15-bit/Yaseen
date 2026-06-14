const axios = require('axios');

module.exports = {
    name: "surah",
    alias: ["quran", "msahafu"],
    description: "Soma Quran (Arabic, English, Swahili)",
    category: "islam",

    execute: async (sock, chatId, message, args) => {
        // 🛠️ DYNAMIC PREFIX DETECTION
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0); 
        const input = args[0]?.toLowerCase();

        // 1. THE STRATEGIC MANUAL (Shows when no args are provided)
        if (!input) {
            const mainManual = `✦═════════◆═════════✦
🛰️ *ＲＥＡＤＩＮＧ  ＭＡＮＵＡＬ:*
> 1️⃣ *READ:* ${prefix}surah [number]
> 2️⃣ *PLAY:* ${prefix}psurah [number]
> 3️⃣ *LIST:* ${prefix}surah list
✦═════════◆═════════✦

✨ *ＳＵＲＡＨ  ＧＵＩＤＥ* ✨
_Select a number (1-114) to read_

✦═════════◆═════════✦
_© 2026 YAS-TECH • Spiritual Suite_`;
            return await sock.sendMessage(chatId, { text: mainManual }, { quoted: message });
        }

        // 2. THE FULL 1-114 LIST (Only shows on .surah list)
        if (input === 'list') {
            const listGuide = `✦═════════◆═════════✦
✨ *ＳＵＲＡＨ  ＬＩＳＴ  (１-１１４)* ✨
✦═════════◆═════════✦
> 1. Al-Fātiḥah
> 2. Al-Baqarah
> 3. Āl-‘Imrān
> 4. An-Nisā’
> 5. Al-Mā’idah
> 6. Al-An‘ām
> 7. Al-A‘rāf
> 8. Al-Anfāl
> 9. At-Tawbah
> 10. Yūnus
> 11. Hūd
> 12. Yūsuf
> 13. Ar-Ra‘d
> 14. Ibrāhīm
> 15. Al-Ḥijr
> 16. An-Naḥl
> 17. Al-Isrā’
> 18. Al-Kahf
> 19. Maryam
> 20. Ṭā-Hā
> 21. Al-Anbiyā’
> 22. Al-Ḥajj
> 23. Al-Mu’minūn
> 24. An-Nūr
> 25. Al-Furqān
> 26. Ash-Shu‘arā’
> 27. An-Naml
> 28. Al-Qaṣaṣ
> 29. Al-‘Ankabūt
> 30. Ar-Rūm
> 31. Luqmān
> 32. As-Sajdah
> 33. Al-Aḥzāb
> 34. Saba’
> 35. Fāṭir
> 36. Yā-Sīn
> 37. Aṣ-Ṣāffāt
> 38. Ṣād
> 39. Az-Zumar
> 40. Ghāfir
> 41. Fuṣṣilat
> 42. Ash-Shūrā
> 43. Az-Zukhruf
> 44. Ad-Dukhān
> 45. Al-Jāthiyah
> 46. Al-Aḥqāf
> 47. Muḥammad
> 48. Al-Fatḥ
> 49. Al-Ḥujurāt
> 50. Qāf
> 51. Adh-Dhāriyāt
> 52. Aṭ-Ṭūr
> 53. An-Najm
> 54. Al-Qamar
> 55. Ar-Raḥmān
> 56. Al-Wāqi‘ah
> 57. Al-Ḥadīd
> 58. Al-Mujādilah
> 59. Al-Ḥashr
> 60. Al-Mumtaḥanah
> 61. Aṣ-Ṣaff
> 62. Al-Jumu‘ah
> 63. Al-Munāfiqūn
> 64. At-Taghābun
> 65. Aṭ-Ṭalāq
> 66. At-Taḥrīm
> 67. Al-Mulk
> 68. Al-Qalam
> 69. Al-Ḥāqqah
> 70. Al-Ma‘ārij
> 71. Nūḥ
> 72. Al-Jinn
> 73. Al-Muzzammil
> 74. Al-Muddaththir
> 75. Al-Qiyāmah
> 76. Al-Insān
> 77. Al-Mursalāt
> 78. An-Naba’
> 79. An-Nāzi‘āt
> 80. ‘Abasa
> 81. At-Takwīr
> 82. Al-Infitar
> 83. Al-Muṭaffifīn
> 84. Al-Inshiqāq
> 85. Al-Burūj
> 86. Aṭ-Ṭāriq
> 87. Al-A‘lā
> 88. Al-Ghāshiyah
> 89. Al-Fajr
> 90. Al-Balad
> 91. Ash-Shams
> 92. Al-Layl
> 93. Aḍ-Ḍuḥā
> 94. Ash-Sharḥ
> 95. At-Tīn
> 96. Al-‘Alaq
> 97. Al-Qadr
> 98. Al-Bayyinah
> 99. Az-Zalzalah
> 100. Al-‘Ādiyāt
> 101. Al-Qāri‘ah
> 102. At-Takāthur
> 103. Al-‘Aṣr
> 104. Al-Humazah
> 105. Al-Fīl
> 106. Quraysh
> 107. Al-Mā‘ūn
> 108. Al-Kawthar
> 109. Al-Kāfirūn
> 110. An-Nasar
> 111. Al-Masad
> 112. Al-Ikhlāṣ
> 113. Al-Falaq
> 114. An-Nās
✦═════════◆═════════✦
_© 2026 YAS-TECH • Spiritual Suite_`;
            return await sock.sendMessage(chatId, { text: listGuide }, { quoted: message });
        }

        // 3. THE SURAH DATA LOGIC
        const surahNumber = input;
        if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
            return await sock.sendMessage(chatId, { 
                text: `📖 *Namba haitambuliki.* Tumia 1-114.\nExample: *${prefix}surah 18*` 
            }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

            const [arRes, swRes] = await Promise.all([
                axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.quran-uthmani`),
                axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/sw.barwani`)
            ]);

            const surahAr = arRes.data.data;
            const surahSw = swRes.data.data;

            // --- TACTICAL AUDIO SUGGESTION ---
            let responseText = `✦═════════◆═════════✦\n`;
            responseText += `🎧 *AUDIO SUGGESTION:* \n> Type *${prefix}psurah ${surahNumber}* to listen.\n`;
            responseText += `✦═════════◆═════════✦\n\n`;

            responseText += `📖 *Surah ${surahNumber}:* ${surahAr.name}\n`;
            responseText += `*(${surahAr.englishName} - ${surahAr.englishNameTranslation})*\n\n`;

            surahAr.ayahs.forEach((ayah, index) => {
                const swText = surahSw.ayahs[index].text;
                let arText = ayah.text;
                if (surahNumber !== "1" && index === 0) {
                    arText = arText.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "").trim();
                }
                responseText += `${index + 1}. ${arText}\n`;
                responseText += `> ✒️ *SW:* ${swText}\n\n`;
            });

            await sock.sendMessage(chatId, { text: responseText }, { quoted: message });
            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (error) {
            await sock.sendMessage(chatId, { text: '❌ Node Error: Check internet connection.' });
        }
    }
};
