document.getElementById("summarize").addEventListener("click", async () => {

    const resultDiv = document.getElementById("result");
    const summaryType = document.getElementById("summary-type").value;

    resultDiv.innerHTML = '<div class="loader"></div>';

    // Get User API Key
    chrome.storage.sync.get(['GroqApikey'], ({ GroqApikey }) => {
        if (!GroqApikey) {
            resultDiv.textContent = "No API set. Click extension options to add one.";
            return;
        }

        // Ask content.js for page text
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            chrome.tabs.sendMessage(tab.id, { type: "GET_ARTICLE_TEXT" }, async (response) => {
                if (chrome.runtime.lastError) {
                    resultDiv.textContent = "Content script not loaded.";
                    return;
                }
                const text = response?.text;
                if (!text) {
                    resultDiv.textContent = "Couldn't extract text from this page.";
                    return;
                }
                // Send text to AI
                try {
                  const summary = await getGroqSummary(text, summaryType, GroqApikey);
                    resultDiv.textContent = summary;
                } catch (error) {
                    resultDiv.textContent = "Groq Error: " + error.message;
                }
            });
        });
    });
});
async function getGroqSummary(rawText, type, apiKey) {
    const max = 6000;
    const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;
   const promptMap = {
    brief: `Summarize in 2-3 sentences:\n\n${text}`,
    detailed: `Give a detailed summary:\n\n${text}`,
    bullets: `Summarize in 5-7 bullet points (start each line with "-"):\n\n${text}`,
    short: `Give a very short summary in one sentence:\n\n${text}`,
    keywords: `Extract the most important keywords from this text:\n\n${text}`,
    explainSimple: `Explain this article in very simple language for beginners:\n\n${text}`,
    highlights: `Give the key highlights of this article:\n\n${text}`,
    facts: `List the important facts from this article:\n\n${text}`,
    tweet: `Summarize this article as a tweet under 280 characters:\n\n${text}`,
    title: `Generate a good title for this article:\n\n${text}`,
    proscons: `Extract pros and cons from this article:\n\n${text}`
};
    const prompt = promptMap[type] || promptMap.brief;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({

           model: "llama-3.1-8b-instant",

            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]

        })

    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || "Groq API failed");
    }

    return data.choices[0].message.content;

}

document.getElementById("copy-btn").addEventListener('click',()=>{
    const txt=document.getElementById("result").innerText;
    if(!txt) return;
    navigator.clipboard.writeText(txt).then(()=>{
        const btn=document.getElementById("copy-btn");
        const old=btn.textContent;
        btn.textContent="Copied!";
        setTimeout(()=>(btn.textContent=old),2000);
    })
})