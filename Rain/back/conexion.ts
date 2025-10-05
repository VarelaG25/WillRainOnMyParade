import axios, { AxiosResponse } from 'axios';
import { GoogleGenAI } from '@google/genai';

// Interfaces de clima
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

interface ClimaParams {
  start: string;
  end: string;
  latitud: number;
  longitud: number;
}

// ================================
// 1️⃣ Obtener datos del clima
// ================================
export async function obtenerClima({
  start,
  end,
  latitud,
  longitud
}: ClimaParams): Promise<ClimaData[]> {
  try {
    const response: AxiosResponse<ClimaResponse> = await axios.get(
      'http://127.0.0.1:5000/clima',
      {
        params: { start_date: start, end_date: end, lat: latitud, lon: longitud }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error al obtener datos del clima:', error);
    return [];
  }
}

// ================================
// 2️⃣ Resumen con Gemini
// ================================
export async function generarResumenClima(datosClima: ClimaData[]): Promise<string> {
  const gemini = new GoogleGenAI({ apiKey: 'AIzaSyCUn6QZczz5gOW-TvhgpW6hzsD5nb9rzpg' }); // reemplaza TU_API_KEY

  const datosTexto = datosClima
    .map(d => `Fecha: ${d.time}, Tair: ${d.Tair}K, Rainf: ${d.Rainf}mm`)
    .join('\n');

  const prompt = `Proporciona un resumen del clima con la temperatura mínima, máxima y precipitación acumulada para los siguientes datos:\n${datosTexto}\nTair son grados Kelvin, Rainf es precipitación en mm.`;

  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash", // modelo estable para texto
      contents: prompt
    });

    // En la versión actual, el texto generado está en:
    return 'No se pudo generar el clima'
    } catch (error) {
    console.error('Error al generar resumen con Gemini:', error);
    return 'No se pudo obtener el resumen del clima.';
    }
}

// ================================
// 3️⃣ Función combinada
// ================================
export async function climaConResumen(params: ClimaParams): Promise<string> {
  const datos = await obtenerClima(params);
  if (!datos.length) return 'No hay datos climáticos disponibles.';
  return await generarResumenClima(datos);
}

// ================================
// 4️⃣ Uso ejemplo
// ================================
// (async () => {
//   const resumen = await climaConResumen({
//     start: '2025-09-15T00',
//     end: '2025-09-20T00',
//     latitud: 25.68,
//     longitud: -100.31
//   });
//   console.log(resumen);
// })();
