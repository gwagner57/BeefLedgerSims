/*******************************************************
 Simulation Parameters
********************************************************/
sim.scenario.simulationEndTime = 3*360;  // 3 years
sim.scenario.idCounter = 1001;  // start value of auto IDs
//sim.scenario.randomSeed = 2345;  // optional
sim.config.createLog = false;
//sim.config.suppressInitialStateUI = true;
sim.config.runInMainThread = true;  // for debugging
/*******************************************************
 Simulation Model
********************************************************/
sim.model.time = "discrete";
sim.model.timeUnit = "D"; // days

sim.model.objectTypes = ["Cattle", "Breeder", "Feedlot"];
sim.model.eventTypes = ["Restocking", "Purchase", "Sale"];

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
sim.model.v.postWeaningDwgAverage =  {
  range: "Decimal",
  decimalPlaces: 1,
  hint: "Post-weaning average daily weight gain (g)",
  initialValue: 600.0
};
sim.model.v.postWeaningDwgStdDev =  {
  range: "Decimal",
  decimalPlaces: 1,
  hint: "Prost-weaning std. deviation daily weight gain (g)",
  initialValue: 50.0
};
sim.model.v.nmrOfBreeders =  {
  range: "PositiveInteger",
  label: "Number of breeders",
  initialValue: 2  //20
};
sim.model.v.breederCapacityMin =  {
  range: "PositiveInteger",
  hint: "Minimum breeder capacity",
  initialValue: 3 //100
};
sim.model.v.breederCapacityMax =  {
  range: "PositiveInteger",
  hint: "Maximum breeder capacity",
  initialValue: 5 //500
};
sim.model.v.feedlotEntryAge =  {
  range: "PositiveInteger",
  label: "Entry age",
  hint: "Feedlot entry age (mo)",
  initialValue: 2 //26
};
sim.model.v.feedlotExitAge =  {
  range: "PositiveInteger",
  label: "Exit age",
  hint: "Feedlot exit age (mo)",
  initialValue: 4 //30
};
sim.model.v.purchaseMinBatchSize =  {
  range: "PositiveInteger",
  hint: "Purchase minimum batch size",
  initialValue: 3 //10
};
sim.model.v.avgPurchasePrice =  {
  range: "Decimal",
  decimalPlaces: 2,
  hint: "Average purchase price per cattle (AUD)",
  initialValue: 1258.0
};
sim.model.v.feedlotDwgAverage =  {
  range: "Decimal",
  decimalPlaces: 1,
  hint: "Feedlot average daily weight gain (g)",
  initialValue: 1600.0
};
sim.model.v.feedlotDwgStdDev =  {
  range: "Decimal",
  decimalPlaces: 1,
  hint: "Feedlot std. deviation daily weight gain (g)",
  initialValue: 100.0
};
sim.model.v.saleMinBatchSize =  {
  range: "PositiveInteger",
  hint: "Sale minimum batch size",
  initialValue: 5 //10
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
  initialValue: 0.8
};

sim.model.OnEachTimeStep = function () {
  var breeders = cLASS["Breeder"].instances,
      feedlots = cLASS["Feedlot"].instances,
      feedlot = sim.objects["1"];  // assuming that there is only one
  /*********************************************************************
   ***  Process breeders data
   ********************************************************************/
  Object.keys( breeders).forEach( function (objIdStr) {
    var breeder = breeders[objIdStr], c=null,
        maxEntryCapacity = feedlot.capacity - feedlot.cattle.length,
        feedlotEntryBatch=[], tooYoungIndex=0, purchaseBatchSize=0,
        upperBound = breeder.capacity - breeder.cattle.length,
        nmrOfNewBornCalves = rand.uniformInt( 0, upperBound);
    for (let i=0; i < breeder.cattle.length; i++) {
      c = breeder.cattle[i];
      // take care of daily weight gain
      c.weight += rand.normal( sim.v.postWeaningDwgAverage, sim.v.postWeaningDwgStdDev) / 1000;
      // test if cattle passes feedlot entry age
      if (sim.time - c.bornOn === sim.v.feedlotEntryAge*30) {
        // update "atFeedlotEntryAge"
        breeder.atFeedlotEntryAge++;
      }
    }
    // test if Purchase event needs to be created
    if (breeder.atFeedlotEntryAge >= sim.v.purchaseMinBatchSize &&
        !sim.FEL.getEventsOfType("Purchase").some( function (evt) {
          return evt.breeder.id === breeder.id;
        }) &&
        sim.v.purchaseMinBatchSize <= maxEntryCapacity
    ) {
      tooYoungIndex = breeder.cattle.findIndex(c =>
          sim.time - c.bornOn < sim.v.feedlotEntryAge*30);
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
        batchPrice: purchaseBatchSize * sim.v.avgPurchasePrice,
        cattle: feedlotEntryBatch
      }));
      breeder.atFeedlotEntryAge -= purchaseBatchSize;
    }
    // take care of daily births
    for (let i=0; i < nmrOfNewBornCalves; i++) {
      c = new Cattle({
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
    var feedlot = feedlots[objIdStr], c=null,
        feedlotExitBatch=[], tooYoungIndex=0, saleBatchSize=0;
    for (let i=0; i < feedlot.cattle.length; i++) {
      c = feedlot.cattle[i];
      // take care of daily weight gain
      c.weight += rand.normal( sim.v.feedlotDwgAverage, sim.v.feedlotDwgStdDev) / 1000;
      // test if cattle passes feedlot exit age
      if (sim.time - c.bornOn === sim.v.feedlotExitAge*30) {
        feedlot.atFeedlotExitAge++;
      }
    }
    // deduct feedCostsPerDay from liquidity
    feedlot.liquidity -= feedlot.feedCostsPerDay * feedlot.cattle.length;
    // test if Purchase event needs to be created
    if (feedlot.atFeedlotExitAge >= sim.v.saleMinBatchSize &&
        !sim.FEL.getEventsOfType("Sale").some( function (evt) {
          return evt.feedlot.id === feedlot.id;
        })
    ) {
      tooYoungIndex = feedlot.cattle.findIndex( cattle =>
          sim.time - cattle.bornOn < sim.v.feedlotExitAge*30);
      if (tooYoungIndex === -1) {
        saleBatchSize = feedlot.cattle.length; //Math.min( feedlot.cattle.length, maxExitCapacity);
      } else {
        saleBatchSize = tooYoungIndex; //Math.min( tooYoungIndex, maxExitCapacity);
      }
      // extract and remove the first saleBatchSize elements
      feedlotExitBatch = feedlot.cattle.splice(0, saleBatchSize);
      // create Sale event
      sim.scheduleEvent( new Sale({
        feedlot: 1,
        pricePerKg: sim.v.carcassPricePerKg,
        cattle: feedlotExitBatch
      }));
      feedlot.atFeedlotExitAge -= saleBatchSize;
    }
  });
}

/*******************************************************
 Define Initial State
********************************************************/
sim.scenario.initialState.objects = {
  "1": {typeName: "Feedlot", name:"feedlot", capacity: 500, liquidity: 100000, feedCostsPerDay: 3.2,
        cattle:[], potSuppliers: [], prefSuppliers: []}
};
sim.scenario.setupInitialState = function () {
  var breeder=null, maxNmrOfBirths=0;
  for (let i=1; i <= sim.v.nmrOfBreeders; i++) {
    breeder = new Breeder({
      id: 100+i,
      capacity: rand.uniformInt( sim.v.breederCapacityMin, sim.v.breederCapacityMax),
	  cattle: []
    });
    sim.addObject( breeder);
  }
};
/*******************************************************
 Define Output Statistics Variables
 ********************************************************/
sim.model.statistics = {
  /*
  "feedlotStockSize": {range:"NonNegativeInteger", showTimeSeries: true, label:"Feedlot stock size",
      expression: function () {
        return sim.objects["1"].cattle.length
    }
  },
  */
  "liquidity": {objectType:"Feedlot", objectIdRef: 1, unit:"AUD",
    property:"liquidity", showTimeSeries: true, label:"Feedlot liquidity"}
};
