import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token:   localStorage.getItem('token')   || null,
    usuario: JSON.parse(localStorage.getItem('usuario') || 'null'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    rol:             (state) => state.usuario?.rol || null,
    nombre:          (state) => state.usuario?.nombre || '',
    escuelaId:       (state) => state.usuario?.escuela_id || null,
  },

  actions: {
    async login(curp, password) {
      const { data } = await api.post('/auth/login', { curp, password })

      this.token   = data.token
      this.usuario = data.usuario

      localStorage.setItem('token',   data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
    },

    logout() {
      this.token   = null
      this.usuario = null
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    }
  }
})