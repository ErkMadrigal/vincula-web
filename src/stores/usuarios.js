import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useUsuariosStore = defineStore('usuarios', {
  state: () => ({
    lista:   [],
    loading: false,
    error:   null,
  }),

  actions: {
    async crearUsuario(datos) {
      this.loading = true
      try {
        const { data } = await api.post('/admin/usuario/nuevo', datos)
        return data
      } catch (e) {
        this.error = e.response?.data?.messages?.error || 'Error al crear usuario.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async listar() {
      this.loading = true
      try {
        const { data } = await api.get('/admin/usuarios')
        this.lista = data.usuarios
      } catch (e) {
        this.error = 'Error al cargar usuarios.'
      } finally {
        this.loading = false
      }
    }
  }
})