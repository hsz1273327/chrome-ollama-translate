import browser, { type Menus, type Notifications } from "webextension-polyfill"
const CHOSEN_MODEL_KEY = "chosen_model"
const SYSTEM_PROMPT_KEY = "system_prompt"
const PROMPT_TEMPLATE_KEY = "prompt_template"

browser.contextMenus.create({
    'type': 'normal',
    'title': "ollama翻译",
    'contexts': ['selection'],
    'id': "ollama-translate"
})

browser.contextMenus.onClicked.addListener(async (item: Menus.OnClickData) => {
    const tld = item.menuItemId
    if (tld == "ollama-translate") {
        //获取捕获的文本
        if (!item.selectionText) {
            await browser.notifications.create({
                "type": 'basic' as Notifications.TemplateType,
                "iconUrl": '../images/icon48.png',
                "title": "错误",
                "message": "未捕获到文本"
            })
            return
        }
        // 获取模型信息
        const ChosenModelInStorage = await browser.storage.local.get(CHOSEN_MODEL_KEY)
        const chosen_model = ChosenModelInStorage[CHOSEN_MODEL_KEY] as string | undefined
        if (!chosen_model) {
            await browser.notifications.create({
                "type": 'basic' as Notifications.TemplateType,
                "iconUrl": '../images/icon48.png',
                "title": "配置错误",
                "message": "翻译模型未配置,请前往设置页面配置"
            })
            return
        }
        // 获取系统提示信息
        const SystemPromptInStorage = await browser.storage.local.get(SYSTEM_PROMPT_KEY)
        const systemprompt = SystemPromptInStorage[SYSTEM_PROMPT_KEY] as string | undefined
        if (!systemprompt) {
            await browser.notifications.create({
                "type": 'basic' as Notifications.TemplateType,
                "iconUrl": '../images/icon48.png',
                "title": "配置错误",
                "message": "翻译系统提示未配置,请前往设置页面配置"
            })
            return
        }
        // 获取模板信息
        const PromptTemplateInStorage = await browser.storage.local.get(PROMPT_TEMPLATE_KEY)
        const prompt_template = PromptTemplateInStorage[PROMPT_TEMPLATE_KEY] as string | undefined
        if (!prompt_template) {
            await browser.notifications.create({
                "type": 'basic' as Notifications.TemplateType,
                "iconUrl": '../images/icon48.png',
                "title": "配置错误",
                "message": "翻译模板未配置,请前往设置页面配置"
            })
            return
        }
        const content = prompt_template.replace("{content}", item.selectionText)
        // 获取翻译内容
        const translateData = {
            "model": chosen_model,
            "messages": [
                {
                    "role": "system",
                    "content": systemprompt
                },
                {
                    "role": "user",
                    "content": content
                },
            ],
            "stream": false
        }
        const prompt_data = JSON.stringify(translateData)
        console.log(prompt_data)
        const translateResult = await fetch(
            "http://localhost:11434/api/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: prompt_data,
                mode: "cors"
            })
        if (translateResult.status != 200) {
            await browser.notifications.create({
                "type": 'basic' as Notifications.TemplateType,
                "iconUrl": '../images/icon48.png',
                "title": "错误",
                "message": `翻译失败:${translateResult.status}`,
                "contextMessage": translateResult.statusText
            })
            return
        }
        const translateResultJsonString = await translateResult.text()
        console.log(translateResultJsonString)
        const translateResultJson = JSON.parse(translateResultJsonString)
        let translateResultContent = translateResultJson["message"]["content"] as string
        if (translateResultContent.includes("</think>")) {
            const translateResultContentList = translateResultContent.split('</think>')
            if (translateResultContentList.length >= 1) {
                translateResultContent = translateResultContentList[1].trim()
            }
        }
        console.log(translateResultContent)
        const tabs = await browser.tabs.query({ active: true, currentWindow: true })
        const targetTab = tabs[0]

        if (targetTab.id !== undefined) {
            await browser.tabs.sendMessage(targetTab.id, {
                cmd: "show_translate_result",
                content: translateResultContent
            })
        } else {
            await browser.notifications.create({
                "type": 'basic' as Notifications.TemplateType,
                "iconUrl": '../images/icon48.png',
                "title": "错误",
                "message": "未找到目标标签页"
            })
        }
    }
})