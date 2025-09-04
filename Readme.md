# Only Tabs — краткое руководство

## 1) Структура расширения (пример)
/my-ug-extension/  
├─ manifest.json  
├─ popup.html  
├─ popup.js  
├─ content.js
├─ icon.png

---

## 2) manifest.json (пример, MV2)
```json
{
  "manifest_version": 2,
  "name": "UG Extract Tabs",
  "version": "1.0",
  "permissions": ["activeTab", "tabs", "storage"],
  "browser_action": {
    "default_title": "Show tabs",
    "default_popup": "popup.html"
  },
  "content_scripts": [
    {
      "matches": ["*://tabs.ultimate-guitar.com/*", "*://*.ultimate-guitar.com/*"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "icons": { "48": "icon.png" }
}
```

---

## 3) Установка в Firefox (временный режим)
- Открой about:debugging#/runtime/this-firefox
- Нажми "Load Temporary Add-on"
- Выбери файл `manifest.json` из папки `my-ug-extension`
- Расширение загрузится временно (до перезапуска браузера)

---

## 4) Установка в Chrome (временный режим)
- Открой chrome://extensions/
- Включи "Developer mode" (Режим разработчика)
- Нажми "Load unpacked" и выбери папку `my-ug-extension`
- Расширение загрузится временно

---

## 5) Использование
- Открой popup (клик по иконке расширения).
- Включи "Auto mode" (чекбокс) или нажми кнопку "Show tabs" для ручного запуска.
- Перейди на страницу вида `https://tabs.ultimate-guitar.com/tab/...` или другую страницу на `*.ultimate-guitar.com`.
- При включённом авто‑режиме скрипт автоматически пытается найти маркер `Capo:` и извлечь ближайший `<pre>`. После извлечения контент остаётся на белом фоне по умолчанию.

---

## 6) Примечания
- Пример использует Manifest V2. Для Manifest V3 синтаксис и подключение background/content scripts отличаются.
- Для постоянной установки нужно упаковать/подписать расширение по инструкции браузера или установить как пользовательское расширение в режиме разработчика.
- Если удаляешь кнопку "Toggle invert" из popup, удалите также соответствующие обработчики в `popup.js` и сообщения (`changeTheme`/`toggleInvert`) в `content.js`, чтобы не оставлять неиспользуемый код.