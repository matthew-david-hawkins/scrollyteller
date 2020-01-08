//-----------------------------------
// base map layer
//-------------------------------------------------
function buildMap() {
	// returns - leaflet map object
	// This function creates a map with two available map styles centered around Kansas
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
	
	  var myMap = L.map("map", {
		center: [41.49, -99.90], // Central Kansas
		zoom: 4,
		layers: [darkmap]});
	
	  return myMap
	};
	
//-------------------------------------------------
// Clear Map
//-------------------------------------------------
function clearMap(){
  // Remove any associations to leaflet for div with id='map'
  var container = L.DomUtil.get('map');

  if(container != null){
  
  container._leaflet_id = null;
  
  }

}
	
//-------------------------------------------------
// create a map layer given tweet data
//-------------------------------------------------
function createHeatLayer(data, colorString, mapObject){
// args - data: json, colorString: str, mapObject: Leaflet map object
// given a set of tweets, create and add a heat layer the given map object

  var heatArray = [];
  var heatMarkers =[];

  for (var i = 0; i < data.length; i++) {
  var lat = data[i].lat;
  var long = data[i].long;
  heatArray.push([lat, long]);
  heatMarkers.push(L.circle([lat, long],{
    stroke: false,
    fillOpacity: 1,
    color: colorString,
    fillColor: colorString,
    radius: 15000,
    className: 'circle-transition', // For transitioning
  }
));
  }

  // var heatmap = L.heatLayer(heatArray, {
  //   radius: 15,
  //   blur: 1,
  //   gradient : {1: colorString},
  
  //   max: 2000
  // }).addTo(mapObject);

  var heatmap = L.layerGroup(heatMarkers).addTo(mapObject);

  return heatmap
  
}

//-------------------------------------------------
// Parse Twitter Date string
//-------------------------------------------------
function parseDate(s) {
  var d = new Date();
  s = s.split(' '); // split into date and time
  s = s[0].split('-'); // split into date into year, month, day
  d.setFullYear(s[0]);
  d.setMonth(parseInt(s[1]) - 1);
  d.setDate(s[2]);
  return d;
}

//--------------------------------------------------
// Groups tweets by month, and sum of retweets and and favorites
//--------------------------------------------------
function tweetReachVsTime(tweets, color){
// args - tweets: json
// Given a set a tweets, group them by day and retweets + favorites, add trace to lineplot with the data
  var screen_name = tweets[0].Screen_Name
  var dates = []; // placeholder for dates
  var popularity = []; // placeholder for the populatiry of each tweet
  tweets.forEach(function(tweet) {
  date = parseDate(tweet.Tweet_Created_At);
  dates.push(date)
  favorites = parseInt(tweet.Favorite_Count);
  retweets = parseInt(tweet.Retweet_Count);
  popularity.push((favorites + retweets));
  });

  //const sortedDates = dates.sort((a, b) => b - a)
  //1) combine the arrays:
  var list = [];
  for (var j = 0; j < dates.length; j++) 
    list.push({'date': dates[j], 'popularity': popularity[j]});

  //2) sort:
  list.sort(function(a, b) {
    return ((a.date < b.date) ? -1 : ((a.name == b.name) ? 0 : 1));
    //Sort could be modified to, for example, sort on the age 
    // if the name is the same.
  });

  //3) separate them back out:
  for (var k = 0; k < list.length; k++) {
    dates[k] = list[k].date;
    popularity[k] = list[k].popularity;
  }

  // Create a counter object with {month: total retweets and likes}\
  counter = {}
  var i;
  for (i = 0; i < dates.length; i++) {
  dategroup = dates[i].getFullYear().toString() + "-" + (dates[i].getMonth() + 1).toString() + "-" + dates[i].getDate().toString() // group by yyyy-mm
  if (typeof(counter[dategroup]) !== 'undefined'){
    counter[dategroup] += popularity[i];
  } else {
    counter[dategroup] = popularity[i];
  }
  }

  // Create arrays from counter
  groupedDates = Object.keys(counter)
  groupedPopularity = Object.values(counter)

  const sortedPopularity = groupedDates.sort((a, b) => b - a)


  console.log(groupedDates)
  console.log(groupedPopularity)


  Plotly.addTraces("lineplot", {x: groupedDates.slice(1,-1), 
  y: groupedPopularity.slice(1,-1), 
  name: screen_name,
  line: {
    color: color,
    width: 2
  }}); // Don't plot the first or last pair because of incomplete data

}

function emphasizeTrace1(color){
  // restyle two traces using attribute strings
  var update1 = {
  'line.color': color
  };

  Plotly.restyle("lineplot", update1, [0]);
}

function emphasizeTrace2(color){
  // restyle two traces using attribute strings
  var update2 = {
  'line.color': color
  };

  Plotly.restyle("lineplot", update2, [1]);
}