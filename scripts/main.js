import { personIcon } from "./constants.js";
import getIcon, { getStatus } from "./helpers.js";
import ui from "./ui.js";

let map;
let clickedCoords;
let layer;
let notes = JSON.parse(localStorage.getItem("notes")) || [];

window.navigator.geolocation.getCurrentPosition(
  (e) => {
    loadMap([e.coords.latitude, e.coords.longitude], "Mevcut Konum");
  },
  () => {
    loadMap([39.925696, 32.855806], "Varsayılan Konum");
  }
);

function loadMap(currentPosition, msg) {
  map = L.map("map", {
    zoomControl: false,
  }).setView(currentPosition, 8);
  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  layer = L.layerGroup().addTo(map);
  L.marker(currentPosition, { icon: personIcon }).addTo(map).bindPopup(msg);
  map.on("click", onMapClick);

  renderNotes();
  renderMakers();
}

function onMapClick(e) {
  clickedCoords = [e.latlng.lat, e.latlng.lng];

  ui.aside.className = "add";
}
ui.cancelBtn.addEventListener("click", () => {
  ui.aside.className = "";
});

ui.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  const newNote = {
    id: new Date().getTime(),
    title,
    date,
    status,
    coords: clickedCoords,
    favorite: false,
  };
  notes.unshift(newNote);

  localStorage.setItem("notes", JSON.stringify(notes));
  ui.aside.className = "";
  e.target.reset();

  renderNotes();
  renderMakers();
});

function renderMakers() {
  layer.clearLayers();

  notes.forEach((item) => {
    const icon = getIcon(item.status);

    L.marker(item.coords, { icon }).addTo(layer).bindPopup(item.title);
  });
}

function renderNotes() {
  const sortedNotes = notes.sort((a, b) => b.favorite - a.favorite);
  const noteCards = notes
    .map((item) => {
      const date = new Date(item.date).toLocaleString("tr", {
        day: "2-digit",
        month: "long",
        year: "2-digit",
      });
      const status = getStatus(item.status);
      const favoriteClass = item.favorite ? "bi-star-fill" : "bi-star";
      return `
        <li>
            <div>
              <p>${item.title}</p>
              <p>${date}</p>
              <p>${status}</p>
            </div>

            <div class="icons">
              <i data-id="${item.id}" class="bi ${favoriteClass}" id="favorite"></i>
              <i data-id="${item.id}" class="bi bi-airplane-fill" id="fly"></i>
              
              <i data-id="${item.id}" class="bi bi-trash3-fill" id="delete" ></i>
            </div>
          </li>
  `;
    })
    .join("");
  ui.list.innerHTML = noteCards;

  document.querySelectorAll("li #favorite").forEach((btn) => {
    btn.addEventListener("click", () => toggleFavorite(btn.dataset.id));
  });
  document.querySelectorAll("li #delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteNote(btn.dataset.id));
  });

  document.querySelectorAll("li #fly").forEach((btn) => {
    btn.addEventListener("click", () => flyToLocation(btn.dataset.id));
  });
}

function deleteNote(id) {
  const res = confirm("Notu silmeyi onaylıyor musunuz ?");

  if (res) {
    notes = notes.filter((note) => note.id !== +id);

    localStorage.setItem("notes", JSON.stringify(notes));

    renderNotes();
    renderMakers();
  }
}

function flyToLocation(id) {
  const note = notes.find((note) => note.id === +id);
  map.flyTo(note.coords, 12);
}

ui.arrow.addEventListener("click", () => {
  ui.aside.classList.toggle("hide");
});

function toggleFavorite(id) {
  notes = notes.map((note) => {
    if (note.id === +id) {
      note.favorite = !note.favorite;
    }
    return note;
  });
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
  renderMakers();
}

function getDirections(id) {
  const note = notes.find((note) => note.id === +id);
  const { coords } = note;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`;

  window.open(googleMapsUrl, "_blank");
}
