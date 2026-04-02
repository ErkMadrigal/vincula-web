import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true }
    },
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '',              name: 'dashboard',      component: () => import('@/views/admin/DashboardView.vue') },
        { path: 'asistencias',  name: 'asistencias',    component: () => import('@/views/admin/AsistenciasView.vue') },
        { path: 'incidencias',  name: 'incidencias',    component: () => import('@/views/admin/IncidenciasView.vue') },
        { path: 'alumnos',      name: 'alumnos',        component: () => import('@/views/admin/AlumnosView.vue') },
        { path: 'maestros',     name: 'maestros',       component: () => import('@/views/admin/MaestrosView.vue') },
        { path: 'avisos',       name: 'avisos',         component: () => import('@/views/admin/AvisosView.vue') },
        { path: 'calificaciones',name: 'calificaciones',component: () => import('@/views/admin/CalificacionesView.vue') },
        { path: 'pagos',        name: 'pagos',          component: () => import('@/views/admin/PagosView.vue') },
        { path: 'carga',        name: 'carga',          component: () => import('@/views/admin/CargaView.vue') },
        { path: 'qr',           name: 'qr',             component: () => import('@/views/admin/QrView.vue') },
        { path: 'usuarios', name: 'usuarios', component: () => import('@/views/admin/UsuariosView.vue') },
      ]
    },
    {
      path: '/no-acceso',
      name: 'no-acceso',
      component: () => import('@/views/auth/NoAccesoView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})

// Guard global
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.requiresAuth && auth.isAuthenticated && auth.rol === 'padre') {
    return { name: 'no-acceso' }
  }

  if (to.meta.guest && auth.isAuthenticated && auth.rol !== 'padre') {
    return { name: 'dashboard' }
  }

  if (to.meta.guest && auth.isAuthenticated && auth.rol === 'padre') {
    return { name: 'no-acceso' }
  }
})

export default router