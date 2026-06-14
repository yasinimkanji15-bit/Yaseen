const asmaulList = [
    { n: "Ar-Rahman", e: "The Most Gracious", s: "Mwingi wa Rehema" },
    { n: "Ar-Rahim", e: "The Most Merciful", s: "Mwenye Kurehemu" },
    { n: "Al-Malik", e: "The Sovereign Lord", s: "Mfalme wa kila kitu" },
    { n: "Al-Quddus", e: "The Holy", s: "Mtakatifu" },
    { n: "As-Salam", e: "The Source of Peace", s: "Mwenye Amani" },
    { n: "Al-Mu'min", e: "The Guardian of Faith", s: "Mwenye Kutoa Amani" },
    { n: "Al-Muhaymin", e: "The Protector", s: "Mwenye Kulinda" },
    { n: "Al-Aziz", e: "The Mighty", s: "Mwenye Nguvu" },
    { n: "Al-Jabbar", e: "The Compeller", s: "Mwenye Kushinda" },
    { n: "Al-Mutakabbir", e: "The Majestic", s: "Mwenye Ukubwa" },
    { n: "Al-Khaliq", e: "The Creator", s: "Muumba" },
    { n: "Al-Bari'", e: "The Evolver", s: "Mwenye Kutengeneza" },
    { n: "Al-Musawwir", e: "The Fashioner", s: "Mwenye Kutia Sura" },
    { n: "Al-Ghaffar", e: "The Forgiver", s: "Mwingi wa Kusamehe" },
    { n: "Al-Qahhar", e: "The Subduer", s: "Mwenye Nguvu za Kushinda" },
    { n: "Al-Wahhab", e: "The Bestower", s: "Mpigaji Mkuu" },
    { n: "Ar-Razzaq", e: "The Provider", s: "Mwenye Kuruzuku" },
    { n: "Al-Fattah", e: "The Opener", s: "Mwenye Kufungua" },
    { n: "Al-'Alim", e: "The All-Knowing", s: "Mwenye Kujua Kila Kitu" },
    { n: "Al-Qabid", e: "The Constrictor", s: "Mwenye Kuzuia" },
    { n: "Al-Basit", e: "The Expander", s: "Mwenye Kukunjua" },
    { n: "Al-Khafid", e: "The Abaser", s: "Mwenye Kushusha" },
    { n: "Ar-Rafi'", e: "The Exalter", s: "Mwenye Kuinua" },
    { n: "Al-Mu'izz", e: "The Giver of Honor", s: "Mwenye Kutia Utukufu" },
    { n: "Al-Mudhill", e: "The Humiliator", s: "Mwenye Kudhalilisha" },
    { n: "As-Sami'", e: "The All-Hearing", s: "Mwenye Kusikia" },
    { n: "Al-Basir", e: "The All-Seeing", s: "Mwenye Kuona" },
    { n: "Al-Hakam", e: "The Judge", s: "Mwamuzi" },
    { n: "Al-'Adl", e: "The Just", s: "Muadilifu" },
    { n: "Al-Latif", e: "The Subtle One", s: "Mwenye Upole" },
    { n: "Al-Khabir", e: "The All-Aware", s: "Mwenye Habari" },
    { n: "Al-Halim", e: "The Forbearing", s: "Mwenye Ustahimilivu" },
    { n: "Al-'Azim", e: "The Magnificent", s: "Mkuu" },
    { n: "Al-Ghafur", e: "The Forgiving", s: "Mwingi wa Maghfirah" },
    { n: "Ash-Shakur", e: "The Grateful", s: "Mwenye Kushukuru" },
    { n: "Al-'Aliyy", e: "The Highest", s: "Aliye Juu Sana" },
    { n: "Al-Kabir", e: "The Greatest", s: "Mkubwa" },
    { n: "Al-Hafiz", e: "The Preserver", s: "Mwenye Kuhifadhi" },
    { n: "Al-Muqit", e: "The Sustainer", s: "Mtoa Riziki" },
    { n: "Al-Hasib", e: "The Reckoner", s: "Mwenye Kuhesabu" },
    { n: "Al-Jalil", e: "The Sublime One", s: "Mwenye Utukufu" },
    { n: "Al-Karim", e: "The Generous", s: "Mkarimu" },
    { n: "Ar-Raqib", e: "The Watchful", s: "Mwangalizi" },
    { n: "Al-Mujib", e: "The Responsive", s: "Mwenye Kuitikia" },
    { n: "Al-Wasi'", e: "The All-Embracing", s: "Mwenye Wigo Mpana" },
    { n: "Al-Hakim", e: "The Wise", s: "Mwenye Hekima" },
    { n: "Al-Wadud", e: "The Loving", s: "Mwenye Mapenzi" },
    { n: "Al-Majid", e: "The Most Glorious", s: "Mwenye Utukufu Mkuu" },
    { n: "Al-Ba'ith", e: "The Resurrector", s: "Mwenye Kufufua" },
    { n: "Ash-Shahid", e: "The Witness", s: "Shahidi" },
    { n: "Al-Haqq", e: "The Truth", s: "Wa Kweli" },
    { n: "Al-Wakil", e: "The Trustee", s: "Mtegemewa" },
    { n: "Al-Qawiyy", e: "The Strong", s: "Mwenye Nguvu" },
    { n: "Al-Matin", e: "The Firm One", s: "Imara Sana" },
    { n: "Al-Waliyy", e: "The Protecting Friend", s: "Mlinzi na Rafiki" },
    { n: "Al-Hamid", e: "The Praiseworthy", s: "Mwenye Kusifiwa" },
    { n: "Al-Muhsi", e: "The Counter", s: "Mwenye Kudhibiti" },
    { n: "Al-Mubdi'", e: "The Originator", s: "Mwenye Kuanzisha" },
    { n: "Al-Mu'id", e: "The Restorer", s: "Mwenye Kurudisha" },
    { n: "Al-Muhyi", e: "The Giver of Life", s: "Mwenye Kuhuisha" },
    { n: "Al-Mumit", e: "The Bringer of Death", s: "Mwenye Kufisha" },
    { n: "Al-Hayy", e: "The Ever-Living", s: "Aliye Hai" },
    { n: "Al-Qayyum", e: "The Self-Subsisting", s: "Mwenye Kusimama na Kujitegemea" },
    { n: "Al-Wajid", e: "The Perceiver", s: "Mwenye Kupata" },
    { n: "Al-Majid", e: "The Noble", s: "Mwenye Shani" },
    { n: "Al-Wahid", e: "The One", s: "Mmoja" },
    { n: "Al-Ahad", e: "The Unique", s: "Pekee" },
    { n: "As-Samad", e: "The Eternal", s: "Mtegemewa" },
    { n: "Al-Qadir", e: "The Able", s: "Mwenye Uwezo" },
    { n: "Al-Muqtadir", e: "The Powerful", s: "Mwenye Nguvu Kamili" },
    { n: "Al-Muqaddim", e: "The Expediter", s: "Mwenye Kutanguliza" },
    { n: "Al-Mu'akhkhir", e: "The Delayer", s: "Mwenye Kuchelewesha" },
    { n: "Al-Awwal", e: "The First", s: "Wa Kwanza" },
    { n: "Al-Akhir", e: "The Last", s: "Wa Mwisho" },
    { n: "Az-Zahir", e: "The Manifest", s: "Aliye Dhahiri" },
    { n: "Al-Batin", e: "The Hidden", s: "Aliyejificha" },
    { n: "Al-Wali", e: "The Governor", s: "Mtawala" },
    { n: "Al-Muta'ali", e: "The Most Exalted", s: "Aliye Juu Kabisa" },
    { n: "Al-Barr", e: "The Source of All Goodness", s: "Mwema" },
    { n: "At-Tawwab", e: "The Acceptor of Repentance", s: "Mwenye Kupokea Toba" },
    { n: "Al-Muntaqim", e: "The Avenger", s: "Mwenye Kulipiza Kisasi" },
    { n: "Al-'Afuww", e: "The Pardoner", s: "Mwenye Kusamehe" },
    { n: "Ar-Ra'uf", e: "The Compassionate", s: "Mwenye Huruma" },
    { n: "Malik-ul-Mulk", e: "The Owner of All Sovereignty", s: "Mfalme wa Falme" },
    { n: "Dhul-Jalal-wal-Ikram", e: "The Lord of Majesty and Generosity", s: "Mwenye Utukufu na Heshima" },
    { n: "Al-Muqsit", e: "The Equitable", s: "Muadilifu" },
    { n: "Al-Jami'", e: "The Gatherer", s: "Mwenye Kukusanya" },
    { n: "Al-Ghaniyy", e: "The Self-Sufficient", s: "Tajiri" },
    { n: "Al-Mughni", e: "The Enricher", s: "Mwenye Kutajirisha" },
    { n: "Al-Mani'", e: "The Preventer", s: "Mwenye Kuzuia" },
    { n: "Ad-Darr", e: "The Distresser", s: "Mwenye Kudhuru" },
    { n: "An-Nafi'", e: "The Propitious", s: "Mwenye Kunufaisha" },
    { n: "An-Nur", e: "The Light", s: "Nuru" },
    { n: "Al-Hadi", e: "The Guide", s: "Mwenye Kuongoza" },
    { n: "Al-Badi'", e: "The Incomparable", s: "Mwanzilishi wa Pekee" },
    { n: "Al-Baqi", e: "The Everlasting", s: "Mwenye Kubakia" },
    { n: "Al-Warith", e: "The Inheritor", s: "Mwenye Kurithi" },
    { n: "Ar-Rashid", e: "The Guide to the Right Path", s: "Mwenye Muongozo Sahihi" },
    { n: "As-Sabur", e: "The Patient", s: "Mstahimilivu" }
];

module.exports = {
    name: "asmaul",
    alias: ["names", "99names"],
    description: "Displays Allah's 99 names with English and Swahili translations.",
    category: "islamic",

    execute: async (sock, chatId, message, args) => {
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const input = args[0]?.toLowerCase();

        // 📜 --- THE ENGLISH MANUAL --- 📜
        if (!input) {
               
            const manual = `✦═════════◆═════════✦
✨  *ＡＳＭＡＵＬ  ＨＵＳＮＡ* ✨
✦═════════◆═════════✦

📖  *ＤＥＳＣＲＩＰＴＩＯＮ:*
Explore the 99 Beautiful Names of Allah (SWT) with their deep meanings in English and Swahili.

🛰️  *ＣＯＭＭＡＮＤＳ:*
> 1️⃣  *${prefix}asmaul list*
_Displays the full directory of all 99 Names for quick reference._

> 2️⃣  *${prefix}asmaul [number]*
_Fetch detailed translations and the specific sequence number of a Name._

💡  *ＥＸＡＭＰＬＥＳ:*
> *${prefix}asmaul 1*
> *${prefix}asmaul 99*

🌟  *ＢＥＮＥＦＩＴＳ:*
_“To Allah belong the best names, so invoke Him by them.” (7:180)_

✦═════════◆═════════✦
_© 2026 YAS-TECH • Spiritual Suite_`;

            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }


        // 📜 --- FULL LIST LOGIC --- 📜
        if (input === 'list') {
            let listText = `✦═════════◆═════════✦\n✨ *ＡＬＬＡＨ'Ｓ  ＮＡＭＥＳ* ✨\n✦═════════◆═════════✦\n`;
            asmaulList.forEach((item, index) => {
                listText += `> *${index + 1}.* ${item.n}\n`;
            });
            listText += `\n*Usage:* ${prefix}asmaul [number]\n✦═════════◆═════════✦`;
            return await sock.sendMessage(chatId, { text: listText }, { quoted: message });
        }

        // 🔍 --- SEARCH LOGIC --- 🔍
        const index = parseInt(input) - 1;
        if (isNaN(index) || !asmaulList[index]) {
            return await sock.sendMessage(chatId, { text: `❌ *Invalid:* Please use a number from 1 to 99.` }, { quoted: message });
        }

        const result = asmaulList[index];
        const response = `✦═════════◆═════════✦
✨ *${result.n.toUpperCase()}* ✨
✦═════════◆═════════✦
> 🇬🇧 *EN:* ${result.e}
> 🇹🇿 *SW:* ${result.s}
> 🔢 *NO:* ${index + 1}
✦═════════◆═════════✦`;
        
        await sock.sendMessage(chatId, { text: response }, { quoted: message });
    }
};
