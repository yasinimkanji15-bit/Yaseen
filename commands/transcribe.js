const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: "transcribe",
    alias: ["tr", "stt"],
    execute: async (sock, chatId, m) => {
        // Your AssemblyAI Key
        const apiKey = "66094d670b6a4d1d822f1260175176ad"; 
        
        try {
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const msg = quoted || m.message;
            const audio = msg?.audioMessage;

            if (!audio) return sock.sendMessage(chatId, { text: "❌ Please reply to an audio or voice note!" });

            // Initial message
            const { key } = await sock.sendMessage(chatId, { text: "⏳ *Uploading audio...*" });

            // 1. Download
            const stream = await downloadContentFromMessage(audio, 'audio');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { 
                buffer = Buffer.concat([buffer, chunk]); 
            }

            // 2. Upload
            const uploadResp = await axios.post('https://api.assemblyai.com/v2/upload', buffer, {
                headers: { 
                    authorization: apiKey, 
                    "content-type": "application/octet-stream" 
                }
            });

            // 3. Start Transcription
            const transcriptResp = await axios.post('https://api.assemblyai.com/v2/transcript', {
                audio_url: uploadResp.data.upload_url
            }, { headers: { authorization: apiKey } });

            const transcriptId = transcriptResp.data.id;
            await sock.sendMessage(chatId, { text: "✍️ *AI is transcribing...*" }, { edit: key });

            // 4. Polling for result
            let status = "processing";
            let resultText = "";

            while (status !== "completed") {
                const checkResp = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                    headers: { authorization: apiKey }
                });
                
                status = checkResp.data.status;
                
                if (status === "completed") {
                    resultText = checkResp.data.text;
                } else if (status === "error") {
                    throw new Error("Transcription failed");
                } else {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }

            let caption = `🎙️ *Transcription Result*\n\n📝 ${resultText}\n\n🔊 *Media:* AUDIO`;
            await sock.sendMessage(chatId, { text: caption }, { edit: key });

        } catch (e) {
            console.error(e);
            // --- HII NDIO SEHEMU YA KUZUIA API LIMIT ERROR ---
            if (e.response && e.response.status === 429) {
                await sock.sendMessage(chatId, { text: "⚠️ *API Limit Reached!* Please wait a few minutes or check your dashboard." });
            } else {
                await sock.sendMessage(chatId, { text: "❌ *Error:* Failed to process audio. Try a shorter clip." });
            }
        }
    }
};
