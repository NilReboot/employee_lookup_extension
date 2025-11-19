document.getElementById('btnRescan').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.id) {
        // Send script to run the exposed global function
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                if (window.EntityScanner) {
                    window.EntityScanner.rescan();
                    alert('Page re-scanned!');
                } else {
                    alert('Scanner not active on this page.');
                }
            }
        });
    }
});