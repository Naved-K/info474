'use strict'

(function() {

  var context = "";
  var regressionConstants = "";

  // wait until window loads to execute code
  window.onload = function() {
    let canvas = document.getElementById('myCanvas');
    context = canvas.getContext("2d");
    fetch("data/admission_predict.json")
      .then(res => res.json())
      .then(data => makeScatterPlot(data));
  }

  // make a scatter plot of the data with the given function
  function makeScatterPlot(data) {
    drawAxesLines(); // draw axes
    let axesLimits = findMinMax(data);
    drawAxesTicks(axesLimits);
    drawAxesLabels(); // label axes
    for (let i = 0; i < data.length; i++) {
      plotCanvasPoint(data[i]);
    }

    /* Cool Points Animation!!!
    for (let i = 0; i < 400; i++) {
      setTimeout(() => {
        plotCanvasPoint(data[i]);
      }, i * 50)
    }
    */
    drawRegressionLine(data);
  }

  function drawAxesLabels() {
    context.fillText("TOEFL Score", 180, 485);
    context.save();
    context.translate(10, 250);
    context.rotate(-Math.PI/2);
    context.fillText("Chance of Admittance", -80, 0);
    context.restore();
  }

  function drawAxesLines() {
    line(50, 50, 50, 450);
    line(50, 450, 500, 450);
  }

  // find the min and max for each axis
  // returns an object with x and y axes min/max
  function findMinMax(data) {
    let greScores = data.map((row) => parseInt(row["TOEFL Score"]));
    let admissionRates = data.map((row) => parseFloat(row["Chance of Admit"]));

    // get x-axis min and max
    let xMax = Math.max.apply(Math, greScores);
    let xMin = Math.min.apply(Math, greScores);

    // round x-axis limits
    xMax = Math.round(xMax*10)/10;
    xMin = Math.round(xMin*10)/10;

    // get y-axis min and max
    let yMax = Math.max.apply(Math, admissionRates);
    let yMin = Math.min.apply(Math, admissionRates);

    // round y-axis limits to nearest 0.05
    yMax = Number((Math.ceil(yMax*20)/20).toFixed(2));
    yMin = Number((Math.ceil(yMin*20)/20).toFixed(2));

    // format axes limits and return it
    let allMaxsAndMins = {
      xMax : xMax,
      xMin : xMin,
      yMax : yMax,
      yMin : yMin
    }
    return allMaxsAndMins;

  }

  // draw the axes ticks on both axes
  function drawAxesTicks(axesLimits) {

    // draw x-axis ticks
    let xMark = axesLimits.xMin; // start a counter with initial value xMin
    for (let x = xMark; x < 500; x += 60) {
        // stop if counter is greater than x-axis max
      if (xMark-2 > axesLimits.xMax) {
        break;
      }
      // draw the counter and label it
      line(x, 440, x, 460);
      // context.fillText(xMark-2, x - 5, 470);
      context.fillText(xMark, x - 5, 470);
      // increment counter
      xMark += 5;
    }

    let yMark = axesLimits.yMin; // start a counter with initial value yMin
    for (let y = 425; y > 50; y -= 25) {
      yMark = Math.round(yMark*100)/100; // round counter to nearest hundredth
      // stop if counter is greater than y-axis max
      if (yMark > axesLimits.yMax) {
        break;
      }
      // draw the counter and label it
      line(40, y, 60, y);
      context.fillText(yMark, 15, y + 5);
      // increment counter
      yMark += 0.05;
    }
  }

  // plot a point at the given x and y coordinate
    function plotPoint(x, y) {
        context.beginPath();
        //context.arc(x, y, 5, 0, 2 * Math.PI, false); old arc
        context.arc(x, y, 3, 0, 2 * Math.PI, false); // made point area smaller
        //context.fillStyle = 'green'; old fill fillStyle
        context.fillStyle = '#4286f4'; // changed color to blue
        context.fill();
        //context.lineWidth = 5; old lineWidth
        context.lineWidth = 1; // made line width smaller
        context.strokeStyle = '#003300';
        context.stroke();
      }

  // draw a line starting from x1,y1 to x2,y2
  function line(x1, y1, x2, y2) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  }

  // plot a json data point on the canvas
  function plotCanvasPoint(point) {
    let canvasPoint = toCanvasPoint(point); // scale data point to canvas point
    plotPoint(canvasPoint.x, canvasPoint.y);
  }

  // convert a data point to canvas coordinates
  function toCanvasPoint(point) {
    xCanvas = (point["TOEFL Score"]-85)*6 + 50// - 285)*6 + 50; // scale the x point
    yCanvas = 450 - (point["Chance of Admit"]-0.3)*500; // - 0.3)*500; // scale the y point
    
    // return new x and y
    return {
      x: xCanvas,
      y: yCanvas
    }
  }

  function drawRegressionLine(data) {
    let toeflScores = data.map((row) => parseInt(row["TOEFL Score"]));
    let admissionRates = data.map((row) => parseFloat(row["Chance of Admit"]));
    let lr = linearRegression(toeflScores, admissionRates)

    minMax = findMinMax(data);

    lxmin = minMax.xMin;
    lxmax = minMax.xMax;

    lymin = lr.b + lr.a * lxmin;
    lymax = lr.b + lr.a * lxmax;

    lxMin = (lxmin - 85)*6 + 50; // scale the x point
    lyMin = 450 - (lymin - 0.3)*500; // scale the y point

    lxMax = (lxmax - 85)*6+ 50; // scale the x point
    lyMax = 450 - (lymax - 0.3)*500; // scale the y point

    context.save();
    context.lineWidth = 5;
    context.strokeStyle = "#000000";
    line(lxMin, lyMin, lxMax, lyMax)
    context.restore();    
  }

  // LINEAR REGRESSION FUNCTIONS
  function linearRegression(independent, dependent) {
    let lr = {};

    let independent_mean = arithmeticMean(independent);
    let dependent_mean = arithmeticMean(dependent);
    let products_mean = meanOfProducts(independent, dependent);
    let independent_variance = variance(independent);

    lr.a = (products_mean - (independent_mean * dependent_mean) ) / independent_variance;

    lr.b = dependent_mean - (lr.a * independent_mean);

    return lr;
}


function arithmeticMean(data) {
    let total = 0;

    // note that incrementing total is done within the for loop
    for(let i = 0, l = data.length; i < l; total += data[i], i++);

    return total / data.length;
}


function meanOfProducts(data1, data2) {
    let total = 0;

    // note that incrementing total is done within the for loop
    for(let i = 0, l = data1.length; i < l; total += (data1[i] * data2[i]), i++);

    return total / data1.length;
}


function variance(data) {
    let squares = [];

    for(let i = 0, l = data.length; i < l; i++)
    {
        squares[i] = Math.pow(data[i], 2);
    }

    let mean_of_squares = arithmeticMean(squares);
    let mean = arithmeticMean(data);
    let square_of_mean = Math.pow(mean, 2);
    let variance = mean_of_squares - square_of_mean;

    return variance;
}

})();