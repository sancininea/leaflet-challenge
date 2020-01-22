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

// Layer del mapa inicial
let bg_layer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-v9',
    accessToken: API_KEY
});

// Otros layers
let grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    accessToken: API_KEY
});

let outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/outdoors-v11',
    accessToken: API_KEY
});

// GeoJson de las placas
var geoData = "static/data/B2002_plates.geojson";
var geojson;

// Añadir al mapa los datos de las placas
d3.json(geoData, function(data) {

    // Create a new choropleth layer
    geojson = L.choropleth(data, {

        // Define what  property in the features to use
        valueProperty: "PlateName",

        // Set color scale
        scale: ["#ffffb2", "#b10026"],

        // Number of breaks in step range
        steps: 10,

        // q for quartile, e for equidistant, k for k-means
        mode: "q",
        style: {
            // Border color
            color: "#fff",
            weight: 1,
            fillOpacity: 0.0
        },

        // Binding a pop-up to each layer
        onEachFeature: function(feature, layer) {
            layer.bindPopup("Plate:<br>" +
                feature.properties.PlateName);
        }
    }).addTo(mymap);

});

// Objeto baseMaps para el menú de layers
let baseMaps = {
    "Satellite": bg_layer,
    "Grayscale": grayscale,
    "Outdoors": outdoors
};

// Crea el mapa con las opciones
var mymap = createMap(initialCoords, mapZoomLevel, [bg_layer]);

/// Función que selecciona el color del marcador
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

//// Función para seleccionar el color de fondo de la leyenda
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

// Obtiene datos del geojson de terremotos
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

// Añade los marcadores al mapa, también el menú para seleccionar los layers y datos
d3.json(url, jsonR => {

    let response = jsonR.features;

    let earthquakeMarkers = response.map(d =>
        L.marker([d.geometry.coordinates[1], d.geometry.coordinates[0]], { icon: chooseColor(d.properties.mag) })
        .bindPopup(`<h3>Location: ${d.properties.place}</h3> <hr> Magnitude: ${d.properties.mag}`)
    );

    earthquakeLayer = L.layerGroup(earthquakeMarkers);

    // Control de layers de marcadores y lineas de placas
    var markLayer = {
        "Earthquakes": earthquakeLayer,
        "Fault line": geojson
    };

    //Crea el control de layers
    L.control.layers(baseMaps, markLayer).addTo(mymap);

    mymap.addLayer(earthquakeLayer);

    // Añade la leyenda de terremotos
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
});