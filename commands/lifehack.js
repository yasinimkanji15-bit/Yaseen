const { prepareWAMessageMedia } = require('@whiskeysockets/baileys');

// --- DATABASE YA LIFE HACKS KULINGANA NA MAKUNDI (ENGLISH ONLY) ---
const LIFEHACKS_DATABASE = {
      tech: [
        "Accidentally closed a tab? Press 'Ctrl + Shift + T' to reopen it instantly on your browser.",
        "Clear phone storage quickly by deleting large video files from your WhatsApp sent folder.",
        "Want to download a YouTube video quickly? Just add 'ss' to the URL right before 'youtube.com'.",
        "If you want to download an image from Google directly without saving, hold 'Alt' and click the image.",
        "Your phone charges much faster if you switch it to Airplane Mode while plugging it in.",
        "When copying text from the internet, press 'Ctrl + Shift + V' to paste it without any annoying formatting.",
        "Need a temporary disposable email for a sketchy website? Use 10minutemail.com to avoid spam.",
        "If your computer is lagging, press 'Ctrl + Shift + Esc' to open Task Manager and kill heavy background apps.",
        "Add 'nsfw' before 'youtube.com' in any video URL to bypass age restrictions without signing in.",
        "Type 'google.com/ncr' to prevent Google from automatically redirecting you to your local country's domain.",
        "Use your spacebar to scroll down a webpage, and 'Shift + Spacebar' to scroll back up easily.",
        "If you lose your Android phone, type 'Find My Device' on Google from any desktop to locate or ring it.",
        "Before downloading a file, look at the extension. If it's an '.exe' file instead of a PDF/Video, delete it immediately.",
        "Press 'Windows Key + V' on your PC to open your clipboard history and see everything you copied earlier.",
        "To quickly rename any file on Windows, just click the file and hit the 'F2' key.",
        "Stuck on a website that doesn't allow you to copy text? Take a screenshot and use Google Lens to extract the text.",
        "If a YouTube video is blocked in your country, replace 'watch?v=' with 'v/' in the URL to watch it anyway.",
        "Press 'Windows Key + Period (.)' on Windows to open the native emoji keyboard anywhere.",
        "Type 'calc' in your Windows search bar or run box to instantly pull up the calculator without searching programs.",
        "If you want to zoom in or out on any webpage instantly, hold 'Ctrl' and scroll your mouse wheel up or down."
    ],
    health: [
        "Drink a glass of water right after waking up to activate your internal organs and boost energy.",
        "If you have a headache, submerge your hands in ice water and flex them; it helps relieve pressure.",
        "To fall asleep faster, try the 4-7-8 breathing method: inhale for 4s, hold for 7s, exhale for 8s.",
        "Feeling sleepy during a study or coding session? Hold your breath for as long as you can and release it.",
        "If you burn your tongue with hot coffee or tea, put a spoonful of sugar on it to soothe the pain quickly.",
        "Chewing gum while chopping onions prevents tears by forcing you to breathe through your mouth.",
        "If you get a brain freeze from ice cream, press your tongue flat against the roof of your mouth to warm it up.",
        "Feeling stressed or anxious? Breathe in deeply through your nose, hold it, and sigh it out loudly.",
        "To stop a hiccup attack instantly, swallow a single teaspoon of sugar or peanut butter dry.",
        "If you feel dizzy in bed, put one foot flat on the floor. It resets your brain's internal balance system.",
        "Drink a cup of green tea before working out to boost your metabolism and burn more calories.",
        "To stop a minor paper cut or scrape from stinging, apply a thin layer of lip balm over it.",
        "If you struggle with bad breath, make sure you scrub the back of your tongue when brushing your teeth.",
        "Need an instant energy boost? Take a cold shower for just 30 seconds at the end of your bath.",
        "If you have trouble digesting heavy meals, try sleeping on your left side to help your stomach layout.",
        "Struggling with a blocked nose? Press your tongue to the roof of your mouth and press your thumb between your eyebrows for 20s.",
        "Keep your phone across the room when sleeping. It stops you from scrolling late and forces you to get up for the alarm.",
        "If your eyes feel tired from staring at your screen, use the 20-20-20 rule: look 20 feet away for 20 seconds every 20 minutes.",
        "Sniffing a fresh lemon or tasting its juice can instantly reduce nausea and motion sickness.",
        "To prevent muscle cramps after a heavy workout or walk, make sure you eat a banana for its potassium."
    ],
    study: [
        "Use the Pomodoro Technique: Study hard for 25 minutes, then take a 5-minute break to keep your brain sharp.",
        "Writing notes by hand helps you retain information much better than typing them on a laptop.",
        "After learning something new, try explaining it to someone else. It locks the knowledge into your memory.",
        "If you need to memorize a long list of items, create a funny acronym or phrase using the first letters.",
        "When studying a long document, change the font to 'Times New Roman' or 'Bionic Reading' to read faster.",
        "Chew a unique flavor of gum while studying, then chew that same flavor during the test to trigger your memory.",
        "Listen to video game soundtracks while studying. They are designed to keep you focused without lyrics distracting you.",
        "If you can't understand a complex topic, search for it on YouTube with 'ELI5' (Explain Like I'm 5) at the end.",
        "Spray an unfamiliar cologne or perfume while reviewing your notes to help trigger memory recall during exams.",
        "Always study difficult concepts right before going to sleep. Your brain processes and stores data better during sleep.",
        "If you are stuck writing an essay, copy your text into Google Translate and listen to it read out loud to catch errors.",
        "Use the 'Feynman Technique': Read a topic, then try to write a summary of it as if you are teaching a child.",
        "Keep a blank sheet of paper next to you while studying. Write down any random distracting thoughts to review later.",
        "If you need to find direct PDF files on Google, type your search term followed by 'filetype:pdf'.",
        "Don't study in your bed. Your brain associates the bed with sleep, making you lose focus and feel tired faster.",
        "To memorize quotes or equations, write them on sticky notes and paste them on your bathroom mirror.",
        "When reading a textbook, read the summary and review questions at the back of the chapter *before* reading the text.",
        "Take a 10-minute walk before an exam or study session. It increases brain activity and upgrades focus.",
        "If you use Wikipedia for research, change 'en.wikipedia' to 'simple.wikipedia' in the URL for an easy summary.",
        "Reward yourself with a small piece of chocolate or a quick break after completing every single study chapter."
    ],
    money: [
        "When shopping online, clear your browser cookies or use incognito mode to avoid dynamic price increases.",
        "Always wait 48 hours before buying something non-essential. If you still want it, then buy it.",
        "Track your daily micro-expenses. Small snacks and drinks add up to a huge monthly cost.",
        "Never go grocery shopping on an empty stomach. You will end up buying things you don't actually need.",
        "If you want to save money effortlessly, set up an automatic transfer to your savings account on payday.",
        "Before buying an expensive item online, use coupon aggregator sites or check for discount codes.",
        "When booking flights or hotels online, always search on a Tuesday or Wednesday for cheaper rates.",
        "Cancel subscriptions you haven't used in the last 30 days. You can always sign up again if you need them.",
        "Before replacing a broken item, search YouTube for a DIY repair guide. Most fixes are incredibly simple.",
        "Buy items you use daily (like soap, tissues, or coffee) in bulk. It saves a lot of money in the long run.",
        "When eating out at restaurants, ask for tap water instead of bottled water or soda to save on the bill.",
        "Calculate the cost of an item in terms of your hourly wage before buying it. Ask yourself: 'Is this worth 5 hours of work?'",
        "Keep your spare change in a physical jar or container. You'll be shocked at how fast it adds up over a year.",
        "Unsubscribe from retail marketing emails. If you don't see the sale alerts, you won't feel tempted to spend.",
        "Instead of buying new books, search for free legal digital versions on Project Gutenberg or PDFDrive.",
        "If you have a credit card, set up text alerts for every transaction to instantly monitor budget leaks.",
        "Learn to cook 3 basic, delicious meals at home. It cuts down your relying on expensive food deliveries.",
        "When buying clothes, choose classic, high-quality items over cheap, fast-fashion trends that ruin quickly.",
        "If you are planning to buy something on an app, add it to your cart and leave it for a few days; they often email you a discount.",
        "Adopt a 'No-Spend Weekend' once a month where you only do free activities like walking, reading, or watching movies."
    ],
    daily: [
        "Put a piece of charcoal in your fridge; it naturally absorbs all bad odors and smells.",
        "To clean a microwave easily, microwave a bowl of water with lemon slices for 3 minutes, then wipe it down.",
        "Put your phone in a bowl or mug to naturally amplify the speaker sound like a DIY amplifier.",
        "To find the end of a roll of tape easily, stick a small paperclip or toothpick to the sticky end after using it.",
        "If your shoes smell bad, place dry tea bags inside them overnight to absorb the moisture and odor.",
        "Rub a walnut over scratches on wooden furniture to make them disappear magically.",
        "Tie a brightly colored ribbon to your luggage bag to spot it instantly on the airport or bus terminal carousel.",
        "If a zipper gets stuck, rub the teeth of the zipper with a graphite pencil or candle wax to loosen it.",
        "To stop keys from jingling loudly in your pocket, wrap a small rubber band tightly around them.",
        "Keep your ice cream container inside a zip-lock bag in the freezer to keep it soft and easy to scoop.",
        "Drop a tiny piece of paper into a public toilet bowl before using it to completely prevent water splashes.",
        "If you drop a small item like an earring or screw, put a sock over a vacuum hose and turn it on to find it.",
        "To chill a soda or drink bottle in 10 minutes, wrap it in a wet paper towel before placing it in the freezer.",
        "Hang your shirts or jackets in the bathroom while taking a hot shower to let the steam remove wrinkles naturally.",
        "To remove a stubborn sticker or label cleanly, blast it with a hair dryer for 30 seconds to melt the glue.",
        "If you struggle to open a tight glass jar, wrap a thick rubber band around the lid to give yourself maximum grip.",
        "Store your bedsheet sets inside one of their matching pillowcases to keep your closet neat and organized.",
        "Put a small drop of superglue on your screwdriver tip to hold a loose screw in place while fixing things upside down.",
        "When packing a suitcase, roll your clothes instead of folding them. It saves space and stops deep creases.",
        "To clean a blender in seconds, fill it halfway with warm water, add a drop of dish soap, and blend it."
    ]
 } ;
// Picha maalumu kwa ajili ya Life Hacks
const DEFAULT_IMAGE = "https://files.catbox.moe/038kef.jpg";

module.exports = {
    name: "lifehack",
    alias: ["hack", "hacks", "tech_hack", "health_hack", "study_hack", "money_hack", "daily_hack"],
    description: "Get smart life hacks and daily tricks for yourself or a tagged friend.",
    category: "fun",

    execute: async (sock, chatId, message, args, { pushname }) => {
        try {
            const msgStructure = message.message;
            const incomingText = (
                msgStructure?.conversation || 
                msgStructure?.extendedTextMessage?.text || 
                msgStructure?.buttonsResponseMessage?.selectedButtonId || 
                msgStructure?.templateButtonReplyMessage?.selectedId ||
                msgStructure?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
                ""
            ).trim().toLowerCase();

            let categoryInput = args[0]?.toLowerCase();

            // Kutambua aina ya hack kulingana na maandishi yaliyotumwa au kubofya kitufe
            if (/tech/i.test(incomingText)) categoryInput = 'tech';
            else if (/health/i.test(incomingText)) categoryInput = 'health';
            else if (/study/i.test(incomingText)) categoryInput = 'study';
            else if (/money/i.test(incomingText)) categoryInput = 'money';
            else if (/daily/i.test(incomingText)) categoryInput = 'daily';

            // Ulinzi wa hali ya juu kukamata JID ya mtu ili kuzuia split error kabisa
            let targetUser = null;
            
            if (msgStructure?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetUser = msgStructure.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (message.key?.participant) {
                targetUser = message.key.participant;
            } else if (message.sender) {
                targetUser = message.sender;
            } else {
                targetUser = chatId;
            }

            if (typeof targetUser !== 'string') {
                targetUser = String(targetUser);
            }

            // ====================================================
            // SECTION 1: KUTUMA MENU YA VIFUNGO (KAMA HAJACHAGUA)
            // ====================================================
            if (!categoryInput || !LIFEHACKS_DATABASE[categoryInput]) {
                await sock.sendMessage(chatId, { react: { text: '🧠', key: message.key } });

                const menuText = `*💡 YASEEN-MD LIFE HACKS ROUTER*\n\nHello *${pushname}*, please select a life hack category you want to display for the user:`;

                const { sendButtons } = require('gifted-btns');
                return await sendButtons(sock, chatId, {
                    title: '┏━━━〔 SELECT HACK SECTOR 〕━━━┓',
                    text: menuText,
                    footer: '© POWERED BY YASEEN-MD',
                    aimode: false,
                    buttons: [
                        { id: 'tech_hack', text: '💻 Tech Hacks' },
                        { id: 'health_hack', text: '🏥 Health & Body' },
                        { id: 'study_hack', text: '📚 Study Tips' },
                        { id: 'money_hack', text: '💵 Money Saving' },
                        { id: 'daily_hack', text: '🏡 Daily Life Tricks' }
                    ]
                });
            }

            // ====================================================
            // SECTION 2: KUTUMA HACK ILIYOCHAGULIWA HUKU MTU AKITAGIWA
            // ====================================================
            await sock.sendMessage(chatId, { react: { text: '⚡', key: message.key } });

            const selectedGroup = LIFEHACKS_DATABASE[categoryInput];
            const randomHack = selectedGroup[Math.floor(Math.random() * selectedGroup.length)];

            const mentionTag = `@${targetUser.split('@')[0]}`;
            const finalCaption = `*💡 ${categoryInput.toUpperCase()} HACK FOR ${mentionTag}*\n\n> "${randomHack}"\n\n_Sent via YASEEN-MD_`;

            return await sock.sendMessage(chatId, {
                image: { url: DEFAULT_IMAGE },
                caption: finalCaption,
                mentions: [targetUser]
            }, { quoted: message });

        } catch (error) {
            console.error("Lifehacks Interactive Error:", error);
            return await sock.sendMessage(chatId, { text: `❌ *System Error:* ${error.message}` });
        }
    }
};
