//inbuild functions od chrome
chrome.runtime.onInstalled.addListener(()=>{
    chrome.storage.sync.get(["GroqAPIkey"],(result)=>{
        if(!result.GroqAPIkey){
            //if the api is not fetch then will open chrome options
            chrome.tabs.create({url:"options.html"});
        }
    })
})