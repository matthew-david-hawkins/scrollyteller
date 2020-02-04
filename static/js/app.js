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
  
  try {
    Plotly.deleteTraces('lineplot', 0);
    Plotly.deleteTraces('lineplot', 1);
  }
  catch{}

    Plotly.newPlot("lineplot", 
    [], 
    {
        //autosize: true,
        //width: 500,
        title: "Popularity Over Time",
        xaxis: { title: "Week of the Year"},
        yaxis: { title: "Weekly Retweets + Favorites\n" },
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
    {
      responsive: true,
      displayModeBar: false
    }
    );
}


// Select user choices from multi drop down
var selectv = []; // array of the selected politicians
var values = [];

//initialize selection
values.push(d3.select('#input1').node().value)

//initialize selection
values.push(d3.select('#input2').node().value)

selectv = values

d3.select("#input1").on("change",function(d){ 
  values = []

  values.push(d3.select(this).node().value)
  
  values.push(d3.select('#input2').node().value)

  selectv = values

})

d3.select("#input2").on("change",function(d){

  values = []

  values.push(d3.select(this).node().value)
  
  values.push(d3.select('#input1').node().value)
    
  selectv = values
})

// Function for showing loading status
function loadingFunction() {
  d3.select("#button")
    .text("Loading...")

  d3.select("#introText")
    .html("<br><strong>Just a sec. We're getting things ready...</strong><br>")
}

// Function for hiding the loading status
function completeFunction() {
  d3.select("#button")
    .text("Ready!")

  d3.select("#introText")
  .html("<br><strong>Ok! Let's See Who's Ahead.</strong><br><br>Sit Back and Start Scrolling...")
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
    d3.select('#lollipop1').html("");
    d3.select('#lollipop2').html("");

    // Table which translates form selection into twitter username
    var politicianDict = {
        "Bernie Sanders" :"BernieSanders",
        "Donald Trump":"realDonaldTrump",
        "Joe Biden":"JoeBiden",
        "Elizabeth Warren":"ewarren",
        "Pete Buttigieg":"PeteButtigieg",
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
    var hashtagUrl1 = "https://twitter-thrum.herokuapp.com/api/hashtag/" + userName1;
    var hashtagUrl2 = "https://twitter-thrum.herokuapp.com/api/hashtag/" + userName2;

    // Build API endpoint urls for tweets made by the selected politicians
    var userUrl1 = "https://twitter-thrum.herokuapp.com/api/historical/" + userName1;
    var userUrl2 = "https://twitter-thrum.herokuapp.com/api/historical/" + userName2;

    // Update page messages
    d3.select("#stepText3")
      .html(`Each politician's map is different.<br><br> Consider <strong>${selectv[0]}'s</strong> support map`)
    d3.select("#stepText4")
      .html(`Now, compare <strong>${selectv[1]}'s</strong> support map`)

    //---------------------------------------
    // Make API calls and analyze responses
    //---------------------------------------

    d3.json(hashtagUrl1).then(function(data1){
        console.log("hashtag1 is ", data1.length)
        pLayer1 = createHeatLayer(data1, "SkyBlue", myMap) // Create a heatlayer in fuschia and add it to the map
        layerControl.addOverlay(pLayer1, selectv[0].fontcolor("SkyBlue")); // add the heatlayer to the Leaflet control
        layerControl.expand(); // expand the layer control
        d3.json(hashtagUrl2).then(function(data2){
          console.log("hashtag1 is ", data2.length)
          pLayer2 = createHeatLayer(data2, "ORANGE", myMap) // Create a heatlayer in orange and add it to the map
          layerControl.addOverlay(pLayer2, selectv[1].fontcolor("ORANGE")); // add the heatlayer to the Leaflet control
        });
    });


    // Make API calls and analyze responses
    d3.json(userUrl1).then(function(data1){
        response1 = []
        response2 = []
        data2 = []
        textAnalysis1 = analyzeTweets(data1, "#1f77b4", "1"); // perform text analysis of the tweets
        response1 = tweetReachVsTime(data1, 'rgba(31, 119, 180, 1)', 0); // perform text analysis of the tweets
        d3.select("#stepText1")
        .html(`${selectv[0]} averages <br><strong>${Math.round(response1[1]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</strong><br> weekly Favorites & Retweets`)
        // Make API calls and analyze responses
        d3.json(userUrl2).then(function(data2){
            textAnalysis2 = analyzeTweets(data2, "#ff7f0e", "2");
            response2 = tweetReachVsTime(data2, 'rgba(255, 127, 14, 1)', response1[0]);
            d3.select("#stepText2")
            .html(`${selectv[1]} averages <br><strong>${Math.round(response2[1]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</strong><br> weekly Favorites & Retweets`)

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
            
              d3.select("#stepText5")
              .html(`Have a look at ${selectv[0]}'s unique vocabulary.`)
              d3.select("#stepText6")
              .html(`...And ${selectv[1]}'s vocab.`)
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
