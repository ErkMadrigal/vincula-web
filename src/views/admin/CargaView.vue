<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-medium text-[#1E1252]">Carga masiva</h1>
      <p class="text-sm text-[#9B89D4] mt-0.5">Descarga plantillas y sube archivos desde aquí</p>
    </div>

    <!-- Tarjetas de módulos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <!-- Actualización masiva (inserta / actualiza por CURP) -->
      <ActualizacionAlumnos class="lg:col-span-2" />

      <!-- Alumnos -->
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-[#EEEDFE] flex items-center justify-center text-lg">
            ♟
          </div>
          <div>
            <p class="text-sm font-medium text-[#1E1252]">Alumnos</p>
            <p class="text-xs text-[#9B89D4]">curp, nombre, grado, grupo</p>
          </div>
        </div>
        <div
          v-if="resultados.alumnos"
          class="mb-4 p-3 rounded-xl bg-[#F4F2FB] border border-[#ece9f8]"
        >
          <p class="text-xs text-[#0F6E56]">✓ Creados: {{ resultados.alumnos.creados }}</p>
          <p class="text-xs text-[#9B89D4]">— Omitidos: {{ resultados.alumnos.omitidos }}</p>
          <p class="text-xs text-red-500" v-if="resultados.alumnos.errores > 0">
            ✗ Errores: {{ resultados.alumnos.errores }}
          </p>
        </div>
        <div class="border-2 border-dashed border-[#ece9f8] rounded-xl p-4 text-center mb-4">
          <input
            type="file"
            accept=".xlsx"
            ref="fileAlumnos"
            @change="(e) => seleccionar(e, 'alumnos')"
            class="hidden"
          />
          <p class="text-xs text-[#9B89D4] mb-2">
            {{ archivos.alumnos ? archivos.alumnos.name : 'Sin archivo seleccionado' }}
          </p>
          <button
            @click="$refs.fileAlumnos.click()"
            class="px-3 py-1.5 border border-[#ece9f8] rounded-lg text-xs text-[#6B4FBB] hover:bg-[#F4F2FB] transition"
          >
            Seleccionar archivo
          </button>
        </div>
        <div class="flex gap-2">
          <a
            href="/plantillas/plantilla_alumnos.xlsx"
            download
            class="flex-1 py-2 rounded-xl border border-[#ece9f8] text-xs text-[#9B89D4] hover:bg-[#F8F7FC] transition text-center"
          >
            ⬇ Plantilla
          </a>
          <button
            @click="subir('alumnos')"
            :disabled="!archivos.alumnos || cargando.alumnos"
            class="flex-1 py-2 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-xs transition disabled:opacity-60"
          >
            {{ cargando.alumnos ? 'Subiendo...' : 'Subir' }}
          </button>
        </div>
      </div>

      <!-- Maestros -->
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center text-lg">
            ✎
          </div>
          <div>
            <p class="text-sm font-medium text-[#1E1252]">Maestros</p>
            <p class="text-xs text-[#9B89D4]">curp, nombre</p>
          </div>
        </div>
        <div
          v-if="resultados.maestros"
          class="mb-4 p-3 rounded-xl bg-[#F4F2FB] border border-[#ece9f8]"
        >
          <p class="text-xs text-[#0F6E56]">✓ Creados: {{ resultados.maestros.creados }}</p>
          <p class="text-xs text-[#9B89D4]">— Omitidos: {{ resultados.maestros.omitidos }}</p>
          <p class="text-xs text-red-500" v-if="resultados.maestros.errores > 0">
            ✗ Errores: {{ resultados.maestros.errores }}
          </p>
        </div>
        <div class="border-2 border-dashed border-[#ece9f8] rounded-xl p-4 text-center mb-4">
          <input
            type="file"
            accept=".xlsx"
            ref="fileMaestros"
            @change="(e) => seleccionar(e, 'maestros')"
            class="hidden"
          />
          <p class="text-xs text-[#9B89D4] mb-2">
            {{ archivos.maestros ? archivos.maestros.name : 'Sin archivo seleccionado' }}
          </p>
          <button
            @click="$refs.fileMaestros.click()"
            class="px-3 py-1.5 border border-[#ece9f8] rounded-lg text-xs text-[#6B4FBB] hover:bg-[#F4F2FB] transition"
          >
            Seleccionar archivo
          </button>
        </div>
        <div class="flex gap-2">
          <a
            href="/plantillas/plantilla_maestros.xlsx"
            download
            class="flex-1 py-2 rounded-xl border border-[#ece9f8] text-xs text-[#9B89D4] hover:bg-[#F8F7FC] transition text-center"
          >
            ⬇ Plantilla
          </a>
          <button
            @click="subir('maestros')"
            :disabled="!archivos.maestros || cargando.maestros"
            class="flex-1 py-2 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-xs transition disabled:opacity-60"
          >
            {{ cargando.maestros ? 'Subiendo...' : 'Subir' }}
          </button>
        </div>
      </div>

      <!-- Calificaciones -->
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-[#FAEEDA] flex items-center justify-center text-lg">
            ★
          </div>
          <div>
            <p class="text-sm font-medium text-[#1E1252]">Calificaciones</p>
            <p class="text-xs text-[#9B89D4]">curp, materia, calificacion, observaciones</p>
          </div>
        </div>

        <!-- Bimestre y ciclo -->
        <div class="grid grid-cols-2 gap-2 mb-3">
          <select
            v-model="calForm.bimestre"
            class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-xs text-[#1E1252] focus:outline-none focus:border-[#6B4FBB] transition"
          >
            <option value="">Bimestre</option>
            <option v-for="b in [1, 2, 3, 4, 5]" :key="b" :value="b">Bimestre {{ b }}</option>
          </select>
          <input
            v-model="calForm.ciclo"
            type="text"
            placeholder="2025-2026"
            class="px-3 py-2 rounded-xl border border-[#ece9f8] bg-[#F8F7FC] text-xs text-[#1E1252] placeholder-[#C4B8F0] focus:outline-none focus:border-[#6B4FBB] transition"
          />
        </div>

        <div
          v-if="resultados.calificaciones"
          class="mb-4 p-3 rounded-xl bg-[#F4F2FB] border border-[#ece9f8]"
        >
          <p class="text-xs text-[#0F6E56]">
            ✓ Procesados: {{ resultados.calificaciones.procesados }}
          </p>
          <p class="text-xs text-[#9B89D4]">— Omitidos: {{ resultados.calificaciones.omitidos }}</p>
          <p class="text-xs text-red-500" v-if="resultados.calificaciones.errores > 0">
            ✗ Errores: {{ resultados.calificaciones.errores }}
          </p>
        </div>

        <div class="border-2 border-dashed border-[#ece9f8] rounded-xl p-4 text-center mb-4">
          <input
            type="file"
            accept=".xlsx"
            ref="fileCalificaciones"
            @change="(e) => seleccionar(e, 'calificaciones')"
            class="hidden"
          />
          <p class="text-xs text-[#9B89D4] mb-2">
            {{
              archivos.calificaciones ? archivos.calificaciones.name : 'Sin archivo seleccionado'
            }}
          </p>
          <button
            @click="$refs.fileCalificaciones.click()"
            class="px-3 py-1.5 border border-[#ece9f8] rounded-lg text-xs text-[#6B4FBB] hover:bg-[#F4F2FB] transition"
          >
            Seleccionar archivo
          </button>
        </div>
        <div class="flex gap-2">
          <a
            href="/plantillas/plantilla_calificaciones.xlsx"
            download
            class="flex-1 py-2 rounded-xl border border-[#ece9f8] text-xs text-[#9B89D4] hover:bg-[#F8F7FC] transition text-center"
          >
            ⬇ Plantilla
          </a>
          <button
            @click="subir('calificaciones')"
            :disabled="
              !archivos.calificaciones ||
              !calForm.bimestre ||
              !calForm.ciclo ||
              cargando.calificaciones
            "
            class="flex-1 py-2 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-xs transition disabled:opacity-60"
          >
            {{ cargando.calificaciones ? 'Subiendo...' : 'Subir' }}
          </button>
        </div>
      </div>

      <!-- Pagos -->
      <div class="bg-white rounded-2xl border border-[#ece9f8] p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center text-lg">
            💲
          </div>
          <div>
            <p class="text-sm font-medium text-[#1E1252]">Pagos</p>
            <p class="text-xs text-[#9B89D4]">curp, nombre, pagado (1=activo, 0=bloqueado)</p>
          </div>
        </div>
        <div
          v-if="resultados.pagos"
          class="mb-4 p-3 rounded-xl bg-[#F4F2FB] border border-[#ece9f8]"
        >
          <p class="text-xs text-[#0F6E56]">✓ Activados: {{ resultados.pagos.activados }}</p>
          <p class="text-xs text-[#A32D2D]">✗ Bloqueados: {{ resultados.pagos.bloqueados }}</p>
          <p class="text-xs text-[#9B89D4]">— Omitidos: {{ resultados.pagos.omitidos }}</p>
          <p class="text-xs text-red-500" v-if="resultados.pagos.errores > 0">
            ✗ Errores: {{ resultados.pagos.errores }}
          </p>
        </div>
        <div class="border-2 border-dashed border-[#ece9f8] rounded-xl p-4 text-center mb-4">
          <input
            type="file"
            accept=".xlsx"
            ref="filePagos"
            @change="(e) => seleccionar(e, 'pagos')"
            class="hidden"
          />
          <p class="text-xs text-[#9B89D4] mb-2">
            {{ archivos.pagos ? archivos.pagos.name : 'Sin archivo seleccionado' }}
          </p>
          <button
            @click="$refs.filePagos.click()"
            class="px-3 py-1.5 border border-[#ece9f8] rounded-lg text-xs text-[#6B4FBB] hover:bg-[#F4F2FB] transition"
          >
            Seleccionar archivo
          </button>
        </div>
        <div class="flex gap-2">
          <a
            href="/plantillas/plantilla_pagos.xlsx"
            download
            class="flex-1 py-2 rounded-xl border border-[#ece9f8] text-xs text-[#9B89D4] hover:bg-[#F8F7FC] transition text-center"
          >
            ⬇ Plantilla
          </a>
          <button
            @click="subir('pagos')"
            :disabled="!archivos.pagos || cargando.pagos"
            class="flex-1 py-2 rounded-xl bg-[#6B4FBB] hover:bg-[#5a3faa] text-white text-xs transition disabled:opacity-60"
          >
            {{ cargando.pagos ? 'Subiendo...' : 'Subir' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/axios'
import swal from '@/plugins/swal'
import ActualizacionAlumnos from '@/components/ActualizacionAlumnos.vue'

const archivos = ref({ alumnos: null, maestros: null, calificaciones: null, pagos: null })
const cargando = ref({ alumnos: false, maestros: false, calificaciones: false, pagos: false })
const resultados = ref({ alumnos: null, maestros: null, calificaciones: null, pagos: null })
const calForm = ref({ bimestre: '', ciclo: '' })

const endpoints = {
  alumnos: '/admin/carga/alumnos',
  maestros: '/admin/carga/maestros',
  calificaciones: '/admin/calificaciones/carga',
  pagos: '/admin/pagos/carga',
}

function seleccionar(e, modulo) {
  archivos.value[modulo] = e.target.files[0]
  resultados.value[modulo] = null
}

async function subir(modulo) {
  if (!archivos.value[modulo]) return
  cargando.value[modulo] = true

  try {
    const formData = new FormData()
    formData.append('archivo', archivos.value[modulo])

    if (modulo === 'calificaciones') {
      formData.append('bimestre', calForm.value.bimestre)
      formData.append('ciclo', calForm.value.ciclo)
    }

    const { data } = await api.post(endpoints[modulo], formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    resultados.value[modulo] = data
    archivos.value[modulo] = null

    swal.fire({
      title: '¡Carga completada!',
      text: `El archivo de ${modulo} fue procesado correctamente.`,
      icon: 'success',
      confirmButtonText: 'Cerrar',
    })
  } catch {
    swal.fire({ title: 'Error', text: 'No se pudo procesar el archivo.', icon: 'error' })
  } finally {
    cargando.value[modulo] = false
  }
}
</script>
