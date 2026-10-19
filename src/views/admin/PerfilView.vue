<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-6">
      <h1 class="text-xl font-medium text-[#1E1252]">Mi perfil</h1>
      <p class="text-sm text-[#9B89D4] mt-0.5">Gestiona tu información personal</p>
    </div>

    <div v-if="loading" class="p-8 text-center text-sm text-[#9B89D4]">Cargando...</div>

    <div v-else class="space-y-6">
      <!-- Info personal -->
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-6">
        <div class="flex items-center gap-5 mb-6">
          <!-- Avatar / foto -->
          <div class="relative">
            <div
              class="w-20 h-20 rounded-full overflow-hidden bg-[#EEEDFE] flex items-center justify-center flex-shrink-0"
            >
              <img
                v-if="fotoPreview || usuario.foto"
                :src="fotoPreview || `https://api.vincula365.com/api/${usuario.foto}`"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-2xl font-medium text-[#6B4FBB]">{{ iniciales }}</span>
            </div>
            <button
              @click="$refs.fotoInput.click()"
              class="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#6B4FBB] flex items-center justify-content-center text-white text-xs hover:bg-[#5a3faa] transition flex items-center justify-center"
            >
              ✎
            </button>
            <input
              type="file"
              ref="fotoInput"
              accept="image/*"
              @change="seleccionarFoto"
              class="hidden"
            />
          </div>

          <div>
            <p class="text-lg font-medium text-[#1E1252]">{{ usuario.nombre }}</p>
            <p class="text-sm text-[#9B89D4]">{{ usuario.rol }} · {{ usuario.escuela }}</p>
            <button
              v-if="fotoSeleccionada"
              @click="subirFoto"
              :disabled="subiendoFoto"
              class="mt-2 px-3 py-1.5 rounded-lg bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-xs transition disabled:opacity-60"
            >
              {{ subiendoFoto ? 'Subiendo...' : 'Guardar foto' }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-[#F8F7FC] rounded-xl p-4">
            <p class="text-xs text-[#9B89D4] mb-1">CURP</p>
            <p class="text-sm font-medium text-[#1E1252] font-mono">{{ usuario.curp }}</p>
          </div>
          <div class="bg-[#F8F7FC] rounded-xl p-4">
            <p class="text-xs text-[#9B89D4] mb-1">Rol</p>
            <p class="text-sm font-medium text-[#1E1252] capitalize">{{ usuario.rol }}</p>
          </div>
          <div class="bg-[#F8F7FC] rounded-xl p-4">
            <p class="text-xs text-[#9B89D4] mb-1">Escuela</p>
            <p class="text-sm font-medium text-[#1E1252]">{{ usuario.escuela || '—' }}</p>
          </div>
          <div class="bg-[#F8F7FC] rounded-xl p-4">
            <p class="text-xs text-[#9B89D4] mb-1">Miembro desde</p>
            <p class="text-sm font-medium text-[#1E1252]">{{ formatFecha(usuario.created_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Cambiar contraseña -->
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-6">
        <h2 class="text-base font-medium text-[#1E1252] mb-4">Cambiar contraseña</h2>

        <div
          v-if="passError"
          class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600"
        >
          {{ passError }}
        </div>
        <div
          v-if="passExito"
          class="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700"
        >
          {{ passExito }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Contraseña actual</label>
            <div class="relative">
              <input
                v-model="passForm.password_old"
                :type="showOld ? 'text' : 'password'"
                placeholder="Tu contraseña actual"
                class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] pr-16 focus:outline-none focus:border-[#6B4FBB] transition"
              />
              <button
                type="button"
                @click="showOld = !showOld"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#C4B8F0] hover:text-[#6B4FBB] transition"
              >
                {{ showOld ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Nueva contraseña</label>
            <div class="relative">
              <input
                v-model="passForm.password_new"
                :type="showNew ? 'text' : 'password'"
                placeholder="Mínimo 8 caracteres"
                class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] pr-16 focus:outline-none focus:border-[#6B4FBB] transition"
              />
              <button
                type="button"
                @click="showNew = !showNew"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#C4B8F0] hover:text-[#6B4FBB] transition"
              >
                {{ showNew ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5"
              >Confirmar nueva contraseña</label
            >
            <input
              v-model="passForm.password_confirm"
              type="password"
              placeholder="Repite la nueva contraseña"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
            />
          </div>

          <!-- Indicador fortaleza -->
          <div v-if="passForm.password_new" class="space-y-1">
            <div class="flex gap-1">
              <div
                v-for="i in 4"
                :key="i"
                class="h-1 flex-1 rounded-full transition-colors"
                :class="fortaleza >= i ? fortalezaColor : 'bg-[#F4F2FB]'"
              ></div>
            </div>
            <p class="text-xs" :class="fortalezaTextoColor">{{ fortalezaLabel }}</p>
          </div>
        </div>

        <button
          @click="cambiarPassword"
          :disabled="cambiandoPass"
          class="mt-5 w-full py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
        >
          {{ cambiandoPass ? 'Guardando...' : 'Cambiar contraseña' }}
        </button>
      </div>

      <!-- Historial de actividad -->
      <div class="bg-white rounded-2xl border border-[#ece9f8] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F4F2FB]">
          <p class="text-base font-medium text-[#1E1252]">Historial de actividad</p>
          <p class="text-xs text-[#9B89D4] mt-0.5">Últimas 20 acciones registradas</p>
        </div>

        <div class="overflow-y-auto" style="max-height: 400px">
          <div
            v-for="a in auditoria"
            :key="a.id"
            class="flex items-center gap-3 px-5 py-3 border-b border-[#F8F7FC] hover:bg-[#F8F7FC] transition"
          >
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
              :class="accionClass(a.accion)"
            >
              {{ accionIcon(a.accion) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[#1E1252] capitalize">
                {{ a.accion }} — {{ a.modulo }}
              </p>
              <p class="text-xs text-[#9B89D4] truncate">{{ a.descripcion }}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="text-xs text-[#9B89D4]">{{ formatFecha(a.created_at) }}</p>
              <p class="text-xs text-[#C4B8F0]">{{ a.ip }}</p>
            </div>
          </div>
          <div v-if="auditoria.length === 0" class="p-8 text-center text-sm text-[#9B89D4]">
            Sin actividad registrada.
          </div>
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

const auth = useAuthStore()
const loading = ref(false)
const usuario = ref({})
const auditoria = ref([])
const fotoPreview = ref(null)
const fotoSeleccionada = ref(null)
const subiendoFoto = ref(false)
const cambiandoPass = ref(false)
const passError = ref(null)
const passExito = ref(null)
const showOld = ref(false)
const showNew = ref(false)
const fotoInput = ref(null)

const passForm = ref({
  password_old: '',
  password_new: '',
  password_confirm: '',
})

onMounted(() => cargar())

async function cargar() {
  loading.value = true
  try {
    const { data } = await api.get('/auth/perfil')
    usuario.value = data.usuario
    auditoria.value = data.auditoria
  } catch {
  } finally {
    loading.value = false
  }
}

const iniciales = computed(() => {
  if (!usuario.value.nombre) return '?'
  return usuario.value.nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
})

// Fortaleza de contraseña
const fortaleza = computed(() => {
  const p = passForm.value.password_new
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const fortalezaColor = computed(() => {
  return (
    ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'][fortaleza.value - 1] ||
    'bg-red-400'
  )
})

const fortalezaTextoColor = computed(() => {
  return (
    ['text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'][fortaleza.value - 1] ||
    'text-red-500'
  )
})

const fortalezaLabel = computed(() => {
  return ['Muy débil', 'Débil', 'Regular', 'Fuerte'][fortaleza.value - 1] || 'Muy débil'
})

function seleccionarFoto(e) {
  const archivo = e.target.files[0]
  if (!archivo) return
  fotoSeleccionada.value = archivo
  const reader = new FileReader()
  reader.onload = (ev) => (fotoPreview.value = ev.target.result)
  reader.readAsDataURL(archivo)
}

async function subirFoto() {
  if (!fotoSeleccionada.value) return
  subiendoFoto.value = true
  try {
    const formData = new FormData()
    formData.append('foto', fotoSeleccionada.value)
    await api.post('/auth/foto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    fotoSeleccionada.value = null
    swal.fire({ title: '¡Foto actualizada!', icon: 'success', confirmButtonText: 'Cerrar' })
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo subir la foto.', icon: 'error' })
  } finally {
    subiendoFoto.value = false
  }
}

async function cambiarPassword() {
  passError.value = null
  passExito.value = null

  if (!passForm.value.password_old || !passForm.value.password_new) {
    passError.value = 'Todos los campos son obligatorios.'
    return
  }

  if (passForm.value.password_new.length < 8) {
    passError.value = 'La nueva contraseña debe tener al menos 8 caracteres.'
    return
  }

  if (passForm.value.password_new !== passForm.value.password_confirm) {
    passError.value = 'Las contraseñas no coinciden.'
    return
  }

  cambiandoPass.value = true
  try {
    await api.post('/auth/cambiar-password', {
      curp: usuario.value.curp,
      password_old: passForm.value.password_old,
      password_new: passForm.value.password_new,
    })
    passExito.value = '¡Contraseña actualizada correctamente!'
    passForm.value = { password_old: '', password_new: '', password_confirm: '' }
  } catch (e) {
    passError.value = e.response?.data?.messages?.error || 'Error al cambiar contraseña.'
  } finally {
    cambiandoPass.value = false
  }
}

function accionClass(accion) {
  return (
    {
      crear: 'bg-[#E1F5EE] text-[#0F6E56]',
      editar: 'bg-[#EEEDFE] text-[#534AB7]',
      eliminar: 'bg-[#FCEBEB] text-[#A32D2D]',
      login: 'bg-[#FAEEDA] text-[#854F0B]',
      logout: 'bg-[#F4F2FB] text-[#9B89D4]',
      bloquear: 'bg-[#FCEBEB] text-[#A32D2D]',
      desbloquear: 'bg-[#E1F5EE] text-[#0F6E56]',
    }[accion] || 'bg-[#F4F2FB] text-[#9B89D4]'
  )
}

function accionIcon(accion) {
  return (
    {
      crear: '✓',
      editar: '✎',
      eliminar: '✗',
      login: '→',
      logout: '←',
      bloquear: '⊘',
      desbloquear: '✓',
    }[accion] || '·'
  )
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
