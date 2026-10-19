<template>
  <div class="bg-white rounded-2xl border border-[#ece9f8] p-4 sm:p-6">
    <!-- Encabezado -->
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-xl bg-[#E0F7FA] flex items-center justify-center text-lg">⟳</div>
      <div class="min-w-0">
        <p class="text-sm font-medium text-[#1E1252]">Actualización masiva de alumnos</p>
        <p class="text-xs text-[#9B89D4]">
          CURP, APELLIDOS, NOMBRES, GRADO, GRUPO — inserta los nuevos y actualiza los existentes
        </p>
      </div>
    </div>

    <!-- Paso 1: turno + archivo -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <p class="text-xs font-medium text-[#6B7280] mb-2">Turno</p>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="t in ['matutino', 'vespertino']"
            :key="t"
            @click="cambiarTurno(t)"
            class="py-2.5 rounded-xl text-sm font-medium border-2 transition capitalize"
            :class="
              turno === t
                ? 'bg-[#F4F2FB] border-[#6B4FBB] text-[#6B4FBB]'
                : 'border-[#ece9f8] text-[#9B89D4] hover:bg-[#F8F7FC]'
            "
          >
            {{ t === 'matutino' ? '☀️ Matutino' : '🌙 Vespertino' }}
          </button>
        </div>
        <p class="text-[11px] text-[#9B89D4] mt-1.5">
          Los grupos que no existan se crearán en este turno.
        </p>
      </div>

      <div>
        <p class="text-xs font-medium text-[#6B7280] mb-2">Archivo</p>
        <div class="border-2 border-dashed border-[#ece9f8] rounded-xl p-3 flex items-center gap-2">
          <input type="file" accept=".xlsx" ref="inputArchivo" class="hidden" @change="seleccionar" />
          <p class="flex-1 min-w-0 text-xs text-[#9B89D4] truncate">
            {{ archivo ? archivo.name : 'Sin archivo seleccionado' }}
          </p>
          <button
            @click="inputArchivo.click()"
            class="px-3 py-1.5 border border-[#ece9f8] rounded-lg text-xs text-[#6B4FBB] hover:bg-[#F4F2FB] transition flex-shrink-0"
          >
            Seleccionar
          </button>
        </div>
        <a
          href="/plantillas/plantilla_actualizacion_alumnos.xlsx"
          download
          class="inline-block text-[11px] text-[#6B4FBB] underline underline-offset-2 mt-1.5"
        >
          ⬇ Descargar plantilla
        </a>
      </div>
    </div>

    <button
      v-if="!revision"
      @click="enviar(true)"
      :disabled="!archivo || cargando"
      class="w-full py-2.5 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-sm transition disabled:opacity-60"
    >
      {{ cargando ? 'Revisando archivo…' : '1. Revisar cambios (no guarda nada)' }}
    </button>

    <!-- Paso 2: revisión / resultado -->
    <div v-if="revision" class="mt-2">
      <div
        class="p-3 rounded-xl mb-3 text-xs"
        :class="revision.preview ? 'bg-[#FFF8E6] text-[#9A6700]' : 'bg-[#E1F5EE] text-[#0F6E56]'"
      >
        {{
          revision.preview
            ? `Revisión del archivo — turno ${revision.turno}. Todavía NO se ha guardado nada.`
            : `✓ Cambios aplicados — turno ${revision.turno}.`
        }}
      </div>

      <!-- Resumen -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
        <button
          v-for="c in tarjetas"
          :key="c.key"
          @click="pestana = c.key"
          class="rounded-xl border p-3 text-left transition"
          :class="pestana === c.key ? 'border-[#6B4FBB] bg-[#F4F2FB]' : 'border-[#ece9f8] hover:bg-[#F8F7FC]'"
        >
          <p class="text-[11px] text-[#9B89D4]">{{ c.label }}</p>
          <p class="text-xl font-medium" :class="c.color">{{ revision.resumen[c.key] }}</p>
        </button>
      </div>

      <!-- Detalle -->
      <div class="border border-[#ece9f8] rounded-xl overflow-hidden mb-3">
        <div class="max-h-80 overflow-y-auto">
          <!-- Nuevos -->
          <template v-if="pestana === 'nuevos'">
            <div v-for="n in revision.nuevos" :key="n.curp" class="px-3 py-2 border-b border-[#F4F2FB] text-xs">
              <p class="font-medium text-[#1E1252]">{{ n.nombre }}</p>
              <p class="text-[#9B89D4] font-mono">
                Fila {{ n.fila }} · {{ n.curp }} · {{ n.grado }}° {{ n.grupo }}
              </p>
            </div>
          </template>

          <!-- Actualizados -->
          <template v-else-if="pestana === 'actualizados'">
            <div v-for="a in revision.actualizados" :key="a.curp" class="px-3 py-2 border-b border-[#F4F2FB] text-xs">
              <p class="font-medium text-[#1E1252]">{{ a.nombre }}</p>
              <p class="text-[#9B89D4] font-mono mb-1">Fila {{ a.fila }} · {{ a.curp }}</p>
              <p v-for="c in a.cambios" :key="c.campo" class="text-[#6B7280]">
                <span class="capitalize font-medium">{{ c.campo }}:</span>
                <span class="line-through text-[#E24B4A] mx-1">{{ c.antes || '—' }}</span>
                → <span class="text-[#0F6E56] ml-1">{{ c.despues }}</span>
              </p>
            </div>
          </template>

          <!-- Grupos nuevos -->
          <template v-else-if="pestana === 'grupos_nuevos'">
            <div v-for="g in revision.grupos_nuevos" :key="g.grado + g.grupo" class="px-3 py-2 border-b border-[#F4F2FB] text-xs text-[#1E1252]">
              {{ g.grado }}° {{ g.grupo }} <span class="text-[#9B89D4] capitalize">· {{ g.turno }}</span>
            </div>
          </template>

          <!-- Errores -->
          <template v-else-if="pestana === 'errores'">
            <div v-for="(e, i) in revision.errores" :key="i" class="px-3 py-2 border-b border-[#F4F2FB] text-xs">
              <p class="text-[#A32D2D]">Fila {{ e.fila }}: {{ e.mensaje }}</p>
              <p class="text-[#9B89D4] font-mono">{{ e.curp || '(sin CURP)' }}</p>
            </div>
          </template>

          <div v-else class="px-3 py-6 text-center text-xs text-[#9B89D4]">
            {{ revision.resumen.sin_cambios }} alumnos ya están igual que en el archivo.
          </div>

          <div v-if="listaVacia" class="px-3 py-6 text-center text-xs text-[#9B89D4]">Nada aquí.</div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-2">
        <button
          @click="reiniciar"
          class="flex-1 py-2.5 rounded-xl border border-[#ece9f8] text-sm text-[#9B89D4] hover:bg-[#F8F7FC] transition"
        >
          {{ revision.preview ? 'Cancelar' : 'Subir otro archivo' }}
        </button>
        <button
          v-if="revision.preview"
          @click="confirmarYAplicar"
          :disabled="cargando || !hayCambios"
          class="flex-1 py-2.5 rounded-xl bg-[#1D9E75] hover:bg-[#178a65] text-white text-sm transition disabled:opacity-60"
        >
          {{ cargando ? 'Guardando…' : hayCambios ? '2. Aplicar cambios' : 'No hay cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/api/axios'
import swal from '@/plugins/swal'

const emit = defineEmits(['aplicado'])

const turno = ref('matutino')
const archivo = ref(null)
const inputArchivo = ref(null)
const cargando = ref(false)
const revision = ref(null)
const pestana = ref('nuevos')

const tarjetas = [
  { key: 'nuevos', label: 'Nuevos', color: 'text-[#0F6E56]' },
  { key: 'actualizados', label: 'Actualizados', color: 'text-[#6B4FBB]' },
  { key: 'sin_cambios', label: 'Sin cambios', color: 'text-[#9B89D4]' },
  { key: 'grupos_nuevos', label: 'Grupos nuevos', color: 'text-[#0E7490]' },
  { key: 'errores', label: 'Errores', color: 'text-[#A32D2D]' },
]

const hayCambios = computed(() => {
  const r = revision.value?.resumen
  return r && r.nuevos + r.actualizados + r.grupos_nuevos > 0
})

const listaVacia = computed(() => {
  const r = revision.value
  if (!r || pestana.value === 'sin_cambios') return false
  return !(r[pestana.value] || []).length
})

function seleccionar(e) {
  archivo.value = e.target.files[0] || null
  revision.value = null
}

function cambiarTurno(t) {
  turno.value = t
  revision.value = null // los grupos nuevos dependen del turno: hay que revisar otra vez
}

function reiniciar() {
  revision.value = null
  archivo.value = null
  if (inputArchivo.value) inputArchivo.value.value = ''
}

async function confirmarYAplicar() {
  const r = revision.value.resumen
  const { isConfirmed } = await swal.fire({
    title: '¿Aplicar cambios?',
    html:
      `<b>${r.nuevos}</b> alumnos nuevos<br><b>${r.actualizados}</b> actualizados<br>` +
      `<b>${r.grupos_nuevos}</b> grupos nuevos (${revision.value.turno})` +
      (r.errores ? `<br><br>Las <b>${r.errores}</b> filas con error se van a omitir.` : ''),
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, aplicar',
    cancelButtonText: 'Cancelar',
  })
  if (isConfirmed) enviar(false)
}

async function enviar(preview) {
  if (!archivo.value) return
  cargando.value = true
  try {
    const form = new FormData()
    form.append('archivo', archivo.value)
    form.append('turno', turno.value)
    form.append('preview', preview ? '1' : '0')

    const { data } = await api.post('/admin/carga/alumnos-actualizar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 10 * 60 * 1000,
    })

    revision.value = data
    const r = data.resumen
    pestana.value = r.errores && !r.nuevos && !r.actualizados ? 'errores'
      : r.nuevos ? 'nuevos' : r.actualizados ? 'actualizados' : 'sin_cambios'

    if (!preview) {
      emit('aplicado', data)
      swal.fire({
        title: '¡Listo!',
        text: `${r.nuevos} nuevos, ${r.actualizados} actualizados, ${r.grupos_nuevos} grupos creados.`,
        icon: 'success',
      })
    }
  } catch (e) {
    swal.fire({
      title: 'Error',
      text: e.response?.data?.messages?.error || 'No se pudo procesar el archivo.',
      icon: 'error',
    })
  } finally {
    cargando.value = false
  }
}
</script>
