const api = (typeof browser !== 'undefined') ? browser : chrome;
api.browserAction.onClicked.addListener(tab => {
    api.tabs.sendMessage(tab.id, 'extractTabs').catch(()=>{});
});