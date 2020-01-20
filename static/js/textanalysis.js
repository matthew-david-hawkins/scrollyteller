//-------------------------------------------------------
// Text Analysis: functions for analyzing the text of tweets
//-------------------------------------------------------


// https://gist.github.com/deekayen/4148741

const mostCommonWords =["im", "its", "rt", "&amp", "", "&amp;", "-", "amp", "realdonaldtrump", "berniesanders", "joebiden", 
"ewarren", "chasbuttigieg", "kamalaharris", "andrewyang", "tedcruz", "secretarycarson", "mike_pence", "", "the",
"of", "to", "and", "a", "in", "is", "it", "you", "that", "he", "was", "for", 
"on", "are", "with", "as", "i", "his", "they", "be", "at", "one", "have", "this", "from", "or", "had", "by", "not", 
"word", "but", "what", "some", "we", "can", "out", "other", "were", "all", "there", "when", "up", "use", "your", 
"how", "said", "an", "each", "she", "which", "do", "their", "time", "if", "will", "way", "about", "many", "then", 
"them", "write", "would", "like", "so", "these", "her", "long", "make", "thing", "see", "him", "two", "has", "look", 
"more", "day", "could", "go", "come", "did", "number", "sound", "no", "most", "people", "my", "over", "know", "water", 
"than", "call", "first", "who", "may", "down", "side", "been", "now", "find", "any", "new", "work", "part", "take", 
"get", "place", "made", "live", "where", "after", "back", "little", "only", "round", "man", "year", "came", "show", 
"every", "good", "me", "give", "our", "under", "name", "very", "through", "just", "form", "sentence", "great", "think", 
"say", "help", "low", "line", "differ", "turn", "cause", "much", "mean", "before", "move", "right", "boy", "old", "too", 
"same", "tell", "does", "set", "three", "want", "air", "well", "also", "play", "small", "end", "put", "home", "read", 
"hand", "port", "large", "spell", "add", "even", "land", "here", "must", "big", "high", "such", "follow", "act", "why", 
"ask", "men", "change", "went", "light", "kind", "off", "need", "house", "picture", "try", "us", "again", "animal", 
"point", "mother", "world", "near", "build", "self", "earth", "father", "head", "stand", "own", "page", "should", 
"country", "found", "answer", "school", "grow", "study", "still", "learn", "plant", "cover", "food", "sun", "four", 
"between", "state", "keep", "eye", "never", "last", "let", "thought", "city", "tree", "cross", "farm", "hard", "start", 
"might", "story", "saw", "far", "sea", "draw", "left", "late", "run", "don't", "while", "press", "close", "night", "real", 
"life", "few", "north", "open", "seem", "together", "next", "white", "children", "begin", "got", "walk", "example", "ease", 
"paper", "group", "always", "music", "those", "both", "mark", "often", "letter", "until", "mile", "river", "car", "feet", 
"care", "second", "book", "carry", "took", "science", "eat", "room", "friend", "began", "idea", "fish", "mountain", "stop", 
"once", "base", "hear", "horse", "cut", "sure", "watch", "color", "face", "wood", "main", "enough", "plain", "girl", 
"usual", "young", "ready", "above", "ever", "red", "list", "though", "feel", "talk", "bird", "soon", "body", "dog", "family", 
"direct", "pose", "leave", "song", "measure", "door", "product", "black", "short", "numeral", "class", "wind", "question", 
"happen", "complete", "ship", "area", "half", "rock", "order", "fire", "south", "problem", "piece", "told", "knew", "pass", 
"since", "top", "whole", "king", "space", "heard", "best", "hour", "better", "TRUE", "during", "hundred", "five", "remember", 
"step", "early", "hold", "west", "ground", "interest", "reach", "fast", "verb", "sing", "listen", "six", "table", "travel", 
"less", "morning", "ten", "simple", "several", "vowel", "toward", "war", "lay", "against", "pattern", "slow", "center", 
"love", "person", "money", "serve", "appear", "road", "map", "rain", "rule", "govern", "pull", "cold", "notice", "voice", 
"unit", "power", "town", "fine", "certain", "fly", "fall", "lead", "cry", "dark", "machine", "note", "wait", "plan", 
"figure", "star", "box", "noun", "field", "rest", "correct", "able", "pound", "done", "beauty", "drive", "stood", 
"contain", "front", "teach", "week", "final", "gave", "green", "oh", "quick", "develop", "ocean", "warm", "free", 
"minute", "strong", "special", "mind", "behind", "clear", "tail", "produce", "fact", "street", "inch", "multiply", 
"nothing", "course", "stay", "wheel", "full", "force", "blue", "object", "decide", "surface", "deep", "moon", "island", 
"foot", "system", "busy", "test", "record", "boat", "common", "gold", "possible", "plane", "stead", "dry", "wonder", 
"laugh", "thousand", "ago", "ran", "check", "game", "shape", "equate", "hot", "miss", "brought", "heat", "snow", "tire", 
"bring", "yes", "distant", "fill", "east", "paint", "language", "among"];


function analyzeTweets(tweets, lollipopColor, lollipopIndex){
// Args - tweets: json
// return - object vocab: array, mostPopularTweet: str
// This functions takes many tweets for one user and returns an object wiht a list of the most common words used in the tweets and the tweet with the most "reach"

  // initialize
  var maxReach = 0;
  var allWords = [];
  var counter = {};

  // Find most popular tweet, collect words used
  tweets.forEach( function(element){
      favoriteCount = element["Favorite_Count"];
      retweetCount = element["Retweet_Count"];
      tweetText = element["Tweet_Text"];
      
      tweetWords = tweetText.split(" "); // Split tweet into individual words
      tweetWords.forEach(word => allWords.push(word.toLowerCase().replace(/[^a-zA-Z]/g, ""))); // add this tweet's words to word list, change everything to lowercase and remove special characters
      reach = favoriteCount + retweetCount; // reach is favorites plus retweets
      if (reach > maxReach) { // if the is tweet with the highest reach, collect it
          mostPopularTweet = tweetText;
          maxReach = reach;
          maxFavorites = favoriteCount;
          maxRetweets = retweetCount;
          tweetDate = element["Tweet_Created_At"]; // overwrite tweet date
      }
  });

  // Create a counter object with {word: number_of_uses}
  allWords.forEach(function(word){
    if (typeof(counter[word]) !== 'undefined'){
      counter[word] += 1;
    } else {
      counter[word] = 1;
    }
  })

  // Put the counter object into list and sort so that most used words are at the begining
  var sortable = [];
  for (var word in counter) {
      sortable.push([word, counter[word]]);
  }
  sortable.sort(function(a, b) {
      return b[1] - a[1];
  });

  // create an array of then 10 most used words which are not in the hardcoded array of common words
  vocab = []
  vocab_counts = []
  vocab_list = []

  i = 0
  j = 0
  while (i < 10) {
    if (mostCommonWords.includes(sortable[j][0]) === false) { // if the next most common word is not in the most common words add it to vocab, otherwise continue
      vocab.push(sortable[j][0])
      vocab_counts.push(sortable[j][1])
      vocab_list.push({"word": sortable[j][0], "value": sortable[j][1]})
      i++;
    }
    j++;
  }

  // set the dimensions and margins of the graph
  var clientHeight = document.getElementById('figure4').clientHeight;
  var clientWidth = document.getElementById('figure4').clientWidth;
  console.log(clientHeight)
  console.log(clientWidth)
  var margin = {top: 10, right: 30, bottom: 40, left: 100},
  width = clientWidth - margin.left - margin.right,
  height = clientHeight - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select(`#lollipop${lollipopIndex}`)
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


  console.log(vocab)
  console.log(vocab_counts)
  console.log(Math.max(vocab_counts))

  // Add X axis
  var x = d3.scaleLinear()
  .domain([0, vocab_counts[0]])
  .range([ 0, width]);
  svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Y axis
  var y = d3.scaleBand()
  .range([ 0, height ])
  .domain(vocab_list.map(function(d) { return d.word; }))
  .padding(1);
  svg.append("g")
  .call(d3.axisLeft(y))


  // Lines
  svg.selectAll("myline")
  .data(vocab_list)
  .enter()
  .append("line")
  .attr("x1", x(0))
  .attr("x2", x(0))
  .attr("y1", function(d) { return y(d.word); })
  .attr("y2", function(d) { return y(d.word); })
  .attr("stroke", "grey")

  // Circles
  svg.selectAll("mycircle")
  .data(vocab_list)
  .enter()
  .append("circle")
  .attr("cx", x(0))
  .attr("cy", function(d) { return y(d.word); })
  .attr("r", "5")
  .style("fill", lollipopColor)
  .attr("stroke", "black")

  // Change the X coordinates of line and circle
  //var svg = d3.select("#my_dataviz")
  // Select the node that will be observed for mutations
  const targetNode = document.getElementById('this-step-monitor4');

  // Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  const callback = function(mutationsList, observer) {
    svg.selectAll("circle")
    .transition()
    .duration(1000)
    .attr("cx", function(d) { return x(d.value); })
  
    svg.selectAll("line")
    .transition()
    .duration(1000)
    .attr("x1", function(d) { return x(d.value); })
    console.log(response)
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);


  var response = {"mostPopular": mostPopularTweet, "favoriteCount": maxFavorites, "retweetCount": maxRetweets, "tweetDate": tweetDate, "vocab": vocab};
  return response;

}


// for creating a bar chart visualization of most popular tweet
function tweetBar(data, scale) {
  
  //set up svg using margin conventions - we'll need plenty of room on the left for labels
  // set the dimensions and margins of the graph
  var clientHeight = document.getElementById('figure3').clientHeight;
  var clientWidth = document.getElementById('figure3').clientWidth;
  var margin = {top: 10, right: 50, bottom: 10, left: 100},
  width = clientWidth - margin.left - margin.right,
  height = clientHeight - margin.top - margin.bottom;
  
  // Append the svg object to the page
  var svg = d3.select("#barchart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  // set up X Axis
  var x = d3.scaleLinear()
  .range([0, width])
  .domain([0, scale]);
  
  // Add 1st Y Axis
  var y1 = d3.scaleBand()
    .range([ 0, height/8])
    .padding(0.25)
    .domain([data[0].name]);

  svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y1))
    .attr("transform", "translate(0," + height / 4 + ")")

  // Add 2nd Y Axis
  var y2 = d3.scaleBand()
    .range([ 0, height/8])
    .padding(0.25)
    .domain([data[1].name]);

  svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y2))
    .attr("transform", "translate(0," + height * 3 / 4 + ")")
  
  // Bars and text label graphical element
  var bars = svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("g")
  
  // Bars and text label graphical element
  bars.append("rect")
    .attr("y", function(d) {return d.index == 0 ? height / 4 + height / 8 * 0.25 : height * 3 / 4  + height / 8 * 0.25 })
    .attr("height", y1.bandwidth())
    .attr("x", 0)
    .attr("width", x(0))
    .attr("fill", function(d) {return d.index == 0 ? "#1f77b4" : "#ff7f0e"});
  
  //add a value label to the right of each bar
  bars.append("text")
    .attr("class", "label")
    //y position of the label is halfway down the bar
    .attr("y", function(d) {return d.index == 0 ? height / 4 + height / 8 * 0.25 + height / 32: height * 3 / 4  + height / 8 * 0.25 + height / 32})
    //x position is 3 pixels to the right of the bar
    .attr("x", x(0))
    .text(function (d) {return d.value;})
    .attr("font-size", "13px");


  fo1 = svg.append("foreignObject")
    .attr("width", width)
    .attr("height", height/4)
    .attr("x", "0")
    .attr("y", "0")
    .text(data[0].tweet)
    .style("color", "#1f77b4")
    .style("align", "center")
    

  // fo1.append("p")
  //   .attr("xmlns", "http://www.w3.org/1999/xhtml")
  //   .text(data[0].tweet)
  
  fo2 = svg.append("foreignObject")
    .attr("width", width)
    .attr("height", height/4)
    .attr("x", "0")
    .attr("y", height/2)
    .text(data[1].tweet)
    .style("color", "#ff7f0e")
    .style("align", "center")
    
  // fo2.append("p")
  //   .attr("xmlns", "http://www.w3.org/1999/xhtml")
  //   .text(data[1].tweet)
  //   .style("color", "blue")
  
  // Change the X coordinates of line and circle
  //var svg = d3.select("#my_dataviz")
  // Select the node that will be observed for mutations
  const targetNode = document.getElementById('this-step-monitor3');

  // Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  const callback1 = function(mutationsList, observer1) {
    bars.selectAll("rect")
    .transition()
    .duration(1000)
    .attr("width", function(d) { return x(d.value); })
  
    bars.selectAll("text")
    .transition()
    .duration(1000)
    .attr("x", function(d) { return x(d.value) +3 ; })
    //console.log(response)
  };

  // Create an observer instance linked to the callback function
  const observer1 = new MutationObserver(callback1);

  // Start observing the target node for configured mutations
  observer1.observe(targetNode, config);

}