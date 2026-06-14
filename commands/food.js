const https = require('https');

module.exports = {
    name: "food",
    alias: ["recipe", "dish"],
    description: "Get detailed food info, origin, ingredients, and instructions.",
    category: "food",

    execute: async (sock, chatId, m, args) => {
        try {
            // 1. Get the query from args or quoted message
            let query = args.join(" ");
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!query && quoted) {
                query = quoted.conversation || quoted.extendedTextMessage?.text;
            }

            if (!query) return sock.sendMessage(chatId, { text: "❓ Please provide a food name.\n\nExample: `.food Pizza`" });

            // 2. TheMealDB API URL (Free and very stable for recipes)
            const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;

            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', async () => {
                    try {
                        const json = JSON.parse(data);
                        
                        if (!json.meals) {
                            return sock.sendMessage(chatId, { text: `❌ No detailed recipe found for "${query}". Try common names like 'Burger', 'Steak', or 'Pasta'.` });
                        }

                        const meal = json.meals[0];

                        // 3. Extract and Format Ingredients
                        let ingredients = "";
                        for (let i = 1; i <= 20; i++) {
                            const ingredient = meal[`strIngredient${i}`];
                            const measure = meal[`strMeasure${i}`];
                            if (ingredient && ingredient.trim() !== "") {
                                ingredients += `📍 ${ingredient} (${measure})\n`;
                            }
                        }

                        // 4. Construct the Final English Message
                        const recipeMessage = `🍴 *DISH:* ${meal.strMeal.toUpperCase()}\n` +
                                            `🌍 *ORIGIN:* ${meal.strArea}\n` +
                                            `📂 *CATEGORY:* ${meal.strCategory}\n\n` +
                                            `📜 *INGREDIENTS:*\n${ingredients}\n` +
                                            `👨‍🍳 *COOKING INSTRUCTIONS:*\n${meal.strInstructions}\n\n` +
                                            `🎥 *VIDEO GUIDE:* ${meal.strYoutube || 'N/A'}\n\n` +
                                            `*Powered by Yas-Tech*`;

                        await sock.sendMessage(chatId, { text: recipeMessage }, { quoted: m });

                    } catch (e) {
                        console.error(e);
                        sock.sendMessage(chatId, { text: "⚠️ Error processing the data. Please try again." });
                    }
                });
            }).on('error', (err) => {
                console.error(err);
                sock.sendMessage(chatId, { text: "⚠️ Connection error. The server could not reach the API." });
            });

        } catch (err) {
            console.error(err);
        }
    }
};
