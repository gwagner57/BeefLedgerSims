/*******************************************************
 Simulation Parameters
********************************************************/
sim.scenario.simulationEndTime = 5*360;  // 3 years
sim.scenario.idCounter = 3001;  // start value of auto IDs (for cattle objects)
//sim.scenario.randomSeed = 2345;  // optional
sim.config.createLog = false;
sim.config.visualize = false;
//sim.config.suppressInitialStateUI = true;
//sim.config.runInMainThread = true;  // for debugging
/*******************************************************
 Simulation Model
********************************************************/
sim.model.time = "discrete";
sim.model.timeUnit = "D"; // days

sim.model.objectTypes = ["Cattle", "Breeder", "Feedlot"];
sim.model.eventTypes = ["Restocking", "Purchase", "Sale"];

var DwgModelTypeEL = new eNUMERATION( "DwgModelTypeEL",
    ["constant DWG", "age-based DWG"] );

sim.model.v.DwgModelType =  {  // 1 = constant DWG, 2 = age-based DWG
  range: DwgModelTypeEL,
  label: "Daily Weight Gain (DWG) model type",
  hint: "How the Daily Weight Gain (DWG) is modeled",
  initialValue: 2
};
sim.model.v.birthWeightAverage =  {
  range: "Decimal",
  decimalPlaces: 1,
  hint: "Average birth weight (kg)",
  initialValue: 38.0
};
sim.model.v.birthWeightStdDev =  {
  range: "Decimal",
  decimalPlaces: 1,
  hint: "Std. deviation birth weight (kg)",
  initialValue: 5.0
};
/*
sim.model.v.preWeaningDwgAverage =  {
  range: "Decimal",
  decimalPlaces: 1,
  hint: "Pre-weaning average daily weight gain (g)",
  initialValue: 759.0
};
sim.model.v.preWeaningDwgStdDev =  {
  range: "Decimal",
  decimalPlaces: 1,
  hint: "Pre-weaning std. deviation daily weight gain (g)",
  initialValue: 100.0
};
*/
sim.model.v.postWeaningDwgAverage =  {
  range: "Decimal",
  decimalPlaces: 1,
  hint: "Post-weaning average daily weight gain (g)",
  initialValue: 550.0
};
sim.model.v.postWeaningDwgStdDev =  {
  range: "Decimal",
  decimalPlaces: 1,
  hint: "Prost-weaning std. deviation daily weight gain (g)",
  initialValue: 150.0
};
sim.model.v.nmrOfFeedlots =  {
  range: "PositiveInteger",
  label: "Number of feedlots",
  initialValue: 2
};
sim.model.v.nmrOfBreedersPerFeedlot =  {
  range: "PositiveInteger",
  label: "Nmr of breeders/feedlot",
  initialValue: 30
};
sim.model.v.breederCapacityMin =  {
  range: "PositiveInteger",
  hint: "Minimum breeder capacity (*100)",
  initialValue: 3
};
sim.model.v.breederCapacityMax =  {
  range: "PositiveInteger",
  hint: "Maximum breeder capacity (*100)",
  initialValue: 7
};
sim.model.v.feedlotCapacityMin =  {
  range: "PositiveInteger",
  hint: "Minimum feedlot capacity (*100)",
  initialValue: 5
};
sim.model.v.feedlotCapacityMax =  {
  range: "PositiveInteger",
  hint: "Maximum feedlot capacity (*100)",
  initialValue: 10
};
sim.model.v.feedlotEntryAgeThreshold =  {
  range: "PositiveInteger",
  unit: "mo",
  label: "Entry age",
  hint: "Feedlot entry age threshold (mo)",
  initialValue: 26
};
sim.model.v.feedlotExitAgeThreshold =  {
  range: "PositiveInteger",
  unit: "mo",
  label: "Exit age",
  hint: "Feedlot exit age (mo)",
  initialValue: 30
};
sim.model.v.purchaseMinBatchSize =  {
  range: "PositiveInteger",
  hint: "Purchase minimum batch size",
  initialValue: 20
};
sim.model.v.feedlotDwgAverage =  {
  range: "Decimal",
  decimalPlaces: 1,
  hint: "Feedlot average daily weight gain (g)",
  initialValue: 1200.0
};
sim.model.v.feedlotDwgStdDev =  {
  range: "Decimal",
  decimalPlaces: 1,
  hint: "Feedlot std. deviation daily weight gain (g)",
  initialValue: 400.0
};
sim.model.v.saleMinBatchSize =  {
  range: "PositiveInteger",
  hint: "Sale minimum batch size",
  initialValue: 12
};
sim.model.v.restockingThresholdPercent =  {
  range: "PositiveInteger",
  hint: "Threshold (in percent of capacity) for restocking",
  initialValue: 75
};
sim.model.v.carcassPricePerKg =  {
  range: "Decimal",
  decimalPlaces: 2,
  hint: "Carcass price per kg (AUD)",
  initialValue: 6.50
};
sim.model.v.carcassWeightFactor =  {
  range: "Decimal",
  decimalPlaces: 2,
  label: "Carc. weight factor",
  hint: "Carcass weight factor",
  initialValue: 0.6
};
/***************************************************************************/
sim.model.f.DWG = function (age) {
  const entryAge = sim.v.feedlotEntryAgeThreshold;
  if (age < (entryAge + 1) * 30) return rand.normal( 1400, 300);
  else if (age < (entryAge + 2) * 30) return rand.normal( 1200, 300);
  else if (age < (entryAge + 3) * 30) return rand.normal( 1000, 300);
  else if (age < (entryAge + 4) * 30) return rand.normal( 800, 300);
  else return rand.uniformInt( 0, 500);
};
/***************************************************************************/
sim.model.OnEachTimeStep = function () {
  var breeders = cLASS["Breeder"].instances,
      feedlots = cLASS["Feedlot"].instances;
  /*********************************************************************
   ***  Process breeders data
   ********************************************************************/
  // compute maxEntryCapacity
  Object.keys( feedlots).forEach( function (objIdStr) {
    var feedlot = feedlots[objIdStr];
    feedlot.maxEntryCapacity = Math.max( 0, feedlot.capacity - feedlot.cattle.length);
  });
  Object.keys( breeders).forEach( function (objIdStr) {
    var breeder = breeders[objIdStr],
        feedlot = breeder.prefBuyer,
        upperBound = breeder.capacity - breeder.cattle.length,
        nmrOfNewBornCalves = rand.uniformInt( 0, upperBound);
    for (let i=0; i < breeder.cattle.length; i++) {
      let c = breeder.cattle[i];
      // take care of daily weight gain
      c.weight += rand.normal( sim.v.postWeaningDwgAverage, sim.v.postWeaningDwgStdDev) / 1000;
      // test if cattle passes feedlot entry age threshold
      if (sim.time - c.bornOn === sim.v.feedlotEntryAgeThreshold * 30) {
        // update "atFeedlotEntryAge"
        breeder.atFeedlotEntryAge++;
      }
    }
    const tooYoungIndex = breeder.cattle.findIndex( c =>
        sim.time - c.bornOn < sim.v.feedlotEntryAgeThreshold * 30);
    if (breeder.atFeedlotEntryAge !== tooYoungIndex) {
      console.log("sim.time: ",sim.time, "tooYoungIndex: ",tooYoungIndex, "atFeedlotEntryAge", breeder.atFeedlotEntryAge);
    }
    if (feedlot) {  // breeder has a preferred buyer
      // test if there are enough feedlot-mature cattle and no purchase event has already been scheduled
      if (breeder.atFeedlotEntryAge >= sim.v.purchaseMinBatchSize &&
          !sim.FEL.getEventsOfType("Purchase").some( function (evt) {
            return evt.breeder.id === breeder.id;
          }) &&
          sim.v.purchaseMinBatchSize <= feedlot.maxEntryCapacity
      ) {
        const tooYoungIndex = breeder.cattle.findIndex( c =>
            sim.time - c.bornOn < sim.v.feedlotEntryAgeThreshold * 30);
        let purchaseBatchSize = 0;
        if (tooYoungIndex === -1) {
          purchaseBatchSize = Math.min( breeder.cattle.length, feedlot.maxEntryCapacity);
        } else {
          purchaseBatchSize = Math.min( tooYoungIndex, feedlot.maxEntryCapacity);
        }
        // extract and remove the first purchaseBatchSize elements
        let feedlotEntryBatch = breeder.cattle.splice( 0, purchaseBatchSize);
        feedlot.maxEntryCapacity -= purchaseBatchSize;
        // deduct number of transferred cattle from atFeedlotEntryAge counter
        breeder.atFeedlotEntryAge -= purchaseBatchSize;
        let batchWeight = feedlotEntryBatch.reduce((w,c) => w + c.weight, 0);
        let pricePerKg = 0;
        let maxPurchasePricePerKg = feedlot.getMaxPurchasePricePerKg();
        let minSalePricePerKg = breeder.getMinSalePricePerKg();
        if (minSalePricePerKg <= maxPurchasePricePerKg) {
          pricePerKg = Math.round( (minSalePricePerKg + maxPurchasePricePerKg) / 2 * 100) / 100;
          sim.stat.avgPricePerKgFeedlotEntry = (sim.stat.nmrOfEntries * sim.stat.avgPricePerKgFeedlotEntry +
              purchaseBatchSize * pricePerKg) / (sim.stat.nmrOfEntries + purchaseBatchSize);
          sim.scheduleEvent( new Purchase({
            feedlot: feedlot,
            breeder: breeder,
            batchPrice: batchWeight * pricePerKg,
            cattle: feedlotEntryBatch
          }));
        }
      }
    } else { // breeder is not a contract, but only a potential supplier
      // skim off feedlot-mature cattle
      const skimLevel = 100;
      if (breeder.atFeedlotEntryAge > skimLevel) {
        breeder.cattle.splice(0, skimLevel);
        breeder.atFeedlotEntryAge -= skimLevel;
      }
    }
    // take care of daily births
    for (let i=0; i < nmrOfNewBornCalves; i++) {
      let c = new Cattle({
        bornOn: sim.time,
        weight: rand.normal( sim.v.birthWeightAverage, sim.v.birthWeightStdDev),
        phase: CattlePhaseEL.AT_BREEDER
      });
      sim.addObject( c);
      breeder.cattle.push( c);
    }
  });
  /*********************************************************************
   ***  Process feedlots data
   ********************************************************************/
  Object.keys( feedlots).forEach( function (objIdStr) {
    var feedlot = feedlots[objIdStr],
        feedlotExitBatch=[], tooYoungIndex=0, saleBatchSize=0;
    for (let i=0; i < feedlot.cattle.length; i++) {
      let c = feedlot.cattle[i];
      // take care of daily weight gain
      if (sim.v.DwgModelType === 1) {
        c.weight += rand.normal( sim.v.feedlotDwgAverage, sim.v.feedlotDwgStdDev) / 1000;
      } else if (sim.v.DwgModelType === 2) {
        c.weight += sim.model.f.DWG( sim.time - c.bornOn) / 1000;
      }
      // test if cattle passes feedlot exit age
      if (sim.time - c.bornOn === sim.v.feedlotExitAgeThreshold * 30) {
        feedlot.atFeedlotExitAge++;
      }
    }
    // deduct daily feed costs and fixed costs from liquidity
    feedlot.liquidity -= feedlot.feedCostsPerDay * feedlot.cattle.length;
    feedlot.liquidity -= feedlot.fixedCostsPerDay;
    // test if Sale event needs to be created
    if (feedlot.atFeedlotExitAge >= sim.v.saleMinBatchSize &&
        !sim.FEL.getEventsOfType("Sale").some( function (evt) {
          return evt.feedlot.id === feedlot.id;
        })
    ) {
      tooYoungIndex = feedlot.cattle.findIndex( c =>
          sim.time - c.bornOn < sim.v.feedlotExitAgeThreshold*30);
      if (tooYoungIndex === -1) {
        saleBatchSize = feedlot.cattle.length; //Math.min( feedlot.cattle.length, maxExitCapacity);
      } else {
        saleBatchSize = tooYoungIndex; //Math.min( tooYoungIndex, maxExitCapacity);
      }
      // extract and remove the first saleBatchSize elements
      feedlotExitBatch = feedlot.cattle.splice( 0, saleBatchSize);
      // create Sale event
      sim.scheduleEvent( new Sale({
        feedlot: feedlot,
        pricePerKg: sim.v.carcassPricePerKg,
        cattle: feedlotExitBatch
      }));
      // restock weekly if stock is below restockingLevel
      if (sim.time % 7 ===0 && feedlot.cattle.length < feedlot.getRestockingLevel()) {
        sim.scheduleEvent( new Restocking({ feedlot: feedlot}));
      }
    }
  });
};

/*******************************************************
 Define Initial State
********************************************************/
sim.scenario.setupInitialState = function () {
  // preliminary fix (TODO: make sure that sim.time is initialized before invoking setupInitialState
  if (sim.time === undefined) sim.time = 0;
  // check model parameters
  if (sim.v.nmrOfFeedlots > 9) {
    console.log("Number of feedlots must not exceed 9.");
    sim.v.nmrOfFeedlots = 9;
  }
  if (sim.v.nmrOfBreedersPerFeedlot > 100) {
    console.log("Number of breeders per feedlot must not exceed 100.");
    sim.v.nmrOfBreedersPerFeedlot = 100;
  }
  // create potential supplier pool (breeders with cattle)
  for (let i=1; i <= sim.v.nmrOfBreedersPerFeedlot*sim.v.nmrOfFeedlots; i++) {
    let breeder = new Breeder({
      id: 1000+i,
      capacity: rand.uniformInt( sim.v.breederCapacityMin, sim.v.breederCapacityMax) * 100,
      cattle: []
    });
    // breeders are stocked between 75% and 100% of their capacity
    let occupancyRate = rand.uniformInt( 75, 100);
    let nmrOfCattle = Math.round( breeder.capacity * occupancyRate/100);
    sim.addObject( breeder);
    for (let j=0; j < nmrOfCattle; j++) {
      // born between 26 mo ago and now
      let birthDay = -rand.uniformInt( sim.time,
          Math.abs(sim.time - sim.v.feedlotEntryAgeThreshold * 30));
      try {
        let c = new Cattle({
          bornOn: birthDay,
          weight: rand.normal( sim.v.birthWeightAverage, sim.v.birthWeightStdDev) +
          (sim.time - birthDay) * sim.v.postWeaningDwgAverage / 1000,
          phase: CattlePhaseEL.AT_BREEDER
        });
        sim.addObject( c);
        breeder.cattle.push( c);
        // test if cattle passes feedlot entry age threshold
        if (sim.time - c.bornOn >= sim.v.feedlotEntryAgeThreshold * 30) {
          // update "atFeedlotEntryAge"
          breeder.atFeedlotEntryAge++;
        }
      } catch (e) {
        console.log( e);
      }
    }
    // negative values mean c1 comes before c2
    breeder.cattle.sort( (c1,c2) => c1.bornOn - c2.bornOn);
  }
  // create feedlots
  for (let i=1; i <= sim.v.nmrOfFeedlots; i++) {
    let feedlotCapacity = rand.uniformInt( sim.v.feedlotCapacityMin, sim.v.feedlotCapacityMax) * 100;
    let feedlot = new Feedlot({
      id: i,
      name: "feedlot" + i,
      capacity: feedlotCapacity,
      liquidity: 400000 + 1000 * feedlotCapacity,
      feedCostsPerDay: 3.2, fixedCostsPerDay: 500,
      cattle: [],
      potSuppliers: [],
      prefSuppliers: []
    });
    sim.addObject( feedlot);
    // create preferred suppliers (breeders with cattle)
    for (let j=1; j <= sim.v.nmrOfBreedersPerFeedlot; j++) {
      let breeder = new Breeder({
        id: 100 + (i-1)*sim.v.nmrOfBreedersPerFeedlot + j,
        capacity: rand.uniformInt( sim.v.breederCapacityMin, sim.v.breederCapacityMax) * 100,
        cattle: []
      });
      breeder.prefBuyer = feedlot;
      feedlot.prefSuppliers.push( breeder);
      // breeders are stocked between 75% and 100% of their capacity
      let occupancyRate = rand.uniformInt( 75, 100);
      let nmrOfCattle = Math.round( breeder.capacity * occupancyRate/100);
      sim.addObject( breeder);
      for (let k=0; k < nmrOfCattle; k++) {
        // born between 26 mo ago and now
        let birthDay = -rand.uniformInt( sim.time,
            Math.abs(sim.time - sim.v.feedlotEntryAgeThreshold * 30));
        try {
          let c = new Cattle({
            bornOn: birthDay,
            weight: rand.normal( sim.v.birthWeightAverage, sim.v.birthWeightStdDev) +
            (sim.time - birthDay) * sim.v.postWeaningDwgAverage / 1000,
            phase: CattlePhaseEL.AT_BREEDER
          });
          sim.addObject( c);
          breeder.cattle.push( c);
          // test if cattle passes feedlot entry age threshold
          if (sim.time - c.bornOn >= sim.v.feedlotEntryAgeThreshold * 30) {
            // update "atFeedlotEntryAge"
            breeder.atFeedlotEntryAge++;
          }
        } catch (e) {
          console.log( e);
        }
      }
      // negative values mean c1 comes before c2
      breeder.cattle.sort( (c1,c2) => c1.bornOn - c2.bornOn);
    }
    // assign potential suppliers (breeders)
    for (let j=1; j <= sim.v.nmrOfBreedersPerFeedlot; j++) {
      feedlot.potSuppliers.push( sim.objects[ 1000 + (i-1)*sim.v.nmrOfBreedersPerFeedlot + j]);
    }
    }
};
/*******************************************************
 Define Output Statistics Variables
 ********************************************************/
sim.model.statistics = {
  "stockFeedlot1": {range:"NonNegativeInteger", showTimeSeries: true,
      label:"Feedlot 1 stock", expression: () => sim.objects["1"].cattle.length
  },
  "stockFeedlot2": {range:"NonNegativeInteger", showTimeSeries: true,
    label:"Feedlot 2 stock", expression: () => sim.objects["2"].cattle.length
  },
  "liquidityFeedlot1": {objectType:"Feedlot", objectIdRef: 1, timeSeriesScalingFactor: 0.0001, unit:"AUD",
      property:"liquidity", showTimeSeries: true, label:"Feedlot 1 liquidity"},
  "liquidityFeedlot2": {objectType:"Feedlot", objectIdRef: 2, timeSeriesScalingFactor: 0.0001, unit:"AUD",
      property:"liquidity", showTimeSeries: true, label:"Feedlot 2 liquidity"},
  "capacityFeedlot1": {objectType:"Feedlot", objectIdRef: 1, property:"capacity",
      computeOnlyAtEnd: true, label:"Feedlot 1 capacity"},
  "capacityFeedlot2": {objectType:"Feedlot", objectIdRef: 2, property:"capacity",
      computeOnlyAtEnd: true, label:"Feedlot 2 capacity"},
/*
  "stockAtBreeders": {range:"NonNegativeInteger", showTimeSeries: true, label:"Breeders' stock",
      expression: function () {
        var cattle = cLASS["Cattle"].instances, count=0;
        for (let i=0; i < Object.keys( cattle).length; i++) {
          let c = cattle[Object.keys( cattle)[i]];
          if (c.phase === CattlePhaseEL.AT_BREEDER) count++;
        }
        return count
      }
  },
*/
  "avgPricePerKgFeedlotEntry": {
    range: "Decimal", showTimeSeries: true, timeSeriesScalingFactor: 100,
    label: "Avg. price/kg feedlot entry", hint: "Price per kg (AUD)",
    unit:"AUD", initialValue: 3.0
  },

  "cumulativeEntryWeight": {range:"Decimal"},
  "nmrOfEntries": {range:"NonNegativeInteger"},
  "averageEntryWeight": { range: "Decimal", // label:"Avg. entry weight",
    computeOnlyAtEnd: true, decimalPlaces: 1, unit: "kg",
    expression: () => sim.stat.cumulativeEntryWeight / sim.stat.nmrOfEntries
  },
  "cumulativeExitWeight": {range:"Decimal"},
  "nmrOfExits": {range:"NonNegativeInteger"},
  "averageExitWeight": { range: "Decimal", // label:"Avg. exit weight",
    computeOnlyAtEnd: true, decimalPlaces: 1, unit: "kg",
    expression: () => sim.stat.cumulativeExitWeight / sim.stat.nmrOfExits
  },
  "maxSalesBatchSize": {range:"NonNegativeInteger", //label:"Max. sales batch size"
  },
  "cumulativeExitAge": {range:"NonNegativeInteger"},
  "avgAgeAtExit": { range: "Decimal", //label:"Avg. age at exit",
    computeOnlyAtEnd: true, decimalPlaces: 1, unit: "mo",
    expression: () => sim.stat.cumulativeExitAge / sim.stat.nmrOfExits
  },
  "maxExitAge": { range: "Decimal", //label:"Max. age at exit",
    decimalPlaces: 1, unit: "mo"
  },
};

/*******************************************************
 Define an experiment
 ********************************************************/
sim.experiment.id = 1;
sim.experiment.experimentNo = 1;  // sequence number relative to simulation scenario
sim.experiment.title = "Test";
sim.experiment.replications = 10;
sim.experiment.seeds = [123, 234, 345, 456, 567, 678, 789, 890, 901, 1012];
/*
sim.experiment.parameterDefs = [
  {name:"arrivalEventRate", values:[0.4, 0.5, 0.6]}
];
sim.experiment.storeEachExperimentScenarioRun = true;
sim.experiment.timeSeriesStatisticsVariables = ["arrivedCustomers","departedCustomers"];
*/

/*******************************************************
 Define the observation UI
 ********************************************************/
sim.config.observationUI.type = "SVG";
sim.config.observationUI.canvas.width = 800;
sim.config.observationUI.canvas.height = 400;
//Allows background styling (not needed here)
//sim.config.observationUI.canvas.style = "background-color:yellow";
/*
sim.config.observationUI.fixedElements = {
  "LemonadePitcher": {
    shapeName: "polyline",
    shapeAttributes: {points: "200,100 200,150 250,150 250,100"},
    style: "fill:none; stroke:black; stroke-width:3"
  }
};
*/
sim.config.observationUI.objectViews = {
  "feedlot1": {shapeName: "circle",
    // CSS style rules for the SVG element
    style: "fill:orange; stroke-width:0",
    // attribute-value slots of an SVG shape, using fixed values or expressions
    shapeAttributes: {
      // defining fixed values for the attributes of an SVG shape
      cx: 300, cy: 200,
      r: function (fl) {return Math.floor( fl.cattle.length / 5);}
    }
  },
  "feedlot2": {shapeName: "circle",
    // CSS style rules for the SVG element
    style: "fill:olive; stroke-width:0",
    // attribute-value slots of an SVG shape, using fixed values or expressions
    shapeAttributes: {
      // defining fixed values for the attributes of an SVG shape
      cx: 600, cy: 200,
      r: function (fl) {return Math.floor( fl.cattle.length / 5);}
    }
  },
};
/*
sim.config.observationUI.eventAppearances = {
  "DailyDemand": {
    //sound: {duration: 1000, source:"12/300/80 14/200/90"},
    view: {  // an event view is a web animation of a DOM element
      imageFile: "customers.svg",
      style: "width:300px; height:300px; position:absolute; left:-30%; top:135px;",
      keyframes: [{left:'-30%'}, {left:'80%'}],
      duration: 1000,  // ms
      //iterations: Infinity,
      //fill:
    }
  },
  "EndOfDay": {
    view: {  // an event view is a web animation of a DOM element
      domElem: function () {return sim.visualEl;},  // the visualization container element
      keyframes: [{backgroundColor:'lightgray'}, {backgroundColor:'darkslategrey'}],
      duration: 1000  // ms
    }
  }
};
*/
