<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-medium text-[#1E1252]">Generador de QR</h1>
      <p class="text-sm text-[#9B89D4] mt-0.5">Genera y descarga los QR para las credenciales</p>
    </div>

    <!-- Filtros -->
    <div
      class="bg-white rounded-2xl border border-[#ece9f8] p-4 mb-6 flex items-center gap-3 flex-wrap"
    >
      <input
        v-model="buscar"
        placeholder="Buscar alumno..."
        class="flex-1 min-w-48 px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
      />
      <select
        v-model="filtroGrado"
        class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
      >
        <option value="">Todos los grados</option>
        <option v-for="g in grados" :key="g" :value="g">{{ g }}</option>
      </select>
      <select
        v-model="filtroGrupo"
        class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
      >
        <option value="">Todos los grupos</option>
        <option v-for="g in grupos" :key="g" :value="g">Grupo {{ g }}</option>
      </select>

      <!-- Descargar ZIP del grupo -->
      <button
        v-if="filtroGrado && filtroGrupo"
        @click="descargarZip"
        :disabled="descargandoZip"
        class="px-4 py-2 border border-[#6B4FBB] text-[#6B4FBB] text-sm rounded-xl hover:bg-[#F4F2FB] transition disabled:opacity-60"
      >
        {{ descargandoZip ? 'Generando...' : '⬇ Descargar ZIP del grupo' }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-8 text-center text-sm text-[#9B89D4]">Cargando alumnos...</div>

    <!-- Grid de alumnos -->
    <div v-else class="grid grid-cols-3 gap-4">
      <div
        v-for="a in alumnosFiltrados"
        :key="a.uuid"
        class="bg-white rounded-2xl border border-[#ece9f8] p-4 flex flex-col items-center"
      >
        <!-- QR -->
        <div
          class="w-32 h-32 rounded-xl border border-[#ece9f8] overflow-hidden mb-3 flex items-center justify-center bg-[#F8F7FC]"
        >
          <img
            v-if="qrsVisibles.includes(a.uuid)"
            :src="qrUrl(a.uuid)"
            :alt="`QR ${a.nombre}`"
            class="w-full h-full object-contain"
          />
          <span v-else class="text-3xl">▣</span>
        </div>

        <!-- Info -->
        <p class="text-sm font-medium text-[#1E1252] text-center mb-0.5">{{ a.nombre }}</p>
        <p class="text-xs text-[#9B89D4] mb-3">{{ a.grado }} — Grupo {{ a.grupo }}</p>
        <p class="text-[10px] text-[#C4B8F0] font-mono mb-3 truncate w-full text-center">
          {{ a.uuid }}
        </p>

        <!-- Botones -->
        <div class="flex gap-2 w-full">
          <button
            @click="toggleQr(a.uuid)"
            class="flex-1 py-1.5 rounded-lg border border-[#ece9f8] text-xs text-[#6B4FBB] hover:bg-[#F4F2FB] transition"
          >
            {{ qrsVisibles.includes(a.uuid) ? 'Ocultar' : 'Ver QR' }}
          </button>
          <a
            :href="qrUrl(a.uuid)"
            :download="`qr_${a.nombre}.png`"
            target="_blank"
            class="flex-1 py-1.5 rounded-lg bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-xs transition text-center"
          >
            ⬇ Descargar
          </a>
        </div>
      </div>

      <div
        v-if="alumnosFiltrados.length === 0"
        class="col-span-3 bg-white rounded-2xl border border-[#ece9f8] p-8 text-center text-sm text-[#9B89D4]"
      >
        No se encontraron alumnos.
      </div>
    </div>

    <!-- Modal QR ampliado -->
    <div
      v-if="qrAmpliado"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
      @click.self="qrAmpliado = null"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-6 w-full max-w-sm text-center">
        <p class="text-sm font-medium text-[#1E1252] mb-1">{{ qrAmpliado.nombre }}</p>
        <p class="text-xs text-[#9B89D4] mb-4">
          {{ qrAmpliado.grado }} — Grupo {{ qrAmpliado.grupo }}
        </p>
        <img
          :src="qrUrl(qrAmpliado.uuid)"
          :alt="qrAmpliado.nombre"
          class="w-56 h-56 mx-auto rounded-xl border border-[#ece9f8] mb-4"
        />
        <p class="text-[10px] text-[#C4B8F0] font-mono mb-4">{{ qrAmpliado.uuid }}</p>
        <div class="flex gap-3">
          <button
            @click="qrAmpliado = null"
            class="flex-1 py-2.5 rounded-xl border border-[#ece9f8] text-sm text-[#9B89D4] hover:bg-[#F8F7FC] transition"
          >
            Cerrar
          </button>
          <a
            :href="qrUrl(qrAmpliado.uuid)"
            :download="`qr_${qrAmpliado.nombre}.png`"
            target="_blank"
            class="flex-1 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition text-center"
          >
            ⬇ Descargar
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import swal from '@/plugins/swal'

const alumnos = ref([])
const loading = ref(false)
const buscar = ref('')
const filtroGrado = ref('')
const filtroGrupo = ref('')
const qrsVisibles = ref([])
const qrAmpliado = ref(null)
const descargandoZip = ref(false)

// const BASE_URL = 'http://localhost/vincula-api/public/api'
const BASE_URL = 'https://api.vincula365.com/api/'

onMounted(() => cargarAlumnos())

async function cargarAlumnos() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/alumnos')
    alumnos.value = data.alumnos.filter((a) => a.activo == 1)
  } catch {
  } finally {
    loading.value = false
  }
}

const grados = computed(() => {
  const set = new Set(alumnos.value.map((a) => a.grado).filter(Boolean))
  return [...set].sort()
})

const grupos = computed(() => {
  const set = new Set(
    alumnos.value
      .filter((a) => !filtroGrado.value || a.grado === filtroGrado.value)
      .map((a) => a.grupo)
      .filter(Boolean),
  )
  return [...set].sort()
})

const alumnosFiltrados = computed(() => {
  return alumnos.value.filter((a) => {
    const matchBuscar = !buscar.value || a.nombre.toLowerCase().includes(buscar.value.toLowerCase())
    const matchGrado = !filtroGrado.value || a.grado === filtroGrado.value
    const matchGrupo = !filtroGrupo.value || a.grupo === filtroGrupo.value
    return matchBuscar && matchGrado && matchGrupo
  })
})

function qrUrl(uuid) {
  const token = localStorage.getItem('token')
  return `${BASE_URL}/qr/alumno/${uuid}?token=${token}`
}

function toggleQr(uuid) {
  const idx = qrsVisibles.value.indexOf(uuid)
  if (idx === -1) {
    qrsVisibles.value.push(uuid)
  } else {
    qrsVisibles.value.splice(idx, 1)
  }
}

async function descargarZip() {
  if (!filtroGrado.value || !filtroGrupo.value) return
  descargandoZip.value = true
  try {
    const token = localStorage.getItem('token')
    const url = `${BASE_URL}/qr/grupo/${filtroGrado.value}/${filtroGrupo.value}`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error()
    const blob = await response.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `qr_${filtroGrado.value}_${filtroGrupo.value}.zip`
    link.click()
    URL.revokeObjectURL(link.href)
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo generar el ZIP.', icon: 'error' })
  } finally {
    descargandoZip.value = false
  }
}
</script>
