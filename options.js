document.addEventListener("DOMContentLoaded", () => {

    chrome.storage.sync.get(['GroqApikey'], (result) => {
        if (result.GroqApikey) {
            document.getElementById("api-key").value = result.GroqApikey;
        }
    });

    document.getElementById("save-button").addEventListener("click", () => {

        const apikey = document.getElementById("api-key").value.trim();
        if (!apikey) return;

        chrome.storage.sync.set({ GroqApikey: apikey }, () => {
            document.getElementById("success-message").style.display = "block";
            setTimeout(() => window.close(), 1000);
        });

    });

});