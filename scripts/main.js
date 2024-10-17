import { personIcon } from "./constants.js";
window.navigator.geolocation.getCurrentPosition(
    (e) => {
        loadMap([e.coords.latitude, e.coords.longitude], "Current Location");
    },
    () => {
        loadMap([35.18537125891162, 33.38590013789878], "Default Location");
    }
);

function loadMap(coords, msg) {
    let map = L.map("map").setView(coords, 8);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 10,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    L.marker(coords, { icon: personIcon }).addTo(map).bindPopup(msg);

    map.on("click", (e) => {
        console.log("addeddd", e);
    });
}