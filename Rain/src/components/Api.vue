<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-2">Datos Climáticos</h1>

    <button
      class="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      @click="fetchClima"
    >
      Obtener Clima
    </button>

    <table class="table-auto border-collapse border border-gray-400">
      <thead>
        <tr class="bg-gray-200">
          <th class="border border-gray-400 px-2">Fecha</th>
          <th class="border border-gray-400 px-2">Tair (K)</th>
          <th class="border border-gray-400 px-2">PSurf (Pa)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in clima" :key="item.time">
          <td class="border border-gray-400 px-2">{{ item.time }}</td>
          <td class="border border-gray-400 px-2">{{ item.Tair }}</td>
          <td class="border border-gray-400 px-2">{{ item.PSurf }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import axios, { type AxiosResponse } from 'axios';

// Interfaces
interface ClimaData {
  time: string;
  Tair: number;
  Qair: number;
  Wind_E: number;
  Wind_N: number;
  PSurf: number;
  Rainf: number;
  LWdown: number;
}

interface ClimaResponse {
  start_date: string;
  end_date: string;
  latitude: number;
  longitude: number;
  num_days: number;
  data: ClimaData[];
}

// Variables reactivas
const clima = ref<ClimaData[]>([]);
const start = ref('2025-09-15T00');
const end = ref('2025-09-20T00');
const latitud = ref(25.68);
const longitud = ref(-100.31);

// Función para obtener clima
async function obtenerClima(
  start_date: string,
  end_date: string,
  lat: number,
  lon: number
): Promise<void> {
  try {
    const response: AxiosResponse<ClimaResponse> = await axios.get(
      'http://127.0.0.1:5000/clima',
      {
        params: {
          start_date,
          end_date,
          lat,
          lon
        }
      }
    );

    clima.value = response.data.data;
    console.log('Datos climáticos:', clima.value);
  } catch (error) {
    console.error('Error al obtener datos:', error);
  }
}

// Función para usar en el botón
function fetchClima() {
  obtenerClima(start.value, end.value, latitud.value, longitud.value);
}
</script>

<style scoped>
table {
  width: 100%;
}
</style>
