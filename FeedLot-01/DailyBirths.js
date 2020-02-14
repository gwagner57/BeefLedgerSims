var DailyBirths = new cLASS({
  Name: "DailyBirths",
  shortLabel: "dB",
  supertypeName: "eVENT",
  properties: {
    "nmrOfCalves": { range: "NonNegativeInteger", label: "Number of calves", shortLabel: "nmr"},
    "breeder": {range: "Breeder", shortLabel: "br"}
  },
  methods: {
    "onEvent": function () {
      var followupEvents=[], calve=null;
      sim.stat.newBornCalves += this.nmrOfCalves;
      for (let i=0; i < this.nmrOfCalves; i++) {
        calve = new Cattle({
            bornOn: this.occTime,
            weight: rand.normal( sim.v.birthWeightAverage, sim.v.birthWeightStdDev),
            phase: CattlePhaseEL.AT_BREEDER
        });
        sim.addObject( calve);
        this.breeder.cattle.push( calve);
      }
      return followupEvents;
    }
  }
});
DailyBirths.randNmrOfCalves = function (uB) {
  return rand.uniformInt( 0, uB);
};
// Any exogenous event type needs to define a static function "recurrence"
DailyBirths.recurrence = function () {
  return 1;
};
// Any exogenous event type needs to define a static function "createNextEvent"
DailyBirths.createNextEvent = function (e) {
  var upperBound = e.breeder.capacity - e.breeder.cattle.length;
  return new DailyBirths({
    nmrOfCalves: DailyBirths.randNmrOfCalves( upperBound),
    breeder: e.breeder,
    delay: DailyBirths.recurrence()
  });
};
