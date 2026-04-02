<template>
  <div class="min-h-screen bg-[#F4F2FB] flex items-center justify-center px-4">
    <div class="w-full max-w-sm text-center">

      <svg width="64" height="64" viewBox="0 0 40 40" fill="none" class="mx-auto mb-6">
        <polyline points="12,8 20,28 28,8" fill="none" stroke="#C4B8F0"
          stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="20" cy="28" r="3" fill="#C4B8F0"/>
        <circle cx="12" cy="8" r="2" fill="#C4B8F0"/>
        <circle cx="28" cy="8" r="2" fill="#C4B8F0"/>
      </svg>

      <h1 class="text-xl font-medium text-[#1E1252] mb-2">
        Acceso no permitido
      </h1>
      <p class="text-sm text-[#9B89D4] mb-6">
        Esta plataforma es exclusiva para personal de la escuela.<br>
        Si eres padre de familia descarga la app <strong class="text-[#6B4FBB]">Vincúla</strong>
        para ver la información de tus hijos.
      </p>

      <div class="bg-white border border-[#ece9f8] rounded-2xl p-4 mb-6 text-left">
        <p class="text-xs text-[#9B89D4] mb-2">Disponible en</p>
        <div class="flex gap-3">
          <div class="flex-1 border border-[#ece9f8] rounded-xl px-3 py-2 text-center">
            <p class="text-xs font-medium text-[#1E1252]">App Store</p>
            <p class="text-[10px] text-[#9B89D4]">iPhone / iPad</p>
          </div>
          <div class="flex-1 border border-[#ece9f8] rounded-xl px-3 py-2 text-center">
            <p class="text-xs font-medium text-[#1E1252]">Google Play</p>
            <p class="text-[10px] text-[#9B89D4]">Android</p>
          </div>
        </div>
      </div>

      <button @click="handleLogout"
        class="text-sm text-[#9B89D4] hover:text-[#6B4FBB] transition">
        ← Volver al inicio
      </button>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth   = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>