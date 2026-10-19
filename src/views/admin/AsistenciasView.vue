<template>
  <div>
    <div class="mb-4 lg:mb-6">
      <h1 class="text-xl font-medium text-[#1E1252]">Asistencias</h1>
      <p class="text-sm text-[#9B89D4] mt-0.5">Registra entradas y salidas — {{ fechaHoy }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <!-- Panel de captura -->
      <div class="space-y-4">
        <!-- Selector entrada/salida -->
        <div class="bg-white rounded-2xl border border-[#ece9f8] p-4">
          <p class="text-xs font-medium text-[#6B7280] mb-3">Tipo de registro</p>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="cambiarTipo('entrada')"
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
              @click="cambiarTipo('salida')"
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

        <!-- Scanner físico / manual (primero: es lo que más se usa) -->
        <div class="bg-white rounded-2xl border border-[#ece9f8] p-4">
          <div class="flex items-center justify-between gap-2 mb-3">
            <p class="text-xs font-medium text-[#6B7280]">Scanner — QR, código de barras o CURP</p>
            <span
              class="flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
              :class="cola.length ? 'bg-[#FFF4DB] text-[#9A6700]' : 'bg-[#E1F5EE] text-[#0F6E56]'"
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="cola.length ? 'bg-[#F0B429] animate-pulse' : 'bg-[#1D9E75]'"
              ></span>
              {{ cola.length ? `Procesando ${cola.length}…` : 'Listo para escanear' }}
            </span>
          </div>
          <div class="flex gap-2">
            <input
              v-model="codigoManual"
              ref="inputManual"
              type="text"
              :inputmode="tecladoVirtual ? 'text' : 'none'"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              enterkeyhint="done"
              placeholder="Escanea o escribe CURP…"
              class="flex-1 min-w-0 px-4 py-3 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-base sm:text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition font-mono"
              @keydown.enter.prevent="enviarManual"
              @keydown.tab.prevent="enviarManual"
              @input="autoEnviarSiCompleto"
            />
            <button
              @click="enviarManual"
              :disabled="!codigoManual.trim()"
              class="px-4 py-3 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60 flex-shrink-0"
            >
              Registrar
            </button>
          </div>
          <button
            type="button"
            class="mt-2 text-xs text-[#6B4FBB] underline underline-offset-2"
            @click="alternarTeclado"
          >
            {{ tecladoVirtual ? 'Ocultar teclado (usar scanner)' : '⌨️ Escribir a mano' }}
          </button>
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
            <div class="min-w-0">
              <p
                class="text-sm font-medium truncate"
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
            <div class="ml-auto text-right flex-shrink-0">
              <p
                class="text-xs font-medium"
                :class="ultimoRegistro.exito ? 'text-[#0F6E56]' : 'text-[#A32D2D]'"
              >
                {{ ultimoRegistro.hora }}
              </p>
            </div>
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
            :style="{ minHeight: camaraActiva ? '200px' : '0' }"
          >
            <div
              v-if="!camaraActiva"
              class="flex items-center justify-center h-24 sm:h-40 text-[#C4B8F0] text-sm"
            >
              Cámara desactivada
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de asistencias del día -->
      <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
        <div class="px-4 sm:px-5 py-4 border-b border-[#F4F2FB] flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="text-sm font-medium text-[#1E1252]">Registros de hoy</p>
            <p class="text-xs text-[#9B89D4]">{{ asistencias.length }} registros</p>
          </div>
          <div class="flex gap-1 sm:gap-2">
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

        <div v-if="loadingLista && !asistencias.length" class="p-8 text-center text-sm text-[#9B89D4]">
          Cargando...
        </div>

        <div v-else class="overflow-y-auto max-h-[60dvh] lg:max-h-[520px]">
          <div
            v-for="a in asistenciasFiltradas"
            :key="a.id"
            class="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
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
              <p v-if="a.grado || a.grupo" class="text-xs text-[#9B89D4]">{{ a.grado }} — Grupo {{ a.grupo }}</p>
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
import { TZ_MX } from '@/utils/fecha'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import api from '@/api/axios'
import swal from '@/plugins/swal'

/* ─────────────────────────────────────────────────────────────────────────────
 * ESCÁNER A PRUEBA DE ATORONES
 * - Cada lectura entra a una COLA y se procesa una por una; el input se limpia
 *   al instante, así que el siguiente escaneo nunca se mezcla con el anterior.
 * - Funciona aunque el input NO tenga el foco (escucha el teclado global y
 *   distingue al scanner por la velocidad con la que "teclea").
 * - Ignora lecturas repetidas del mismo código durante unos segundos.
 * - Cada petición tiene timeout: si el internet se cae, la cola sigue.
 * - En celular no abre el teclado en pantalla (inputmode="none") salvo que
 *   se pida "Escribir a mano".
 * ──────────────────────────────────────────────────────────────────────────── */

const DUPLICADO_MS = 4000 // mismo código dentro de este tiempo = se ignora
const TIMEOUT_MS = 10000 // tiempo máximo por petición
// Tolerante: si el navegador está ocupado redibujando, las teclas del scanner
// pueden llegar con retraso; con márgenes cortos el código se partía.
const SCANNER_MAX_MS_ENTRE_TECLAS = 400 // pausa mayor = empieza un código nuevo
const SCANNER_FIN_INACTIVIDAD_MS = 500 // scanner sin Enter: se envía si el código ya está completo
const MIN_LARGO_CODIGO = 6

const tipo = ref('entrada')
const codigoManual = ref('')
const camaraActiva = ref(false)
const ultimoRegistro = ref(null)
const asistencias = ref([])
const loadingLista = ref(false)
const filtroTipo = ref('')
const inputManual = ref(null)
const tecladoVirtual = ref(false)
const cola = ref([]) // códigos pendientes
let procesando = false
let html5Qr = null
let recargaTimer = null
let autoEnvioTimer = null
const recientes = new Map() // codigo → timestamp

const fechaHoy = new Date().toLocaleDateString('es-MX', {
  timeZone: TZ_MX,
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

onMounted(() => {
  cargarAsistencias()
  window.addEventListener('keydown', onTeclaGlobal, true)
  enfocar()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onTeclaGlobal, true)
  clearTimeout(recargaTimer)
  clearTimeout(autoEnvioTimer)
  clearTimeout(bufferTimer)
  detenerCamara()
})

async function cargarAsistencias() {
  loadingLista.value = true
  try {
    const { data } = await api.get('/asistencia/hoy', { timeout: TIMEOUT_MS })
    asistencias.value = data.asistencias
  } catch {
    // si falla, se conserva la lista actual
  } finally {
    loadingLista.value = false
  }
}

/** Recarga la lista sólo cuando ya no hay escaneos en cola (no bloquea) */
function programarRecarga() {
  clearTimeout(recargaTimer)
  recargaTimer = setTimeout(() => {
    if (!cola.value.length) cargarAsistencias()
  }, 1500)
}

const asistenciasFiltradas = computed(() => {
  if (!filtroTipo.value) return asistencias.value
  return asistencias.value.filter((a) => a.tipo === filtroTipo.value)
})

function cambiarTipo(t) {
  tipo.value = t
  recientes.clear() // al cambiar de entrada a salida se puede volver a escanear al mismo alumno
  enfocar()
}

/* ─── Normalización ─────────────────────────────────────────────────────── */

/**
 * Limpia lo que manda el scanner. Si el scanner está configurado en inglés y el
 * equipo en español, los guiones del UUID llegan como ' / ? etc.: se corrigen.
 */
function normalizar(raw) {
  let c = String(raw || '')
    .replace(/[\u0000-\u001F\u007F]/g, '') // caracteres de control
    .trim()

  const uuidMal = /^([0-9a-f]{8}).([0-9a-f]{4}).([0-9a-f]{4}).([0-9a-f]{4}).([0-9a-f]{12})$/i
  const m = c.match(uuidMal)
  if (m) return `${m[1]}-${m[2]}-${m[3]}-${m[4]}-${m[5]}`.toLowerCase()

  return c
}

/* ─── Cola ──────────────────────────────────────────────────────────────── */

function encolar(raw) {
  const codigo = normalizar(raw)
  if (codigo.length < MIN_LARGO_CODIGO) return

  const ahora = Date.now()
  const clave = `${tipo.value}|${codigo.toUpperCase()}`
  const ultimo = recientes.get(clave)
  if (ultimo && ahora - ultimo < DUPLICADO_MS) return // doble lectura del mismo código
  recientes.set(clave, ahora)

  // limpiar entradas viejas del mapa
  for (const [k, t] of recientes) if (ahora - t > DUPLICADO_MS * 3) recientes.delete(k)

  cola.value.push({ codigo, tipo: tipo.value })
  procesarCola()
}

async function procesarCola() {
  if (procesando) return
  procesando = true
  try {
    while (cola.value.length) {
      const item = cola.value[0]
      await registrar(item)
      cola.value.shift()
    }
  } finally {
    procesando = false
    programarRecarga()
  }
}

async function registrar({ codigo, tipo: tipoReg }) {
  try {
    const { data } = await api.post(
      '/asistencia/registrar',
      { alumno_uuid: codigo, tipo: tipoReg },
      { timeout: TIMEOUT_MS },
    )

    ultimoRegistro.value = {
      exito: true,
      nombre: data.alumno,
      mensaje: `${data.tipo} registrada correctamente`,
      hora: data.hora,
    }
    beep(true)

    // se agrega a la lista al instante, sin esperar a recargar
    asistencias.value.unshift({
      id: `tmp-${Date.now()}-${Math.random()}`,
      alumno: data.alumno,
      grado: '',
      grupo: '',
      tipo: data.tipo,
      hora: data.hora,
    })
  } catch (e) {
    let msg = e.response?.data?.messages?.error || e.response?.data?.message
    if (!msg) {
      msg =
        e.code === 'ECONNABORTED'
          ? 'El servidor tardó demasiado. Vuelve a escanear.'
          : !navigator.onLine
            ? 'Sin conexión a internet.'
            : 'Error al registrar.'
      // si falló por red, permitir reintentar el mismo código de inmediato
      recientes.delete(`${tipoReg}|${codigo.toUpperCase()}`)
    }
    ultimoRegistro.value = {
      exito: false,
      nombre: e.response?.status === 409 ? 'Ya registrado' : 'Error',
      mensaje: msg,
      hora: new Date().toLocaleTimeString('es-MX', {
        timeZone: TZ_MX,
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
    beep(false)
  }
}

/* ─── Input (scanner con foco / escritura manual) ───────────────────────── */

function enviarManual() {
  clearTimeout(autoEnvioTimer)
  const valor = codigoManual.value
  codigoManual.value = '' // limpiar YA para que el siguiente escaneo no se pegue
  encolar(valor)
  enfocar()
}

/** Por si el scanner no manda Enter: si ya es un UUID o CURP completo, se envía solo */
function esCodigoCompleto(raw) {
  const v = normalizar(raw)
  return (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v) ||
    /^[A-Z]{4}\d{6}[HMX][A-Z]{5}[A-Z0-9]\d$/i.test(v)
  )
}

function autoEnviarSiCompleto() {
  clearTimeout(autoEnvioTimer)
  if (tecladoVirtual.value) return // escribiendo a mano: esperar a que presione Registrar
  if (esCodigoCompleto(codigoManual.value)) autoEnvioTimer = setTimeout(enviarManual, 300)
}

function alternarTeclado() {
  tecladoVirtual.value = !tecladoVirtual.value
  // re-enfocar para que el celular muestre/oculte el teclado
  inputManual.value?.blur()
  setTimeout(enfocar, 50)
}

function enfocar() {
  nextTick(() => {
    const activo = document.activeElement
    const enOtroCampo =
      activo &&
      activo !== inputManual.value &&
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(activo.tagName)
    if (!enOtroCampo) inputManual.value?.focus({ preventScroll: true })
  })
}

/* ─── Teclado global: el scanner funciona aunque el input no tenga foco ─── */

let buffer = ''
let ultimaTecla = 0
let bufferTimer = null

function onTeclaGlobal(e) {
  const t = e.target
  // Si escribe en nuestro input o en otro campo, no interferir
  if (t === inputManual.value) return
  if (t && (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable)) return
  if (e.ctrlKey || e.altKey || e.metaKey) return

  const ahora = performance.now()
  const rapido = ahora - ultimaTecla < SCANNER_MAX_MS_ENTRE_TECLAS
  ultimaTecla = ahora

  if (e.key === 'Enter' || e.key === 'Tab') {
    if (buffer.length >= MIN_LARGO_CODIGO) {
      e.preventDefault()
      encolar(buffer)
    }
    buffer = ''
    clearTimeout(bufferTimer)
    return
  }

  if (e.key.length !== 1) return // Shift, flechas, etc.

  // Si la tecla llegó lenta, es una persona: empezar buffer nuevo
  buffer = rapido ? buffer + e.key : e.key

  clearTimeout(bufferTimer)
  bufferTimer = setTimeout(() => {
    // scanner configurado sin Enter al final: solo si el código ya está completo
    if (esCodigoCompleto(buffer)) {
      encolar(buffer)
      buffer = ''
    }
  }, SCANNER_FIN_INACTIVIDAD_MS)
}

/* ─── Cámara ────────────────────────────────────────────────────────────── */

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
      {
        fps: 10,
        // recuadro proporcional a la pantalla (en celular 250px fijos no caben)
        qrbox: (w, h) => {
          const lado = Math.floor(Math.min(w, h) * 0.7)
          return { width: lado, height: lado }
        },
      },
      (decodedText) => encolar(decodedText), // la cola evita lecturas dobles
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

/* ─── Utilidades ────────────────────────────────────────────────────────── */

function iniciales(nombre) {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// Un solo AudioContext reutilizado: crear uno por escaneo agota los del navegador
// y deja de sonar / se alenta después de varios escaneos.
let audioCtx = null
function beep(exito = true) {
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)()
    if (audioCtx.state === 'suspended') audioCtx.resume()

    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)

    osc.frequency.value = exito ? 880 : 300
    osc.type = exito ? 'sine' : 'square'
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3)

    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + 0.3)
  } catch {}

  // vibración en celular
  if (navigator.vibrate) navigator.vibrate(exito ? 80 : [80, 60, 80])
}
</script>
