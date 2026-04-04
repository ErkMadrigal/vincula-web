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
    passwordChanged: (state) => state.usuario?.password_changed ?? true,
  },

  actions: {
    async login(curp, password) {
      const { data } = await api.post('/auth/login', { curp, password })

      this.token = data.token
      this.usuario = data.usuario

      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
    },

    // getter
    passwordChanged: (state) => state.usuario?.password_changed ?? true,

    logout() {
      this.token = null
      this.usuario = null
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    },
  },
})
