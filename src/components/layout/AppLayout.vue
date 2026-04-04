<template>
  <div class="flex h-screen overflow-hidden" :class="isDark ? 'dark bg-[#111120]' : 'bg-[#F8F7FC]'">
    <!-- Sidebar -->
    <aside
      :class="isDark ? 'bg-[#18182a] border-[#2a2a3a]' : 'bg-white border-[#ece9f8]'"
      class="w-56 flex flex-col border-r transition-colors duration-300 flex-shrink-0"
    >
      <!-- Logo -->
      <div :class="isDark ? 'border-[#2a2a3a]' : 'border-[#ece9f8]'" class="px-4 py-4 border-b">
        <div class="flex flex-col items-center gap-1">
          <img
            src="@/assets/img/vincula_icon_animated_transparent.svg"
            alt="Vincúla"
            class="w-26 h-26"
          />
          <span
            class="text-2xl font-medium tracking-wide"
            :class="isDark ? 'text-white' : 'text-[#1E1252]'"
          >
            <span class="text-[#6B4FBB]">V</span>INCULA
          </span>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        <template v-for="section in filteredMenu" :key="section.label">
          <p
            class="text-[10px] font-medium tracking-widest uppercase px-3 pt-3 pb-1"
            :class="isDark ? 'text-[#4a4a6a]' : 'text-[#C4B8F0]'"
          >
            {{ section.label }}
          </p>
          <RouterLink
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
            :class="
              isActive(item.to)
                ? 'bg-[#F4F2FB] text-[#6B4FBB] font-medium'
                : isDark
                  ? 'text-[#8888aa] hover:bg-[#23233a] hover:text-[#A89EE8]'
                  : 'text-[#6B7280] hover:bg-[#F4F2FB] hover:text-[#6B4FBB]'
            "
          >
            <span class="text-base w-4 text-center">{{ item.icon }}</span>
            {{ item.label }}
            <span
              v-if="isActive(item.to)"
              class="ml-auto w-1.5 h-1.5 rounded-full bg-[#6B4FBB]"
            ></span>
          </RouterLink>
        </template>
      </nav>

      <!-- Usuario sidebar -->
      <div :class="isDark ? 'border-[#2a2a3a]' : 'border-[#ece9f8]'" class="p-3 border-t">
        <div
          class="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer"
          :class="isDark ? 'hover:bg-[#23233a]' : 'hover:bg-[#F4F2FB]'"
          @click="router.push('/perfil')"
        >
          <div
            class="w-8 h-8 rounded-full bg-[#6B4FBB] flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
          >
            {{ iniciales }}
          </div>
          <div class="flex-1 min-w-0">
            <p
              class="text-xs font-medium truncate"
              :class="isDark ? 'text-[#e0e0f0]' : 'text-[#1E1252]'"
            >
              {{ auth.nombre }}
            </p>
            <p class="text-[10px] text-[#9B89D4] truncate capitalize">{{ auth.rol }}</p>
          </div>
          <span class="text-[#C4B8F0] text-xs">→</span>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Topbar -->
      <header
        :class="isDark ? 'bg-[#18182a] border-[#2a2a3a]' : 'bg-white border-[#ece9f8]'"
        class="h-14 flex items-center justify-between px-6 border-b transition-colors duration-300 flex-shrink-0"
      >
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition"
          :class="
            isDark
              ? 'bg-[#23233a] border-[#2a2a3a] text-[#6666aa]'
              : 'bg-[#F4F2FB] border-[#ece9f8] text-[#9B89D4]'
          "
        >
          <span>🔍</span> Buscar (Ctrl + K)
        </div>

        <div class="flex items-center gap-2">
          <!-- Notificaciones -->
          <button
            class="relative w-8 h-8 rounded-lg flex items-center justify-center text-sm transition"
            :class="
              isDark
                ? 'border border-[#2a2a3a] text-[#6666aa] hover:bg-[#23233a]'
                : 'border border-[#ece9f8] text-[#9B89D4] hover:bg-[#F4F2FB]'
            "
          >
            🔔
            <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#6B4FBB]"></span>
          </button>

          <!-- Usuario topbar con dropdown -->
          <div class="relative" ref="userMenuRef">
            <div
              @click="showUserMenu = !showUserMenu"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition"
              :class="
                isDark
                  ? 'border-[#2a2a3a] text-[#e0e0f0] hover:bg-[#23233a]'
                  : 'border-[#ece9f8] text-[#1E1252] hover:bg-[#F4F2FB]'
              "
            >
              <div
                class="w-5 h-5 rounded-full bg-[#6B4FBB] flex items-center justify-center text-white text-[9px] font-medium"
              >
                {{ iniciales }}
              </div>
              {{ auth.nombre }}
              <span class="text-[#C4B8F0] text-[10px]">▾</span>
            </div>

            <!-- Dropdown -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 top-10 w-48 rounded-xl border overflow-hidden z-50"
              :class="isDark ? 'bg-[#18182a] border-[#2a2a3a]' : 'bg-white border-[#ece9f8]'"
              style="box-shadow: 0 4px 24px rgba(107, 79, 187, 0.08)"
            >
              <!-- Info -->
              <div
                class="px-4 py-3 border-b"
                :class="isDark ? 'border-[#2a2a3a]' : 'border-[#ece9f8]'"
              >
                <p
                  class="text-xs font-medium"
                  :class="isDark ? 'text-[#e0e0f0]' : 'text-[#1E1252]'"
                >
                  {{ auth.nombre }}
                </p>
                <p class="text-[10px] text-[#9B89D4] capitalize">{{ auth.rol }}</p>
              </div>

              <!-- Mi perfil -->
              <button
                @click="irPerfil"
                class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition text-left"
                :class="
                  isDark
                    ? 'text-[#8888aa] hover:bg-[#23233a] hover:text-[#A89EE8]'
                    : 'text-[#6B7280] hover:bg-[#F4F2FB] hover:text-[#6B4FBB]'
                "
              >
                <span>👤</span> Mi perfil
              </button>

              <!-- Modo oscuro -->
              <button
                @click="isDark = !isDark"
                class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition text-left"
                :class="
                  isDark
                    ? 'text-[#8888aa] hover:bg-[#23233a] hover:text-[#A89EE8]'
                    : 'text-[#6B7280] hover:bg-[#F4F2FB] hover:text-[#6B4FBB]'
                "
              >
                <span>{{ isDark ? '☀️' : '🌙' }}</span>
                {{ isDark ? 'Modo claro' : 'Modo oscuro' }}
              </button>

              <div class="border-t" :class="isDark ? 'border-[#2a2a3a]' : 'border-[#ece9f8]'"></div>

              <!-- Cerrar sesión -->
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition text-left text-red-400 hover:bg-red-50"
              >
                <span>↩</span> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Breadcrumb -->
      <div
        class="px-6 py-2 text-xs border-b transition-colors"
        :class="
          isDark
            ? 'bg-[#18182a] border-[#2a2a3a] text-[#4a4a6a]'
            : 'bg-white border-[#ece9f8] text-[#9B89D4]'
        "
      >
        {{ currentRoute }}
      </div>

      <!-- Contenido -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
      <!-- Modal cambiar contraseña obligatorio -->
      <ModalCambiarPassword v-if="!auth.passwordChanged" @completado="() => {}" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ModalCambiarPassword from '@/components/ModalCambiarPassword.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const isDark = ref(localStorage.getItem('darkMode') === 'true')
const showUserMenu = ref(false)
const userMenuRef = ref(null)

watch(isDark, (val) => localStorage.setItem('darkMode', val))

const iniciales = computed(() =>
  auth.nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase(),
)

const currentRoute = computed(() => route.name || 'Inicio')

function isActive(path) {
  return route.path === path
}

function irPerfil() {
  showUserMenu.value = false
  router.push('/perfil')
}

async function handleLogout() {
  showUserMenu.value = false
  auth.logout()
  router.push({ name: 'login' })
}

function handleClickOutside(e) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const menu = [
  {
    label: 'General',
    roles: ['super_admin', 'admin', 'director', 'maestro'],
    items: [
      {
        to: '/',
        icon: '⊞',
        label: 'Dashboard',
        roles: ['super_admin', 'admin', 'director', 'maestro'],
      },
      {
        to: '/asistencias',
        icon: '◎',
        label: 'Asistencias',
        roles: ['super_admin', 'admin', 'director', 'maestro'],
      },
      {
        to: '/historial-asistencias',
        icon: '📋',
        label: 'Historial asistencias',
        roles: ['super_admin', 'admin', 'director', 'maestro'],
      },
      {
        to: '/incidencias',
        icon: '⚑',
        label: 'Incidencias',
        roles: ['super_admin', 'admin', 'director', 'maestro'],
      },
      {
        to: '/avisos',
        icon: '✉',
        label: 'Avisos',
        roles: ['super_admin', 'admin', 'director', 'maestro'],
      },
    ],
  },
  {
    label: 'Escuela',
    roles: ['super_admin', 'admin', 'director', 'maestro'],
    items: [
      {
        to: '/alumnos',
        icon: '♟',
        label: 'Alumnos',
        roles: ['super_admin', 'admin', 'director', 'maestro'],
      },
      {
        to: '/calificaciones',
        icon: '★',
        label: 'Calificaciones',
        roles: ['super_admin', 'admin', 'director', 'maestro'],
      },
      {
        to: '/maestros',
        icon: '✎',
        label: 'Maestros',
        roles: ['super_admin', 'admin', 'director'],
      },
      {
        to: '/usuarios',
        icon: '👤',
        label: 'Usuarios',
        roles: ['super_admin', 'admin', 'director'],
      },
    ],
  },
  {
    label: 'Admin',
    roles: ['super_admin', 'admin', 'director'],
    items: [
      { to: '/pagos', icon: '💲', label: 'Pagos', roles: ['super_admin', 'admin', 'director'] },
      {
        to: '/carga',
        icon: '⬆',
        label: 'Carga masiva',
        roles: ['super_admin', 'admin', 'director'],
      },
      { to: '/qr', icon: '▣', label: 'Generar QR', roles: ['super_admin', 'admin', 'director'] },
      {
        to: '/grados-grupos',
        icon: '⚙',
        label: 'Grados y grupos',
        roles: ['super_admin', 'admin', 'director'],
      },
    ],
  },
  {
    label: 'Super Admin',
    roles: ['super_admin'],
    items: [
      { to: '/superadmin', icon: '👑', label: 'Mi dashboard', roles: ['super_admin'] },
      { to: '/escuelas', icon: '🏫', label: 'Escuelas', roles: ['super_admin'] },
    ],
  },
]

const filteredMenu = computed(() => {
  return menu
    .filter((s) => s.roles.includes(auth.rol))
    .map((s) => ({
      ...s,
      items: s.items.filter((i) => i.roles.includes(auth.rol)),
    }))
    .filter((s) => s.items.length > 0)
})
</script>
