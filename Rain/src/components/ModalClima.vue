<template>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, defineProps } from 'vue';
import { GeocodingControl } from '@maptiler/geocoding-control/maptilersdk';
import '@maptiler/geocoding-control/style.css';
const emit = defineEmits(['transitionEnd', 'select-coords'])


const props = defineProps<{
  map: any // Map instance
  apiKey: string
}>();

let gc: GeocodingControl | null = null;

onMounted(() => {
  if (!props.map) return;

  gc = new GeocodingControl({
    apiKey: props.apiKey,
    enableReverse: "always"
  } as any);

  props.map.addControl(gc, 'top-left');

  // Evento al seleccionar una ubicación
  gc.on('select', (e: any) => {
    if (!e.feature || !e.feature.center) return;
    const [lng, lat] = e.feature.center;
    props.map.easeTo({ center: [lng, lat], zoom: 12 });
  });

  // Dentro de ModalClima.vue
gc.on('select', (e: any) => {
  if (!e.feature || !e.feature.center) return;
  const [lng, lat] = e.feature.center;

  // Emitir evento hacia el padre
  emit('select-coords', { lat, lng });

  // Opcional: centrar mapa
    props.map.easeTo({ center: [lng, lat], zoom: 12 });
});

});

onUnmounted(() => {
  if (gc) props.map.removeControl(gc);
});
</script>