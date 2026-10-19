<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-medium text-[#1E1252]">Mi dashboard</h1>
      <p class="text-sm text-[#9B89D4] mt-0.5">Vista general del negocio — {{ fechaHoy }}</p>
    </div>

    <!-- Métricas globales -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Escuelas activas</p>
        <p class="text-2xl font-medium text-[#1E1252]">{{ totales.escuelas }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Total alumnos</p>
        <p class="text-2xl font-medium text-[#1E1252]">{{ totales.alumnos }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Alumnos pagados</p>
        <p class="text-2xl font-medium text-[#0F6E56]">{{ totales.alumnos_pagados }}</p>
        <p class="text-xs text-[#C4B8F0] mt-1">{{ totales.alumnos_bloqueados }} bloqueados</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Ingreso mensual</p>
        <p class="text-2xl font-medium text-[#6B4FBB]">${{ formatMoney(totales.ingreso_mes) }}</p>
        <p class="text-xs text-[#C4B8F0] mt-1">${{ formatMoney(totales.ingreso_anio) }} al año</p>
      </div>
    </div>

    <!-- Proyección -->
    <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 mb-6">
      <p class="text-sm font-medium text-[#1E1252] mb-4">Proyección de ingresos</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="text-center p-4 bg-[#F4F2FB] rounded-xl">
          <p class="text-xs text-[#9B89D4] mb-1">Este mes</p>
          <p class="text-xl font-medium text-[#6B4FBB]">${{ formatMoney(totales.ingreso_mes) }}</p>
        </div>
        <div class="text-center p-4 bg-[#F4F2FB] rounded-xl">
          <p class="text-xs text-[#9B89D4] mb-1">Año completo</p>
          <p class="text-xl font-medium text-[#6B4FBB]">${{ formatMoney(totales.ingreso_anio) }}</p>
        </div>
        <div class="text-center p-4 bg-[#EEEDFE] rounded-xl">
          <p class="text-xs text-[#9B89D4] mb-1">Potencial (100% pagados)</p>
          <p class="text-xl font-medium text-[#534AB7]">${{ formatMoney(totales.alumnos * 15) }}</p>
          <p class="text-xs text-[#A89EE8] mt-1">
            {{ totales.alumnos_bloqueados }} alumnos sin activar
          </p>
        </div>
      </div>
    </div>

    <!-- Tabla escuelas -->
    <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
      <div class="px-5 py-4 border-b border-[#F4F2FB] flex items-center justify-between">
        <p class="text-sm font-medium text-[#1E1252]">Escuelas</p>
        <RouterLink to="/escuelas" class="text-xs text-[#6B4FBB] hover:underline"
          >Ver todas</RouterLink
        >
      </div>

      <div v-if="loading" class="p-8 text-center text-sm text-[#9B89D4]">Cargando...</div>

      <div v-else class="overflow-x-auto"><table class="w-full min-w-[640px]">
        <thead>
          <tr class="border-b border-[#F4F2FB]">
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Escuela</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Alumnos</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Pagados</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Ingreso/mes</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">% pagado</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="e in escuelas"
            :key="e.id"
            class="border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
          >
            <td class="px-5 py-3">
              <p class="text-sm font-medium text-[#1E1252]">{{ e.nombre }}</p>
              <p class="text-xs text-[#9B89D4]">{{ e.subdominio }}.vincula.com.mx</p>
            </td>
            <td class="px-5 py-3 text-sm text-[#6B7280]">{{ e.total_alumnos }}</td>
            <td class="px-5 py-3 text-sm text-[#6B7280]">{{ e.alumnos_pagados }}</td>
            <td class="px-5 py-3 text-sm font-medium text-[#1E1252]">
              ${{ formatMoney(e.alumnos_pagados * 15) }}
            </td>
            <td class="px-5 py-3">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-[#F4F2FB] rounded-full h-1.5">
                  <div
                    class="bg-[#6B4FBB] rounded-full h-1.5 transition-all"
                    :style="`width: ${Math.min(e.total_alumnos > 0 ? Math.round((e.alumnos_pagados / e.total_alumnos) * 100) : 0, 100)}%`"
                  ></div>
                </div>
                <span class="text-xs text-[#9B89D4] min-w-8 text-right">
                  {{
                    e.total_alumnos > 0
                      ? Math.round((e.alumnos_pagados / e.total_alumnos) * 100)
                      : 0
                  }}%
                </span>
              </div>
            </td>
            <td class="px-5 py-3">
              <span
                class="text-xs px-2.5 py-1 rounded-full font-medium"
                :class="
                  e.activa == 1 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FCEBEB] text-[#A32D2D]'
                "
              >
                {{ e.activa == 1 ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
          </tr>
          <tr v-if="escuelas.length === 0">
            <td colspan="6" class="px-5 py-8 text-center text-sm text-[#9B89D4]">
              Sin escuelas registradas.
            </td>
          </tr>
        </tbody>
      </table></div>
    </div>
  </div>
</template>

<script setup>
import { TZ_MX } from '@/utils/fecha'
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api/axios'

const loading = ref(false)
const escuelas = ref([])
const totales = ref({
  escuelas: 0,
  alumnos: 0,
  alumnos_pagados: 0,
  alumnos_bloqueados: 0,
  ingreso_mes: 0,
  ingreso_anio: 0,
})

const fechaHoy = new Date().toLocaleDateString('es-MX', {
  timeZone: TZ_MX,
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

onMounted(() => cargar())

async function cargar() {
  loading.value = true
  try {
    const [dash, esc] = await Promise.all([
      api.get('/superadmin/dashboard'),
      api.get('/superadmin/escuelas'),
    ])
    totales.value = dash.data.totales
    escuelas.value = esc.data.escuelas
  } catch {
  } finally {
    loading.value = false
  }
}

function formatMoney(n) {
  return Math.round(n).toLocaleString('es-MX')
}
</script>
