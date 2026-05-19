<template>
  <div class="page" :class="isDark ? 'dark' : 'light'">
    <div class="container">

      <!-- ── HEADER ── -->
      <header class="header">
        <div class="header-left">
          <h1 class="title-doto">SUBCONV</h1>
          <span class="title-sub">SUBSCRIPTION CONVERTER</span>
        </div>
        <div class="header-right">
          <button class="mode-btn" type="button" @click="isDark = !isDark" :title="isDark ? '切换亮色' : '切换暗色'">
            <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
          <a href="https://github.com/SubConv/SubConv" class="github-link" target="_blank" rel="noopener noreferrer" title="GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
            </svg>
          </a>
        </div>
      </header>

      <div class="divider"></div>

      <!-- ── FORM ── -->
      <form @submit.prevent class="form">

        <!-- SUBSCRIPTION -->
        <div class="field">
          <label class="field-label">SUBSCRIPTION</label>
          <textarea
            class="input-area"
            v-model="linkInput"
            rows="4"
            placeholder="粘贴订阅链接或分享链接，多条链接换行或用 | 分隔"
          ></textarea>
        </div>

        <!-- TEMPLATE + CLIENT -->
        <div class="row-two">
          <div class="field">
            <label class="field-label">TEMPLATE</label>
            <div class="select-wrapper">
              <select
                class="input-select"
                v-model="selectedTemplate"
                :disabled="isLoadingRuntimeConfig || hasRuntimeConfigError"
              >
                <option v-if="isLoadingRuntimeConfig" value="" disabled>[LOADING...]</option>
                <option v-else-if="hasRuntimeConfigError" value="" disabled>[ERROR]</option>
                <option
                  v-for="t in availableTemplates"
                  :key="t"
                  :value="t"
                >{{ t }}</option>
              </select>
              <svg class="select-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          <div class="field">
            <label class="field-label">CLIENT</label>
            <div class="segmented">
              <button
                v-for="c in clientOptions"
                :key="c.value"
                :class="['seg-btn', { 'seg-active': selectedClient === c.value }]"
                type="button"
                @click="selectedClient = c.value"
              >{{ c.label }}</button>
            </div>
          </div>
        </div>

        <!-- OPTIONS ROW -->
        <div class="row-two">
          <div class="field">
            <label class="field-label">PROXY RULESET</label>
            <div class="toggle-row" @click="proxy_switch = !proxy_switch">
              <div class="toggle" :class="{ 'toggle-on': proxy_switch }">
                <div class="toggle-thumb"></div>
              </div>
              <span class="toggle-label">{{ proxy_switch ? 'ON' : 'OFF' }}</span>
            </div>
          </div>
          <div class="field">
            <label class="field-label">STANDBY NODES</label>
            <div class="toggle-row" @click="standby_switch = !standby_switch">
              <div class="toggle" :class="{ 'toggle-on': standby_switch }">
                <div class="toggle-thumb"></div>
              </div>
              <span class="toggle-label">{{ standby_switch ? 'ON' : 'OFF' }}</span>
            </div>
          </div>
        </div>

        <!-- STANDBY INPUT -->
        <div class="field" v-if="standby_switch">
          <label class="field-label">STANDBY LINKS</label>
          <textarea
            class="input-area"
            v-model="standby"
            rows="3"
            placeholder="备用节点链接，多条换行或用 | 分隔"
          ></textarea>
        </div>

        <!-- INTERVAL -->
        <div class="field field-narrow">
          <label class="field-label">UPDATE INTERVAL</label>
          <div class="inline-input">
            <input class="input-text" v-model="time" type="text" placeholder="1800" maxlength="10" />
            <span class="input-suffix">SEC</span>
          </div>
        </div>

        <!-- INLINE ERROR -->
        <div v-if="errorMsg" class="inline-error">{{ errorMsg }}</div>

        <!-- ACTIONS -->
        <div class="actions">
          <button class="btn-primary" type="button" @click="submitForm">GENERATE</button>
          <button class="btn-secondary" type="button" @click="copyForm" :disabled="!linkOutput">COPY</button>
        </div>

        <!-- OUTPUT -->
        <div class="field output-field" v-if="linkOutput">
          <label class="field-label">OUTPUT URL</label>
          <textarea class="input-area input-output" v-model="linkOutput" rows="2" readonly></textarea>
          <span v-if="copySuccess" class="copy-status">[COPIED]</span>
        </div>

      </form>

      <!-- ── FOOTER ── -->
      <footer class="footer">
        <span>API / UI —&nbsp;</span>
        <a href="https://github.com/SubConv/SubConv" target="_blank" rel="noopener noreferrer" class="footer-link">SubConv</a>
        <span>&nbsp;·&nbsp;UI by&nbsp;</span>
        <a href="https://github.com/musanico" target="_blank" rel="noopener noreferrer" class="footer-link">@Musanico</a>
      </footer>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

// ── state ──────────────────────────────────────────────────────────────────
const isDark = ref(true)
const linkInput = ref('')
const linkOutput = ref('')
const time = ref('')
const standby = ref('')
const standby_switch = ref(false)
const proxy_switch = ref(true)
const selectedClient = ref('mihomo')
const errorMsg = ref('')
const copySuccess = ref(false)

const selectedTemplate = ref<string | null>(null)
const availableTemplates = ref<string[]>([])
const isLoadingRuntimeConfig = ref(true)
const hasRuntimeConfigError = ref(false)

const clientOptions = [
  { label: 'MIHOMO', value: 'mihomo' },
  { label: 'STASH', value: 'stash' },
]

// ── template loading ────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

const initializeTemplateSelection = async () => {
  const maxAttempts = 3
  const retryDelayMs = [500, 1500]
  isLoadingRuntimeConfig.value = true
  hasRuntimeConfigError.value = false

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch('/config')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const runtimeConfig = await response.json() as {
        defaultTemplate?: string
        availableTemplates?: string[]
      }
      const templates = Array.isArray(runtimeConfig.availableTemplates)
        ? runtimeConfig.availableTemplates : []
      if (templates.length === 0) throw new Error('No templates available')

      availableTemplates.value = templates
      const def = typeof runtimeConfig.defaultTemplate === 'string'
        ? runtimeConfig.defaultTemplate : null
      selectedTemplate.value = def && templates.includes(def) ? def : templates[0]
      isLoadingRuntimeConfig.value = false
      return
    } catch (err) {
      console.error(`Template load attempt ${attempt}/${maxAttempts}`, err)
      if (attempt < maxAttempts) { await sleep(retryDelayMs[attempt - 1]); continue }
      availableTemplates.value = []
      selectedTemplate.value = null
      hasRuntimeConfigError.value = true
      isLoadingRuntimeConfig.value = false
      errorMsg.value = '[ERROR: 模板配置加载失败，请刷新重试]'
    }
  }
}

onMounted(initializeTemplateSelection)

// ── actions ─────────────────────────────────────────────────────────────────
const submitForm = () => {
  errorMsg.value = ''
  if (!linkInput.value.trim()) {
    errorMsg.value = '[ERROR: 订阅链接不能为空]'
    return
  }
  if (!selectedTemplate.value) {
    errorMsg.value = '[ERROR: 模板配置加载失败，请刷新重试]'
    return
  }
  if (time.value && !/^[1-9][0-9]*$/.test(time.value)) {
    errorMsg.value = '[ERROR: 更新间隔必须为正整数]'
    return
  }

  let result = `${window.location.protocol}//${window.location.host}/sub`
  result += `?url=${encodeURIComponent(linkInput.value)}`
  result += `&template=${encodeURIComponent(selectedTemplate.value)}`
  if (time.value) result += `&interval=${time.value}`
  if (standby_switch.value && standby.value.trim())
    result += `&urlstandby=${encodeURIComponent(standby.value)}`
  if (!proxy_switch.value) result += '&npr=1'
  if (selectedClient.value !== 'mihomo')
    result += `&client=${encodeURIComponent(selectedClient.value)}`

  linkOutput.value = result
}

const copyForm = async () => {
  if (!linkOutput.value) return
  await navigator.clipboard.writeText(linkOutput.value)
  copySuccess.value = true
  setTimeout(() => { copySuccess.value = false }, 2000)
}
</script>

<style scoped>
/* ── TOKENS ───────────────────────────────────────────────────────────────── */
.dark {
  --bg:              #000000;
  --surface:         #111111;
  --surface-raised:  #1A1A1A;
  --border:          #222222;
  --border-visible:  #333333;
  --text-disabled:   #666666;
  --text-secondary:  #999999;
  --text-primary:    #E8E8E8;
  --text-display:    #FFFFFF;
  --accent:          #D71921;
  --interactive:     #5B9BF6;
}
.light {
  --bg:              #F5F5F5;
  --surface:         #FFFFFF;
  --surface-raised:  #F0F0F0;
  --border:          #E8E8E8;
  --border-visible:  #CCCCCC;
  --text-disabled:   #999999;
  --text-secondary:  #666666;
  --text-primary:    #1A1A1A;
  --text-display:    #000000;
  --accent:          #D71921;
  --interactive:     #007AFF;
}

/* ── RESET / BASE ─────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text-primary);
  font-family: 'Space Grotesk', 'DM Sans', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  transition: background 200ms ease-out, color 200ms ease-out;
}

.container {
  max-width: 680px;
  margin: 0 auto;
  padding: 48px 24px 64px;
}

/* ── HEADER ───────────────────────────────────────────────────────────────── */
.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}
.header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.title-doto {
  font-family: 'Doto', 'Space Mono', monospace;
  font-size: 52px;
  font-weight: 700;
  line-height: 1.0;
  letter-spacing: -0.02em;
  color: var(--text-display);
  user-select: none;
}
.title-sub {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  text-transform: uppercase;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 4px;
}
.mode-btn {
  background: none;
  border: 1px solid var(--border-visible);
  border-radius: 999px;
  color: var(--text-secondary);
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 150ms, color 150ms;
}
.mode-btn:hover { border-color: var(--text-secondary); color: var(--text-primary); }
.github-link {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  transition: color 150ms;
}
.github-link:hover { color: var(--text-primary); }

/* ── DIVIDER ──────────────────────────────────────────────────────────────── */
.divider {
  height: 1px;
  background: var(--border-visible);
  margin-bottom: 40px;
}

/* ── FORM ─────────────────────────────────────────────────────────────────── */
.form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ── FIELD ────────────────────────────────────────────────────────────────── */
.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.field-narrow { max-width: 240px; }

.field-label {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  text-transform: uppercase;
  user-select: none;
}

/* ── TWO-COLUMN ROW ───────────────────────────────────────────────────────── */
.row-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* ── TEXTAREA ─────────────────────────────────────────────────────────────── */
.input-area {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-visible);
  border-radius: 0;
  color: var(--text-primary);
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  padding: 8px 0 10px;
  resize: none;
  outline: none;
  width: 100%;
  transition: border-color 150ms;
}
.input-area::placeholder { color: var(--text-disabled); }
.input-area:focus { border-bottom-color: var(--text-primary); }
.input-output {
  color: var(--text-secondary);
  cursor: text;
}

/* ── SELECT ───────────────────────────────────────────────────────────────── */
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.input-select {
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-visible);
  border-radius: 0;
  color: var(--text-primary);
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.02em;
  padding: 8px 28px 10px 0;
  cursor: pointer;
  outline: none;
  width: 100%;
  transition: border-color 150ms;
}
.input-select:focus { border-bottom-color: var(--text-primary); }
.input-select:disabled { color: var(--text-disabled); cursor: default; }
.input-select option { background: var(--surface); color: var(--text-primary); }
.select-chevron {
  position: absolute;
  right: 4px;
  color: var(--text-secondary);
  pointer-events: none;
}

/* ── SEGMENTED CONTROL ────────────────────────────────────────────────────── */
.segmented {
  display: inline-flex;
  border: 1px solid var(--border-visible);
  border-radius: 999px;
  overflow: hidden;
  height: 36px;
  width: fit-content;
}
.seg-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.06em;
  padding: 0 18px;
  text-transform: uppercase;
  transition: background 200ms ease-out, color 200ms ease-out;
  white-space: nowrap;
}
.seg-btn:hover:not(.seg-active) { color: var(--text-primary); }
.seg-active {
  background: var(--text-display);
  color: var(--bg);
}

/* ── TOGGLE ───────────────────────────────────────────────────────────────── */
.toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  width: fit-content;
}
.toggle {
  width: 40px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid var(--border-visible);
  background: transparent;
  position: relative;
  transition: background 200ms ease-out, border-color 200ms ease-out;
  flex-shrink: 0;
}
.toggle-on {
  background: var(--text-display);
  border-color: var(--text-display);
}
.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--text-disabled);
  transition: transform 200ms ease-out, background 200ms ease-out;
}
.toggle-on .toggle-thumb {
  transform: translateX(18px);
  background: var(--bg);
}
.toggle-label {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  text-transform: uppercase;
}

/* ── TEXT INPUT ───────────────────────────────────────────────────────────── */
.inline-input {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.input-text {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-visible);
  color: var(--text-primary);
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  padding: 6px 0 8px;
  width: 100px;
  outline: none;
  transition: border-color 150ms;
}
.input-text::placeholder { color: var(--text-disabled); }
.input-text:focus { border-bottom-color: var(--text-primary); }
.input-suffix {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  text-transform: uppercase;
}

/* ── INLINE ERROR ─────────────────────────────────────────────────────────── */
.inline-error {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--accent);
  margin-top: -16px;
}

/* ── ACTIONS ──────────────────────────────────────────────────────────────── */
.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.btn-primary {
  background: var(--text-display);
  border: none;
  border-radius: 999px;
  color: var(--bg);
  cursor: pointer;
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  min-height: 44px;
  padding: 0 32px;
  text-transform: uppercase;
  transition: opacity 150ms;
}
.btn-primary:hover { opacity: 0.85; }
.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-visible);
  border-radius: 999px;
  color: var(--text-primary);
  cursor: pointer;
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.06em;
  min-height: 44px;
  padding: 0 32px;
  text-transform: uppercase;
  transition: border-color 150ms, color 150ms;
}
.btn-secondary:hover:not(:disabled) { border-color: var(--text-primary); }
.btn-secondary:disabled { color: var(--text-disabled); border-color: var(--border); cursor: default; }

/* ── OUTPUT ───────────────────────────────────────────────────────────────── */
.output-field { position: relative; }
.copy-status {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  position: absolute;
  right: 0;
  bottom: -20px;
}

/* ── FOOTER ───────────────────────────────────────────────────────────────── */
.footer {
  margin-top: 64px;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--text-disabled);
  text-transform: uppercase;
}
.footer-link {
  color: var(--text-disabled);
  text-decoration: none;
  transition: color 150ms;
}
.footer-link:hover { color: var(--text-secondary); }

/* ── RESPONSIVE ───────────────────────────────────────────────────────────── */
@media (max-width: 560px) {
  .container { padding: 32px 20px 48px; }
  .title-doto { font-size: 40px; }
  .row-two { grid-template-columns: 1fr; gap: 32px; }
  .field-narrow { max-width: 100%; }
}
</style>

