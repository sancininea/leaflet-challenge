var newYorkCoords = [40.73, -74.0059];
var mapZoomLevel = 12;

// Create the createMap function
function createMap(coords, zoom, layers) {
    var mymap = L.map('map-id', {
        center: coords,
        zoom: zoom,
        layers: layers
    });
    return mymap
};

// Create the tile layer that will be the background of our map
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

// Create the map object with options
var mymap = createMap(newYorkCoords, mapZoomLevel, [bg_layer]);

var url = "https://gbfs.citibikenyc.com/gbfs/en/station_information.json"


d3.json(url, jsonR => {

    let response = jsonR.data.stations;

    let bikeMarkers = response.map(station => L.marker([station.lat, station.lon]).bindPopup(`<h3>Station: ${station.name}</h3> <hr> Capacity: ${station.capacity}`));

    let bikeStations = L.layerGroup(bikeMarkers);

    let bikeLayer = {
        "Bike stations": bikeStations
    };

    mymap.addLayer(bikeStations);

    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, bikeLayer).addTo(mymap);

});