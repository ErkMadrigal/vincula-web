<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-medium text-[#1E1252]">Incidencias</h1>
        <p class="text-sm text-[#9B89D4] mt-0.5">
          Registra y consulta incidencias — {{ fechaHoy }}
        </p>
      </div>
      <button
        @click="showModal = true"
        class="px-4 py-2 bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm rounded-xl transition"
      >
        + Nueva incidencia
      </button>
    </div>

    <!-- Métricas -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Total período</p>
        <p class="text-2xl font-medium text-[#1E1252]">{{ incidencias.length }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Graves</p>
        <p class="text-2xl font-medium text-[#A32D2D]">{{ contarGravedad('grave') }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Moderadas</p>
        <p class="text-2xl font-medium text-[#854F0B]">{{ contarGravedad('moderada') }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Leves</p>
        <p class="text-2xl font-medium text-[#534AB7]">{{ contarGravedad('leve') }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-2xl border border-[#ece9f8] p-4 mb-6">
      <div class="flex items-center gap-3 flex-wrap">
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

        <div class="w-px h-6 bg-[#ece9f8]"></div>

        <div class="flex items-center gap-2">
          <input
            v-model="desde"
            type="date"
            class="px-3 py-1.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-xs text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
          />
          <span class="text-xs text-[#C4B8F0]">al</span>
          <input
            v-model="hasta"
            type="date"
            class="px-3 py-1.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-xs text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
          />
          <button
            @click="aplicarFiltro('rango')"
            class="px-3 py-1.5 rounded-lg bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-xs transition"
          >
            Buscar
          </button>
        </div>

        <div class="w-px h-6 bg-[#ece9f8]"></div>

        <input
          v-model="buscar"
          placeholder="Buscar alumno..."
          class="px-3 py-1.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-xs text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
        />

        <select
          v-model="filtroGravedad"
          class="px-3 py-1.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-xs text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
        >
          <option value="">Todas las gravedades</option>
          <option value="grave">Grave</option>
          <option value="moderada">Moderada</option>
          <option value="leve">Leve</option>
        </select>

        <select
          v-model="filtroTipo"
          class="px-3 py-1.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-xs text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
        >
          <option value="">Todos los tipos</option>
          <option value="pelea">Pelea</option>
          <option value="falta">Falta</option>
          <option value="conducta">Conducta</option>
          <option value="accidente">Accidente</option>
          <option value="otro">Otro</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-sm text-[#9B89D4]">Cargando...</div>
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-[#F4F2FB]">
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Alumno</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Tipo</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Gravedad</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Descripción</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Maestro</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Fecha</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Acuse</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Foto</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="i in incidenciasFiltradas"
            :key="i.id"
            class="border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
          >
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                  :class="gravClass(i.gravedad).avatar"
                >
                  {{ iniciales(i.alumno) }}
                </div>
                <div>
                  <p class="text-sm font-medium text-[#1E1252]">{{ i.alumno }}</p>
                  <p class="text-xs text-[#9B89D4]">{{ i.grado }} — {{ i.grupo }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3">
              <span
                class="text-xs px-2.5 py-1 rounded-full font-medium bg-[#F4F2FB] text-[#6B4FBB]"
              >
                {{ i.tipo }}
              </span>
            </td>
            <td class="px-5 py-3">
              <span
                class="text-xs px-2.5 py-1 rounded-full font-medium"
                :class="gravClass(i.gravedad).pill"
              >
                {{ i.gravedad }}
              </span>
            </td>
            <td class="px-5 py-3 text-sm text-[#6B7280] max-w-xs truncate">{{ i.descripcion }}</td>
            <td class="px-5 py-3 text-sm text-[#9B89D4]">{{ i.maestro }}</td>
            <td class="px-5 py-3 text-sm text-[#9B89D4]">{{ formatFecha(i.created_at) }}</td>
            <td class="px-5 py-3">
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="
                  i.acuse == 1 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#F4F2FB] text-[#9B89D4]'
                "
              >
                {{ i.acuse == 1 ? 'Firmado' : 'Pendiente' }}
              </span>
            </td>
            <td class="px-5 py-3">
              <a
                v-if="i.foto"
                :href="`http://localhost/vincula-api/public/${i.foto}`"
                target="_blank"
                class="text-xs text-[#6B4FBB] hover:underline"
              >
                Ver foto
              </a>
              <span v-else class="text-xs text-[#C4B8F0]">—</span>
            </td>
          </tr>
          <tr v-if="incidenciasFiltradas.length === 0">
            <td colspan="8" class="px-5 py-8 text-center text-sm text-[#9B89D4]">
              Sin incidencias en este período.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal nueva incidencia -->
    <div
      v-if="showModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
      @click.self="showSuggestions = false"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-6 w-full max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-4">Nueva incidencia</h2>

        <div
          v-if="formError"
          class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600"
        >
          {{ formError }}
        </div>

        <div class="space-y-4">
          <!-- Buscador alumno -->
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Alumno</label>
            <div class="relative">
              <input
                v-model="buscarAlumno"
                type="text"
                placeholder="Escribe nombre o CURP..."
                class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
                @input="filtrarAlumnos"
                @focus="showSuggestions = true"
              />

              <!-- Sugerencias -->
              <div
                v-if="showSuggestions && alumnosSugeridos.length > 0"
                class="absolute z-20 w-full mt-1 bg-white border border-[#ece9f8] rounded-xl overflow-hidden"
                style="box-shadow: 0 4px 24px rgba(107, 79, 187, 0.08)"
              >
                <div
                  v-for="a in alumnosSugeridos"
                  :key="a.uuid"
                  @mousedown="seleccionarAlumno(a)"
                  class="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F4F2FB] cursor-pointer transition"
                >
                  <div
                    class="w-7 h-7 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#6B4FBB] text-xs font-medium flex-shrink-0"
                  >
                    {{ iniciales(a.nombre) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-[#1E1252]">{{ a.nombre }}</p>
                    <p class="text-xs text-[#9B89D4]">{{ a.grado }} — Grupo {{ a.grupo }}</p>
                  </div>
                </div>
              </div>

              <!-- Chip alumno seleccionado -->
              <div
                v-if="alumnoSeleccionado"
                class="mt-2 flex items-center gap-2 px-3 py-2 bg-[#EEEDFE] rounded-xl"
              >
                <div
                  class="w-6 h-6 rounded-full bg-[#6B4FBB] flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                >
                  {{ iniciales(alumnoSeleccionado.nombre) }}
                </div>
                <span class="text-xs font-medium text-[#6B4FBB] flex-1">
                  {{ alumnoSeleccionado.nombre }} — {{ alumnoSeleccionado.grado }}
                  {{ alumnoSeleccionado.grupo }}
                </span>
                <button @click="limpiarAlumno" class="text-[#A89EE8] hover:text-[#6B4FBB] text-xs">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Tipo</label>
              <select
                v-model="form.tipo"
                class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
              >
                <option value="">Selecciona</option>
                <option value="pelea">Pelea</option>
                <option value="falta">Falta</option>
                <option value="conducta">Conducta</option>
                <option value="accidente">Accidente</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Gravedad</label>
              <select
                v-model="form.gravedad"
                class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
              >
                <option value="">Selecciona</option>
                <option value="leve">Leve</option>
                <option value="moderada">Moderada</option>
                <option value="grave">Grave</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Descripción</label>
            <textarea
              v-model="form.descripcion"
              rows="3"
              placeholder="Describe la incidencia..."
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] resize-none focus:outline-none focus:border-[#6B4FBB] transition"
            >
            </textarea>
          </div>

          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">
              Foto / evidencia <span class="text-[#C4B8F0]">(opcional)</span>
            </label>
            <div class="border-2 border-dashed border-[#ece9f8] rounded-xl p-3 text-center">
              <input
                type="file"
                accept="image/*"
                ref="fotoInput"
                @change="seleccionarFoto"
                class="hidden"
              />
              <p class="text-xs text-[#9B89D4] mb-2">
                {{ form.foto ? form.foto.name : 'Sin foto seleccionada' }}
              </p>
              <button
                @click="$refs.fotoInput.click()"
                class="px-3 py-1.5 border border-[#ece9f8] rounded-lg text-xs text-[#6B4FBB] hover:bg-[#F4F2FB] transition"
              >
                Seleccionar foto
              </button>
            </div>
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
            @click="registrarIncidencia"
            :disabled="guardando"
            class="flex-1 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
          >
            {{ guardando ? 'Registrando...' : 'Registrar' }}
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

const incidencias = ref([])
const alumnos = ref([])
const loading = ref(false)
const buscar = ref('')
const filtroGravedad = ref('')
const filtroTipo = ref('')
const periodoActivo = ref('semana')
const desde = ref('')
const hasta = ref('')
const showModal = ref(false)
const guardando = ref(false)
const formError = ref(null)
const fotoInput = ref(null)
const buscarAlumno = ref('')
const alumnoSeleccionado = ref(null)
const alumnosSugeridos = ref([])
const showSuggestions = ref(false)

const form = ref({
  alumno_uuid: '',
  tipo: '',
  gravedad: '',
  descripcion: '',
  foto: null,
})

const fechaHoy = new Date().toLocaleDateString('es-MX', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

onMounted(async () => {
  await aplicarFiltro('semana')
  try {
    const { data } = await api.get('/admin/alumnos')
    alumnos.value = data.alumnos
  } catch {}
})

async function aplicarFiltro(periodo) {
  periodoActivo.value = periodo
  const hoy = new Date()

  if (periodo === 'hoy') {
    const d = hoy.toISOString().split('T')[0]
    desde.value = d
    hasta.value = d
  } else if (periodo === 'semana') {
    const lunes = new Date(hoy)
    const dia = hoy.getDay() || 7
    lunes.setDate(hoy.getDate() - dia + 1)
    const domingo = new Date(lunes)
    domingo.setDate(lunes.getDate() + 6)
    desde.value = lunes.toISOString().split('T')[0]
    hasta.value = domingo.toISOString().split('T')[0]
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
    const { data } = await api.get(`/incidencia/escuela?desde=${desde.value}&hasta=${hasta.value}`)
    incidencias.value = data.incidencias
  } catch {
  } finally {
    loading.value = false
  }
}

const incidenciasFiltradas = computed(() => {
  return incidencias.value.filter((i) => {
    const matchBuscar = !buscar.value || i.alumno.toLowerCase().includes(buscar.value.toLowerCase())
    const matchGravedad = !filtroGravedad.value || i.gravedad === filtroGravedad.value
    const matchTipo = !filtroTipo.value || i.tipo === filtroTipo.value
    return matchBuscar && matchGravedad && matchTipo
  })
})

const contarGravedad = (g) => incidencias.value.filter((i) => i.gravedad === g).length

function filtrarAlumnos() {
  alumnoSeleccionado.value = null
  form.value.alumno_uuid = ''
  showSuggestions.value = true

  if (!buscarAlumno.value || buscarAlumno.value.length < 2) {
    alumnosSugeridos.value = []
    return
  }

  alumnosSugeridos.value = alumnos.value
    .filter(
      (a) =>
        a.nombre.toLowerCase().includes(buscarAlumno.value.toLowerCase()) ||
        a.curp.toLowerCase().includes(buscarAlumno.value.toLowerCase()),
    )
    .slice(0, 6)
}

function seleccionarAlumno(a) {
  alumnoSeleccionado.value = a
  form.value.alumno_uuid = a.uuid
  buscarAlumno.value = ''
  alumnosSugeridos.value = []
  showSuggestions.value = false
}

function limpiarAlumno() {
  alumnoSeleccionado.value = null
  form.value.alumno_uuid = ''
  buscarAlumno.value = ''
}

async function registrarIncidencia() {
  formError.value = null

  if (!form.value.alumno_uuid) {
    formError.value = 'Selecciona un alumno.'
    return
  }
  if (!form.value.tipo || !form.value.gravedad || !form.value.descripcion) {
    formError.value = 'Todos los campos son obligatorios.'
    return
  }
  if (form.value.descripcion.length < 10) {
    formError.value = 'La descripción debe tener al menos 10 caracteres.'
    return
  }

  guardando.value = true
  try {
    const formData = new FormData()
    formData.append('alumno_uuid', form.value.alumno_uuid)
    formData.append('tipo', form.value.tipo)
    formData.append('gravedad', form.value.gravedad)
    formData.append('descripcion', form.value.descripcion)
    if (form.value.foto) formData.append('foto', form.value.foto)

    await api.post('/incidencia/registrar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    cerrarModal()
    await cargar()
    swal.fire({
      title: '¡Incidencia registrada!',
      text: 'Se notificó al padre de familia.',
      icon: 'success',
      confirmButtonText: 'Cerrar',
    })
  } catch (e) {
    formError.value = e.response?.data?.messages?.error || 'Error al registrar.'
  } finally {
    guardando.value = false
  }
}

function seleccionarFoto(e) {
  form.value.foto = e.target.files[0] || null
}

function cerrarModal() {
  showModal.value = false
  formError.value = null
  buscarAlumno.value = ''
  alumnoSeleccionado.value = null
  alumnosSugeridos.value = []
  showSuggestions.value = false
  form.value = { alumno_uuid: '', tipo: '', gravedad: '', descripcion: '', foto: null }
  if (fotoInput.value) fotoInput.value.value = ''
}

function gravClass(g) {
  const clases = {
    grave: { pill: 'bg-[#FCEBEB] text-[#A32D2D]', avatar: 'bg-[#FCEBEB] text-[#A32D2D]' },
    moderada: { pill: 'bg-[#FAEEDA] text-[#854F0B]', avatar: 'bg-[#FAEEDA] text-[#854F0B]' },
    leve: { pill: 'bg-[#EEEDFE] text-[#534AB7]', avatar: 'bg-[#EEEDFE] text-[#534AB7]' },
  }
  return clases[g] || { pill: 'bg-[#F4F2FB] text-[#9B89D4]', avatar: 'bg-[#F4F2FB] text-[#9B89D4]' }
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
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>
