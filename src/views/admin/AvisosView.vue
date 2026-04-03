<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-medium text-[#1E1252]">Avisos</h1>
        <p class="text-sm text-[#9B89D4] mt-0.5">Publica comunicados para los padres de familia</p>
      </div>
      <button
        @click="showModal = true"
        class="px-4 py-2 bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm rounded-xl transition"
      >
        + Nuevo aviso
      </button>
    </div>

    <!-- Métricas -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Total avisos</p>
        <p class="text-2xl font-medium text-[#1E1252]">{{ avisos.length }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Vigentes</p>
        <p class="text-2xl font-medium text-[#0F6E56]">{{ avisosVigentes }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#ece9f8] p-4">
        <p class="text-xs text-[#9B89D4] mb-1">Vencidos</p>
        <p class="text-2xl font-medium text-[#9B89D4]">{{ avisos.length - avisosVigentes }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div
      class="bg-white rounded-2xl border border-[#ece9f8] p-4 mb-6 flex items-center gap-3 flex-wrap"
    >
      <input
        v-model="buscar"
        placeholder="Buscar aviso..."
        class="flex-1 min-w-48 px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
      />
      <select
        v-model="filtroGrado"
        class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
      >
        <option value="">Todos los grados</option>
        <option v-for="g in grados" :key="g" :value="g">{{ g }}</option>
        <option value="general">General</option>
      </select>
      <select
        v-model="filtroEstado"
        class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
      >
        <option value="">Todos</option>
        <option value="vigente">Vigentes</option>
        <option value="vencido">Vencidos</option>
      </select>
    </div>

    <!-- Grid de avisos -->
    <div v-if="loading" class="p-8 text-center text-sm text-[#9B89D4]">Cargando avisos...</div>

    <div v-else class="grid grid-cols-2 gap-4">
      <div
        v-for="a in avisosFiltrados"
        :key="a.id"
        class="bg-white rounded-2xl border overflow-hidden transition"
        :class="esVigente(a) ? 'border-[#ece9f8]' : 'border-[#F4F2FB] opacity-60'"
      >
        <!-- Header -->
        <div class="px-5 py-4 border-b border-[#F4F2FB]">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[#1E1252] truncate">{{ a.titulo }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs text-[#9B89D4]">{{ a.autor }}</span>
                <span class="text-[#C4B8F0]">·</span>
                <span class="text-xs text-[#9B89D4]">{{ formatFecha(a.created_at) }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Badge destino -->
              <span
                class="text-xs px-2.5 py-1 rounded-full font-medium"
                :class="a.grado ? 'bg-[#EEEDFE] text-[#534AB7]' : 'bg-[#E1F5EE] text-[#0F6E56]'"
              >
                {{ a.grado ? `${a.grado}${a.grupo ? ' — ' + a.grupo : ''}` : 'Toda la escuela' }}
              </span>
              <!-- Badge vigencia -->
              <span
                class="text-xs px-2.5 py-1 rounded-full font-medium"
                :class="
                  esVigente(a) ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#F4F2FB] text-[#9B89D4]'
                "
              >
                {{ esVigente(a) ? 'Vigente' : 'Vencido' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Descripción -->
        <div class="px-5 py-4">
          <p class="text-sm text-[#6B7280] line-clamp-3">{{ a.descripcion }}</p>
          <div v-if="a.vigencia" class="mt-3 flex items-center gap-1.5">
            <span class="text-xs text-[#C4B8F0]">Vigencia:</span>
            <span class="text-xs font-medium text-[#9B89D4]">{{ formatFecha(a.vigencia) }}</span>
          </div>
        </div>

        <!-- Acciones -->
        <div class="px-5 py-3 border-t border-[#F4F2FB] flex items-center justify-end gap-2">
          <button
            @click="eliminarAviso(a)"
            class="text-xs px-3 py-1.5 rounded-lg border border-[#ece9f8] text-red-400 hover:bg-red-50 transition"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div
        v-if="avisosFiltrados.length === 0"
        class="col-span-2 bg-white rounded-2xl border border-[#ece9f8] p-8 text-center text-sm text-[#9B89D4]"
      >
        No hay avisos publicados.
      </div>
    </div>

    <!-- Modal nuevo aviso -->
    <div
      v-if="showModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-6 w-full max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-4">Nuevo aviso</h2>

        <div
          v-if="formError"
          class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600"
        >
          {{ formError }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Título</label>
            <input
              v-model="form.titulo"
              type="text"
              placeholder="Ej. Suspensión de clases el viernes"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Descripción</label>
            <textarea
              v-model="form.descripcion"
              rows="4"
              placeholder="Escribe el contenido del aviso..."
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] resize-none focus:outline-none focus:border-[#6B4FBB] transition"
            >
            </textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-[#6B7280] mb-1.5">
                Grado <span class="text-[#C4B8F0]">(opcional)</span>
              </label>
              <select
                v-model="form.grado"
                class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
              >
                <option value="">Toda la escuela</option>
                <option v-for="g in grados" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-[#6B7280] mb-1.5">
                Grupo <span class="text-[#C4B8F0]">(opcional)</span>
              </label>
              <input
                v-model="form.grupo"
                type="text"
                placeholder="A, B, C..."
                :disabled="!form.grado"
                class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">
              Fecha de vigencia <span class="text-[#C4B8F0]">(opcional)</span>
            </label>
            <input
              v-model="form.vigencia"
              type="date"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
            />
            <p class="text-xs text-[#C4B8F0] mt-1">Si no pones fecha, el aviso no expira.</p>
          </div>

          <!-- Preview destino -->
          <div class="px-3 py-2 bg-[#F4F2FB] rounded-xl">
            <p class="text-xs text-[#9B89D4]">
              Este aviso llegará a:
              <strong class="text-[#6B4FBB]">
                {{
                  form.grado
                    ? `${form.grado}${form.grupo ? ' — Grupo ' + form.grupo : ' (todos los grupos)'}`
                    : 'Toda la escuela'
                }}
              </strong>
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
            @click="publicar"
            :disabled="guardando"
            class="flex-1 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
          >
            {{ guardando ? 'Publicando...' : '📢 Publicar aviso' }}
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

const avisos = ref([])
const loading = ref(false)
const buscar = ref('')
const filtroGrado = ref('')
const filtroEstado = ref('')
const showModal = ref(false)
const guardando = ref(false)
const formError = ref(null)

const form = ref({
  titulo: '',
  descripcion: '',
  grado: '',
  grupo: '',
  vigencia: '',
})

onMounted(() => cargarAvisos())

async function cargarAvisos() {
  loading.value = true
  try {
    const { data } = await api.get('/aviso/escuela')
    avisos.value = data.avisos
  } catch {
  } finally {
    loading.value = false
  }
}

const grados = computed(() => {
  const set = new Set(avisos.value.map((a) => a.grado).filter(Boolean))
  return [...set].sort()
})

const avisosVigentes = computed(() => avisos.value.filter((a) => esVigente(a)).length)

const avisosFiltrados = computed(() => {
  return avisos.value.filter((a) => {
    const matchBuscar =
      !buscar.value ||
      a.titulo.toLowerCase().includes(buscar.value.toLowerCase()) ||
      a.descripcion.toLowerCase().includes(buscar.value.toLowerCase())

    const matchGrado =
      !filtroGrado.value ||
      (filtroGrado.value === 'general' ? !a.grado : a.grado === filtroGrado.value)

    const matchEstado =
      !filtroEstado.value || (filtroEstado.value === 'vigente' ? esVigente(a) : !esVigente(a))

    return matchBuscar && matchGrado && matchEstado
  })
})

function esVigente(a) {
  if (!a.vigencia) return true
  return new Date(a.vigencia + 'T23:59:59') >= new Date()
}

async function publicar() {
  formError.value = null

  if (!form.value.titulo || !form.value.descripcion) {
    formError.value = 'El título y la descripción son obligatorios.'
    return
  }

  guardando.value = true
  try {
    await api.post('/aviso/publicar', {
      titulo: form.value.titulo,
      descripcion: form.value.descripcion,
      grado: form.value.grado || null,
      grupo: form.value.grupo || null,
      vigencia: form.value.vigencia || null,
    })

    cerrarModal()
    await cargarAvisos()
    swal.fire({
      title: '¡Aviso publicado!',
      text: 'Los padres de familia recibirán una notificación.',
      icon: 'success',
      confirmButtonText: 'Cerrar',
    })
  } catch (e) {
    formError.value = e.response?.data?.messages?.error || 'Error al publicar.'
  } finally {
    guardando.value = false
  }
}

async function eliminarAviso(a) {
  const result = await swal.fire({
    title: '¿Eliminar aviso?',
    text: `"${a.titulo}" dejará de ser visible para los padres.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
  })
  if (!result.isConfirmed) return

  try {
    await api.delete(`/aviso/eliminar/${a.id}`)
    await cargarAvisos()
    swal.fire({
      title: '¡Listo!',
      text: 'Aviso eliminado.',
      icon: 'success',
      confirmButtonText: 'Cerrar',
    })
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo eliminar.', icon: 'error' })
  }
}

function cerrarModal() {
  showModal.value = false
  formError.value = null
  form.value = { titulo: '', descripcion: '', grado: '', grupo: '', vigencia: '' }
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>
