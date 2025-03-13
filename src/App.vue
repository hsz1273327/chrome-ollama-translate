<template>
  <n-flex vertical>
    <n-dropdown trigger="hover" :options="options" @select="handleSelect">
      <n-button>{{ chosen_model }}</n-button>
    </n-dropdown>
    <n-divider />
    system:
    <n-input type="textarea" v-model:value="system_prompt" :autosize="{
      minRows: 3,
    }" />
    <n-button @click="save_system_prompt">保存</n-button>
    <n-divider />
    template:
    <n-input type="textarea" v-model:value="prompt_template" :autosize="{
      minRows: 3,
    }" />
    ps: 请使用`{content}`来替换输入的内容
    <n-button @click="save_prompt_template">保存</n-button>
  </n-flex>
</template>
<script setup lang="ts">
import { ref, onBeforeMount, type Ref } from 'vue'
import { NInput, NDivider, NButton, NFlex, NDropdown, type DropdownOption } from 'naive-ui'
import browser from "webextension-polyfill";

const CHOSEN_MODEL_KEY = "chosen_model"
const SYSTEM_PROMPT_KEY = "system_prompt"
const PROMPT_TEMPLATE_KEY = "prompt_template"
interface Info {
  name: string
}
const options: Ref<DropdownOption[]> = ref([])
const chosen_model = ref("选择模型")
const system_prompt = ref("")
const prompt_template = ref("")


async function save_system_prompt() {
  await saveSystemPrompt(system_prompt.value)

}
async function save_prompt_template() {
  await savePromptTemplate(prompt_template.value)

}
async function handleSelect(key: string) {
  chosen_model.value = key
  await saveChosenModel(chosen_model.value)
}

async function saveChosenModel(value: string) {
  await browser.storage.local.set({ [CHOSEN_MODEL_KEY]: value })
}
async function getChosenModel() {
  const ChosenModelInStorage = await browser.storage.local.get(CHOSEN_MODEL_KEY)
  let _chosen_model = ChosenModelInStorage[CHOSEN_MODEL_KEY] as string | undefined
  if (_chosen_model) {
    chosen_model.value = _chosen_model
  }
}
async function saveSystemPrompt(value: string) {
  await browser.storage.local.set({ [SYSTEM_PROMPT_KEY]: value })
}
async function getSystemPrompt() {
  const SystemPromptInStorage = await browser.storage.local.get(SYSTEM_PROMPT_KEY)
  let _systemprompt = SystemPromptInStorage[SYSTEM_PROMPT_KEY] as string | undefined
  if (_systemprompt) {
    system_prompt.value = _systemprompt
  } else {
    system_prompt.value = `## Role: 翻译人员 
 ## Profile: 
 - author: 黄思喆
 - version: 0.1 
 - language: 中文 
 - description: 我是一个优秀的翻译人员，可以将汉字翻译成英文和日语，并提供日语假名。输出结束后，会增加一个横线。 
 ## Goals: 
 将用户输入的文字翻译成中文
 ## Constrains: 
 除非不认识否则不提供任何额外解释说明 
 ## Skills: 
 熟练掌握汉语、英语,法语和日语，熟悉日语假名 

 ## Initialization: 
 欢迎用户, 提示用户输入内容`
  }
  await saveSystemPrompt(system_prompt.value)
}

async function savePromptTemplate(value: string) {
  await browser.storage.local.set({ [PROMPT_TEMPLATE_KEY]: value })
}
async function getPromptTemplate() {
  const PromptTemplateInStorage = await browser.storage.local.get(PROMPT_TEMPLATE_KEY)
  let _prompt_template = PromptTemplateInStorage[PROMPT_TEMPLATE_KEY] as string | undefined
  if (_prompt_template) {
    prompt_template.value = _prompt_template
  } else {
    prompt_template.value = `请将下面的文本翻译为中文:
    "{content}"
    直接给出答案不要说废话`
    await savePromptTemplate(prompt_template.value)
  }
}
async function getOllamaModels() {
  const res = await fetch("http://localhost:11434/api/tags")
  if (res.status !== 200) {
    console.error("Failed to fetch models")
    return
  }
  const data = await res.json()
  let _options: DropdownOption[] = []
  data["models"].forEach((info: Info) => {
    _options.push({ label: info["name"], key: info["name"] })
  })
  options.value = _options
}
onBeforeMount(() => {
  Promise.all([
    getOllamaModels(),
    getChosenModel(),
    getPromptTemplate(),
    getSystemPrompt()
  ]).then(() => {
    console.log("All models fetched");
  });
})
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
