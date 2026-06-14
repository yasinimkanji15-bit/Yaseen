const axios = require('axios');

// --- FUNCTION YA KUBADILISHA MAANDISHI KUWA MADOGO (KAMA ULIVYOOMBA KWENYE MENU) ---
function toTinyFont(text) {
    const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const tiny   = "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９";
    
    return text.split('').map(char => {
        const index = normal.indexOf(char);
        return index !== -1 ? tiny[index] : char;
    }).join('');
}

module.exports = {
    name: "gpt",
    alias: ["chatgpt", "gpt5", "ai"],
    description: "Asks ChatGPT (GPT-5) a question.",
    category: "ai",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;
        const query = args.join(" ");

        if (!query) {
            await sock.sendMessage(from, { react: { text: '⚠️', key: msg.key } });
            const warningText = toTinyFont("please provide a question for gpt");
            return sock.sendMessage(from, { text: `*⚠️ ${warningText}*\n_Example: .gpt nieleze kuhusu nchi ya Tanzania_` }, { quoted: msg });
        }

        try {
            // Reaction ya kuanza kuchakata swali
            await sock.sendMessage(from, { react: { text: '🤖', key: msg.key } });

            const apiKey = 'test';
            // Tunasafirisha swali kwa kutumia parameter ya 'q' kwenye endpoint yako
            const apiUrl = `https://madrinsapi.vercel.app/ai/gpt5?q=${encodeURIComponent(query)}&apikey=${apiKey}`;
            
            const response = await axios.get(apiUrl);
            
            // Kusoma data kutoka kwenye mifumo tofauti ya JSON inayoweza kurudishwa na API
            let aiResponse = response.data?.result || response.data?.response || response.data?.data || response.data;

            if (!aiResponse) throw new Error("Empty response from AI matrix server.");

            // Reaction baada ya jibu kupatikana kikamilifu
            await sock.sendMessage(from, { react: { text: '🟢', key: msg.key } });
            
            // Jibu linatumwa likiwa kamili na katika muundo wake asilia bila kufupishwa
            await sock.sendMessage(from, { text: aiResponse }, { quoted: msg });

        } catch (error) {
            console.error("ChatGPT Core Error:", error.message);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            
            const errorText = toTinyFont("error failed to get response from gpt mainframe");
            return sock.sendMessage(from, { text: `❌ *${errorText}*\n_Reason: ${error.message}_` }, { quoted: msg });
        }
    }
};