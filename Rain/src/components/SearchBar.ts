import { Map, MapStyle, config } from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { GeocodingControl } from '@maptiler/geocoding-control/maptilersdk';
import '@maptiler/geocoding-control/style.css';

config.apiKey = 'EURI1gdq7LvMqlFCBlyY';

const map = new Map({
  container: 'map', // container id
  style: MapStyle.STREETS.LIGHT,
  geolocate: true
});

//set geocoding control search by coodinates (reverse geocoding)
const gc = new GeocodingControl({
  enableReverse: "always",
});

map.addControl(gc, 'top-left');