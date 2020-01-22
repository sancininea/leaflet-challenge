var initialCoords = [17.9618, -66.7425];
var mapZoomLevel = 2;

// Función para crear el mapa - createMap
function createMap(coords, zoom, layers) {
    var mymap = L.map('map', {
        center: coords,
        zoom: zoom,
        layers: layers
    });
    return mymap
};

// Layer del mapa principal
let bg_layer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    accessToken: API_KEY
});

// Create a baseMaps object to hold the lightmap layer
let baseMaps = {
    "Light Map": bg_layer
};

// Crea el mapa con las opciones
var mymap = createMap(initialCoords, mapZoomLevel, [bg_layer]);

/// Selecciona color del marcador
function chooseColor(mag) {
    var markerHtmlStyles = `
    background-color: ${getColor(mag)};
    width: 2rem;
    height: 2rem;
    display: block;
    left: -1.5rem;
    top: -1.5rem;
    position: relative;
    border-radius: 2rem 2rem 0;
    transform: rotate(45deg);
    border: 1px solid #FFFFFF`

    var icon = L.divIcon({
        className: "my-custom-pin",
        iconAnchor: [0, 24],
        labelAnchor: [-6, 0],
        popupAnchor: [0, -36],
        html: `<span style="${markerHtmlStyles}" />`
    })

    return icon;
};

//// Color de fondo de la leyenda
function getColor(d) {
    return d > 5 ? '#800026' :
        d > 4 ? '#BD0026' :
        d > 3 ? '#E31A1C' :
        d > 2 ? '#FC4E2A' :
        d > 1 ? '#FD8D3C' :
        d > .5 ? '#FEB24C' :
        d > .1 ? '#FED976' :
        '#FFEDA0';
};

// Obtiene datos del json
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

d3.json(url, jsonR => {

    let response = jsonR.features;

    let earthquakeMarkers = response.map(d =>
        L.marker([d.geometry.coordinates[1], d.geometry.coordinates[0]], { icon: chooseColor(d.properties.mag) })
        .bindPopup(`<h3>Location: ${d.properties.place}</h3> <hr> Magnitude: ${d.properties.mag}`)
    );

    let earthquakeLayer = L.layerGroup(earthquakeMarkers);

    let markLayer = {
        "Earthquakes": earthquakeLayer
    };

    mymap.addLayer(earthquakeLayer);

    // Set up the legend
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 0.1, 0.5, 1, 2, 3, 4, 5],
            labels = [];
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(mymap);

    //Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, markLayer).addTo(mymap);

});