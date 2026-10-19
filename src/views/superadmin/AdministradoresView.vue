<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-xl font-medium text-[#1E1252]">Administradores</h1>
        <p class="text-sm text-[#9B89D4] mt-0.5">Asigna a cada admin las escuelas que puede ver</p>
      </div>
      <button
        @click="abrirNuevo"
        class="px-4 py-2 bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm rounded-xl transition"
      >
        + Nuevo admin
      </button>
    </div>

    <input
      v-model="buscar"
      type="text"
      placeholder="Buscar admin por nombre o CURP…"
      class="w-full sm:max-w-sm mb-4 px-3 py-2 rounded-xl border border-[#ece9f8] bg-white text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
    />

    <div v-if="cargando" class="p-8 text-center text-sm text-[#9B89D4]">Cargando…</div>

    <div v-else class="space-y-3">
      <div
        v-for="a in adminsFiltrados"
        :key="a.id"
        class="bg-white rounded-2xl border border-[#ece9f8] p-4 flex flex-col sm:flex-row sm:items-center gap-3"
      >
        <div class="flex items-center gap-3 min-w-0 sm:w-64 flex-shrink-0">
          <div class="w-9 h-9 rounded-full bg-[#6B4FBB] text-white text-xs font-medium flex items-center justify-center flex-shrink-0">
            {{ iniciales(a.nombre) }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-[#1E1252] truncate">
              {{ a.nombre }}
              <span v-if="a.activo == 0" class="text-[10px] text-[#A32D2D]">(inactivo)</span>
            </p>
            <p class="text-xs text-[#9B89D4] font-mono truncate">{{ a.curp }}</p>
          </div>
        </div>

        <div class="flex-1 flex flex-wrap gap-1.5 min-w-0">
          <span
            v-for="e in a.escuelas"
            :key="e.id"
            class="text-xs px-2.5 py-1 rounded-full"
            :class="e.origen === 'creada' ? 'bg-[#E0F7FA] text-[#0E7490]' : 'bg-[#F4F2FB] text-[#6B4FBB]'"
            :title="e.origen === 'creada' ? 'La creó este admin' : 'Asignada por ti'"
          >
            {{ e.nombre }}<span v-if="e.origen === 'creada'"> ★</span>
          </span>
          <span v-if="!a.escuelas.length" class="text-xs text-[#C4B8F0]">Sin escuelas</span>
        </div>

        <button
          @click="abrirAsignar(a)"
          class="text-xs px-3 py-2 rounded-lg border border-[#ece9f8] text-[#6B4FBB] hover:bg-[#F4F2FB] transition flex-shrink-0"
        >
          Asignar escuelas
        </button>
      </div>

      <div v-if="!adminsFiltrados.length" class="bg-white rounded-2xl border border-[#ece9f8] p-8 text-center text-sm text-[#9B89D4]">
        No hay administradores.
      </div>
      <p class="text-[11px] text-[#9B89D4]">★ = escuela creada por el admin (no se le puede quitar desde aquí).</p>
    </div>

    <!-- Modal asignar escuelas -->
    <div
      v-if="adminSel"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
      style="background: rgba(30, 18, 82, 0.4)"
      @click.self="adminSel = null"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] flex flex-col max-w-md">
        <h2 class="text-base font-medium text-[#1E1252]">Escuelas de {{ adminSel.nombre }}</h2>
        <p class="text-xs text-[#9B89D4] mb-3">Marca las escuelas que puede ver.</p>

        <input
          v-model="buscarEscuela"
          type="text"
          placeholder="Buscar escuela…"
          class="w-full mb-2 px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm focus:outline-none focus:border-[#6B4FBB] transition"
        />

        <div class="flex-1 overflow-y-auto border border-[#ece9f8] rounded-xl divide-y divide-[#F4F2FB] min-h-0">
          <label
            v-for="e in escuelasFiltradas"
            :key="e.id"
            class="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer hover:bg-[#F8F7FC]"
            :class="creadas.has(e.id) ? 'opacity-70 cursor-not-allowed' : ''"
          >
            <input
              type="checkbox"
              class="w-4 h-4 accent-[#6B4FBB]"
              :checked="seleccion.has(e.id) || creadas.has(e.id)"
              :disabled="creadas.has(e.id)"
              @change="toggle(e.id)"
            />
            <span class="flex-1 min-w-0 truncate text-[#1E1252]">{{ e.nombre }}</span>
            <span v-if="creadas.has(e.id)" class="text-[10px] text-[#0E7490]">creada ★</span>
            <span v-else-if="e.activa == 0" class="text-[10px] text-[#A32D2D]">inactiva</span>
          </label>
        </div>

        <div class="flex gap-3 mt-4">
          <button
            @click="adminSel = null"
            class="flex-1 py-2.5 rounded-xl border border-[#ece9f8] text-sm text-[#9B89D4] hover:bg-[#F8F7FC] transition"
          >
            Cancelar
          </button>
          <button
            @click="guardarAsignacion"
            :disabled="guardando"
            class="flex-1 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
          >
            {{ guardando ? 'Guardando…' : `Guardar (${seleccion.size + creadas.size})` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal nuevo admin -->
    <div
      v-if="modalNuevo"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
      style="background: rgba(30, 18, 82, 0.4)"
      @click.self="modalNuevo = false"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-4">Nuevo administrador</h2>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-[#6B7280]">Nombre</label>
            <input v-model="nuevo.nombre" type="text" class="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm focus:outline-none focus:border-[#6B4FBB]" />
          </div>
          <div>
            <label class="text-xs font-medium text-[#6B7280]">CURP (será su usuario)</label>
            <input v-model="nuevo.curp" maxlength="18" type="text" class="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm font-mono uppercase focus:outline-none focus:border-[#6B4FBB]" />
          </div>
          <div>
            <label class="text-xs font-medium text-[#6B7280]">Primera escuela</label>
            <select v-model="nuevo.escuela_id" class="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm focus:outline-none focus:border-[#6B4FBB]">
              <option value="">Selecciona…</option>
              <option v-for="e in escuelas" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
          </div>
          <p class="text-[11px] text-[#9B89D4]">
            La contraseña inicial son los primeros 8 caracteres de la CURP. Después le puedes asignar más escuelas.
          </p>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="modalNuevo = false" class="flex-1 py-2.5 rounded-xl border border-[#ece9f8] text-sm text-[#9B89D4] hover:bg-[#F8F7FC] transition">
            Cancelar
          </button>
          <button
            @click="crearAdmin"
            :disabled="guardando || !nuevo.nombre || nuevo.curp.length !== 18 || !nuevo.escuela_id"
            class="flex-1 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
          >
            {{ guardando ? 'Creando…' : 'Crear admin' }}
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

const admins = ref([])
const escuelas = ref([])
const cargando = ref(false)
const guardando = ref(false)
const buscar = ref('')
const buscarEscuela = ref('')

const adminSel = ref(null)
const seleccion = ref(new Set())
const creadas = ref(new Set())

const modalNuevo = ref(false)
const nuevo = ref({ nombre: '', curp: '', escuela_id: '' })

onMounted(cargar)

async function cargar() {
  cargando.value = true
  try {
    const [a, e] = await Promise.all([api.get('/superadmin/admins'), api.get('/superadmin/escuelas')])
    admins.value = a.data.admins
    escuelas.value = e.data.escuelas.map((x) => ({ ...x, id: Number(x.id) }))
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo cargar la información.', icon: 'error' })
  } finally {
    cargando.value = false
  }
}

const adminsFiltrados = computed(() => {
  const q = buscar.value.trim().toUpperCase()
  if (!q) return admins.value
  return admins.value.filter((a) => a.nombre.toUpperCase().includes(q) || a.curp.includes(q))
})

const escuelasFiltradas = computed(() => {
  const q = buscarEscuela.value.trim().toUpperCase()
  const lista = [...escuelas.value].sort((a, b) => a.nombre.localeCompare(b.nombre))
  return q ? lista.filter((e) => e.nombre.toUpperCase().includes(q)) : lista
})

function abrirAsignar(a) {
  adminSel.value = a
  buscarEscuela.value = ''
  creadas.value = new Set(a.escuelas.filter((e) => e.origen === 'creada').map((e) => e.id))
  seleccion.value = new Set(a.escuelas.filter((e) => e.origen === 'asignada').map((e) => e.id))
}

function toggle(id) {
  const s = new Set(seleccion.value)
  s.has(id) ? s.delete(id) : s.add(id)
  seleccion.value = s
}

async function guardarAsignacion() {
  guardando.value = true
  try {
    await api.put(`/superadmin/admins/${adminSel.value.id}/escuelas`, {
      escuelas: [...seleccion.value],
    })
    adminSel.value = null
    await cargar()
  } catch (e) {
    swal.fire({ title: 'Error', text: e.response?.data?.messages?.error || 'No se pudo guardar.', icon: 'error' })
  } finally {
    guardando.value = false
  }
}

function abrirNuevo() {
  nuevo.value = { nombre: '', curp: '', escuela_id: '' }
  modalNuevo.value = true
}

async function crearAdmin() {
  guardando.value = true
  try {
    await api.post('/superadmin/usuario/nuevo', {
      nombre: nuevo.value.nombre.trim(),
      curp: nuevo.value.curp.trim().toUpperCase(),
      escuela_id: Number(nuevo.value.escuela_id),
      rol: 'admin',
    })
    modalNuevo.value = false
    swal.fire({ title: 'Admin creado', text: 'Ya puede entrar con su CURP.', icon: 'success' })
    await cargar()
  } catch (e) {
    const err = e.response?.data?.messages
    swal.fire({
      title: 'Error',
      text: err?.error || (err && Object.values(err).join(' ')) || 'No se pudo crear.',
      icon: 'error',
    })
  } finally {
    guardando.value = false
  }
}

function iniciales(n) {
  return (n || '?').split(' ').slice(0, 2).map((x) => x[0]).join('').toUpperCase()
}
</script>
