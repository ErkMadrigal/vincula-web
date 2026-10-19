<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-medium text-[#1E1252]">Historial de asistencias</h1>
      <p class="text-sm text-[#9B89D4] mt-0.5">Consulta por semana, mes o rango personalizado</p>
    </div>

    <!-- Métricas -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Total alumnos</p>
        <p class="text-2xl font-medium text-[#1E1252]">{{ metricas.total }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Entradas</p>
        <p class="text-2xl font-medium text-[#0F6E56]">{{ metricas.entradas }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Salidas</p>
        <p class="text-2xl font-medium text-[#993C1D]">{{ metricas.salidas }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Faltaron</p>
        <p class="text-2xl font-medium text-[#A32D2D]">{{ metricas.faltaron }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-2xl border border-[#ece9f8] p-4 mb-6">
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Accesos rápidos -->
        <div class="flex gap-2">
          <button
            @click="aplicarFiltro('semana')"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition"
            :class="
              periodoActivo === 'semana'
                ? 'bg-[#6B4FBB] text-white'
                : 'border border-[#ece9f8] text-[#9B89D4] hover:bg-[#F8F7FC]'
            "
          >
            Esta semana
          </button>
          <button
            @click="aplicarFiltro('mes')"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition"
            :class="
              periodoActivo === 'mes'
                ? 'bg-[#6B4FBB] text-white'
                : 'border border-[#ece9f8] text-[#9B89D4] hover:bg-[#F8F7FC]'
            "
          >
            Este mes
          </button>
          <button
            @click="aplicarFiltro('hoy')"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition"
            :class="
              periodoActivo === 'hoy'
                ? 'bg-[#6B4FBB] text-white'
                : 'border border-[#ece9f8] text-[#9B89D4] hover:bg-[#F8F7FC]'
            "
          >
            Hoy
          </button>
        </div>

        <div class="hidden sm:block w-px h-6 bg-[#ece9f8]"></div>

        <!-- Rango personalizado -->
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <input
            v-model="desde"
            type="date"
            class="flex-1 min-w-0 sm:flex-none px-3 py-1.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-xs text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
          />
          <span class="text-xs text-[#C4B8F0]">al</span>
          <input
            v-model="hasta"
            type="date"
            class="flex-1 min-w-0 sm:flex-none px-3 py-1.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-xs text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
          />
          <button
            @click="aplicarFiltro('rango')"
            class="px-3 py-1.5 rounded-lg bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-xs transition"
          >
            Buscar
          </button>
        </div>

        <div class="hidden sm:block w-px h-6 bg-[#ece9f8]"></div>

        <!-- Filtros adicionales -->
        <input
          v-model="buscar"
          placeholder="Buscar alumno..."
          class="px-3 py-1.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-xs text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
        />

        <select
          v-model="filtroTipo"
          class="px-3 py-1.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-xs text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
        >
          <option value="">Todos</option>
          <option value="entrada">Entradas</option>
          <option value="salida">Salidas</option>
        </select>

        <!-- Periodo activo -->
        <span v-if="desde && hasta" class="text-xs text-[#9B89D4] ml-auto">
          {{ desde }} — {{ hasta }}
        </span>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-sm text-[#9B89D4]">Cargando...</div>

      <div v-else class="overflow-x-auto"><table class="w-full min-w-[640px]">
        <thead>
          <tr class="border-b border-[#F4F2FB]">
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Alumno</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Grado</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Tipo</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Fecha</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Hora</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Registrado por</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="a in registrosFiltrados"
            :key="a.id"
            class="border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
          >
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                  :class="
                    a.tipo === 'entrada'
                      ? 'bg-[#E1F5EE] text-[#0F6E56]'
                      : 'bg-[#FAECE7] text-[#993C1D]'
                  "
                >
                  {{ iniciales(a.alumno) }}
                </div>
                <span class="text-sm font-medium text-[#1E1252]">{{ a.alumno }}</span>
              </div>
            </td>
            <td class="px-5 py-3 text-sm text-[#6B7280]">{{ a.grado }} — {{ a.grupo }}</td>
            <td class="px-5 py-3">
              <span
                class="text-xs px-2.5 py-1 rounded-full font-medium"
                :class="
                  a.tipo === 'entrada'
                    ? 'bg-[#E1F5EE] text-[#0F6E56]'
                    : 'bg-[#FAECE7] text-[#993C1D]'
                "
              >
                {{ a.tipo }}
              </span>
            </td>
            <td class="px-5 py-3 text-sm text-[#6B7280]">{{ formatFecha(a.fecha) }}</td>
            <td class="px-5 py-3 text-sm text-[#6B7280]">{{ a.hora }}</td>
            <td class="px-5 py-3 text-sm text-[#9B89D4]">{{ a.maestro }}</td>
          </tr>
          <tr v-if="registrosFiltrados.length === 0">
            <td colspan="6" class="px-5 py-8 text-center text-sm text-[#9B89D4]">
              Sin registros en este período.
            </td>
          </tr>
        </tbody>
      </table></div>
    </div>
  </div>
</template>

<script setup>
import { fechaISO } from '@/utils/fecha'
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'

const registros = ref([])
const loading = ref(false)
const buscar = ref('')
const filtroTipo = ref('')
const periodoActivo = ref('semana')
const desde = ref('')
const hasta = ref('')

const metricas = computed(() => {
  const entradas = registros.value.filter((r) => r.tipo === 'entrada').length
  const salidas = registros.value.filter((r) => r.tipo === 'salida').length
  const uuids = [...new Set(registros.value.map((r) => r.alumno))]
  return {
    total: uuids.length,
    entradas,
    salidas,
    faltaron: 0, // se puede calcular vs total alumnos si se quiere
  }
})

const registrosFiltrados = computed(() => {
  return registros.value.filter((r) => {
    const matchBuscar = !buscar.value || r.alumno.toLowerCase().includes(buscar.value.toLowerCase())
    const matchTipo = !filtroTipo.value || r.tipo === filtroTipo.value
    return matchBuscar && matchTipo
  })
})

onMounted(() => aplicarFiltro('semana'))

async function aplicarFiltro(periodo) {
  periodoActivo.value = periodo
  const hoy = new Date()

  if (periodo === 'hoy') {
    const d = fechaISO(hoy)
    desde.value = d
    hasta.value = d
  } else if (periodo === 'semana') {
    const lunes = new Date(hoy)
    const dia = hoy.getDay() || 7
    lunes.setDate(hoy.getDate() - dia + 1)
    const domingo = new Date(lunes)
    domingo.setDate(lunes.getDate() + 6)
    desde.value = fechaISO(lunes)
    hasta.value = fechaISO(domingo)
  } else if (periodo === 'mes') {
    const y = hoy.getFullYear()
    const m = String(hoy.getMonth() + 1).padStart(2, '0')
    const ultimo = new Date(y, hoy.getMonth() + 1, 0).getDate()
    desde.value = `${y}-${m}-01`
    hasta.value = `${y}-${m}-${ultimo}`
  }

  await cargar()
}

async function cargar() {
  if (!desde.value || !hasta.value) return
  loading.value = true
  try {
    const { data } = await api.get(
      `/asistencia/escuela/rango?desde=${desde.value}&hasta=${hasta.value}`,
    )
    registros.value = data.registros
  } catch {
  } finally {
    loading.value = false
  }
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

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}
</script>
