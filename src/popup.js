const auto = document.getElementById('auto');
const go = document.getElementById('go');

browser.storage.local.get({autoMode: false}).then(res => {
    auto.checked = !!res.autoMode;
});

auto.addEventListener('change', () => {
    browser.storage.local.set({autoMode: auto.checked});
});

go.addEventListener('click', () => {
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
        browser.tabs.sendMessage(tabs[0].id, 'extractTabs').catch(()=>{});
    });
});
