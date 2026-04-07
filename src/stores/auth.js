import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    usuario: JSON.parse(localStorage.getItem('usuario') || 'null'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    rol: (state) => state.usuario?.rol || null,
    nombre: (state) => state.usuario?.nombre || '',
    escuelaId: (state) => state.usuario?.escuela_id || null,
    curp: (state) => state.usuario?.curp || null,
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

    logout() {
      this.token = null
      this.usuario = null
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    },
  },
})
