//-------------------------------------------------------
// Scrollytelling handles scrolling events
//-------------------------------------------------------


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
console.log(scrolly4)
console.log(figure4)
console.log(article4)
console.log(step4)

// initialize the scrollama
var scroller1 = scrollama();
var scroller2 = scrollama();
var scroller3 = scrollama();
var scroller4 = scrollama();

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  var stepH = Math.floor(window.innerHeight * 0.75);
  step1.style('height', stepH + 'px');
  step2.style('height', stepH + 'px');
  step3.style('height', stepH + 'px');
  step4.style('height', stepH + 'px');

  var figureHeight = window.innerHeight / 2
  var figureMarginTop = (window.innerHeight - figureHeight) / 2

  figure1
    .style('height', figureHeight + 'px')
    .style('top', figureMarginTop + 'px');
  
  figure2
    .style('height', figureHeight + 'px')
    .style('top', figureMarginTop + 'px');
  
  figure3
    .style('height', figureHeight + 'px')
    .style('top', figureMarginTop + 'px');

  figure4
    .style('height', figureHeight + 'px')
    .style('top', figureMarginTop + 'px');

  // 3. tell scrollama to update new element dimensions
  scroller1.resize();
}

// scrollama event handlers
function handleStepEnter1(response) {
  console.log(response)
  // response = { element, direction, index }

  // add color to current step only
  step1.classed('is-active', function (d, i) {
    return i === response.index;
  })

  // // update graphic based on step
  // figure1.select('p').text(response.index + 1);

}

function handleStepEnter2(response) {
  console.log(response)
  // response = { element, direction, index }

  // add color to current step only
  step2.classed('is-active', function (d, i) {
    return i === response.index;
  })

  // // update graphic based on step
  // figure2.select('p').text(response.index + 1);

}

function handleStepEnter3(response) {
  console.log(response)
  // response = { element, direction, index }

  // add color to current step only
  step3.classed('is-active', function (d, i) {
    return i === response.index;
  })

  // update graphic based on step
  //figure3.select('p').text(response.index + 1);

}

function handleStepEnter4(response) {
  console.log(response)
  // response = { element, direction, index }

  // add color to current step only
  step4.classed('is-active', function (d, i) {
    return i === response.index;
  })

  // update graphic based on step
  //figure3.select('p').text(response.index + 1);

}



function setupStickyfill() {
  d3.selectAll('.sticky').each(function () {
    Stickyfill.add(this);
  });
}

function init() {

  setupStickyfill();

  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();

  // 2. setup the scroller passing options
  // 		this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller1.setup({
    step: '#scrolly1 article .step',
    offset: 0.33,

    // set to true to see debug horizontal line
    debug: false,
  })
    .onStepEnter(handleStepEnter1)

  scroller2.setup({
    step: '#scrolly2 article .step',
    offset: 0.33,

    // set to true to see debug horizontal line
    debug: false,
  })
    .onStepEnter(handleStepEnter2)

  scroller3.setup({
    step: '#scrolly3 article .step',
    offset: 0.33,

    // set to true to see debug horizontal line
    debug: false,
  })
    .onStepEnter(handleStepEnter3)

  scroller4.setup({
    step: '#scrolly4 article .step',
    offset: 0.33,

    // set to true to see debug horizontal line
    debug: false,
  })
    .onStepEnter(handleStepEnter4)


  // setup resize event
  window.addEventListener('resize', handleResize);
}

// kick things off
init();


