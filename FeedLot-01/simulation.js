/*******************************************************
 Simulation Parameters
********************************************************/
sim.scenario.simulationEndTime = 5*360;  // 3 years
sim.scenario.idCounter = 1001;  // start value of auto IDs
//sim.scenario.randomSeed = 2345;  // optional
sim.config.createLog = false;
//sim.config.suppressInitialStateUI = true;
//sim.config.runInMainThread = true;  // for debugging
/*******************************************************
 Simulation Model
********************************************************/
sim.model.time = "discrete";
sim.model.timeUnit = "D"; // days

sim.model.objectTypes = ["Cattle", "Breeder", "Feedlot"];
sim.model.eventTypes = ["Purchase", "Sale"];

var DwgModelTypeEL = new eNUMERATION( "DwgModelTypeEL",
    ["constant DWG", "age-based DWG"] );

sim.model.v.DwgModelType =  {  // 1 = constant DWG, 2 = age-based DWG
  range: DwgModelTypeEL,
  label: "Daily Weight Gain (DWG) model type",
  hint: "How the Daily Weight Gain (DWG) is modeled",
  initialValue: 1
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
sim.model.v.nmrOfBreeders =  {
  range: "PositiveInteger",
  label: "Number of breeders",
  initialValue: 10
};
sim.model.v.breederCapacityMin =  {
  range: "PositiveInteger",
  hint: "Minimum breeder capacity (*100)",
  initialValue: 2
};
sim.model.v.breederCapacityMax =  {
  range: "PositiveInteger",
  hint: "Maximum breeder capacity (*100)",
  initialValue: 5
};
sim.model.v.feedlotEntryAgeThreshold =  {
  range: "PositiveInteger",
  unit: "mo",
  label: "Entry age",
  hint: "Feedlot entry age threshold (mo)",
  initialValue: 26
};
/*
sim.model.v.feedlotEntryWeightThreshold =  {
  range: "PositiveInteger",
  label: "Entry weight",
  hint: "Feedlot entry weight (kg)",
  initialValue: 500
};
*/
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
  initialValue: 10
};
// avgPurchasePrice
sim.model.v.purchasePricePerKg =  {
  range: "Decimal",
  decimalPlaces: 2,
  unit: "AUD",
  label: "Purchase price/kg",
  hint: "Purchase price per kg (AUD)",
  initialValue: 3.00
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
      feedlots = cLASS["Feedlot"].instances,
      feedlot = sim.objects["1"];  // assuming that there is only one
  /*********************************************************************
   ***  Process breeders data
   ********************************************************************/
  Object.keys( breeders).forEach( function (objIdStr) {
    var breeder = breeders[objIdStr],
        maxEntryCapacity = feedlot.capacity - feedlot.cattle.length,
        feedlotEntryBatch=[], tooYoungIndex=0, purchaseBatchSize=0,
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
    // test if there are enough feedlot-mature cattle and no purchase event has already been scheduled
    if (breeder.atFeedlotEntryAge >= sim.v.purchaseMinBatchSize &&
        !sim.FEL.getEventsOfType("Purchase").some( function (evt) {
          return evt.breeder.id === breeder.id;
        }) &&
        sim.v.purchaseMinBatchSize <= maxEntryCapacity
    ) {
      tooYoungIndex = breeder.cattle.findIndex( c =>
          sim.time - c.bornOn < sim.v.feedlotEntryAgeThreshold * 30);
      if (tooYoungIndex === -1) {
        purchaseBatchSize = Math.min( breeder.cattle.length, maxEntryCapacity);
      } else {
        purchaseBatchSize = Math.min( tooYoungIndex, maxEntryCapacity);
      }
      // extract and remove the first purchaseBatchSize elements
      feedlotEntryBatch = breeder.cattle.splice(0, purchaseBatchSize);
      // create Purchase event
      sim.scheduleEvent( new Purchase({
        feedlot: 1,
        breeder: breeder,
        batchPrice: feedlotEntryBatch.reduce((w,c) => w + c.weight, 0) * sim.v.purchasePricePerKg,
        cattle: feedlotEntryBatch
      }));
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
    if (sim.time % 360 === 1) {
      sim.stat.liquidityValueAtStartOfYear = feedlot.liquidity;
    }
    if (sim.time % 360 === 0) {
      sim.stat.liquidityValueAtEndOfYear = feedlot.liquidity;
      sim.stat.annualProfits.push( sim.stat.liquidityValueAtEndOfYear -
          sim.stat.liquidityValueAtStartOfYear);
    }
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
        feedlot: 1,
        pricePerKg: sim.v.carcassPricePerKg,
        cattle: feedlotExitBatch
      }));
    }
  });
};

/*******************************************************
 Define Initial State
********************************************************/
sim.scenario.initialState.objects = {
  "1": {typeName: "Feedlot", name:"feedlot", capacity: 500, liquidity: 500000,
        feedCostsPerDay: 3.2, fixedCostsPerDay: 500,
        cattle:[], potSuppliers: [], prefSuppliers: []}
};
sim.scenario.setupInitialState = function () {
  if (sim.time === undefined) {
    sim.time = 0;
  }
  // create breeders with cattle
  for (let i=1; i <= sim.v.nmrOfBreeders; i++) {
    let breeder = new Breeder({
      id: 100+i,
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
};
/*******************************************************
 Define Output Statistics Variables
 ********************************************************/
sim.model.statistics = {
  "feedlotStockSize": {range:"NonNegativeInteger", showTimeSeries: true,
      label:"Feedlot stock size", expression: () => sim.objects["1"].cattle.length
  },
  "liquidity": {objectType:"Feedlot", objectIdRef: 1, timeSeriesScalingFactor: 0.0001, unit:"AUD",
      property:"liquidity", showTimeSeries: true, label:"Feedlot liquidity"},
  "liquidityValueAtStartOfYear": {range:"Decimal"},
  "liquidityValueAtEndOfYear": {range:"Decimal"},
  "annualProfits": { range: Array,  label:"Annual profit (AUD)",
    decimalPlaces: 0, initialValue: []
  },
  /*
  "atFeedlotExitAge": {objectType:"Feedlot", objectIdRef: 1,
    property:"atFeedlotExitAge", showTimeSeries: true, label:"atFeedlotExitAge"},
  */
  "cumulativeEntryWeight": {range:"Decimal"},
  "nmrOfEntries": {range:"NonNegativeInteger"},
  /*
  "averageEntryWeight": { range: "Decimal",  label:"Avg. entry weight",
    computeOnlyAtEnd: true, decimalPlaces: 1, unit: "kg",
    expression: () => sim.stat.cumulativeEntryWeight / sim.stat.nmrOfEntries
  },
  */
  "cumulativeExitWeight": {range:"Decimal"},
  "nmrOfExits": {range:"NonNegativeInteger"},
  /*
  "averageExitWeight": { range: "Decimal",  label:"Avg. exit weight",
    computeOnlyAtEnd: true, decimalPlaces: 1, unit: "kg",
    expression: () => sim.stat.cumulativeExitWeight / sim.stat.nmrOfExits
  },
  */
  //"minSalesBatchSize": {range:"NonNegativeInteger",  label:"Min. sales batch size"},
  "maxSalesBatchSize": {range:"NonNegativeInteger",  label:"Max. sales batch size"},
  "cumulativeExitAge": {range:"NonNegativeInteger"},
  "avgAgeAtExit": { range: "Decimal",  label:"Avg. age at exit",
    computeOnlyAtEnd: true, decimalPlaces: 1, unit: "mo",
    expression: () => sim.stat.cumulativeExitAge / sim.stat.nmrOfExits
  },
  "maxExitAge": { range: "Decimal",  label:"Max. age at exit",
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