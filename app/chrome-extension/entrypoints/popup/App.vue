<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { NativeMessageType } from 'chrome-mcp-shared'
import { BACKGROUND_MESSAGE_TYPES } from '~/common/message-types'

const connected = ref(false)
const isRunning = ref(false)
const port = ref<number | null>(null)
const lastUpdated = ref<number | null>(null)
const busy = ref(false)
const toast = ref('')

let timer: number | undefined

const serviceText = computed(() => {
  if (connected.value && isRunning.value && port.value) {
    return `服务运行中 (端口: ${port.value})`
  }
  if (connected.value) return '服务未启动'
  return '服务未连接'
})

const statusText = computed(() => {
  if (connected.value && isRunning.value) return '服务运行中'
  if (connected.value) return '已连接，服务未启动'
  return '服务未连接'
})

const statusClass = computed(() => {
  if (connected.value && isRunning.value) return 'ok'
  if (!connected.value) return 'bad'
  return ''
})

const toggleLabel = computed(() => (connected.value ? '断开' : '连接'))
const toggleClass = computed(() => (connected.value ? 'disconnect' : 'connect'))

function fmtTime(ts?: number | null) {
  if (!ts) return '—'
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function setToast(msg: string, isErr = false) {
  toast.value = isErr ? msg : msg
}

async function refresh() {
  try {
    const res = (await chrome.runtime.sendMessage({
      type: BACKGROUND_MESSAGE_TYPES.GET_SERVER_STATUS,
    })) as {
      serverStatus?: { isRunning?: boolean; port?: number; lastUpdated?: number }
      connected?: boolean
    }
    connected.value = !!res?.connected
    isRunning.value = !!res?.serverStatus?.isRunning
    port.value = res?.serverStatus?.port ?? null
    lastUpdated.value = res?.serverStatus?.lastUpdated ?? null
    setToast('')
  } catch (e) {
    connected.value = false
    isRunning.value = false
    setToast(String((e as Error)?.message || e), true)
  }
}

async function onToggle() {
  if (busy.value) return
  busy.value = true
  const willDisconnect = connected.value
  setToast(willDisconnect ? '正在断开…' : '正在连接…')
  try {
    const type = willDisconnect
      ? NativeMessageType.DISCONNECT_NATIVE
      : NativeMessageType.CONNECT_NATIVE
    const res = (await chrome.runtime.sendMessage({ type })) as { connected?: boolean }
    if (willDisconnect) setToast('已断开')
    else if (res?.connected) setToast('已连接')
    else setToast('连接失败', true)
  } catch (e) {
    setToast(String((e as Error)?.message || e), true)
  }
  await refresh()
  busy.value = false
}

onMounted(() => {
  refresh()
  timer = window.setInterval(refresh, 2000)
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === BACKGROUND_MESSAGE_TYPES.SERVER_STATUS_CHANGED) refresh()
  })
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <div class="popup">
    <header class="header">
      <span class="dot" :class="{ on: connected && isRunning }"></span>
      <span class="title">Chrome MCP</span>
    </header>

    <main class="card">
      <div class="label">运行状态</div>
      <div class="badge" :class="statusClass">{{ statusText }}</div>
      <div class="row">
        <span class="k">服务</span>
        <span class="v">{{ serviceText }}</span>
      </div>
      <div class="row">
        <span class="k">最后更新</span>
        <span class="v">{{ fmtTime(lastUpdated) }}</span>
      </div>
    </main>

    <button type="button" class="btn" :class="toggleClass" :disabled="busy" @click="onToggle">
      {{ toggleLabel }}
    </button>

    <p class="toast" :class="{ err: !!toast && toast.includes('失败') }">{{ toast }}</p>
  </div>
</template>
