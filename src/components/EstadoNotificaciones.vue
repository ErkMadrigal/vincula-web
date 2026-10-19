<template>
  <div v-if="d" class="bg-white rounded-2xl border p-4 mb-6" :class="hayProblema ? 'border-[#F0B429]' : 'border-[#ece9f8]'">
    <div class="flex flex-wrap items-center gap-3">
      <div class="text-2xl">{{ !d.firebase.ok ? '⚠️' : d.con_dispositivo ? '🔔' : '🔕' }}</div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-[#1E1252]">Notificaciones push</p>
        <p v-if="!d.firebase.ok" class="text-xs text-[#A32D2D]">
          El servidor no puede mandar notificaciones:
          {{ !d.firebase.credenciales ? 'falta app/Config/firebase-credentials.json' : 'falta la librería google/auth (composer install)' }}.
        </p>
        <p v-else class="text-xs text-[#9B89D4]">
          <b class="text-[#0F6E56]">{{ d.con_dispositivo }}</b> de {{ d.total_alumnos }} alumnos tienen a un tutor
          con notificaciones activas
          <span v-if="plataformas"> · {{ plataformas }}</span>
        </p>
      </div>
      <button
        v-if="d.sin_dispositivo"
        @click="verLista = !verLista"
        class="text-xs px-3 py-1.5 rounded-lg border border-[#ece9f8] text-[#6B4FBB] hover:bg-[#F4F2FB] transition"
      >
        {{ verLista ? 'Ocultar' : `Ver ${d.sin_dispositivo} sin notificaciones` }}
      </button>
    </div>

    <div v-if="d.firebase.ok && d.total_alumnos" class="mt-3 h-1.5 rounded-full bg-[#F4F2FB] overflow-hidden">
      <div class="h-full bg-[#1D9E75] transition-all" :style="{ width: porcentaje + '%' }"></div>
    </div>

    <div v-if="verLista" class="mt-3">
      <p class="text-[11px] text-[#9B89D4] mb-2">
        A estas familias no les llega nada porque ningún tutor ha entrado a la app (o no aceptó el permiso).
        Pídeles que abran la app de Vincula, inicien sesión y toquen “Activar” en el aviso de notificaciones.
      </p>
      <div class="max-h-60 overflow-y-auto border border-[#ece9f8] rounded-xl divide-y divide-[#F4F2FB]">
        <div v-for="(a, i) in d.alumnos_sin_dispositivo" :key="i" class="px-3 py-2 text-xs flex justify-between gap-2">
          <span class="text-[#1E1252] truncate">{{ a.nombre }}</span>
          <span class="text-[#9B89D4] flex-shrink-0">{{ a.grado }} {{ a.grupo }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'

const d = ref(null)
const verLista = ref(false)

const porcentaje = computed(() =>
  d.value?.total_alumnos ? Math.round((d.value.con_dispositivo / d.value.total_alumnos) * 100) : 0,
)
const hayProblema = computed(() => d.value && (!d.value.firebase.ok || d.value.con_dispositivo === 0))
const plataformas = computed(() => {
  const p = d.value?.por_plataforma || {}
  const n = { android: 'Android', ios: 'iPhone', web: 'Navegador' }
  return Object.entries(p).map(([k, v]) => `${v} ${n[k] || k}`).join(' · ')
})

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/push/diagnostico')
    d.value = data
  } catch {
    d.value = null
  }
})
</script>
