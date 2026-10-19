import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: () => import('@/views/admin/DashboardView.vue') },
        {
          path: 'asistencias',
          name: 'asistencias',
          component: () => import('@/views/admin/AsistenciasView.vue'),
        },
        {
          path: 'incidencias',
          name: 'incidencias',
          component: () => import('@/views/admin/IncidenciasView.vue'),
        },
        {
          path: 'alumnos',
          name: 'alumnos',
          component: () => import('@/views/admin/AlumnosView.vue'),
        },
        {
          path: 'maestros',
          name: 'maestros',
          component: () => import('@/views/admin/MaestrosView.vue'),
        },
        { path: 'avisos', name: 'avisos', component: () => import('@/views/admin/AvisosView.vue') },
        {
          path: 'calificaciones',
          name: 'calificaciones',
          component: () => import('@/views/admin/CalificacionesView.vue'),
        },
        {
          path: 'pagos',
          name: 'pagos',
          component: () => import('@/views/admin/PagosView.vue'),
          meta: { roles: ['super_admin'] }, // pagos y precios: solo super admin
        },
        {
          path: 'mis-escuelas',
          name: 'mis-escuelas',
          component: () => import('@/views/admin/MisEscuelasView.vue'),
          meta: { roles: ['admin', 'super_admin'] },
        },
        {
          path: 'administradores',
          name: 'administradores',
          component: () => import('@/views/superadmin/AdministradoresView.vue'),
          meta: { roles: ['super_admin'] },
        },
        { path: 'carga', name: 'carga', component: () => import('@/views/admin/CargaView.vue') },
        { path: 'qr', name: 'qr', component: () => import('@/views/admin/QrView.vue') },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('@/views/admin/UsuariosView.vue'),
        },
        {
          path: 'superadmin',
          name: 'superadmin',
          component: () => import('@/views/superadmin/SuperAdminView.vue'),
          meta: { roles: ['super_admin'] },
        },
        {
          path: 'escuelas',
          name: 'escuelas',
          component: () => import('@/views/superadmin/EscuelasView.vue'),
          meta: { roles: ['super_admin'] },
        },
        {
          path: 'historial-asistencias',
          name: 'historial-asistencias',
          component: () => import('@/views/admin/HistorialAsistenciasView.vue'),
        },
        {
          path: 'grados-grupos',
          name: 'grados-grupos',
          component: () => import('@/views/admin/GradosGruposView.vue'),
        },
        { path: 'perfil', name: 'perfil', component: () => import('@/views/admin/PerfilView.vue') },
      ],
    },

    {
      path: '/no-acceso',
      name: 'no-acceso',
      component: () => import('@/views/auth/NoAccesoView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
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

  // Rutas restringidas por rol
  if (to.meta.roles && !to.meta.roles.includes(auth.rol)) {
    return { name: 'dashboard' }
  }

  if (to.meta.guest && auth.isAuthenticated && auth.rol !== 'padre') {
    return { name: 'dashboard' }
  }

  if (to.meta.guest && auth.isAuthenticated && auth.rol === 'padre') {
    return { name: 'no-acceso' }
  }
})

export default router
