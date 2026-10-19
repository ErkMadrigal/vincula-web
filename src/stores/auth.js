import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    usuario: JSON.parse(localStorage.getItem('usuario') || 'null'),
    // Admin / super admin pueden trabajar en varias escuelas
    escuelas: [],
    escuelaActivaId: Number(localStorage.getItem('escuelaActiva')) || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    rol: (state) => state.usuario?.rol || null,
    nombre: (state) => state.usuario?.nombre || '',
    escuelaId: (state) => state.usuario?.escuela_id || null,
    curp: (state) => state.usuario?.curp || null,
    multiEscuela: (state) => ['super_admin', 'admin'].includes(state.usuario?.rol),
    escuelaActiva: (state) => state.escuelas.find((e) => e.id == state.escuelaActivaId) || null,
    passwordChanged: (state) => {
      const u = state.usuario
      return u?.password_changed === true || u?.password_changed === 1
    },
  },

  actions: {
    async login(curp, password) {
      const { data } = await api.post('/auth/login', { curp, password })
      this.token = data.token
      this.usuario = data.usuario
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
    },

    actualizarPasswordChanged() {
      this.usuario = { ...this.usuario, password_changed: true }
      localStorage.setItem('usuario', JSON.stringify(this.usuario))
    },

    /** Trae las escuelas que puede ver y deja una activa (la guardada o la primera) */
    async cargarEscuelas() {
      if (!this.multiEscuela) return
      try {
        const { data } = await api.get('/mis-escuelas')
        this.escuelas = (data.escuelas || []).map((e) => ({ ...e, id: Number(e.id) }))
        const sigueValida = this.escuelas.some((e) => e.id === this.escuelaActivaId)
        if (!sigueValida) {
          const porDefecto = this.escuelas.find((e) => e.id == this.usuario?.escuela_id) || this.escuelas[0]
          this.setEscuela(porDefecto?.id || null, false)
        }
      } catch {
        this.escuelas = []
      }
    },

    /** Cambia la escuela activa; recarga para que todas las pantallas usen la nueva */
    setEscuela(id, recargar = true) {
      this.escuelaActivaId = id ? Number(id) : null
      if (id) localStorage.setItem('escuelaActiva', String(id))
      else localStorage.removeItem('escuelaActiva')
      if (recargar) window.location.reload()
    },

    logout() {
      this.token = null
      this.usuario = null
      this.escuelas = []
      this.escuelaActivaId = null
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      localStorage.removeItem('escuelaActiva')
    },
  },
})
