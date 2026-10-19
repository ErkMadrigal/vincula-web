<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-xl font-medium text-[#1E1252]">Pagos</h1>
        <p class="text-sm text-[#9B89D4] mt-0.5">Control de cobranza mensual</p>
      </div>
      <div class="flex flex-wrap gap-2 sm:gap-3">
        <button
          @click="showCargaModal = true"
          class="px-4 py-2 border border-[#ece9f8] text-[#6B4FBB] text-sm rounded-xl hover:bg-[#F4F2FB] transition"
        >
          ⬆ Subir xlsx
        </button>
      </div>
    </div>

    <!-- Métricas -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Total alumnos</p>
        <p class="text-2xl font-medium text-[#1E1252]">{{ totales.total }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Al corriente</p>
        <p class="text-2xl font-medium text-[#0F6E56]">{{ totales.pagados }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Sin pago</p>
        <p class="text-2xl font-medium text-[#A32D2D]">{{ totales.bloqueados }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Ingreso del mes</p>
        <p class="text-2xl font-medium text-[#6B4FBB]">${{ formatMoney(totales.pagados * 15) }}</p>
      </div>
    </div>

    <!-- Filtros + Exportar -->
    <div class="bg-white rounded-2xl border border-[#ece9f8] p-4 mb-6">
      <div class="flex items-center gap-3 flex-wrap">
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
          <option value="0">Sin pago</option>
        </select>

        <select
          v-model="filtroGrado"
          class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
        >
          <option value="">Todos los grados</option>
          <option v-for="g in grados" :key="g" :value="g">{{ g }}</option>
        </select>

        <div class="ml-auto flex gap-2">
          <!-- Exportar filtrados -->
          <button
            @click="exportar('')"
            class="px-3 py-2 border border-[#ece9f8] text-[#9B89D4] text-xs rounded-xl hover:bg-[#F8F7FC] transition"
          >
            ⬇ Exportar todos
          </button>
          <button
            @click="exportar('0')"
            class="px-3 py-2 border border-[#FCEBEB] text-[#A32D2D] text-xs rounded-xl hover:bg-[#FCEBEB] transition"
          >
            ⬇ Exportar sin pago
          </button>
          <button
            @click="exportar('1')"
            class="px-3 py-2 border border-[#E1F5EE] text-[#0F6E56] text-xs rounded-xl hover:bg-[#E1F5EE] transition"
          >
            ⬇ Exportar pagados
          </button>
        </div>
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
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Grupo</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Estado</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Acción</th>
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
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                  :class="
                    a.pagado == 1 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FCEBEB] text-[#A32D2D]'
                  "
                >
                  {{ iniciales(a.nombre) }}
                </div>
                <span class="text-sm font-medium text-[#1E1252]">{{ a.nombre }}</span>
              </div>
            </td>
            <td class="px-5 py-3 text-sm text-[#6B7280]">{{ a.grado }}</td>
            <td class="px-5 py-3 text-sm text-[#6B7280]">{{ a.grupo }}</td>
            <td class="px-5 py-3">
              <span
                class="text-xs px-2.5 py-1 rounded-full font-medium"
                :class="
                  a.pagado == 1 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FCEBEB] text-[#A32D2D]'
                "
              >
                {{ a.pagado == 1 ? 'Al corriente' : 'Sin pago' }}
              </span>
            </td>
            <td class="px-5 py-3">
              <button
                @click="togglePago(a)"
                class="text-xs px-3 py-1.5 rounded-lg border transition font-medium"
                :class="
                  a.pagado == 1
                    ? 'border-[#FCEBEB] text-[#A32D2D] hover:bg-[#FCEBEB]'
                    : 'border-[#E1F5EE] text-[#0F6E56] hover:bg-[#E1F5EE]'
                "
              >
                {{ a.pagado == 1 ? 'Revocar pago' : 'Registrar pago' }}
              </button>
            </td>
          </tr>
          <tr v-if="alumnosFiltrados.length === 0">
            <td colspan="5" class="px-5 py-8 text-center text-sm text-[#9B89D4]">
              No se encontraron alumnos.
            </td>
          </tr>
        </tbody>
      </table></div>
    </div>

    <!-- Modal carga xlsx -->
    <div
      v-if="showCargaModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-1">Subir xlsx de pagos</h2>
        <p class="text-xs text-[#9B89D4] mb-4">
          Columnas: <strong>uuid, nombre, pagado (1=activo / 0=bloqueado), grado, grupo</strong>
        </p>

        <!-- Instrucciones flujo -->
        <div class="bg-[#F4F2FB] rounded-xl p-4 mb-4 space-y-1">
          <p class="text-xs font-medium text-[#6B4FBB] mb-2">¿Cómo funciona?</p>
          <p class="text-xs text-[#9B89D4]">1. Exporta el xlsx de alumnos sin pago</p>
          <p class="text-xs text-[#9B89D4]">
            2. Marca con <strong>1</strong> en columna "pagado" a los que ya pagaron
          </p>
          <p class="text-xs text-[#9B89D4]">
            3. Sube el xlsx aquí — el sistema activa los 1 y bloquea los 0
          </p>
        </div>

        <!-- Resultado -->
        <div
          v-if="cargaResultado"
          class="mb-4 p-4 rounded-xl border"
          :class="
            cargaResultado.errores?.length
              ? 'bg-[#FAEEDA] border-[#F5C97A]'
              : 'bg-[#E1F5EE] border-[#A3D9C5]'
          "
        >
          <p class="text-xs font-medium text-[#1E1252] mb-1">Resultado:</p>
          <p class="text-xs text-[#0F6E56]">✓ Activados: {{ cargaResultado.activados }}</p>
          <p class="text-xs text-[#A32D2D]">✗ Bloqueados: {{ cargaResultado.bloqueados }}</p>
          <div v-if="cargaResultado.errores?.length" class="mt-2">
            <p class="text-xs text-[#854F0B]" v-for="e in cargaResultado.errores" :key="e">
              ⚠ {{ e }}
            </p>
          </div>
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
            {{ subiendo ? 'Procesando...' : 'Subir y procesar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { fechaISO } from '@/utils/fecha'
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import swal from '@/plugins/swal'

const alumnos = ref([])
const loading = ref(false)
const buscar = ref('')
const filtroEstado = ref('')
const filtroGrado = ref('')
const showCargaModal = ref(false)
const subiendo = ref(false)
const archivoSeleccionado = ref(null)
const cargaResultado = ref(null)
const fileInput = ref(null)

onMounted(() => cargar())

async function cargar() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/pagos/estado')
    alumnos.value = data.alumnos
  } catch {
  } finally {
    loading.value = false
  }
}

const totales = computed(() => ({
  total: alumnos.value.length,
  pagados: alumnos.value.filter((a) => a.pagado == 1).length,
  bloqueados: alumnos.value.filter((a) => a.pagado == 0).length,
}))

const grados = computed(() => {
  const set = new Set(alumnos.value.map((a) => a.grado).filter(Boolean))
  return [...set].sort()
})

const alumnosFiltrados = computed(() => {
  return alumnos.value.filter((a) => {
    const matchBuscar = !buscar.value || a.nombre.toLowerCase().includes(buscar.value.toLowerCase())
    const matchEstado = filtroEstado.value === '' || a.pagado == filtroEstado.value
    const matchGrado = !filtroGrado.value || a.grado === filtroGrado.value
    return matchBuscar && matchEstado && matchGrado
  })
})

async function togglePago(a) {
  const accion = a.pagado == 1 ? 'revocar el pago de' : 'registrar el pago de'
  const result = await swal.fire({
    title: `¿${a.pagado == 1 ? 'Revocar' : 'Registrar'} pago?`,
    text: `${accion} ${a.nombre}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: a.pagado == 1 ? 'Sí, revocar' : 'Sí, registrar',
    cancelButtonText: 'Cancelar',
  })
  if (!result.isConfirmed) return

  try {
    await api.post(`/admin/pagos/toggle/${a.uuid}`)
    await cargar()
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo actualizar.', icon: 'error' })
  }
}

async function exportar(estado) {
  try {
    const token = localStorage.getItem('token')
    // const url = `http://localhost/vincula-api/public/api/admin/pagos/exportar?estado=${estado}`
    const url = `https://api.vincula365.com/api/admin/pagos/exportar?estado=${estado}`
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const blob = await resp.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `pagos_${estado === '0' ? 'sin_pago' : estado === '1' ? 'pagados' : 'todos'}_${fechaISO(new Date())}.xlsx`
    link.click()
    URL.revokeObjectURL(link.href)
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo exportar.', icon: 'error' })
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
    archivoSeleccionado.value = null
    if (fileInput.value) fileInput.value.value = ''
    await cargar()
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
