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
}

// Crea el mapa con las opciones
var mymap = createMap(initialCoords, mapZoomLevel, [bg_layer]);

// Iconos de colores
var greenIcon = L.AwesomeMarkers.icon({
    icon: 'coffee',
    markerColor: 'green'
});
var orangeIcon = L.AwesomeMarkers.icon({
    icon: 'coffee',
    markerColor: 'orange'
});
var redIcon = L.AwesomeMarkers.icon({
    icon: 'coffee',
    markerColor: 'red'
});




/// Selecciona color del marcador
function chooseColor(mag) {
    if (mag > 5) {
        icon = redIcon;
    } else if (mag > 4) {
        icon = orangeIcon;
    } else {
        icon = greenIcon;
    }

    return icon;
}

//// Color de fondo de la leyenda
function getColor(d) {
    if (d === 'More than 5') {
        color = " red";
    } else if (d === '4 to 5') {
        color = " orange";
    } else {
        color = " green";
    }
    return color;
};

function style(feature) {
    return {
        weight: 1.5,
        opacity: 1,
        fillOpacity: 1,
        radius: 6,
        fillColor: getColor(feature.properties.TypeOfIssue),
        color: "grey"

    };
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


    /////////////////////////////////////////////////////////////////


    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var colors = ['red', 'red', 'red', 'orange', 'orange', 'orange', 'green', 'green']
        var labels = [];

        // Add min & max
        var legendInfo = "<h1>Magnitude</h1>" +
            "<div class=\"labels\">" +
            "<div class=\"min\">" + 0 + "</div>" +
            "<div class=\"max\">" + 8 + "</div>" +
            "</div>";

        div.innerHTML = legendInfo;

        limits = [0, 1, 2, 3, 4, 5, 6, 7];

        limits.forEach(index => {
            labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    legend.addTo(mymap);

    ////////////////////////////////////////////////////////////////

    //Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, markLayer).addTo(mymap);

});