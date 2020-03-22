//-------------------------------------------------------
// Scrollytelling handles scrolling events
//-------------------------------------------------------

// Remove the overflow:hidden css property on the div with id="outerWrapper" on squarespace. This prevents position:sticky from working on Squarespace
d3.select('#outerWrapper')
  .style('overflow', "visible")

// using d3 for convenience
var main = d3.select('main')
var scrolly1 = main.select('#scrolly1');
var figure1 = scrolly1.select('figure');
var article1 = scrolly1.select('article');
var step1 = article1.selectAll('.step');

var scrolly2 = main.select('#scrolly2');
var figure2 = scrolly2.select('figure');
var article2 = scrolly2.select('article');
var step2 = article2.selectAll('.step');

var scrolly3 = main.select('#scrolly3');
var figure3 = scrolly3.select('figure');
var article3 = scrolly3.select('article');
var step3 = article3.selectAll('.step');

var scrolly4 = main.select('#scrolly4');
var figure4 = scrolly4.select('figure');
var article4 = scrolly4.select('article');
var step4 = article4.selectAll('.step');

var scrolly5 = main.select('#scrolly5');
var figure5 = scrolly5.select('figure');
var article5 = scrolly5.select('article');
var step5 = article5.selectAll('.step');

// initialize the scrollama
var scroller1 = scrollama();
var scroller2 = scrollama();
var scroller3 = scrollama();
var scroller4 = scrollama();
var scroller5 = scrollama();

const stepH = Math.floor(window.innerHeight * 1.6);
const figureHeight = window.innerHeight *0.8
const figureMarginTop = (window.innerHeight - figureHeight) / 2

// generic window resize listener event
function handleResize() {
  console.log("handling resize")
  // 1. update height of step elements
  step1.style('height', stepH + 'px');
  step2.style('height', stepH + 'px');
  step3.style('height', stepH + 'px');
  step4.style('height', stepH + 'px');
  step5.style('height', stepH + 'px');
  
  console.log(figureHeight, figureMarginTop, stepH)

  figure1
    .style('height', figureHeight + 'px')
    .style('top', figureMarginTop + 'px')
    .style("z-index", 1);
  
  figure2
    .style('height', figureHeight + 'px')
    .style('top', figureMarginTop + 'px')
    .style("z-index", 1);

  figure3
    .style('height', figureHeight + 'px')
    .style('top', figureMarginTop + 'px')
    .style("z-index", 1);

  figure4
    .style('height', figureHeight + 'px')
    .style('top', figureMarginTop + 'px')
    .style("z-index", 1);

  figure5
    .style('height', figureHeight + 'px')
    .style('top', figureMarginTop + 'px')
    .style("z-index", 1);


  article1.style("z-index", 3);
  article2.style("z-index", 3);
  article3.style("z-index", 3);
  article4.style("z-index", 3);
  article5.style("z-index", 3);

  // 3. tell scrollama to update new element dimensions
  scroller1.resize();
  scroller2.resize();
  scroller3.resize();
  scroller4.resize();
  scroller5.resize();

}

// scrollama event handlers
function handleStepEnter1(response) {
  
  switch(response.index) {
    case 0:
      // code block
      myMap.removeLayer(pLayer1)
      myMap.removeLayer(pLayer2)
      myMap.addLayer(pLayer1)
      myMap.addLayer(pLayer2)
      break;
    case 1:
      // code block
      myMap.removeLayer(pLayer1)
      myMap.removeLayer(pLayer2)
      myMap.addLayer(pLayer1)
      break;
    case 2:
      myMap.removeLayer(pLayer1)
      myMap.removeLayer(pLayer2)
      myMap.addLayer(pLayer2)
      break;
    case 3:
      break;

    default:
      // code block
  }


  // add color to current step only
  step1.classed('is-active', function (d, i) {
    return i === response.index;
  })

  // // update graphic based on step
  // figure1.select('p').text(response.index + 1);

}

function handleStepEnter2(response) {

  switch(response.index) {
    case 0:
      // code block
      emphasizeTrace1('rgba(31, 119, 180, 1)')
      emphasizeTrace2('rgba(255, 127, 14, 1)');
      break;
    case 1:
      // code block
      emphasizeTrace1('rgba(31, 119, 180, 1.0)')
      emphasizeTrace2('rgba(255, 127, 14, 0.25)');
      break;
    case 2:
      emphasizeTrace1('rgba(31, 119, 180, 0.25)');
      emphasizeTrace2('rgba(255, 127, 14, 1)');
      break;
    case 3:
      emphasizeTrace1('rgba(31, 119, 180, 1)');
      emphasizeTrace2('rgba(255, 127, 14, 1)');
      break;

    default:
      // code block
  }
  // response = { element, direction, index }

  // add color to current step only
  step2.classed('is-active', function (d, i) {
    return i === response.index;
  })

  // // update graphic based on step
  // figure2.select('p').text(response.index + 1);

}

function handleStepEnter3(response) {
  // response = { element, direction, index }

  // add color to current step only
  step3.classed('is-active', function (d, i) {
    return i === response.index;
  })

}

function handleStepEnter4(response) {
  var lolli = document.getElementById("lollipop-container");
  var lolliHeight = document.getElementById('lollipop1').clientHeight;

  // switch(response.index) {
  //   case 0:
  //     //lolli1.style.maxHeight = "100%";
  //     lolli.style.transform = "translate(0px, 0px)";
  //     //lolli2.style.maxHeight = "0%";
  //     // code block
  //     break;
  //   case 2:
  //     // code block
  //     lolli.style.transform = `translate(0px, -${lolliHeight}px)`;
  //     //lolli1.style.maxHeight = "0%";
  //     //lolli2.style.maxHeight = "100%";
  //     break;

  //   default:
  // }
  // response = { element, direction, index }

  // add color to current step only
  step4.classed('is-active', function (d, i) {
    return i === response.index;
  })

  // update graphic based on step
  //figure3.select('p').text(response.index + 1);

}

function handleStepEnter5(response) {
  // response = { element, direction, index }

  // add color to current step only
  step5.classed('is-active', function (d, i) {
    return i === response.index;
  })

}



function setupStickyfill() {
  d3.selectAll('.sticky').each(function () {
    Stickyfill.add(this);
  });
}

function init() {

  var midpoint = Math.floor(window.innerHeight * 0.5) + "px"
  setupStickyfill();

  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();

  // 2. setup the scroller passing options
  // 		this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller1.setup({
    step: '#scrolly1 article .step',
    offset: midpoint,

    // set to true to see debug horizontal line
    debug: false,
  })
    .onStepEnter(handleStepEnter1)

  scroller2.setup({
    step: '#scrolly2 article .step',
    offset: midpoint,

    // set to true to see debug horizontal line
    debug: false,
  })
    .onStepEnter(handleStepEnter2)

  scroller3.setup({
    step: '#scrolly3 article .step',
    offset: midpoint,

    // set to true to see debug horizontal line
    debug: false,
  })
    .onStepEnter(handleStepEnter3)

  scroller4.setup({
    step: '#scrolly4 article .step',
    offset: midpoint,

    // set to true to see debug horizontal line
    debug: false,
  })
    .onStepEnter(handleStepEnter4)

  scroller5.setup({
    step: '#scrolly5 article .step',
    offset: midpoint,

    // set to true to see debug horizontal line
    debug: false,
  })
    .onStepEnter(handleStepEnter5)


  // setup resize event
  window.addEventListener('resize', handleResize);
}

// kick things off
init();


