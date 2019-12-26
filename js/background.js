chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
        // install
        window.open(chrome.extension.getURL('html/options.html'));
    }
    if (details.reason === 'update') {
        // 更新事件
    }

});
chrome.browserAction.onClicked.addListener(function(tab) {
    window.open(chrome.extension.getURL('html/options.html'));
});