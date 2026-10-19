<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-xl font-medium text-[#1E1252]">Usuarios</h1>
        <p class="text-sm text-[#9B89D4] mt-0.5">Administra directores, admins y maestros</p>
      </div>
      <button
        @click="showModal = true"
        class="px-4 py-2 bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm rounded-xl transition"
      >
        + Nuevo usuario
      </button>
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
          v-model="filtroRol"
          class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
        >
          <option value="">Todos los roles</option>
          <option value="director">Director</option>
          <option value="admin">Admin</option>
          <option value="maestro">Maestro</option>
        </select>
      </div>

      <div v-if="loading" class="p-8 text-center text-sm text-[#9B89D4]">Cargando usuarios...</div>

      <div v-else class="overflow-x-auto"><table class="w-full min-w-[640px]">
        <thead>
          <tr class="border-b border-[#F4F2FB]">
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Nombre</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">CURP</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Rol</th>
            <th
              v-if="authStore.rol === 'super_admin'"
              class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]"
            >
              Escuela
            </th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Estado</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Creado</th>
            <th class="text-left px-5 py-3 text-xs font-medium text-[#9B89D4]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in usuariosFiltrados"
            :key="u.id"
            class="border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
          >
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#6B4FBB] text-xs font-medium flex-shrink-0"
                >
                  {{ iniciales(u.nombre) }}
                </div>
                <span class="text-sm font-medium text-[#1E1252]">{{ u.nombre }}</span>
              </div>
            </td>
            <td class="px-5 py-3 text-sm text-[#6B7280] font-mono">{{ u.curp }}</td>
            <td class="px-5 py-3">
              <span class="text-xs px-2.5 py-1 rounded-full font-medium" :class="rolClass(u.rol)">
                {{ u.rol }}
              </span>
            </td>
            <td v-if="authStore.rol === 'super_admin'" class="px-5 py-3 text-sm text-[#6B7280]">
              {{ u.escuela_nombre || '—' }}
            </td>
            <td class="px-5 py-3">
              <span
                class="text-xs px-2.5 py-1 rounded-full font-medium"
                :class="
                  u.activo == 1 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FCEBEB] text-[#A32D2D]'
                "
              >
                {{ u.activo == 1 ? 'Activo' : 'Bloqueado' }}
              </span>
            </td>
            <td class="px-5 py-3 text-sm text-[#9B89D4]">{{ formatFecha(u.created_at) }}</td>
            <td class="px-5 py-3">
              <div class="flex items-center gap-2">
                <button
                  @click="abrirEditar(u)"
                  class="text-xs px-3 py-1.5 rounded-lg border border-[#ece9f8] text-[#6B4FBB] hover:bg-[#F4F2FB] transition"
                >
                  Editar
                </button>
                <button
                  @click="confirmarReset(u)"
                  class="text-xs px-3 py-1.5 rounded-lg border border-[#ece9f8] text-[#9B89D4] hover:bg-[#F8F7FC] transition"
                >
                  Reset pass
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="usuariosFiltrados.length === 0">
            <td colspan="7" class="px-5 py-8 text-center text-sm text-[#9B89D4]">
              No se encontraron usuarios.
            </td>
          </tr>
        </tbody>
      </table></div>
    </div>

    <!-- Modal editar usuario -->
    <div
      v-if="showEditModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-4">Editar usuario</h2>

        <div
          v-if="editError"
          class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600"
        >
          {{ editError }}
        </div>

        <div
          v-if="editExito"
          class="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700"
        >
          {{ editExito }}
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
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Rol</label>
            <select
              v-model="editForm.rol"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
            >
              <option value="director">Director</option>
              <option value="admin">Admin</option>
              <option value="maestro">Maestro</option>
            </select>
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

    <!-- Modal nuevo usuario -->
    <div
      v-if="showModal"
      style="min-height: 100vh; background: rgba(30, 18, 82, 0.3)"
      class="fixed inset-0 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-5 sm:p-6 w-full max-h-[90dvh] overflow-y-auto max-w-md">
        <h2 class="text-base font-medium text-[#1E1252] mb-4">Nuevo usuario</h2>

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

          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Rol</label>
            <select
              v-model="form.rol"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
            >
              <option value="">Selecciona un rol</option>
              <option value="director">Director</option>
              <option value="admin">Admin</option>
              <option value="maestro">Maestro</option>
            </select>
          </div>

          <!-- Solo visible para super_admin -->
          <div v-if="authStore.rol === 'super_admin'">
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Escuela</label>
            <select
              v-model="form.escuela_id"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
            >
              <option value="">Selecciona una escuela</option>
              <option v-for="e in escuelas" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
          </div>

          <p class="text-xs text-[#C4B8F0]">
            La contraseña inicial serán los primeros 8 dígitos de la CURP.
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
            @click="crearUsuario"
            :disabled="guardando"
            class="flex-1 py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
          >
            {{ guardando ? 'Guardando...' : 'Crear usuario' }}
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
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const usuarios = ref([])
const escuelas = ref([])
const loading = ref(false)
const buscar = ref('')
const filtroRol = ref('')
const showModal = ref(false)
const guardando = ref(false)
const formError = ref(null)
const showEditModal = ref(false)
const editForm = ref({ id: null, nombre: '', rol: '', activo: 1 })
const editError = ref(null)
const editExito = ref(null)
const guardandoEdit = ref(false)
const form = ref({ curp: '', nombre: '', rol: '', escuela_id: '' })

onMounted(async () => {
  await cargarUsuarios()
  if (authStore.rol === 'super_admin') {
    const { data } = await api.get('/superadmin/escuelas')
    escuelas.value = data.escuelas
  }
})

async function cargarUsuarios() {
  loading.value = true
  try {
    const endpoint = authStore.rol === 'super_admin' ? '/superadmin/usuarios' : '/admin/usuarios'
    const { data } = await api.get(endpoint)
    usuarios.value = data.usuarios
  } catch {
  } finally {
    loading.value = false
  }
}

const usuariosFiltrados = computed(() => {
  return usuarios.value.filter((u) => {
    const matchBuscar =
      !buscar.value ||
      u.nombre.toLowerCase().includes(buscar.value.toLowerCase()) ||
      u.curp.toLowerCase().includes(buscar.value.toLowerCase())
    const matchRol = !filtroRol.value || u.rol === filtroRol.value
    return matchBuscar && matchRol
  })
})

async function crearUsuario() {
  formError.value = null

  if (!form.value.curp || !form.value.nombre || !form.value.rol) {
    formError.value = 'Todos los campos son obligatorios.'
    return
  }

  if (form.value.curp.length !== 18) {
    formError.value = 'La CURP debe tener 18 caracteres.'
    return
  }

  if (authStore.rol === 'super_admin' && !form.value.escuela_id) {
    formError.value = 'Selecciona una escuela.'
    return
  }

  guardando.value = true
  try {
    const endpoint =
      authStore.rol === 'super_admin' ? '/superadmin/usuario/nuevo' : '/admin/usuario/nuevo'

    await api.post(endpoint, form.value)
    cerrarModal()
    await cargarUsuarios()
    swal.fire({
      title: '¡Usuario creado!',
      html: `<strong>${form.value.nombre}</strong> fue registrado correctamente.<br>
             <span style="color:#9B89D4;font-size:13px;">Contraseña inicial: ${form.value.curp.substring(0, 8)}</span>`,
      icon: 'success',
      confirmButtonText: 'Cerrar',
    })
  } catch (e) {
    formError.value = e.response?.data?.messages?.error || 'Error al crear usuario.'
  } finally {
    guardando.value = false
  }
}

function cerrarModal() {
  showModal.value = false
  formError.value = null
  form.value = { curp: '', nombre: '', rol: '', escuela_id: '' }
}

function abrirEditar(u) {
  editForm.value = { id: u.id, nombre: u.nombre, rol: u.rol, activo: parseInt(u.activo) }
  editError.value = null
  editExito.value = null
  showEditModal.value = true
}

async function guardarEdicion() {
  editError.value = null
  editExito.value = null
  guardandoEdit.value = true
  try {
    const endpoint =
      authStore.rol === 'super_admin'
        ? `/superadmin/usuario/editar/${editForm.value.id}`
        : `/admin/usuario/editar/${editForm.value.id}`

    await api.put(endpoint, {
      nombre: editForm.value.nombre,
      rol: editForm.value.rol,
      activo: editForm.value.activo,
    })
    editExito.value = 'Usuario actualizado correctamente.'
    await cargarUsuarios()
    setTimeout(() => (showEditModal.value = false), 1500)
  } catch (e) {
    editError.value = e.response?.data?.messages?.error || 'Error al actualizar.'
  } finally {
    guardandoEdit.value = false
  }
}

async function confirmarReset(u) {
  const result = await swal.fire({
    title: '¿Restablecer contraseña?',
    html: `La contraseña de <strong>${u.nombre}</strong> volverá a ser <strong>${u.curp.substring(0, 8)}</strong>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, restablecer',
    cancelButtonText: 'Cancelar',
  })

  if (!result.isConfirmed) return

  try {
    const endpoint =
      authStore.rol === 'super_admin'
        ? `/superadmin/usuario/reset-password/${u.id}`
        : `/admin/usuario/reset-password/${u.id}`

    const { data } = await api.put(endpoint)
    await swal.fire({
      title: '¡Listo!',
      html: `Contraseña restablecida:<br><strong style="color:#6B4FBB;font-size:18px;">${data.password}</strong>`,
      icon: 'success',
      confirmButtonText: 'Cerrar',
    })
  } catch {
    swal.fire({
      title: 'Error',
      text: 'No se pudo restablecer la contraseña.',
      icon: 'error',
      confirmButtonText: 'Cerrar',
    })
  }
}

function iniciales(nombre) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function rolClass(rol) {
  const clases = {
    super_admin: 'bg-[#1E1252] text-white',
    director: 'bg-[#EEEDFE] text-[#534AB7]',
    admin: 'bg-[#E1F5EE] text-[#0F6E56]',
    maestro: 'bg-[#F4F2FB] text-[#6B4FBB]',
  }
  return clases[rol] || 'bg-gray-100 text-gray-600'
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
