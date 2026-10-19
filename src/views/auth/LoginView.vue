<template>
  <div class="min-h-screen bg-[#F4F2FB] flex items-center justify-center px-4">
    <div class="w-full max-w-md">

      <!-- Logo -->
      <div class="flex flex-col items-center mb-6">
        <img src="@/assets/img/vincula_desktop.svg" alt="Vincúla"    />
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-8">
        <h2 class="text-lg font-medium text-[#1E1252] mb-1">Bienvenido</h2>
        <p class="text-sm text-[#9B89D4] mb-6">Ingresa con la CURP del alumno</p>

        <!-- Error -->
        <div v-if="error"
          class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          {{ error }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">

          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">CURP</label>
            <input
              v-model="form.curp"
              type="text"
              placeholder="MAFE990706HMCDLR05"
              maxlength="18"
              class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC]
                     text-sm text-[#1E1252] placeholder-[#C4B8F0] uppercase
                     focus:outline-none focus:border-[#6B4FBB] focus:ring-1 focus:ring-[#6B4FBB]
                     transition"
              @input="form.curp = form.curp.toUpperCase()"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Contraseña</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                placeholder="Primeros 8 dígitos de tu CURP"
                class="w-full px-4 py-2.5 rounded-xl border border-[#ece9f8] bg-[#F8F7FC]
                       text-sm text-[#1E1252] placeholder-[#C4B8F0]
                       focus:outline-none focus:border-[#6B4FBB] focus:ring-1 focus:ring-[#6B4FBB]
                       transition pr-10"
              />
              <button
                type="button"
                @click="showPass = !showPass"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#C4B8F0] hover:text-[#6B4FBB] text-xs transition">
                {{ showPass ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
            <p class="text-xs text-[#C4B8F0] mt-1.5">
              Contraseña inicial: primeros 8 caracteres de tu CURP
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white
                   text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed mt-2">
            <span v-if="loading">Ingresando...</span>
            <span v-else>Ingresar</span>
          </button>

        </form>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-[#C4B8F0] mt-6">
        Vincúla © {{ new Date().getFullYear() }} · vincula.com.mx
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router   = useRouter()
const auth     = useAuthStore()

const form     = ref({ curp: '', password: '' })
const loading  = ref(false)
const error    = ref(null)
const showPass = ref(false)

async function handleLogin() {
  error.value = null

  if (!form.value.curp || !form.value.password) {
    error.value = 'Ingresa tu CURP y contraseña.'
    return
  }

  if (form.value.curp.length !== 18) {
    error.value = 'La CURP debe tener 18 caracteres.'
    return
  }

  loading.value = true
  try {
    await auth.login(form.value.curp, form.value.password)
    await auth.cargarEscuelas() // admin / super admin: deja lista la escuela activa
    router.push({ name: 'dashboard' })
  } catch (e) {
    const msg = e.response?.data?.messages?.error
    error.value = msg || 'Credenciales incorrectas.'
  } finally {
    loading.value = false
  }
}
</script>