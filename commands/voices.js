const axios = require('axios');

module.exports = {
    name: "voice",
    alias: ["v", "say"],
    description: "Access the voice archives via number keys.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const voices = [
            "tts-adult-female--1-american-english-truvoice", "tts-adult-female--2-american-english-truvoice",
            "tts-adult-male--1-american-english-truvoice", "tts-adult-male--2-american-english-truvoice",
            "tts-adult-male--3-american-english-truvoice", "tts-adult-male--4-american-english-truvoice",
            "tts-adult-male--5-american-english-truvoice", "tts-adult-male--6-american-english-truvoice",
            "tts-adult-male--7-american-english-truvoice", "tts-adult-male--8-american-english-truvoice",
            "tts-female-whisper", "tts-male-whisper", "tts-mary", "tts-mary-for-telephone",
            "tts-mary-in-hall", "tts-mary-in-space", "tts-mary-in-stadium", "tts-mike",
            "tts-mike-for-telephone", "tts-mike-in-hall", "tts-mike-in-space", "tts-mike-in-stadium",
            "tts-robosoft-one", "tts-robosoft-two", "tts-robosoft-three", "tts-robosoft-four",
            "tts-robosoft-five", "tts-robosoft-six", "tts-sam"
        ];

        const subCommand = args[0]?.toLowerCase();

        // 📜 --- 1. THE FULL VERTICAL REGISTRY ---
        if (subCommand === 'list') {
            const listMsg = `🎙️ *YASEEN－ＭＤ  ＶＯＣＡＬ  ＲＥＧＩＳＴＲＹ*

> *“Select a frequency for data transmission.”*

✦═════════════════════◆
• 1: Female 1
• 2: Female 2
• 3: Male 1
• 4: Male 2
• 5: Male 3
• 6: Male 4
• 7: Male 5
• 8: Male 6
• 9: Male 7
• 10: Male 8
• 11: Female Whisper
• 12: Male Whisper
• 13: Mary
• 14: Mary (Telephone)
• 15: Mary (Hall)
• 16: Mary (Space)
• 17: Mary (Stadium)
• 18: Mike
• 19: Mike (Telephone)
• 20: Mike (Hall)
• 21: Mike (Space)
• 22: Mike (Stadium)
• 23: RoboSoft 1
• 24: RoboSoft 2
• 25: RoboSoft 3
• 26: RoboSoft 4
• 27: RoboSoft 5
• 28: RoboSoft 6
• 29: Sam
✦═════════════════════◆

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(chatId, { text: listMsg }, { quoted: message });
        }

        const voiceIndex = parseInt(args[0]) - 1;
        const text = args.slice(1).join(' ');

        // 🛠️ --- 2. THE GHOST MANUAL ---
        if (isNaN(voiceIndex) || !voices[voiceIndex] || !text) {
            const manual = `🎙️ *YASEEN－ＭＤ  ＶＯＩＣＥ  ＭＡＮＵＡＬ*

> *“Synthesizing legacy audio streams.”*

✦═════════════════════◆
📜 *ＩＮＴＥＬ:*
Total Voices: 29 Available.
Protocol: Buffer-Stream Injection.
✦═════════════════════◆

*⚙️ ＣＯＮＴＲＯＬＳ:*
• \`.voice list\` -> Show full vertical registry.
• \`.voice [number] [text]\` -> Synthesize.

*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '🎙️', key: message.key } });

            const endpoint = voices[voiceIndex];
            const apiUrl = `https://apis.prexzyvilla.site/tts/${endpoint}?text=${encodeURIComponent(text)}`;
            
            // 📡 --- STEP 1: GET THE LINK ---
            const res = await axios.get(apiUrl);
            const audioLink = res.data.audio_url?.result;

            if (!audioLink) throw new Error("Audio extraction failed.");

            // 📥 --- STEP 2: DOWNLOAD AS BUFFER ---
            const audioResponse = await axios.get(audioLink, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(audioResponse.data, 'binary');

            // 🚀 --- STEP 3: DISPATCH BUFFER ---
            await sock.sendMessage(chatId, { 
                audio: buffer, 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, { quoted: message });

            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(chatId, { text: "❌ *BUFFER ERROR:* Vocal node failed to stabilize." });
        }
    }
};
