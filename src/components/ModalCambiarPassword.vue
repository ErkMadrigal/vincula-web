<template>
  <div
    style="min-height: 100vh; background: rgba(30, 18, 82, 0.6)"
    class="fixed inset-0 flex items-center justify-center z-[100] px-4"
  >
    <div class="bg-white rounded-2xl border border-[#ece9f8] p-6 w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-6">
        <div
          class="w-14 h-14 rounded-full bg-[#EEEDFE] flex items-center justify-center text-2xl mx-auto mb-3"
        >
          🔐
        </div>
        <h2 class="text-base font-medium text-[#1E1252]">Cambia tu contraseña</h2>
        <p class="text-sm text-[#9B89D4] mt-1">
          Por seguridad debes cambiar tu contraseña inicial antes de continuar.
        </p>
      </div>

      <div
        v-if="error"
        class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600"
      >
        {{ error }}
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Contraseña actual</label>
          <div class="relative">
            <input
              v-model="form.password_old"
              :type="showOld ? 'text' : 'password'"
              placeholder="Tu contraseña inicial"
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
          <p class="text-xs text-[#C4B8F0] mt-1">
            Tu contraseña inicial son los primeros 8 caracteres de tu CURP.
          </p>
        </div>

        <div>
          <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Nueva contraseña</label>
          <div class="relative">
            <input
              v-model="form.password_new"
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
            v-model="form.password_confirm"
            type="password"
            placeholder="Repite la nueva contraseña"
            class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-sm text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
          />
        </div>

        <!-- Fortaleza -->
        <div v-if="form.password_new" class="space-y-1">
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
        @click="cambiar"
        :disabled="guardando"
        class="mt-6 w-full py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm font-medium transition disabled:opacity-60"
      >
        {{ guardando ? 'Guardando...' : 'Cambiar contraseña y continuar' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['completado'])
const auth = useAuthStore()
const error = ref(null)
const guardando = ref(false)
const showOld = ref(false)
const showNew = ref(false)

const form = ref({
  password_old: '',
  password_new: '',
  password_confirm: '',
})

const fortaleza = computed(() => {
  const p = form.value.password_new
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const fortalezaColor = computed(
  () =>
    ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'][fortaleza.value - 1] ||
    'bg-red-400',
)

const fortalezaTextoColor = computed(
  () =>
    ['text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'][fortaleza.value - 1] ||
    'text-red-500',
)

const fortalezaLabel = computed(
  () => ['Muy débil', 'Débil', 'Regular', 'Fuerte'][fortaleza.value - 1] || 'Muy débil',
)

async function cambiar() {
  error.value = null

  if (!form.value.password_old || !form.value.password_new) {
    error.value = 'Todos los campos son obligatorios.'
    return
  }

  if (form.value.password_new.length < 8) {
    error.value = 'La nueva contraseña debe tener al menos 8 caracteres.'
    return
  }

  if (form.value.password_new !== form.value.password_confirm) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  guardando.value = true
  try {
    await api.post('/auth/cambiar-password', {
      id: auth.usuario.id,
      password_old: form.value.password_old,
      password_new: form.value.password_new,
    })

    // Actualizar en el store y localStorage
    const usuario = { ...auth.usuario, password_changed: true }
    auth.usuario = usuario
    localStorage.setItem('usuario', JSON.stringify(usuario))

    emit('completado')
  } catch (e) {
    error.value = e.response?.data?.messages?.error || 'Error al cambiar contraseña.'
  } finally {
    guardando.value = false
  }
}
</script>
