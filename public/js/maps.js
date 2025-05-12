document.addEventListener('DOMContentLoaded', () => {
  // Проверка, что Leaflet загружен
  if (typeof L === 'undefined') {
    console.error('Leaflet.js не загружен. Проверьте подключение скрипта.');
    return;
  }

  // Карта для тура
  const tourMapElement = document.getElementById('tourMap');
  if (tourMapElement && window.tourData && window.tourData.coordinates) {
    const tourMap = L.map('tourMap').setView([window.tourData.coordinates.lat, window.tourData.coordinates.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(tourMap);
    L.marker([window.tourData.coordinates.lat, window.tourData.coordinates.lng])
      .addTo(tourMap)
      .bindPopup(window.tourData.title)
      .openPopup();
  }

  // Карта для региона
  const regionMapElement = document.getElementById('regionMap');
  if (regionMapElement && window.regionData && window.regionData.coordinates && window.attractionsData) {
    const regionMap = L.map('regionMap').setView([window.regionData.coordinates.lat, window.regionData.coordinates.lng], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(regionMap);
    const markers = L.markerClusterGroup();
    // Маркер региона
    markers.addLayer(L.marker([window.regionData.coordinates.lat, window.regionData.coordinates.lng])
      .bindPopup(window.regionData.name));
    // Маркеры достопримечательностей
    window.attractionsData.forEach(attr => {
      markers.addLayer(L.marker([attr.location.coordinates.lat, attr.location.coordinates.lng])
        .bindPopup(`<a href="/attractions/${attr._id}">${attr.name}</a>`));
    });
    regionMap.addLayer(markers);
  }

  // Карта для достопримечательности
  const attractionMapElement = document.getElementById('attractionMap');
  if (attractionMapElement && window.attractionData && window.attractionData.coordinates) {
    const attractionMap = L.map('attractionMap').setView([window.attractionData.coordinates.lat, window.attractionData.coordinates.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(attractionMap);
    L.marker([window.attractionData.coordinates.lat, window.attractionData.coordinates.lng])
      .addTo(attractionMap)
      .bindPopup(window.attractionData.name)
      .openPopup();
  }

  // Карта для отеля
  const hotelMapElement = document.getElementById('hotelMap');
  if (hotelMapElement && window.hotelData && window.hotelData.coordinates) {
    const hotelMap = L.map('hotelMap').setView([window.hotelData.coordinates.lat, window.hotelData.coordinates.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(hotelMap);
    L.marker([window.hotelData.coordinates.lat, window.hotelData.coordinates.lng])
      .addTo(hotelMap)
      .bindPopup(window.hotelData.name)
      .openPopup();
  }
});