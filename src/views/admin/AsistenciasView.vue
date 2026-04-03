<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-medium text-[#1E1252]">Asistencias</h1>
      <p class="text-sm text-[#9B89D4] mt-0.5">Registra entradas y salidas — {{ fechaHoy }}</p>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <!-- Panel de captura -->
      <div class="space-y-4">
        <!-- Selector entrada/salida -->
        <div class="bg-white rounded-2xl border border-[#ece9f8] p-4">
          <p class="text-xs font-medium text-[#6B7280] mb-3">Tipo de registro</p>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="tipo = 'entrada'"
              class="py-3 rounded-xl text-sm font-medium transition border-2"
              :class="
                tipo === 'entrada'
                  ? 'bg-[#E1F5EE] border-[#1D9E75] text-[#0F6E56]'
                  : 'border-[#ece9f8] text-[#9B89D4] hover:bg-[#F8F7FC]'
              "
            >
              Entrada
            </button>
            <button
              @click="tipo = 'salida'"
              class="py-3 rounded-xl text-sm font-medium transition border-2"
              :class="
                tipo === 'salida'
                  ? 'bg-[#FAECE7] border-[#D85A30] text-[#993C1D]'
                  : 'border-[#ece9f8] text-[#9B89D4] hover:bg-[#F8F7FC]'
              "
            >
              Salida
            </button>
          </div>
        </div>

        <!-- Cámara QR -->
        <div class="bg-white rounded-2xl border border-[#ece9f8] p-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-medium text-[#6B7280]">Cámara</p>
            <button
              @click="toggleCamara"
              class="text-xs px-3 py-1.5 rounded-lg border border-[#ece9f8] text-[#6B4FBB] hover:bg-[#F4F2FB] transition"
            >
              {{ camaraActiva ? 'Detener' : 'Activar cámara' }}
            </button>
          </div>
          <div
            id="qr-reader"
            class="w-full rounded-xl overflow-hidden bg-[#F8F7FC] border border-[#ece9f8]"
            style="min-height: 200px"
          >
            <div
              v-if="!camaraActiva"
              class="flex items-center justify-center h-48 text-[#C4B8F0] text-sm"
            >
              Cámara desactivada
            </div>
          </div>
        </div>

        <!-- Campo de texto (scanner físico) -->
        <div class="bg-white rounded-2xl border border-[#ece9f8] p-4">
          <p class="text-xs font-medium text-[#6B7280] mb-3">Scanner físico / manual</p>
          <div class="flex gap-2">
            <input
              v-model="uuidManual"
              ref="inputManual"
              type="text"
              placeholder="Escanea o escribe el UUID..."
              class="flex-1 px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition font-mono"
              @keyup.enter="registrar(uuidManual)"
            />
            <button
              @click="registrar(uuidManual)"
              :disabled="!uuidManual || registrando"
              class="px-4 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
            >
              {{ registrando ? '...' : 'Registrar' }}
            </button>
          </div>
        </div>

        <!-- Resultado del último registro -->
        <div
          v-if="ultimoRegistro"
          class="rounded-2xl border p-4 transition"
          :class="
            ultimoRegistro.exito ? 'bg-[#E1F5EE] border-[#1D9E75]' : 'bg-[#FCEBEB] border-[#E24B4A]'
          "
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
              :class="ultimoRegistro.exito ? 'bg-[#1D9E75] text-white' : 'bg-[#E24B4A] text-white'"
            >
              {{ ultimoRegistro.exito ? '✓' : '✗' }}
            </div>
            <div>
              <p
                class="text-sm font-medium"
                :class="ultimoRegistro.exito ? 'text-[#0F6E56]' : 'text-[#A32D2D]'"
              >
                {{ ultimoRegistro.nombre }}
              </p>
              <p
                class="text-xs"
                :class="ultimoRegistro.exito ? 'text-[#1D9E75]' : 'text-[#E24B4A]'"
              >
                {{ ultimoRegistro.mensaje }}
              </p>
            </div>
            <div class="ml-auto text-right">
              <p
                class="text-xs font-medium"
                :class="ultimoRegistro.exito ? 'text-[#0F6E56]' : 'text-[#A32D2D]'"
              >
                {{ ultimoRegistro.hora }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de asistencias del día -->
      <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F4F2FB] flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-[#1E1252]">Registros de hoy</p>
            <p class="text-xs text-[#9B89D4]">{{ asistencias.length }} registros</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="filtroTipo = ''"
              class="text-xs px-2.5 py-1 rounded-lg transition"
              :class="
                filtroTipo === ''
                  ? 'bg-[#F4F2FB] text-[#6B4FBB]'
                  : 'text-[#9B89D4] hover:bg-[#F8F7FC]'
              "
            >
              Todos
            </button>
            <button
              @click="filtroTipo = 'entrada'"
              class="text-xs px-2.5 py-1 rounded-lg transition"
              :class="
                filtroTipo === 'entrada'
                  ? 'bg-[#E1F5EE] text-[#0F6E56]'
                  : 'text-[#9B89D4] hover:bg-[#F8F7FC]'
              "
            >
              Entradas
            </button>
            <button
              @click="filtroTipo = 'salida'"
              class="text-xs px-2.5 py-1 rounded-lg transition"
              :class="
                filtroTipo === 'salida'
                  ? 'bg-[#FAECE7] text-[#993C1D]'
                  : 'text-[#9B89D4] hover:bg-[#F8F7FC]'
              "
            >
              Salidas
            </button>
          </div>
        </div>

        <div v-if="loadingLista" class="p-8 text-center text-sm text-[#9B89D4]">Cargando...</div>

        <div v-else class="overflow-y-auto" style="max-height: 520px">
          <div
            v-for="a in asistenciasFiltradas"
            :key="a.id"
            class="flex items-center gap-3 px-5 py-3 border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
              :class="
                a.tipo === 'entrada' ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FAECE7] text-[#993C1D]'
              "
            >
              {{ iniciales(a.alumno) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[#1E1252] truncate">{{ a.alumno }}</p>
              <p class="text-xs text-[#9B89D4]">{{ a.grado }} — Grupo {{ a.grupo }}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="
                  a.tipo === 'entrada'
                    ? 'bg-[#E1F5EE] text-[#0F6E56]'
                    : 'bg-[#FAECE7] text-[#993C1D]'
                "
              >
                {{ a.tipo }}
              </span>
              <p class="text-xs text-[#C4B8F0] mt-0.5">{{ a.hora }}</p>
            </div>
          </div>
          <div
            v-if="asistenciasFiltradas.length === 0"
            class="p-8 text-center text-sm text-[#9B89D4]"
          >
            Sin registros aún.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import api from '@/api/axios'
import swal from '@/plugins/swal'

const tipo = ref('entrada')
const uuidManual = ref('')
const registrando = ref(false)
const camaraActiva = ref(false)
const ultimoRegistro = ref(null)
const asistencias = ref([])
const loadingLista = ref(false)
const filtroTipo = ref('')
const inputManual = ref(null)
let html5Qr = null

const fechaHoy = new Date().toLocaleDateString('es-MX', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

onMounted(() => cargarAsistencias())
onUnmounted(() => detenerCamara())

async function cargarAsistencias() {
  loadingLista.value = true
  try {
    const { data } = await api.get('/asistencia/hoy')
    asistencias.value = data.asistencias
  } catch {
  } finally {
    loadingLista.value = false
  }
}

const asistenciasFiltradas = computed(() => {
  if (!filtroTipo.value) return asistencias.value
  return asistencias.value.filter((a) => a.tipo === filtroTipo.value)
})

async function registrar(uuid) {
  if (!uuid || registrando.value) return
  if (!tipo.value) {
    swal.fire({
      title: 'Selecciona el tipo',
      text: 'Elige entrada o salida antes de registrar.',
      icon: 'warning',
    })
    return
  }

  registrando.value = true
  try {
    const { data } = await api.post('/asistencia/registrar', {
      alumno_uuid: uuid.trim(),
      tipo: tipo.value,
    })

    ultimoRegistro.value = {
      exito: true,
      nombre: data.alumno,
      mensaje: `${data.tipo} registrada correctamente`,
      hora: data.hora,
    }
    beep(true)

    uuidManual.value = ''
    await cargarAsistencias()
  } catch (e) {
    const msg = e.response?.data?.messages?.error || 'Error al registrar.'
    ultimoRegistro.value = {
      exito: false,
      nombre: 'Error',
      mensaje: msg,
      hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    }
    beep(false)
  } finally {
    registrando.value = false
    // Enfocar el input para el siguiente escaneo
    await nextTick()
    inputManual.value?.focus()
  }
}

async function toggleCamara() {
  if (camaraActiva.value) {
    await detenerCamara()
  } else {
    await iniciarCamara()
  }
}

async function iniciarCamara() {
  camaraActiva.value = true
  await nextTick()

  html5Qr = new Html5Qrcode('qr-reader')
  try {
    await html5Qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        // QR leído — registrar automáticamente
        await registrar(decodedText)
      },
      () => {}, // error silencioso mientras busca el QR
    )
  } catch (e) {
    camaraActiva.value = false
    swal.fire({
      title: 'Sin acceso a cámara',
      text: 'Permite el acceso a la cámara en tu navegador.',
      icon: 'warning',
    })
  }
}

async function detenerCamara() {
  if (html5Qr) {
    try {
      await html5Qr.stop()
      html5Qr.clear()
    } catch {}
    html5Qr = null
  }
  camaraActiva.value = false
}

function iniciales(nombre) {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function beep(exito = true) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.frequency.value = exito ? 880 : 300
  osc.type = exito ? 'sine' : 'square'
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.3)
}
</script>
