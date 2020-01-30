//-------------------------------------------------------
// App: monitors user inputs, creates visualizations
//-------------------------------------------------------

// clear map
clearMap();

// build base map
var myMap = buildMap();

//myMap.dragging.disable()

// Add an empty contorl to map
var layerControl = L.control.layers({}, {}, {collapsed:false}).addTo(myMap); // update the leaflet control with the named heatlayer

// Initialize Layer group
var pLayer1 = L.layerGroup([]);
var pLayer2 = L.layerGroup([]);

// Initialize plot
function initializePlot(){
    Plotly.newPlot("lineplot", 
    [], 
    {
        //autosize: true,
        //width: 500,
        title: "Popularity on Twitter Over Time",
        xaxis: { title: "Date"},
        yaxis: { title: "Retweets + Favorites" },
        //height: 650,
        margin: {
        l: 50,
        r: 50,
        b: 100,
        t: 100,
        pad: 4
        },
        showlegend: true,
        legend: {
          x: 1,
          xanchor: 'right',
          y: 1
        }
    },
    {responsive: true}
    );
}


// Select user choices from multi drop down
var selectv = []; // array of the selected politicians
var values = [];

//initialize selection
selected = d3.select("#input1") // select the select
.selectAll("option:checked")  // select the selected values
.each(function() { values.push(this.value) 
  }); // for each of those, get its value

//initialize selection
selected = d3.select("#input2") // select the select
.selectAll("option:checked")  // select the selected values
.each(function() { values.push(this.value) 
  }); // for each of those, get its value

selectv = values

d3.select("#keyInputs").on("change",function(d){ 

    selected = d3.select(this) // select the select
      .selectAll("option:checked")  // select the selected values
      .each(function() { values.push(this.value) 
        }); // for each of those, get its value
    
    selectv = values
})

// Function for showing loading status
function loadingFunction() {
  d3.select("#button")
    .text("Loading...")
}

// Function for hiding the loading status
function completeFunction() {
  d3.select("#button")
    .text("Ready!")
  }

function handleSubmit() {
    console.log("Handling Submission")
    // Prevent the page from refreshing
    //d3.event.preventDefault();
    
    loadingFunction(); // show loading spinnner

    let i = 0;
    myMap.eachLayer(function(layer){ 
        if (i > 0){
            myMap.removeLayer(layer)
            layerControl.removeLayer(layer)
        } 
        i += 1; 
    });
    console.log('Map has', i, 'layers.');

    //buildMap();

    initializePlot(); // clear line plot

    var mostPopularP = "" // initializa most popular tweet text
    
    // initialize text analysis slides
    d3.select('#barchart').html("");
    d3.select('#tweet-text').html("");

    // Table which translates form selection into twitter username
    var politicianDict = {
        "Bernie Sanders" :"BernieSanders",
        "Donald Trump":"realDonaldTrump",
        "Joe Biden":"JoeBiden",
        "Elizabeth Warren":"ewarren",
        "Pete Buttigieg":"Chas10Buttigieg",
        "Kamala Harris":"KamalaHarris",
        "Andrew Yang":"AndrewYang",
        "Ted Cruz":"tedcruz",
        "Ben Carson": "SecretaryCarson",
        "Mike Pence":"Mike_Pence",
        "Michael Bloomberg":"MikeBloomberg",
        "Tulsi Gabbard":"TulsiGabbard"
    }

    // Translate dropdown selection into username
    var userName1 = politicianDict[selectv[0]];
    var userName2 = politicianDict[selectv[1]];

    // Build API endpoint urls for recent tweets related to selected politicians
    var hashtagUrl1 = "https://twitter-history-api.herokuapp.com/api/hashtag/" + userName1;
    var hashtagUrl2 = "https://twitter-history-api.herokuapp.com/api/hashtag/" + userName2;

    // Build API endpoint urls for tweets made by the selected politicians
    var userUrl1 = "https://twitter-history-api.herokuapp.com/api/historical/" + userName1;
    var userUrl2 = "https://twitter-history-api.herokuapp.com/api/historical/" + userName2;

    //---------------------------------------
    // Make API calls and analyze responses
    //---------------------------------------

    d3.json(hashtagUrl1).then(function(data){
        pLayer1 = createHeatLayer(data, "SkyBlue", myMap) // Create a heatlayer in fuschia and add it to the map
        layerControl.addOverlay(pLayer1, selectv[0].fontcolor("SkyBlue")); // add the heatlayer to the Leaflet control
        layerControl.expand(); // expand the layer control
    });

    // Make API calls and analyze responses
    d3.json(hashtagUrl2).then(function(data){
        pLayer2 = createHeatLayer(data, "ORANGE", myMap) // Create a heatlayer in orange and add it to the map
        layerControl.addOverlay(pLayer2, selectv[1].fontcolor("ORANGE")); // add the heatlayer to the Leaflet control
    });

    // Make API calls and analyze responses
    d3.json(userUrl1).then(function(data1){
        textAnalysis1 = analyzeTweets(data1, "#1f77b4", "1"); // perform text analysis of the tweets
        tweetReachVsTime(data1, 'rgba(31, 119, 180, 1)'); // perform text analysis of the tweets
        
        // Make API calls and analyze responses
        d3.json(userUrl2).then(function(data2){
            textAnalysis2 = analyzeTweets(data2, "#ff7f0e", "2");
            tweetReachVsTime(data2, 'rgba(255, 127, 14, 1)');
            tweetBar([{
                "name": selectv[0],
                "value": textAnalysis1.retweetCount,
                "index": 0,
                "tweet": textAnalysis1.mostPopular
              },
              {
                "name": selectv[1],
                "value": textAnalysis2.retweetCount,
                "index": 1,
                "tweet": textAnalysis2.mostPopular
              }], Math.max(textAnalysis1.retweetCount, textAnalysis2.retweetCount));
            completeFunction(); // hide spinner once API calls have returned
        });

    });

    // // Make API calls and analyze responses
    // d3.json(userUrl2).then(function(data){
    //     textAnalysis = analyzeTweets(data, "#ff7f0e", "2");
    //     tweetReachVsTime(data, 'rgba(255, 127, 14, 1)');
    //     completeFunction(); // hide spinner once API calls have returned
    //     tweetBar();
    //     d3.select('#tweet-text').insert("p").html(`<br>${selectv[1]}'s Most Popular Tweet: <br><br><strong>${textAnalysis.mostPopular}</strong><br><br>
    //     was retweeted ${textAnalysis.retweetCount} times<br>`).style("color", "#ff7f0e"); // Plotly "safety orange"
    // });

};

// Event listener on "Compare" button
d3.select("#button").on("click", function(){
  console.log("handling click")
  handleSubmit()
  });

// Initialize
handleSubmit();
