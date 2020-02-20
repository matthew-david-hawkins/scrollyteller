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
    layers: [darkmap],
    scrollWheelZoom: false
  });

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

  var bounds = L.latLngBounds([[50, -125], [23, -63]]); // fit lower 48 on the map
  mapObject.fitBounds(bounds);//works!

  mapObject.panTo(new L.LatLng(41.49, -99.90)); // center on Kansas


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
function tweetReachVsTime(tweets, color, dateRange){
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
  });

  for (var k = 0; k < list.length; k++) {
    dates[k] = list[k].date;
    popularity[k] = list[k].popularity;
  }

  // Create a counter object with {month: total retweets and likes}\
  counter = {}
  weekDatesUnique = {}
  var i;
  for (i = 0; i < dates.length; i++) {
  
    var d = moment().day("Monday").year(moment(dates[i]).year()).week(moment(dates[i]).week()).toDate();
    var month = '' + (d.getMonth() + 1)
    var day = '' + d.getDate()
    var year = d.getFullYear()

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    
    if(month == '01' && dates[i].getMonth() == 11){ // If the month of the week bin is in January, and the month of the original tweet is December...
      //console.log("binned date moved forward")
      dateString = [dates[i].getFullYear() + 1, month, day].join('-')
    }
    else if (month == '12' && dates[i].getMonth() == 0) { // If the month of the week bin is in December, and the month of the original tweet is January...
      //console.log("binned date moved backward")
      dateString = [dates[i].getFullYear() - 1, month, day].join('-')
    }
    else if(year !== dates[i].getFullYear() && d.getMonth() == dates[i].getMonth()){ // if the years of the two tweets do not match, but the the months do, go with the original date
      dateString = [dates[i].getFullYear(), month, day].join('-')
    } 
    else{
      dateString = [year, month, day].join('-')
    }

    //console.log(dates[i], dateString)


    //console.log(dates[i], dates[i].getFullYear(), dateString, d)
    if (typeof(counter[dateString]) !== 'undefined'){
      counter[dateString] += popularity[i];
      weekDatesUnique[d] = "yes"
    } else {
      counter[dateString] = popularity[i];
    }

  }


  // Create arrays from counter
  groupedDates = Object.keys(counter)
  groupedPopularity = Object.values(counter)

  Plotly.addTraces("lineplot", {
    x: groupedDates.slice(1,-1), 
    y: groupedPopularity.slice(1,-1), 
    name: screen_name,
    mode: 'lines+markers',
    line: {
      color: color,
      width: 2
    }
  }); // Don't plot the first or last pair because of incomplete data

  
  // If the range is blank leave the layout alone. If the range is not blank, find the range with the later start date, and use it as the x limits
  if (dateRange.length < groupedDates.length) {

    console.log("Going with preexisting length")
    xStart = dateRange[1]
    xEnd = dateRange[dateRange.length-2]

    console.log(xStart, xEnd)
    var update = {
      xaxis: {
        range: [xStart, xEnd],
        fixedrange: true}, //Math.max(length, Object.keys(counter).length)
      };
    
     Plotly.update("lineplot", {}, update);

  }
  else {

    console.log("Going with new length")
    xStart = groupedDates[1]
    xEnd = groupedDates[groupedDates.length-2]

    console.log(xStart, xEnd)

    var update = {
      xaxis: {range: [xStart, xEnd], fixedrange: true}, //Math.max(length, Object.keys(counter).length)
      };
    
      Plotly.update("lineplot", {}, update);

    }

  arr = groupedPopularity.slice(1,-1)
  avgReach = arr.reduce((a,b) => a + b, 0) / arr.length
  
  return [groupedDates, avgReach]
  

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