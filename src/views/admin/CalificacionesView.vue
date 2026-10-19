<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-xl font-medium text-[#1E1252]">Calificaciones</h1>
        <p class="text-sm text-[#9B89D4] mt-0.5">Gestiona las calificaciones por bimestre</p>
      </div>
      <button
        @click="showCargaModal = true"
        class="px-4 py-2 bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm rounded-xl transition"
      >
        ⬆ Cargar calificaciones
      </button>
    </div>

    <!-- Filtros -->
    <div
      class="bg-white rounded-2xl border border-[#ece9f8] p-4 mb-6 flex items-center gap-3 flex-wrap"
    >
      <input
        v-model="buscar"
        placeholder="Buscar alumno..."
        class="flex-1 min-w-48 px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
      />
      <select
        v-model="filtroBimestre"
        class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
      >
        <option value="">Todos los bimestres</option>
        <option value="1">Bimestre 1</option>
        <option value="2">Bimestre 2</option>
        <option value="3">Bimestre 3</option>
        <option value="4">Bimestre 4</option>
        <option value="5">Bimestre 5</option>
      </select>
      <select
        v-model="filtroCiclo"
        class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
      >
        <option value="">Todos los ciclos</option>
        <option v-for="c in ciclos" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <!-- Lista alumnos con calificaciones -->
    <div v-if="loading" class="p-8 text-center text-sm text-[#9B89D4]">
      Cargando calificaciones...
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="alumno in alumnosFiltrados"
        :key="alumno.uuid"
        class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden"
      >
        <!-- Header alumno -->
        <div
          class="px-5 py-4 flex items-center justify-between border-b border-[#F4F2FB] cursor-pointer"
          @click="toggleAlumno(alumno.uuid)"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#6B4FBB] text-xs font-medium flex-shrink-0"
            >
              {{ iniciales(alumno.nombre) }}
            </div>
            <div>
              <p class="text-sm font-medium text-[#1E1252]">{{ alumno.nombre }}</p>
              <p class="text-xs text-[#9B89D4]">{{ alumno.grado }} — Grupo {{ alumno.grupo }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-[#9B89D4]">
              {{ alumno.calificaciones?.length || 0 }} bimestre(s)
            </span>
            <span class="text-[#C4B8F0] text-sm">
              {{ expandidos.includes(alumno.uuid) ? '▲' : '▼' }}
            </span>
          </div>
        </div>

        <!-- Bimestres expandidos -->
        <div v-if="expandidos.includes(alumno.uuid)" class="px-5 py-4">
          <div
            v-if="!alumno.calificaciones?.length"
            class="text-sm text-[#9B89D4] text-center py-4"
          >
            No hay calificaciones registradas.
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="cal in alumno.calificaciones"
              :key="cal.id"
              class="border border-[#F4F2FB] rounded-xl overflow-hidden"
            >
              <!-- Header bimestre -->
              <div class="px-4 py-3 bg-[#F8F7FC] flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span
                    class="text-xs font-medium text-[#6B4FBB] bg-[#EEEDFE] px-2.5 py-1 rounded-full"
                  >
                    Bimestre {{ cal.bimestre }}
                  </span>
                  <span class="text-xs text-[#9B89D4]">{{ cal.ciclo }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-[#9B89D4]">Promedio:</span>
                  <span
                    class="text-sm font-medium"
                    :class="parseFloat(cal.promedio) >= 6 ? 'text-[#0F6E56]' : 'text-[#A32D2D]'"
                  >
                    {{ parseFloat(cal.promedio).toFixed(1) }}
                  </span>
                </div>
              </div>
              <!-- Materias -->
              <div class="overflow-x-auto"><table class="w-full min-w-[480px]">
                <thead>
                  <tr class="border-b border-[#F4F2FB]">
                    <th class="text-left px-4 py-2 text-xs font-medium text-[#9B89D4]">Materia</th>
                    <th class="text-left px-4 py-2 text-xs font-medium text-[#9B89D4]">
                      Calificación
                    </th>
                    <th class="text-left px-4 py-2 text-xs font-medium text-[#9B89D4]">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="m in cal.materias"
                    :key="m.id"
                    class="border-b border-[#F8F7FC] last:border-0"
                  >
                    <td class="px-4 py-2 text-sm text-[#1E1252]">{{ m.materia }}</td>
                    <td class="px-4 py-2">
                      <span
                        class="text-sm font-medium"
                        :class="
                          parseFloat(m.calificacion) >= 6 ? 'text-[#0F6E56]' : 'text-[#A32D2D]'
                        "
                      >
                        {{ parseFloat(m.calificacion).toFixed(1) }}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-xs text-[#9B89D4]">{{ m.observaciones || '—' }}</td>
                  </tr>
                </tbody>
              </table></div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="alumnosFiltrados.length === 0"
        class="bg-white rounded-2xl border border-[#ece9f8] p-8 text-center text-sm text-[#9B89D4]"
      >
        No se encontraron alumnos.
      </div>
    </div>

    <!-- Modal carga masiva calificaciones -->
    <div
      v-if="showCargaModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-2">Cargar calificaciones</h2>
        <p class="text-xs text-[#9B89D4] mb-4">
          Columnas requeridas: <strong>curp, materia, calificacion, observaciones</strong>
        </p>

        <div class="space-y-3 mb-4">
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Bimestre</label>
            <select
              v-model="cargaForm.bimestre"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
            >
              <option value="">Selecciona bimestre</option>
              <option value="1">Bimestre 1</option>
              <option value="2">Bimestre 2</option>
              <option value="3">Bimestre 3</option>
              <option value="4">Bimestre 4</option>
              <option value="5">Bimestre 5</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Ciclo escolar</label>
            <input
              v-model="cargaForm.ciclo"
              type="text"
              placeholder="2025-2026"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
            />
          </div>
        </div>

        <div v-if="cargaResultado" class="mb-4 p-4 rounded-xl bg-[#F4F2FB] border border-[#ece9f8]">
          <p class="text-sm font-medium text-[#1E1252] mb-2">Resultado:</p>
          <p class="text-xs text-[#0F6E56]">✓ Procesados: {{ cargaResultado.procesados }}</p>
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
            :disabled="!archivoSeleccionado || !cargaForm.bimestre || !cargaForm.ciclo || subiendo"
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
const loading = ref(false)
const buscar = ref('')
const filtroBimestre = ref('')
const filtroCiclo = ref('')
const expandidos = ref([])
const showCargaModal = ref(false)
const subiendo = ref(false)
const archivoSeleccionado = ref(null)
const cargaResultado = ref(null)
const fileInput = ref(null)
const cargaForm = ref({ bimestre: '', ciclo: '' })

onMounted(() => cargarDatos())

async function cargarDatos() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/alumnos')
    const lista = data.alumnos

    // Cargar calificaciones de cada alumno
    await Promise.all(
      lista.map(async (a) => {
        try {
          const res = await api.get(`/admin/calificaciones/alumno/${a.uuid}`)
          a.calificaciones = res.data.calificaciones
        } catch {
          a.calificaciones = []
        }
      }),
    )

    alumnos.value = lista
  } catch {
  } finally {
    loading.value = false
  }
}

const ciclos = computed(() => {
  const set = new Set()
  alumnos.value.forEach((a) => {
    a.calificaciones?.forEach((c) => set.add(c.ciclo))
  })
  return [...set].sort().reverse()
})

const alumnosFiltrados = computed(() => {
  return alumnos.value.filter((a) => {
    const matchBuscar = !buscar.value || a.nombre.toLowerCase().includes(buscar.value.toLowerCase())

    if (!matchBuscar) return false

    if (!filtroBimestre.value && !filtroCiclo.value) return true

    // Filtrar que tenga calificaciones del bimestre/ciclo seleccionado
    return a.calificaciones?.some((c) => {
      const matchBim = !filtroBimestre.value || c.bimestre == filtroBimestre.value
      const matchCiclo = !filtroCiclo.value || c.ciclo === filtroCiclo.value
      return matchBim && matchCiclo
    })
  })
})

function toggleAlumno(uuid) {
  const idx = expandidos.value.indexOf(uuid)
  if (idx === -1) {
    expandidos.value.push(uuid)
  } else {
    expandidos.value.splice(idx, 1)
  }
}

function seleccionarArchivo(e) {
  archivoSeleccionado.value = e.target.files[0]
  cargaResultado.value = null
}

async function subirArchivo() {
  if (!archivoSeleccionado.value || !cargaForm.value.bimestre || !cargaForm.value.ciclo) return
  subiendo.value = true
  try {
    const formData = new FormData()
    formData.append('archivo', archivoSeleccionado.value)
    formData.append('bimestre', cargaForm.value.bimestre)
    formData.append('ciclo', cargaForm.value.ciclo)
    const { data } = await api.post('/admin/calificaciones/carga', formData, {
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
  cargaForm.value = { bimestre: '', ciclo: '' }
}

function iniciales(nombre) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
</script>
