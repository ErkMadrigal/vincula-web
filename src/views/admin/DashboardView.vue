<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-medium text-[#1E1252]">Dashboard</h1>
      <p class="text-sm text-[#9B89D4] mt-0.5">{{ fechaHoy }}</p>
    </div>

    <!-- Métricas del día -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Entradas hoy</p>
        <p class="text-2xl font-medium text-[#0F6E56]">{{ metricas.entradas }}</p>
        <p class="text-xs text-[#C4B8F0] mt-1">de {{ metricas.total_alumnos }} alumnos</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Salidas hoy</p>
        <p class="text-2xl font-medium text-[#993C1D]">{{ metricas.salidas }}</p>
        <p class="text-xs text-[#C4B8F0] mt-1">registradas</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Incidencias hoy</p>
        <p class="text-2xl font-medium text-[#A32D2D]">{{ metricas.incidencias }}</p>
        <div class="flex gap-1 mt-1">
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D]">
            {{ metricas.incidencias_graves }} graves
          </span>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Al corriente</p>
        <p class="text-2xl font-medium text-[#1E1252]">{{ metricas.pagados }}</p>
        <p class="text-xs text-[#C4B8F0] mt-1">{{ metricas.bloqueados }} bloqueados</p>
      </div>
    </div>

    <!-- Segunda fila métricas -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Total maestros</p>
        <p class="text-2xl font-medium text-[#1E1252]">{{ metricas.maestros }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Avisos vigentes</p>
        <p class="text-2xl font-medium text-[#1E1252]">{{ metricas.avisos }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Ingreso mensual</p>
        <p class="text-2xl font-medium text-[#1E1252]">${{ formatMoney(metricas.pagados * 15) }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <!-- Últimas asistencias -->
      <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F4F2FB] flex items-center justify-between">
          <p class="text-sm font-medium text-[#1E1252]">Asistencias de hoy</p>
          <RouterLink to="/asistencias" class="text-xs text-[#6B4FBB] hover:underline"
            >Ver todas</RouterLink
          >
        </div>
        <div v-if="loadingAsistencias" class="p-6 text-center text-sm text-[#9B89D4]">
          Cargando...
        </div>
        <div v-else class="overflow-y-auto" style="max-height: 300px">
          <div
            v-for="a in asistencias.slice(0, 8)"
            :key="a.id"
            class="flex items-center gap-3 px-5 py-3 border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
          >
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
              :class="
                a.tipo === 'entrada' ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FAECE7] text-[#993C1D]'
              "
            >
              {{ iniciales(a.alumno) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[#1E1252] truncate">{{ a.alumno }}</p>
              <p class="text-xs text-[#9B89D4]">{{ a.grado }} — {{ a.grupo }}</p>
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
          <div v-if="asistencias.length === 0" class="p-6 text-center text-sm text-[#9B89D4]">
            Sin asistencias hoy.
          </div>
        </div>
      </div>

      <!-- Últimas incidencias -->
      <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F4F2FB] flex items-center justify-between">
          <p class="text-sm font-medium text-[#1E1252]">Incidencias recientes</p>
          <RouterLink to="/incidencias" class="text-xs text-[#6B4FBB] hover:underline"
            >Ver todas</RouterLink
          >
        </div>
        <div v-if="loadingIncidencias" class="p-6 text-center text-sm text-[#9B89D4]">
          Cargando...
        </div>
        <div v-else class="overflow-y-auto" style="max-height: 300px">
          <div
            v-for="i in incidencias.slice(0, 6)"
            :key="i.id"
            class="flex items-center gap-3 px-5 py-3 border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
          >
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
              :class="gravClass(i.gravedad)"
            >
              {{ iniciales(i.alumno) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[#1E1252] truncate">{{ i.alumno }}</p>
              <p class="text-xs text-[#9B89D4] truncate">{{ i.tipo }} · {{ i.maestro }}</p>
            </div>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
              :class="gravPill(i.gravedad)"
            >
              {{ i.gravedad }}
            </span>
          </div>
          <div v-if="incidencias.length === 0" class="p-6 text-center text-sm text-[#9B89D4]">
            Sin incidencias hoy.
          </div>
        </div>
      </div>

      <!-- Avisos activos -->
      <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F4F2FB] flex items-center justify-between">
          <p class="text-sm font-medium text-[#1E1252]">Avisos vigentes</p>
          <RouterLink to="/avisos" class="text-xs text-[#6B4FBB] hover:underline"
            >Ver todos</RouterLink
          >
        </div>
        <div v-if="loadingAvisos" class="p-6 text-center text-sm text-[#9B89D4]">Cargando...</div>
        <div v-else class="overflow-y-auto" style="max-height: 200px">
          <div
            v-for="a in avisosVigentes.slice(0, 5)"
            :key="a.id"
            class="px-5 py-3 border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-medium text-[#1E1252] truncate">{{ a.titulo }}</p>
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                :class="a.grado ? 'bg-[#EEEDFE] text-[#534AB7]' : 'bg-[#E1F5EE] text-[#0F6E56]'"
              >
                {{ a.grado || 'General' }}
              </span>
            </div>
            <p class="text-xs text-[#9B89D4] mt-0.5">{{ a.autor }}</p>
          </div>
          <div v-if="avisosVigentes.length === 0" class="p-6 text-center text-sm text-[#9B89D4]">
            Sin avisos vigentes.
          </div>
        </div>
      </div>

      <!-- Alumnos sin pago -->
      <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F4F2FB] flex items-center justify-between">
          <p class="text-sm font-medium text-[#1E1252]">Alumnos pendientes de pago</p>
          <RouterLink to="/pagos" class="text-xs text-[#6B4FBB] hover:underline"
            >Gestionar</RouterLink
          >
        </div>
        <div v-if="loadingPagos" class="p-6 text-center text-sm text-[#9B89D4]">Cargando...</div>
        <div v-else class="overflow-y-auto" style="max-height: 200px">
          <div
            v-for="a in alumnosSinPago.slice(0, 5)"
            :key="a.uuid"
            class="flex items-center gap-3 px-5 py-3 border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
          >
            <div
              class="w-7 h-7 rounded-full bg-[#FCEBEB] flex items-center justify-center text-[#A32D2D] text-xs font-medium flex-shrink-0"
            >
              {{ iniciales(a.nombre) }}
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-[#1E1252]">{{ a.nombre }}</p>
              <p class="text-xs text-[#9B89D4]">{{ a.grado }} — {{ a.grupo }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D] font-medium">
              Pendiente
            </span>
          </div>
          <div v-if="alumnosSinPago.length === 0" class="p-6 text-center text-sm text-[#9B89D4]">
            Todos al corriente ✓
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api/axios'

const metricas = ref({
  entradas: 0,
  salidas: 0,
  total_alumnos: 0,
  incidencias: 0,
  incidencias_graves: 0,
  pagados: 0,
  bloqueados: 0,
  maestros: 0,
  avisos: 0,
})
const asistencias = ref([])
const incidencias = ref([])
const avisos = ref([])
const alumnos = ref([])
const loadingAsistencias = ref(false)
const loadingIncidencias = ref(false)
const loadingAvisos = ref(false)
const loadingPagos = ref(false)

const fechaHoy = new Date().toLocaleDateString('es-MX', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const avisosVigentes = computed(() =>
  avisos.value.filter((a) => !a.vigencia || new Date(a.vigencia + 'T23:59:59') >= new Date()),
)

const alumnosSinPago = computed(() => alumnos.value.filter((a) => a.pagado == 0))

onMounted(async () => {
  await Promise.all([cargarAsistencias(), cargarIncidencias(), cargarAvisos(), cargarPagos()])
})

async function cargarAsistencias() {
  loadingAsistencias.value = true
  try {
    const { data } = await api.get('/asistencia/hoy')
    asistencias.value = data.asistencias
    metricas.value.entradas = data.asistencias.filter((a) => a.tipo === 'entrada').length
    metricas.value.salidas = data.asistencias.filter((a) => a.tipo === 'salida').length
  } catch {
  } finally {
    loadingAsistencias.value = false
  }
}

async function cargarIncidencias() {
  loadingIncidencias.value = true
  try {
    const hoy = new Date().toISOString().split('T')[0]
    const { data } = await api.get(`/incidencia/escuela?desde=${hoy}&hasta=${hoy}`)
    incidencias.value = data.incidencias
    metricas.value.incidencias = data.incidencias.length
    metricas.value.incidencias_graves = data.incidencias.filter(
      (i) => i.gravedad === 'grave',
    ).length
  } catch {
  } finally {
    loadingIncidencias.value = false
  }
}

async function cargarAvisos() {
  loadingAvisos.value = true
  try {
    const { data } = await api.get('/aviso/escuela')
    avisos.value = data.avisos
    metricas.value.avisos = data.avisos.filter(
      (a) => !a.vigencia || new Date(a.vigencia + 'T23:59:59') >= new Date(),
    ).length
  } catch {
  } finally {
    loadingAvisos.value = false
  }
}

async function cargarPagos() {
  loadingPagos.value = true
  try {
    const { data } = await api.get('/admin/pagos/estado')
    alumnos.value = data.alumnos
    metricas.value.total_alumnos = data.total
    metricas.value.pagados = data.al_corriente
    metricas.value.bloqueados = data.bloqueados

    // Maestros
    const m = await api.get('/admin/usuarios')
    metricas.value.maestros = m.data.usuarios.filter((u) => u.rol === 'maestro').length
  } catch {
  } finally {
    loadingPagos.value = false
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

function gravClass(g) {
  return (
    {
      grave: 'bg-[#FCEBEB] text-[#A32D2D]',
      moderada: 'bg-[#FAEEDA] text-[#854F0B]',
      leve: 'bg-[#EEEDFE] text-[#534AB7]',
    }[g] || 'bg-[#F4F2FB] text-[#9B89D4]'
  )
}

function gravPill(g) {
  return (
    {
      grave: 'bg-[#FCEBEB] text-[#A32D2D]',
      moderada: 'bg-[#FAEEDA] text-[#854F0B]',
      leve: 'bg-[#EEEDFE] text-[#534AB7]',
    }[g] || 'bg-[#F4F2FB] text-[#9B89D4]'
  )
}

function formatMoney(n) {
  return Math.round(n).toLocaleString('es-MX')
}
</script>
