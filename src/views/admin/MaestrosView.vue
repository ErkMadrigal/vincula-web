<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-xl font-medium text-[#1E1252]">Maestros</h1>
        <p class="text-sm text-[#9B89D4] mt-0.5">Gestiona los docentes de la escuela</p>
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
          + Nuevo maestro
        </button>
      </div>
    </div>

    <!-- Métricas -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-6">
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Total maestros</p>
        <p class="text-2xl font-medium text-[#1E1252]">{{ maestros.length }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Activos</p>
        <p class="text-2xl font-medium text-[#1E1252]">
          {{ maestros.filter((m) => m.activo == 1).length }}
        </p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Bloqueados</p>
        <p class="text-2xl font-medium text-[#1E1252]">
          {{ maestros.filter((m) => m.activo == 0).length }}
        </p>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
      <div class="px-5 py-3 border-b border-[#F4F2FB] flex items-center gap-3">
        <input
          v-model="buscar"
          placeholder="Buscar por nombre o CURP..."
          class="flex-1 px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
        />
        <select
          v-model="filtroEstado"
          class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
        >
          <option value="">Todos</option>
          <option value="1">Activos</option>
          <option value="0">Bloqueados</option>
        </select>
      </div>

      <div v-if="loading" class="p-8 text-center text-sm text-[#9B89D4]">Cargando maestros...</div>

      <div v-else class="overflow-x-auto"><table class="w-full min-w-[640px]">
        <thead>
          <tr class="border-b border-[#F4F2FB]">
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Nombre</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">CURP</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Estado</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Creado</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="m in maestrosFiltrados"
            :key="m.id"
            class="border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
          >
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#6B4FBB] text-xs font-medium flex-shrink-0"
                >
                  {{ iniciales(m.nombre) }}
                </div>
                <span class="text-sm font-medium text-[#1E1252]">{{ m.nombre }}</span>
              </div>
            </td>
            <td class="px-5 py-3 text-sm text-[#6B7280] font-mono">{{ m.curp }}</td>
            <td class="px-5 py-3">
              <span
                class="text-xs px-2.5 py-1 rounded-full font-medium"
                :class="
                  m.activo == 1 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FCEBEB] text-[#A32D2D]'
                "
              >
                {{ m.activo == 1 ? 'Activo' : 'Bloqueado' }}
              </span>
            </td>
            <td class="px-5 py-3 text-sm text-[#9B89D4]">{{ formatFecha(m.created_at) }}</td>
            <td class="px-5 py-3">
              <div class="flex items-center gap-2">
                <button
                  @click="abrirEditar(m)"
                  class="text-xs px-3 py-1.5 rounded-lg border border-[#ece9f8] text-[#6B4FBB] hover:bg-[#F4F2FB] transition"
                >
                  Editar
                </button>
                <button
                  @click="confirmarReset(m)"
                  class="text-xs px-3 py-1.5 rounded-lg border border-[#ece9f8] text-[#9B89D4] hover:bg-[#F8F7FC] transition"
                >
                  Reset pass
                </button>
                <button
                  @click="toggleEstado(m)"
                  class="text-xs px-3 py-1.5 rounded-lg border border-[#ece9f8] transition"
                  :class="
                    m.activo == 1
                      ? 'text-red-400 hover:bg-red-50'
                      : 'text-[#6B4FBB] hover:bg-[#F4F2FB]'
                  "
                >
                  {{ m.activo == 1 ? 'Bloquear' : 'Activar' }}
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="maestrosFiltrados.length === 0">
            <td colspan="5" class="px-5 py-8 text-center text-sm text-[#9B89D4]">
              No se encontraron maestros.
            </td>
          </tr>
        </tbody>
      </table></div>
    </div>

    <!-- Modal nuevo maestro -->
    <div
      v-if="showModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-4">Nuevo maestro</h2>

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
              placeholder="RAMJ850310HMCDLR01"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] uppercase placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
              @input="form.curp = form.curp.toUpperCase()"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Nombre completo</label>
            <input
              v-model="form.nombre"
              type="text"
              placeholder="Prof. Juan Ramírez"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
            />
          </div>
          <p class="text-xs text-[#C4B8F0]">Contraseña inicial: primeros 8 dígitos de la CURP.</p>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="cerrarModal"
            class="flex-1 py-2.5 rounded-xl border border-[#ece9f8] text-sm text-[#9B89D4] hover:bg-[#F8F7FC] transition"
          >
            Cancelar
          </button>
          <button
            @click="crearMaestro"
            :disabled="guardando"
            class="flex-1 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
          >
            {{ guardando ? 'Guardando...' : 'Crear maestro' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal editar -->
    <div
      v-if="showEditModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-4">Editar maestro</h2>

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
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Estado</label>
            <select
              v-model="editForm.activo"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
            >
              <option :value="1">Activo</option>
              <option :value="0">Bloqueado</option>
            </select>
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

    <!-- Modal carga masiva -->
    <div
      v-if="showCargaModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-2">Carga masiva de maestros</h2>
        <p class="text-xs text-[#9B89D4] mb-4">
          Sube un archivo .xlsx con columnas: <strong>curp</strong> y <strong>nombre</strong>
        </p>

        <div v-if="cargaResultado" class="mb-4 p-4 rounded-xl bg-[#F4F2FB] border border-[#ece9f8]">
          <p class="text-sm font-medium text-[#1E1252] mb-2">Resultado:</p>
          <p class="text-xs text-[#0F6E56]">✓ Creados: {{ cargaResultado.creados }}</p>
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

const maestros = ref([])
const loading = ref(false)
const buscar = ref('')
const filtroEstado = ref('')
const showModal = ref(false)
const showEditModal = ref(false)
const showCargaModal = ref(false)
const guardando = ref(false)
const guardandoEdit = ref(false)
const subiendo = ref(false)
const formError = ref(null)
const editError = ref(null)
const archivoSeleccionado = ref(null)
const cargaResultado = ref(null)
const fileInput = ref(null)

const form = ref({ curp: '', nombre: '' })
const editForm = ref({ id: null, nombre: '', activo: 1 })

onMounted(() => cargarMaestros())

async function cargarMaestros() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/usuarios')
    maestros.value = data.usuarios.filter((u) => u.rol === 'maestro')
  } catch {
  } finally {
    loading.value = false
  }
}

const maestrosFiltrados = computed(() => {
  return maestros.value.filter((m) => {
    const matchBuscar =
      !buscar.value ||
      m.nombre.toLowerCase().includes(buscar.value.toLowerCase()) ||
      m.curp.toLowerCase().includes(buscar.value.toLowerCase())
    const matchEstado = filtroEstado.value === '' || m.activo == filtroEstado.value
    return matchBuscar && matchEstado
  })
})

async function crearMaestro() {
  formError.value = null
  if (!form.value.curp || !form.value.nombre) {
    formError.value = 'Todos los campos son obligatorios.'
    return
  }
  if (form.value.curp.length !== 18) {
    formError.value = 'La CURP debe tener 18 caracteres.'
    return
  }
  guardando.value = true
  try {
    await api.post('/admin/usuario/nuevo', { ...form.value, rol: 'maestro' })
    cerrarModal()
    await cargarMaestros()
    swal.fire({
      title: '¡Maestro creado!',
      html: `<strong>${form.value.nombre}</strong> fue registrado correctamente.<br>
             <span style="color:#9B89D4;font-size:13px;">Contraseña inicial: ${form.value.curp.substring(0, 8)}</span>`,
      icon: 'success',
      confirmButtonText: 'Cerrar',
    })
  } catch (e) {
    formError.value = e.response?.data?.messages?.error || 'Error al crear maestro.'
  } finally {
    guardando.value = false
  }
}

function cerrarModal() {
  showModal.value = false
  formError.value = null
  form.value = { curp: '', nombre: '' }
}

function abrirEditar(m) {
  editForm.value = { id: m.id, nombre: m.nombre, activo: parseInt(m.activo) }
  editError.value = null
  showEditModal.value = true
}

async function guardarEdicion() {
  editError.value = null
  guardandoEdit.value = true
  try {
    await api.put(`/admin/usuario/editar/${editForm.value.id}`, {
      nombre: editForm.value.nombre,
      activo: editForm.value.activo,
      rol: 'maestro',
    })
    await cargarMaestros()
    showEditModal.value = false
    swal.fire({
      title: '¡Listo!',
      text: 'Maestro actualizado.',
      icon: 'success',
      confirmButtonText: 'Cerrar',
    })
  } catch (e) {
    editError.value = e.response?.data?.messages?.error || 'Error al actualizar.'
  } finally {
    guardandoEdit.value = false
  }
}

async function toggleEstado(m) {
  const accion = m.activo == 1 ? 'bloquear' : 'activar'
  const result = await swal.fire({
    title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${m.nombre}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `Sí, ${accion}`,
  })
  if (!result.isConfirmed) return
  try {
    await api.put(`/admin/usuario/editar/${m.id}`, {
      activo: m.activo == 1 ? 0 : 1,
      rol: 'maestro',
    })
    await cargarMaestros()
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo actualizar.', icon: 'error' })
  }
}

async function confirmarReset(m) {
  const result = await swal.fire({
    title: '¿Restablecer contraseña?',
    html: `La contraseña de <strong>${m.nombre}</strong> volverá a ser <strong>${m.curp.substring(0, 8)}</strong>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, restablecer',
  })
  if (!result.isConfirmed) return
  try {
    const { data } = await api.put(`/admin/usuario/reset-password/${m.id}`)
    swal.fire({
      title: '¡Listo!',
      html: `Contraseña restablecida:<br><strong style="color:#6B4FBB;font-size:18px;">${data.password}</strong>`,
      icon: 'success',
      confirmButtonText: 'Cerrar',
    })
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo restablecer.', icon: 'error' })
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
    const { data } = await api.post('/admin/carga/maestros', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    cargaResultado.value = data
    await cargarMaestros()
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

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>
