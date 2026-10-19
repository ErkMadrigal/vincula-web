import { ref, onMounted } from 'vue'
import api from '@/api/axios'

export function useGradosGrupos() {
  const gradosGrupos = ref([])
  const grados = ref([])

  onMounted(async () => {
    try {
      const { data } = await api.get('/admin/grados-grupos')
      gradosGrupos.value = Array.isArray(data?.grados_grupos) ? data.grados_grupos : []
      grados.value = [...new Set(gradosGrupos.value.map((g) => g.grado))].sort()
    } catch {}
  })

  function gruposPorGrado(grado) {
    return (gradosGrupos.value || [])
      .filter((g) => g.grado === grado)
      .map((g) => ({ grupo: g.grupo, turno: g.turno }))
  }

  return { gradosGrupos, grados, gruposPorGrado }
}
