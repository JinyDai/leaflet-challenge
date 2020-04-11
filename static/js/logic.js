// Store API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createMap function
  createMap(data.features);
  // console.log(data.features);
});

// Define a function to run once for each feature in the features array
// Give each feature a popup describing the place and time of the earthquake
function bindPopMaker(feature, layer) {
  layer.bindPopup("<h2>" + feature.properties.place +
  "</h2><hr><h3> Magnitude :" + feature.properties.mag  +
    "</h3><hr><p>" + new Date(feature.properties.time)+"</p>");
}


function createMap(earthquakeData) {
   

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the bindPopMaker function once for each piece of data in the array
  function radiusSize(mag) {
    return mag*15000;
  }

  function getColor(mag){
      if (mag > 5) {
        return '#BD0026'
    } else if (mag > 4) {
        return '#E31A1C'
    } else if (mag > 3) {
        return '#FC4E2A'
    } else if (mag > 2) {
        return '#FD8D3C'
    } else if (mag > 1) {
        return '#FEB24C'
    } else {
        return '#FED976'
    }
  };
  
  EarthquakeMarkers= earthquakeData.map((feature) =>
        L.circle([feature.geometry.coordinates[1],feature.geometry.coordinates[0]])
        .bindPopup("<h2>" + feature.properties.place +
        "</h2><hr><h3> Magnitude :" + feature.properties.mag  +
          "</h3><hr><p>" + new Date(feature.properties.time)+"</p>")
    )
  

  // Using L.geoJSON to do circles
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer : function(earthquakeData, latlng) {
      return L.circle(latlng,{
        color: getColor(earthquakeData.properties.mag),
        fillOpacity: 0.75,
        radius: radiusSize(earthquakeData.properties.mag)
      });
  },
    onEachFeature: bindPopMaker
  });


// Define streetmap and darkmap layers
var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
});

var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.dark",
  accessToken: API_KEY
});



// Define a baseMaps object to hold our base layers
var baseMaps = {
  "Street Map": streetmap,
  "Dark Map": darkmap
};

// Create overlay object to hold our overlay layer
var overlayMaps = {
  Earthquakes: earthquakes
};

// Create our map, giving it the streetmap and earthquakes layers to display on load
var myMap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 4,
  layers: [streetmap, earthquakes]
});

// Create a layer control
// Pass in our baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// Add the legend on the map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (myMap) {

  var div = L.DomUtil.create('div', 'info legend'),
      mag = [0, 1, 2, 3, 4, 5],
      labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < mag.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(mag[i] + 1) + '"></i> ' +
          mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
  }

  return div;
};

legend.addTo(myMap);
}
