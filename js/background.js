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

// 破解课堂派VIP下载全部作业功能功能

// 监听发送请求
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        return {
            redirectUrl: chrome.extension.getURL('js/ketangpai/hreview.js')
        };
    }, {
        urls: [
            "https://www.ketangpai.com/Public/Home/js/hreview.js*"
        ],
        types: ["script"]
    }, ["blocking"]
);