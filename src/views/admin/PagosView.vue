<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-medium text-[#1E1252]">Control de pagos</h1>
        <p class="text-sm text-[#9B89D4] mt-0.5">Gestiona el estado de pago de los alumnos</p>
      </div>
      <button
        @click="showCargaModal = true"
        class="px-4 py-2 bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm rounded-xl transition"
      >
        ⬆ Carga masiva
      </button>
    </div>

    <!-- Métricas -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Total alumnos</p>
        <p class="text-2xl font-medium text-[#1E1252]">{{ estado.total }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Al corriente</p>
        <p class="text-2xl font-medium text-[#0F6E56]">{{ estado.al_corriente }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Bloqueados</p>
        <p class="text-2xl font-medium text-[#A32D2D]">{{ estado.bloqueados }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Ingreso mensual</p>
        <p class="text-2xl font-medium text-[#1E1252]">
          ${{ formatMoney(estado.al_corriente * 15) }}
        </p>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
      <div class="px-5 py-3 border-b border-[#F4F2FB] flex items-center gap-3 flex-wrap">
        <input
          v-model="buscar"
          placeholder="Buscar alumno..."
          class="flex-1 min-w-48 px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
        />
        <select
          v-model="filtroEstado"
          class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
        >
          <option value="">Todos</option>
          <option value="1">Al corriente</option>
          <option value="0">Bloqueados</option>
        </select>
        <select
          v-model="filtroGrado"
          class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
        >
          <option value="">Todos los grados</option>
          <option v-for="g in grados" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>

      <div v-if="loading" class="p-8 text-center text-sm text-[#9B89D4]">Cargando...</div>

      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-[#F4F2FB]">
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Alumno</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">CURP</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Grado</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Grupo</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Estado</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="a in alumnosFiltrados"
            :key="a.uuid"
            class="border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
          >
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                  :class="
                    a.pagado == 1 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FCEBEB] text-[#A32D2D]'
                  "
                >
                  {{ iniciales(a.nombre) }}
                </div>
                <span class="text-sm font-medium text-[#1E1252]">{{ a.nombre }}</span>
              </div>
            </td>
            <td class="px-5 py-3 text-sm text-[#6B7280] font-mono">{{ a.curp }}</td>
            <td class="px-5 py-3 text-sm text-[#6B7280]">{{ a.grado || '—' }}</td>
            <td class="px-5 py-3 text-sm text-[#6B7280]">{{ a.grupo || '—' }}</td>
            <td class="px-5 py-3">
              <span
                class="text-xs px-2.5 py-1 rounded-full font-medium"
                :class="
                  a.pagado == 1 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FCEBEB] text-[#A32D2D]'
                "
              >
                {{ a.pagado == 1 ? 'Al corriente' : 'Bloqueado' }}
              </span>
            </td>
            <td class="px-5 py-3">
              <button
                @click="toggle(a)"
                class="text-xs px-3 py-1.5 rounded-lg border border-[#ece9f8] transition"
                :class="
                  a.pagado == 1
                    ? 'text-red-400 hover:bg-red-50'
                    : 'text-[#0F6E56] hover:bg-[#E1F5EE]'
                "
              >
                {{ a.pagado == 1 ? 'Bloquear' : 'Activar' }}
              </button>
            </td>
          </tr>
          <tr v-if="alumnosFiltrados.length === 0">
            <td colspan="6" class="px-5 py-8 text-center text-sm text-[#9B89D4]">
              No se encontraron alumnos.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal carga masiva -->
    <div
      v-if="showCargaModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-6 w-full max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-2">Carga masiva de pagos</h2>
        <p class="text-xs text-[#9B89D4] mb-4">
          Columnas requeridas: <strong>curp, nombre, pagado</strong> (1 = activo, 0 = bloqueado)
        </p>

        <div v-if="cargaResultado" class="mb-4 p-4 rounded-xl bg-[#F4F2FB] border border-[#ece9f8]">
          <p class="text-sm font-medium text-[#1E1252] mb-2">Resultado:</p>
          <p class="text-xs text-[#0F6E56]">✓ Activados: {{ cargaResultado.activados }}</p>
          <p class="text-xs text-[#A32D2D]">✗ Bloqueados: {{ cargaResultado.bloqueados }}</p>
          <p class="text-xs text-[#9B89D4]">— Omitidos: {{ cargaResultado.omitidos }}</p>
          <p class="text-xs text-red-500" v-if="cargaResultado.errores > 0">
            ✗ Errores: {{ cargaResultado.errores }}
          </p>
        </div>

        <div class="border-2 border-dashed border-[#ece9f8] rounded-xl p-6 text-center mb-4">
          <input
            type="file"
            accept=".xlsx"
            ref="fileInput"
            @change="seleccionarArchivo"
            class="hidden"
          />
          <p class="text-sm text-[#9B89D4] mb-3">
            {{ archivoSeleccionado ? archivoSeleccionado.name : 'Selecciona un archivo .xlsx' }}
          </p>
          <button
            @click="$refs.fileInput.click()"
            class="px-4 py-2 border border-[#ece9f8] rounded-xl text-sm text-[#6B4FBB] hover:bg-[#F4F2FB] transition"
          >
            Seleccionar archivo
          </button>
        </div>

        <div class="flex gap-3">
          <button
            @click="cerrarCargaModal"
            class="flex-1 py-2.5 rounded-xl border border-[#ece9f8] text-sm text-[#9B89D4] hover:bg-[#F8F7FC] transition"
          >
            Cerrar
          </button>
          <button
            @click="subirArchivo"
            :disabled="!archivoSeleccionado || subiendo"
            class="flex-1 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
          >
            {{ subiendo ? 'Subiendo...' : 'Subir archivo' }}
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

const alumnos = ref([])
const estado = ref({ total: 0, al_corriente: 0, bloqueados: 0 })
const loading = ref(false)
const buscar = ref('')
const filtroEstado = ref('')
const filtroGrado = ref('')
const showCargaModal = ref(false)
const subiendo = ref(false)
const archivoSeleccionado = ref(null)
const cargaResultado = ref(null)
const fileInput = ref(null)

onMounted(() => cargarDatos())

async function cargarDatos() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/pagos/estado')
    alumnos.value = data.alumnos
    estado.value = {
      total: data.total,
      al_corriente: data.al_corriente,
      bloqueados: data.bloqueados,
    }
  } catch {
  } finally {
    loading.value = false
  }
}

const grados = computed(() => {
  const set = new Set(alumnos.value.map((a) => a.grado).filter(Boolean))
  return [...set].sort()
})

const alumnosFiltrados = computed(() => {
  return alumnos.value.filter((a) => {
    const matchBuscar =
      !buscar.value ||
      a.nombre.toLowerCase().includes(buscar.value.toLowerCase()) ||
      a.curp.toLowerCase().includes(buscar.value.toLowerCase())
    const matchEstado = filtroEstado.value === '' || a.pagado == filtroEstado.value
    const matchGrado = !filtroGrado.value || a.grado === filtroGrado.value
    return matchBuscar && matchEstado && matchGrado
  })
})

async function toggle(a) {
  const accion = a.pagado == 1 ? 'bloquear' : 'activar'
  const result = await swal.fire({
    title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${a.nombre}?`,
    text: a.pagado == 1 ? 'Perderá acceso a la app.' : 'Recuperará acceso a la app.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `Sí, ${accion}`,
  })
  if (!result.isConfirmed) return
  try {
    await api.post(`/admin/pagos/toggle/${a.uuid}`)
    await cargarDatos()
    swal.fire({
      title: '¡Listo!',
      text: `${a.nombre} fue ${a.pagado == 1 ? 'bloqueado' : 'activado'} correctamente.`,
      icon: 'success',
      confirmButtonText: 'Cerrar',
    })
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo actualizar.', icon: 'error' })
  }
}

function seleccionarArchivo(e) {
  archivoSeleccionado.value = e.target.files[0]
  cargaResultado.value = null
}

async function subirArchivo() {
  if (!archivoSeleccionado.value) return
  subiendo.value = true
  try {
    const formData = new FormData()
    formData.append('archivo', archivoSeleccionado.value)
    const { data } = await api.post('/admin/pagos/carga', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    cargaResultado.value = data
    await cargarDatos()
    archivoSeleccionado.value = null
    if (fileInput.value) fileInput.value.value = ''
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo procesar el archivo.', icon: 'error' })
  } finally {
    subiendo.value = false
  }
}

function cerrarCargaModal() {
  showCargaModal.value = false
  cargaResultado.value = null
  archivoSeleccionado.value = null
}

function iniciales(nombre) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function formatMoney(n) {
  return Math.round(n).toLocaleString('es-MX')
}
</script>
