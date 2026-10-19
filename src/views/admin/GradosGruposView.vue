<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-xl font-medium text-[#1E1252]">Grados y grupos</h1>
        <p class="text-sm text-[#9B89D4] mt-0.5">Configura los grados y grupos de tu escuela</p>
      </div>
      <button
        @click="showModal = true"
        class="px-4 py-2 bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm rounded-xl transition"
      >
        + Nuevo
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-sm text-[#9B89D4]">Cargando...</div>
      <div v-else class="overflow-x-auto"><table class="w-full min-w-[640px]">
        <thead>
          <tr class="border-b border-[#F4F2FB]">
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Grado</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Grupo</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Turno</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="g in lista"
            :key="g.id"
            class="border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
          >
            <td class="px-5 py-3 text-sm font-medium text-[#1E1252]">{{ g.grado }}</td>
            <td class="px-5 py-3 text-sm text-[#6B7280]">{{ g.grupo }}</td>
            <td class="px-5 py-3">
              <span
                class="text-xs px-2.5 py-1 rounded-full font-medium"
                :class="
                  g.turno === 'matutino'
                    ? 'bg-[#FAEEDA] text-[#854F0B]'
                    : 'bg-[#EEEDFE] text-[#534AB7]'
                "
              >
                {{ g.turno }}
              </span>
            </td>
            <td class="px-5 py-3">
              <button
                @click="eliminar(g)"
                class="text-xs px-3 py-1.5 rounded-lg border border-[#ece9f8] text-red-400 hover:bg-red-50 transition"
              >
                Eliminar
              </button>
            </td>
          </tr>
          <tr v-if="lista.length === 0">
            <td colspan="4" class="px-5 py-8 text-center text-sm text-[#9B89D4]">
              No hay grados/grupos configurados.
            </td>
          </tr>
        </tbody>
      </table></div>
    </div>

    <!-- Modal nuevo -->
    <div
      v-if="showModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-sm">
        <h2 class="text-base font-medium text-[#1E1252] mb-4">Nuevo grado/grupo</h2>

        <div
          v-if="formError"
          class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600"
        >
          {{ formError }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Grado</label>
            <input
              v-model="form.grado"
              type="text"
              placeholder="Ej. 1ro, 2do, 3ro, 1er semestre..."
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Grupo</label>
            <input
              v-model="form.grupo"
              type="text"
              placeholder="Ej. A, B, 1, 2..."
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Turno</label>
            <select
              v-model="form.turno"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
            >
              <option value="matutino">Matutino</option>
              <option value="vespertino">Vespertino</option>
            </select>
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
            @click="crear"
            :disabled="guardando"
            class="flex-1 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
          >
            {{ guardando ? 'Guardando...' : 'Crear' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import swal from '@/plugins/swal'

const lista = ref([])
const loading = ref(false)
const showModal = ref(false)
const guardando = ref(false)
const formError = ref(null)
const form = ref({ grado: '', grupo: '', turno: 'matutino' })

onMounted(() => cargar())

async function cargar() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/grados-grupos')
    lista.value = data.grados_grupos
  } catch {
  } finally {
    loading.value = false
  }
}

async function crear() {
  formError.value = null
  if (!form.value.grado || !form.value.grupo) {
    formError.value = 'Grado y grupo son obligatorios.'
    return
  }
  guardando.value = true
  try {
    await api.post('/admin/grados-grupos/nuevo', form.value)
    cerrarModal()
    await cargar()
    swal.fire({
      title: '¡Listo!',
      text: 'Grado/grupo creado.',
      icon: 'success',
      confirmButtonText: 'Cerrar',
    })
  } catch (e) {
    formError.value = e.response?.data?.messages?.error || 'Error al crear.'
  } finally {
    guardando.value = false
  }
}

async function eliminar(g) {
  const result = await swal.fire({
    title: `¿Eliminar ${g.grado} ${g.grupo}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
  })
  if (!result.isConfirmed) return
  try {
    await api.delete(`/admin/grados-grupos/${g.id}`)
    await cargar()
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo eliminar.', icon: 'error' })
  }
}

function cerrarModal() {
  showModal.value = false
  formError.value = null
  form.value = { grado: '', grupo: '', turno: 'matutino' }
}
</script>
