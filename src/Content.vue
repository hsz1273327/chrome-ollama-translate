<template>
    <n-popconfirm :show="showPopover" :x="x" :y="y" placement="right-start" trigger="manual" style="max-height: 240px"
        content-style="padding: 0;" scrollable :positive-text="null" @negative-click="handleNegativeClick">
        {{ content }}
    </n-popconfirm>
</template>

<script setup lang="ts">
import browser, { type Runtime } from "webextension-polyfill"
import { NPopconfirm } from 'naive-ui'
import { ref } from 'vue'
const showPopover = ref(false)
const x = ref(3 * document.documentElement.clientWidth / 4)
const y = ref(document.documentElement.clientHeight / 4)
const content = ref("")
interface Request {
    cmd: string
    content: string

}

browser.runtime.onMessage.addListener((_request: unknown, _sender: Runtime.MessageSender, sendResponse: (response: unknown) => void) => {
    const request = _request as Request
    if (request.cmd == "show_translate_result") {
        content.value = request.content
        showPopover.value = true
    }
    sendResponse("ok")
    return true
})
function handleNegativeClick() {
    showPopover.value = false
}
</script>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
