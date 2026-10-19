<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-xl font-medium text-[#1E1252]">Escuelas</h1>
        <p class="text-sm text-[#9B89D4] mt-0.5">Gestiona todas las escuelas del sistema</p>
      </div>
      <button
        @click="showModal = true"
        class="px-4 py-2 bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm rounded-xl transition"
      >
        + Nueva escuela
      </button>
    </div>

    <!-- Métricas rápidas -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-6">
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Total escuelas</p>
        <p class="text-2xl font-medium text-[#1E1252]">{{ escuelas.length }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Total alumnos</p>
        <p class="text-2xl font-medium text-[#1E1252]">{{ totalAlumnos }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Ingreso mensual</p>
        <p class="text-2xl font-medium text-[#1E1252]">${{ formatMoney(totalIngreso) }}</p>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
      <div class="px-5 py-3 border-b border-[#F4F2FB]">
        <input
          v-model="buscar"
          placeholder="Buscar escuela..."
          class="w-full max-w-xs px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
        />
      </div>

      <div v-if="loading" class="p-8 text-center text-sm text-[#9B89D4]">Cargando escuelas...</div>

      <div v-else class="overflow-x-auto"><table class="w-full min-w-[640px]">
        <thead>
          <tr class="border-b border-[#F4F2FB]">
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Escuela</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Alumnos</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Pagados</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Ingreso/mes</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Plan</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]" title="Si está apagado, la asistencia no revisa pagos">Cobro</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Estado</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="e in escuelasFiltradas"
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
              <span
                class="text-xs px-2.5 py-1 rounded-full font-medium"
                :class="
                  e.plan === 'pro' ? 'bg-[#1E1252] text-white' : 'bg-[#F4F2FB] text-[#6B4FBB]'
                "
              >
                {{ e.plan }}
              </span>
            </td>
            <td class="px-5 py-3">
              <button
                @click="toggleCobro(e)"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition"
                :class="e.cobro_activo == 1 ? 'bg-[#1D9E75]' : 'bg-[#E5E1F5]'"
                :title="e.cobro_activo == 1 ? 'Cobro activo: se bloquea a alumnos sin pago' : 'Sin cobro: todos registran asistencia'"
              >
                <span
                  class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition"
                  :class="e.cobro_activo == 1 ? 'translate-x-5' : 'translate-x-0.5'"
                ></span>
              </button>
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
            <td class="px-5 py-3">
              <button
                @click="toggleEscuela(e)"
                class="text-xs px-3 py-1.5 rounded-lg border border-[#ece9f8] transition"
                :class="
                  e.activa == 1
                    ? 'text-red-400 hover:bg-red-50'
                    : 'text-[#6B4FBB] hover:bg-[#F4F2FB]'
                "
              >
                {{ e.activa == 1 ? 'Desactivar' : 'Activar' }}
              </button>
            </td>
          </tr>
          <tr v-if="escuelasFiltradas.length === 0">
            <td colspan="8" class="px-5 py-8 text-center text-sm text-[#9B89D4]">
              No se encontraron escuelas.
            </td>
          </tr>
        </tbody>
      </table></div>
    </div>

    <!-- Modal nueva escuela -->
    <div
      v-if="showModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-4">Nueva escuela</h2>

        <div
          v-if="formError"
          class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600"
        >
          {{ formError }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5"
              >Nombre de la escuela</label
            >
            <input
              v-model="form.nombre"
              type="text"
              placeholder="Ej. Escuela Primaria Benito Juárez"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Subdominio</label>
            <div class="flex items-center gap-2">
              <input
                v-model="form.subdominio"
                type="text"
                placeholder="benitojuarez"
                class="flex-1 px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
              />
              <span class="text-xs text-[#9B89D4] whitespace-nowrap">.vincula.com.mx</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Plan</label>
            <select
              v-model="form.plan"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
            >
              <option value="basico">Básico</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          <div class="border-t border-[#ece9f8] pt-4">
            <p class="text-xs font-medium text-[#6B7280] mb-3">Director de la escuela (opcional)</p>
            <div class="space-y-3">
              <input
                v-model="form.admin_curp"
                type="text"
                maxlength="18"
                placeholder="CURP del director"
                class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] uppercase placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
                @input="form.admin_curp = form.admin_curp.toUpperCase()"
              />
              <input
                v-model="form.admin_nombre"
                type="text"
                placeholder="Nombre completo del director"
                class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
              />
            </div>
            <p class="text-xs text-[#C4B8F0] mt-2">
              Se creará automáticamente con los primeros 8 dígitos de su CURP como contraseña.
            </p>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="cerrarModal"
            class="flex-1 py-2.5 rounded-xl border border-[#ece9f8] text-sm text-[#9B89D4] hover:bg-[#F8F7FC] transition"
          >
            Cancelar
          </button>
          <button
            @click="crearEscuela"
            :disabled="guardando"
            class="flex-1 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
          >
            {{ guardando ? 'Creando...' : 'Crear escuela' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import swal from '@/plugins/swal'

const escuelas = ref([])
const loading = ref(false)
const buscar = ref('')
const showModal = ref(false)
const guardando = ref(false)
const formError = ref(null)

const form = ref({
  nombre: '',
  subdominio: '',
  plan: 'basico',
  admin_curp: '',
  admin_nombre: '',
})

onMounted(() => cargarEscuelas())

async function cargarEscuelas() {
  loading.value = true
  try {
    const { data } = await api.get('/superadmin/escuelas')
    escuelas.value = data.escuelas
  } catch {
  } finally {
    loading.value = false
  }
}

const escuelasFiltradas = computed(() => {
  if (!buscar.value) return escuelas.value
  return escuelas.value.filter(
    (e) =>
      e.nombre.toLowerCase().includes(buscar.value.toLowerCase()) ||
      e.subdominio.toLowerCase().includes(buscar.value.toLowerCase()),
  )
})

const totalAlumnos = computed(() =>
  escuelas.value.reduce((sum, e) => sum + parseInt(e.total_alumnos || 0), 0),
)

const totalIngreso = computed(() =>
  escuelas.value.reduce((sum, e) => sum + parseInt(e.alumnos_pagados || 0) * 15, 0),
)

async function crearEscuela() {
  formError.value = null

  if (!form.value.nombre || !form.value.subdominio || !form.value.plan) {
    formError.value = 'Nombre, subdominio y plan son obligatorios.'
    return
  }

  guardando.value = true
  try {
    await api.post('/superadmin/escuelas/nueva', form.value)
    cerrarModal()
    await cargarEscuelas()
    swal.fire({
      title: '¡Escuela creada!',
      text: `${form.value.nombre} fue registrada correctamente.`,
      icon: 'success',
      confirmButtonText: 'Cerrar',
    })
  } catch (e) {
    formError.value = e.response?.data?.messages?.error || 'Error al crear escuela.'
  } finally {
    guardando.value = false
  }
}

async function toggleCobro(e) {
  const activar = e.cobro_activo != 1
  const { isConfirmed } = await swal.fire({
    title: activar ? '¿Activar cobro?' : '¿Desactivar cobro?',
    text: activar
      ? `En ${e.nombre} los alumnos sin pago ya NO podrán registrar asistencia.`
      : `En ${e.nombre} todos los alumnos podrán registrar asistencia sin revisar pagos.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: activar ? 'Activar' : 'Desactivar',
    cancelButtonText: 'Cancelar',
  })
  if (!isConfirmed) return
  try {
    const { data } = await api.put(`/superadmin/escuelas/cobro/${e.id}`)
    e.cobro_activo = data.cobro_activo
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo cambiar el cobro.', icon: 'error' })
  }
}

async function toggleEscuela(e) {
  const accion = e.activa == 1 ? 'desactivar' : 'activar'
  const result = await swal.fire({
    title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} escuela?`,
    text: `${e.nombre} quedará ${accion === 'activar' ? 'activa' : 'inactiva'}.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `Sí, ${accion}`,
  })

  if (!result.isConfirmed) return

  try {
    await api.put(`/superadmin/escuelas/toggle/${e.id}`)
    await cargarEscuelas()
    swal.fire({
      title: '¡Listo!',
      text: `Escuela ${accion === 'activar' ? 'activada' : 'desactivada'} correctamente.`,
      icon: 'success',
      confirmButtonText: 'Cerrar',
    })
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo actualizar.', icon: 'error' })
  }
}

function cerrarModal() {
  showModal.value = false
  formError.value = null
  form.value = { nombre: '', subdominio: '', plan: 'basico', admin_curp: '', admin_nombre: '' }
}

function formatMoney(n) {
  return Math.round(n).toLocaleString('es-MX')
}
</script>
