// content.js
function findMarkerInDom() {
    return Array.from(document.querySelectorAll('span,div,section,body *'))
        .find(el => el.textContent && el.textContent.trim() === 'Capo:');
}

function findPreAfter(marker) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    walker.currentNode = marker;
    let n;
    while ((n = walker.nextNode())) {
        if (n.nodeType === 1 && n.tagName.toLowerCase() === 'pre') return n;
    }
    return null;
}

function applyInvert(on) {
    document.documentElement.style.filter = on ? 'invert(1) hue-rotate(180deg)' : '';
}

function storage() {
    return (typeof browser !== 'undefined' && browser.storage) ? browser.storage : chrome.storage;
}

function getStored(key, def) {
    const s = storage();
    return new Promise(resolve => {
        if (s.local) s.local.get({[key]: def}, r => resolve(r[key]));
        else s.get({[key]: def}, r => resolve(r[key]));
    });
}

function setStored(obj) {
    const s = storage();
    return new Promise(resolve => {
        if (s.local) s.local.set(obj, () => resolve());
        else s.set(obj, () => resolve());
    });
}

function ensureToggleButton() {
    if (document.getElementById('ug-invert-toggle')) return;
    const btn = document.createElement('button');
    btn.id = 'ug-invert-toggle';
    btn.style.cssText = 'position:fixed;top:8px;right:8px;z-index:99999;padding:6px;border-radius:6px;cursor:pointer';
    btn.addEventListener('click', async () => {
        const cur = await getStored('ug_invert', false);
        const next = !cur;
        await setStored({ug_invert: next});
        applyInvert(next);
        btn.textContent = next ? 'Dark' : 'Light';
    });
    document.body.appendChild(btn);
    getStored('ug_invert', true).then(v => btn.textContent = v ? 'Dark' : 'Light');
}

function extractFromMarker(marker) {
    if (!marker) return false;
    const pre = findPreAfter(marker);
    if (!pre) return false;

    document.body.innerHTML = '';
    document.body.appendChild(pre.cloneNode(true));

    getStored('ug_invert', false).then(v => applyInvert(v));
    ensureToggleButton();

    window.__ug_extracted = true;
    return true;
}

function extractTabs(showAlerts = true) {
    if (window.__ug_extracted) return;
    if (document.body.children.length === 1 && document.body.children[0].tagName &&
        document.body.children[0].tagName.toLowerCase() === 'pre') {
        window.__ug_extracted = true;
        return;
    }

    const marker = findMarkerInDom();
    if (!marker) {
        if (showAlerts) alert('Tabs not found');
        return;
    }
    if (!extractFromMarker(marker)) {
        if (showAlerts) alert('Tabs not found');
    }
}

function onMessage(msg) {
    if (msg === 'extractTabs') extractTabs(true);
}
if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
    browser.runtime.onMessage.addListener(onMessage);
} else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(onMessage);
}

if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
    browser.runtime.onMessage.addListener(onMessage);
} else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(onMessage);
}

function urlMatchesTabPage(url) {
    try {
        const u = new URL(url);
        return /\/tab\//.test(u.pathname);
    } catch (e) { return false; }
}

async function waitForMarker(timeoutMs = 8000, intervalMs = 300) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const marker = findMarkerInDom();
        if (marker) return marker;
        await new Promise(r => setTimeout(r, intervalMs));
    }
    return null;
}

if (urlMatchesTabPage(location.href)) {
    const s = storage();
    const getter = s.local ? s.local.get.bind(s.local) : s.get.bind(s);
    getter({autoMode: false}, async res => {
        const auto = (res && res.autoMode) || false;
        if (!auto) return;
        if (window.__ug_extracted) return;
        const immediateMarker = findMarkerInDom();
        if (immediateMarker) { extractFromMarker(immediateMarker); return; }
        const marker = await waitForMarker(8000, 300);
        if (marker) extractFromMarker(marker);
    });
}
