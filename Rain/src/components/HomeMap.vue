<template>
    <div ref="mapContainer" class="map-container"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Map, Marker, Popup } from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { GeocodingControl } from '@maptiler/geocoding-control/maptilersdk';
import '@maptiler/geocoding-control/style.css';
import { useLocationStore } from '../stores/Location';

const locationStore = useLocationStore();

const mapContainer = ref<HTMLDivElement | null>(null);
let map: Map | null = null;
let marker: Marker | null = null; // Referencia global al marker

const API_KEY = 'EURI1gdq7LvMqlFCBlyY';
const selectedLat = ref<number | null>(null);
const selectedLng = ref<number | null>(null);

onMounted(() => {
    if (!mapContainer.value) return;

    map = new Map({
        container: mapContainer.value,
        style: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${API_KEY}`,
        center: [-100.3161, 25.6866],
        zoom: 5,
        projectionControl: true
    });

    const gc = new GeocodingControl({
        apiKey: API_KEY,
        enableReverse: "always",
        marker: false
    } as any);

    map.addControl(gc, 'top-left');

    // Captura la ubicación seleccionada
    gc.on('select', (e: any) => {
        if (!e || !e.feature || !e.feature.center) return;

        const [lngSelected, latSelected] = e.feature.center;

        selectedLat.value = latSelected;
        selectedLng.value = lngSelected;

        console.log('Ubicación seleccionada:');
        console.log('Latitud:', selectedLat.value);
        console.log('Longitud:', selectedLng.value);

        locationStore.setLocation(latSelected, lngSelected);

        // Si el marker ya existe, solo movemos su posición
        // Si el marker ya existe, solo movemos su posición
    if (marker) {
        marker.setLngLat([lngSelected, latSelected]);
        marker.togglePopup(); // abre el popup si estaba cerrado
    } else {
        const popupHTML = `
        <div class="flex flex-col gap-2 p-3 bg-white rounded-lg shadow-lg">
    <!-- Primera fila: iconos -->
    <div class="flex flex-col justify-center items-center">
        <img src="https://openweathermap.org/img/wn/01d@2x.png" alt="Sunny" width="60" />
        <img src="https://openweathermap.org/img/wn/02d@2x.png" alt="Partly Cloudy" width="60"/>
        <img src="https://openweathermap.org/img/wn/09d@2x.png" alt="Rain" width="60"/>
    </div>

    <!-- Segunda fila: textos -->
    <div class="flex flex-col justify-around text-sm font-semibold text-gray-700">
        <span>Min</span>
        <span>Max</span>
        <span>Precipitación</span>
    </div>

    <!-- Tercera fila: enlace -->
    <div class="text-center">
        <a href="#" class="text-blue-500 hover:underline text-sm">Ver más detalles</a>
    </div>
    </div>
        `;

        marker = new Marker()
            .setLngLat([lngSelected, latSelected])
            .setPopup(new Popup().setHTML(popupHTML))
            .addTo(map!)
            .togglePopup();
            
    }

    });
});

onUnmounted(() => {
    map?.remove();
});
</script>


<style scoped>
.map-container {
    background-color: black;
    width: 100vw;
    height: 100vh;
}
</style>
