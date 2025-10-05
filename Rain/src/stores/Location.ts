import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLocationStore = defineStore('location', () => {
  const lat = ref<number | null>(null);
  const lng = ref<number | null>(null);

  const setLocation = (newLat: number, newLng: number) => {
    lat.value = newLat;
    lng.value = newLng;
  };

  return { lat, lng, setLocation };
});
