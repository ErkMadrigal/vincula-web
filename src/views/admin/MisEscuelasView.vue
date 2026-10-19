<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-xl font-medium text-[#1E1252]">Mis escuelas</h1>
        <p class="text-sm text-[#9B89D4] mt-0.5">
          Las que te asignó el super admin y las que tú creaste
        </p>
      </div>
      <button
        @click="abrirNueva"
        class="px-4 py-2 bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm rounded-xl transition"
      >
        + Nueva escuela
      </button>
    </div>

    <div v-if="cargando" class="p-8 text-center text-sm text-[#9B89D4]">Cargando…</div>

    <div v-else-if="!auth.escuelas.length" class="bg-white rounded-2xl border border-[#ece9f8] p-8 text-center">
      <p class="text-sm text-[#1E1252] mb-1">Todavía no tienes escuelas.</p>
      <p class="text-xs text-[#9B89D4]">Crea una o pide al super admin que te asigne.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="e in auth.escuelas"
        :key="e.id"
        class="bg-white rounded-2xl border p-4 flex flex-col gap-3 transition"
        :class="e.id === auth.escuelaActivaId ? 'border-[#6B4FBB] ring-2 ring-[#F4F2FB]' : 'border-[#ece9f8]'"
      >
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#F4F2FB] flex items-center justify-center text-lg flex-shrink-0">🏫</div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-[#1E1252] truncate">{{ e.nombre }}</p>
            <div class="flex flex-wrap gap-1 mt-1">
              <span
                class="text-[10px] px-2 py-0.5 rounded-full font-medium"
                :class="e.origen === 'creada' ? 'bg-[#E0F7FA] text-[#0E7490]' : 'bg-[#F4F2FB] text-[#6B4FBB]'"
              >
                {{ e.origen === 'creada' ? 'Creada por ti' : 'Asignada' }}
              </span>
              <span v-if="e.activa == 0" class="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#FCEBEB] text-[#A32D2D]">
                Inactiva
              </span>
            </div>
          </div>
        </div>

        <button
          v-if="e.id !== auth.escuelaActivaId"
          @click="auth.setEscuela(e.id)"
          class="mt-auto py-2 rounded-xl border border-[#ece9f8] text-xs text-[#6B4FBB] hover:bg-[#F4F2FB] transition"
        >
          Trabajar en esta escuela
        </button>
        <p v-else class="mt-auto py-2 text-center text-xs font-medium text-[#6B4FBB]">✓ Escuela activa</p>
      </div>
    </div>

    <!-- Modal nueva escuela -->
    <div
      v-if="modal"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
      style="background: rgba(30, 18, 82, 0.4)"
      @click.self="modal = false"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-4">Nueva escuela</h2>
        <label class="text-xs font-medium text-[#6B7280]">Nombre de la escuela</label>
        <input
          v-model="nombre"
          ref="inputNombre"
          type="text"
          placeholder="Ej. Secundaria Técnica 36"
          class="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
          @keyup.enter="crear"
        />
        <p class="text-[11px] text-[#9B89D4] mt-2">
          Al crearla quedará asignada a ti. Después da de alta a su director y maestros en Usuarios.
        </p>
        <div class="flex gap-3 mt-6">
          <button
            @click="modal = false"
            class="flex-1 py-2.5 rounded-xl border border-[#ece9f8] text-sm text-[#9B89D4] hover:bg-[#F8F7FC] transition"
          >
            Cancelar
          </button>
          <button
            @click="crear"
            :disabled="guardando || nombre.trim().length < 3"
            class="flex-1 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
          >
            {{ guardando ? 'Creando…' : 'Crear escuela' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import api from '@/api/axios'
import swal from '@/plugins/swal'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const cargando = ref(false)
const modal = ref(false)
const nombre = ref('')
const guardando = ref(false)
const inputNombre = ref(null)

onMounted(async () => {
  cargando.value = true
  await auth.cargarEscuelas()
  cargando.value = false
})

function abrirNueva() {
  nombre.value = ''
  modal.value = true
  nextTick(() => inputNombre.value?.focus())
}

async function crear() {
  if (nombre.value.trim().length < 3 || guardando.value) return
  guardando.value = true
  try {
    const { data } = await api.post('/escuelas/nueva', { nombre: nombre.value.trim() })
    modal.value = false
    await swal.fire({
      title: 'Escuela creada',
      text: `${data.escuela.nombre} quedó asignada a ti. Vamos a trabajar en ella.`,
      icon: 'success',
    })
    auth.setEscuela(data.escuela.id) // cambia a la nueva escuela
  } catch (e) {
    swal.fire({
      title: 'Error',
      text: e.response?.data?.messages?.error || 'No se pudo crear la escuela.',
      icon: 'error',
    })
  } finally {
    guardando.value = false
  }
}
</script>
