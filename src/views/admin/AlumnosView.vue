<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-xl font-medium text-[#1E1252]">Alumnos</h1>
        <p class="text-sm text-[#9B89D4] mt-0.5">Gestiona los alumnos de la escuela</p>
      </div>
      <div class="flex flex-wrap gap-2 sm:gap-3">
        <button
          @click="showCargaModal = true"
          class="px-4 py-2 border border-[#ece9f8] text-[#6B4FBB] text-sm rounded-xl hover:bg-[#F4F2FB] transition"
        >
          ⬆ Carga masiva
        </button>
        <button
          @click="showModal = true"
          class="px-4 py-2 bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm rounded-xl transition"
        >
          + Nuevo alumno
        </button>
      </div>
    </div>

    <!-- Métricas -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Total alumnos</p>
        <p class="text-2xl font-medium text-[#1E1252]">{{ alumnos.length }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Al corriente</p>
        <p class="text-2xl font-medium text-[#1E1252]">
          {{ alumnos.filter((a) => a.pagado == 1).length }}
        </p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Pendientes de pago</p>
        <p class="text-2xl font-medium text-[#1E1252]">
          {{ alumnos.filter((a) => a.pagado == 0).length }}
        </p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Ingreso mensual</p>
        <p class="text-2xl font-medium text-[#1E1252]">
          ${{ formatMoney(alumnos.filter((a) => a.pagado == 1).length * 15) }}
        </p>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
      <div class="px-5 py-3 border-b border-[#F4F2FB] flex items-center gap-3 flex-wrap">
        <input
          v-model="buscar"
          placeholder="Buscar por nombre o CURP..."
          class="flex-1 min-w-48 px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
        />
        <select
          v-model="filtroGrado"
          @change="filtroGrupo = ''"
          class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
        >
          <option value="">Todos los grados</option>
          <option v-for="g in grados" :key="g" :value="g">{{ g }}</option>
        </select>
        <select
          v-model="filtroGrupo"
          :disabled="!filtroGrado"
          class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition disabled:opacity-50"
        >
          <option value="">Todos los grupos</option>
          <option v-for="g in gruposPorGrado(filtroGrado)" :key="g.grupo" :value="g.grupo">
            {{ g.grupo }} — {{ g.turno }}
          </option>
        </select>
        <select
          v-model="filtroPago"
          class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
        >
          <option value="">Todos</option>
          <option value="1">Al corriente</option>
          <option value="0">Pendientes</option>
        </select>
      </div>

      <div v-if="loading" class="p-8 text-center text-sm text-[#9B89D4]">Cargando alumnos...</div>

      <div v-else class="overflow-x-auto"><table class="w-full min-w-[640px]">
        <thead>
          <tr class="border-b border-[#F4F2FB]">
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Nombre</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">CURP</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Grado</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Grupo</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Pago</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="a in alumnosFiltrados"
            :key="a.id"
            class="border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
          >
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#6B4FBB] text-xs font-medium flex-shrink-0"
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
                {{ a.pagado == 1 ? 'Al corriente' : 'Pendiente' }}
              </span>
            </td>
            <td class="px-5 py-3">
              <div class="flex items-center gap-2">
                <button
                  @click="abrirEditar(a)"
                  class="text-xs px-3 py-1.5 rounded-lg border border-[#ece9f8] text-[#6B4FBB] hover:bg-[#F4F2FB] transition"
                >
                  Editar
                </button>
                <button
                  @click="togglePago(a)"
                  class="text-xs px-3 py-1.5 rounded-lg border border-[#ece9f8] transition"
                  :class="
                    a.pagado == 1
                      ? 'text-red-400 hover:bg-red-50'
                      : 'text-[#0F6E56] hover:bg-[#E1F5EE]'
                  "
                >
                  {{ a.pagado == 1 ? 'Bloquear' : 'Activar' }}
                </button>
                <button
                  @click="verQR(a)"
                  class="text-xs px-3 py-1.5 rounded-lg border border-[#ece9f8] text-[#9B89D4] hover:bg-[#F8F7FC] transition"
                >
                  QR
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="alumnosFiltrados.length === 0">
            <td colspan="6" class="px-5 py-8 text-center text-sm text-[#9B89D4]">
              No se encontraron alumnos.
            </td>
          </tr>
        </tbody>
      </table></div>
    </div>

    <!-- Modal nuevo alumno -->
    <div
      v-if="showModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-4">Nuevo alumno</h2>
        <div
          v-if="formError"
          class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600"
        >
          {{ formError }}
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">CURP</label>
            <input
              v-model="form.curp"
              type="text"
              maxlength="18"
              placeholder="MAFE990706HMCDLR05"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] uppercase placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
              @input="form.curp = form.curp.toUpperCase()"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Nombre completo</label>
            <input
              v-model="form.nombre"
              type="text"
              placeholder="Ellioth Martínez"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Grado</label>
              <select
                v-model="form.grado"
                @change="form.grupo = ''"
                class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
              >
                <option value="">Selecciona</option>
                <option v-for="g in grados" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Grupo</label>
              <select
                v-model="form.grupo"
                :disabled="!form.grado"
                class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Selecciona</option>
                <option v-for="g in gruposPorGrado(form.grado)" :key="g.grupo" :value="g.grupo">
                  {{ g.grupo }} — {{ g.turno }}
                </option>
              </select>
            </div>
          </div>
          <p class="text-xs text-[#C4B8F0]">
            Se creará automáticamente el acceso a la app con los primeros 8 dígitos de la CURP.
          </p>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="cerrarModal"
            class="flex-1 py-2.5 rounded-xl border border-[#ece9f8] text-sm text-[#9B89D4] hover:bg-[#F8F7FC] transition"
          >
            Cancelar
          </button>
          <button
            @click="crearAlumno"
            :disabled="guardando"
            class="flex-1 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
          >
            {{ guardando ? 'Guardando...' : 'Crear alumno' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal editar alumno -->
    <div
      v-if="showEditModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-4">Editar alumno</h2>
        <div
          v-if="editError"
          class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600"
        >
          {{ editError }}
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Nombre completo</label>
            <input
              v-model="editForm.nombre"
              type="text"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Grado</label>
              <select
                v-model="editForm.grado"
                @change="editForm.grupo = ''"
                class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
              >
                <option value="">Selecciona</option>
                <option v-for="g in grados" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Grupo</label>
              <select
                v-model="editForm.grupo"
                :disabled="!editForm.grado"
                class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Selecciona</option>
                <option v-for="g in gruposPorGrado(editForm.grado)" :key="g.grupo" :value="g.grupo">
                  {{ g.grupo }} — {{ g.turno }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="showEditModal = false"
            class="flex-1 py-2.5 rounded-xl border border-[#ece9f8] text-sm text-[#9B89D4] hover:bg-[#F8F7FC] transition"
          >
            Cancelar
          </button>
          <button
            @click="guardarEdicion"
            :disabled="guardandoEdit"
            class="flex-1 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
          >
            {{ guardandoEdit ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal QR -->
    <div
      v-if="showQrModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-sm text-center">
        <h2 class="text-base font-medium text-[#1E1252] mb-1">QR — {{ alumnoQR?.nombre }}</h2>
        <p class="text-xs text-[#9B89D4] mb-4">{{ alumnoQR?.grado }} {{ alumnoQR?.grupo }}</p>
        <img
          :src="qrUrl"
          alt="QR"
          class="w-48 h-48 mx-auto rounded-xl border border-[#ece9f8] mb-4"
        />
        <p class="text-[10px] text-[#C4B8F0] font-mono mb-4 truncate w-full text-center">
          {{ alumnoQR?.uuid }}
        </p>
        <div class="flex gap-3">
          <button
            @click="showQrModal = false"
            class="flex-1 py-2.5 rounded-xl border border-[#ece9f8] text-sm text-[#9B89D4] hover:bg-[#F8F7FC] transition"
          >
            Cerrar
          </button>
          <a
            :href="qrUrl"
            :download="`qr_${alumnoQR?.nombre}.png`"
            target="_blank"
            class="flex-1 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition text-center"
          >
            ⬇ Descargar
          </a>
        </div>
      </div>
    </div>

    <!-- Modal carga masiva -->
    <div
      v-if="showCargaModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-2">Carga masiva de alumnos</h2>
        <p class="text-xs text-[#9B89D4] mb-4">
          Columnas: <strong>curp, nombre, grado, grupo</strong>
        </p>
        <div v-if="cargaResultado" class="mb-4 p-4 rounded-xl bg-[#F4F2FB] border border-[#ece9f8]">
          <p class="text-xs text-[#6B4FBB] font-medium mb-2" v-if="cargaResultado.progreso">
            {{ cargaResultado.progreso }}
          </p>
          <p class="text-xs text-[#0F6E56] mb-1">✓ Creados: {{ cargaResultado.creados }}</p>
          <p class="text-xs text-[#9B89D4] mb-1">— Omitidos: {{ cargaResultado.omitidos }}</p>
          <p class="text-xs text-red-500 mb-2" v-if="cargaResultado.errores > 0">
            ✗ Errores: {{ cargaResultado.errores }}
          </p>

          <!-- Detalle errores -->
          <div v-if="cargaResultado.detalle_errores?.length" class="mt-2">
            <p class="text-xs font-medium text-red-500 mb-1">Detalle de errores:</p>
            <div class="max-h-32 overflow-y-auto">
              <p
                v-for="e in cargaResultado.detalle_errores"
                :key="e"
                class="text-xs text-red-400 font-mono mb-0.5"
              >
                {{ e }}
              </p>
            </div>
          </div>

          <!-- Detalle omitidos -->
          <div v-if="cargaResultado.detalle_omitidos?.length" class="mt-2">
            <p class="text-xs font-medium text-[#9B89D4] mb-1">Omitidos (ya existían):</p>
            <div class="max-h-32 overflow-y-auto">
              <p
                v-for="o in cargaResultado.detalle_omitidos"
                :key="o"
                class="text-xs text-[#C4B8F0] font-mono mb-0.5"
              >
                {{ o }}
              </p>
            </div>
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
import { useGradosGrupos } from '@/composables/useGradosGrupos'
import * as XLSX from 'xlsx'

const { grados, gruposPorGrado } = useGradosGrupos()

const alumnos = ref([])
const loading = ref(false)
const buscar = ref('')
const filtroGrado = ref('')
const filtroGrupo = ref('')
const filtroPago = ref('')
const showModal = ref(false)
const showEditModal = ref(false)
const showCargaModal = ref(false)
const showQrModal = ref(false)
const guardando = ref(false)
const guardandoEdit = ref(false)
const subiendo = ref(false)
const formError = ref(null)
const editError = ref(null)
const archivoSeleccionado = ref(null)
const cargaResultado = ref(null)
const fileInput = ref(null)
const alumnoQR = ref(null)
const qrUrl = ref('')

const form = ref({ curp: '', nombre: '', grado: '', grupo: '' })
const editForm = ref({ id: null, uuid: '', nombre: '', grado: '', grupo: '' })

onMounted(() => cargarAlumnos())

async function cargarAlumnos() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/alumnos')
    alumnos.value = data.alumnos
  } catch {
  } finally {
    loading.value = false
  }
}

const alumnosFiltrados = computed(() => {
  return alumnos.value.filter((a) => {
    const matchBuscar =
      !buscar.value ||
      a.nombre.toLowerCase().includes(buscar.value.toLowerCase()) ||
      a.curp.toLowerCase().includes(buscar.value.toLowerCase())
    const matchGrado = !filtroGrado.value || a.grado === filtroGrado.value
    const matchGrupo = !filtroGrupo.value || a.grupo === filtroGrupo.value
    const matchPago = filtroPago.value === '' || a.pagado == filtroPago.value
    return matchBuscar && matchGrado && matchGrupo && matchPago
  })
})

async function crearAlumno() {
  formError.value = null
  if (!form.value.curp || !form.value.nombre || !form.value.grado || !form.value.grupo) {
    formError.value = 'Todos los campos son obligatorios.'
    return
  }
  if (form.value.curp.length !== 18) {
    formError.value = 'La CURP debe tener 18 caracteres.'
    return
  }
  guardando.value = true
  try {
    const { data } = await api.post('/admin/alumno/nuevo', form.value)
    cerrarModal()
    await cargarAlumnos()
    swal.fire({
      title: '¡Alumno creado!',
      html: `
        <p style="color:#6B7280;font-size:14px;margin-bottom:16px">
          El acceso para la app móvil es:
        </p>
        <div style="background:#F8F7FC;border-radius:12px;padding:16px;text-align:left">
          <p style="margin:0 0 8px;font-size:13px;color:#9B89D4">CURP (usuario)</p>
          <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1E1252;font-family:monospace">
            ${data.acceso.curp}
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:#9B89D4">Contraseña inicial</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#6B4FBB;font-family:monospace">
            ${data.acceso.password}
          </p>
        </div>
        <p style="color:#C4B8F0;font-size:12px;margin-top:12px">
          El padre deberá cambiar su contraseña al primer inicio de sesión
        </p>
      `,
      icon: 'success',
      confirmButtonText: 'Entendido',
    })
  } catch (e) {
    formError.value = e.response?.data?.messages?.error || 'Error al crear alumno.'
  } finally {
    guardando.value = false
  }
}

function cerrarModal() {
  showModal.value = false
  formError.value = null
  form.value = { curp: '', nombre: '', grado: '', grupo: '' }
}

function abrirEditar(a) {
  editForm.value = { id: a.id, uuid: a.uuid, nombre: a.nombre, grado: a.grado, grupo: a.grupo }
  editError.value = null
  showEditModal.value = true
}

async function guardarEdicion() {
  editError.value = null
  guardandoEdit.value = true
  try {
    await api.put(`/admin/alumno/editar/${editForm.value.uuid}`, {
      nombre: editForm.value.nombre,
      grado: editForm.value.grado,
      grupo: editForm.value.grupo,
    })
    await cargarAlumnos()
    showEditModal.value = false
    swal.fire({
      title: '¡Listo!',
      text: 'Alumno actualizado.',
      icon: 'success',
      confirmButtonText: 'Cerrar',
    })
  } catch (e) {
    editError.value = e.response?.data?.messages?.error || 'Error al actualizar.'
  } finally {
    guardandoEdit.value = false
  }
}

async function togglePago(a) {
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
    await cargarAlumnos()
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo actualizar.', icon: 'error' })
  }
}

function verQR(a) {
  alumnoQR.value = a
  const token = localStorage.getItem('token')
  // qrUrl.value = `http://localhost/vincula-api/public/api/qr/alumno/${a.uuid}?token=${token}`
  qrUrl.value = `https://api.vincula365.com/api/qr/alumno/${a.uuid}?token=${token}`
  showQrModal.value = true
}

function seleccionarArchivo(e) {
  archivoSeleccionado.value = e.target.files[0]
  cargaResultado.value = null
}

async function subirArchivo() {
  if (!archivoSeleccionado.value) return
  subiendo.value = true
  cargaResultado.value = null

  try {
    const buffer = await archivoSeleccionado.value.arrayBuffer()
    const wb = XLSX.read(buffer)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

    const header = rows[0]
    const data = rows.slice(1).filter((r) => r[0] || r[1])
    const lotes = []

    for (let i = 0; i < data.length; i += 300) {
      lotes.push(data.slice(i, i + 300))
    }

    let totalCreados = 0
    let totalOmitidos = 0
    let totalErrores = 0
    let detalleErrores = []
    let detalleOmitidos = []

    for (let idx = 0; idx < lotes.length; idx++) {
      const wsLote = XLSX.utils.aoa_to_sheet([header, ...lotes[idx]])
      const wbLote = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wbLote, wsLote, 'Sheet1')
      const blob = new Blob([XLSX.write(wbLote, { bookType: 'xlsx', type: 'array' })], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const formData = new FormData()
      formData.append('archivo', blob, 'lote.xlsx')

      const { data: res } = await api.post('/admin/carga/alumnos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      totalCreados += res.creados || 0
      totalOmitidos += res.omitidos || 0
      totalErrores += res.errores || 0
      detalleErrores = detalleErrores.concat(res.detalle_errores || [])
      detalleOmitidos = detalleOmitidos.concat(res.detalle_omitidos || [])

      cargaResultado.value = {
        creados: totalCreados,
        omitidos: totalOmitidos,
        errores: totalErrores,
        progreso: `Lote ${idx + 1} de ${lotes.length} procesado`,
        detalle_errores: detalleErrores,
        detalle_omitidos: detalleOmitidos,
      }
    }

    await cargarAlumnos()
    archivoSeleccionado.value = null
    if (fileInput.value) fileInput.value.value = ''
  } catch (e) {
    const msg = e.response?.data?.messages?.error || e.message || 'Error desconocido'
    swal.fire({ title: 'Error', text: msg, icon: 'error' })
    console.error('Carga error:', e.response?.data)
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
