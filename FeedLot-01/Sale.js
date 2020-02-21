/**
 * @type {cLASS}
 */
var Sale = new cLASS({
  Name: "Sale",
  shortLabel: "sale",
  supertypeName: "eVENT",
  properties: {
    "feedlot": {range: "Feedlot"},
    "pricePerKg": { range: "PositiveDecimal", label: "Batch price"},
    "cattle": { range: "Cattle", label: "Sold cattle", shortLabel: "ctl", minCard: 0, maxCard: Infinity}
  },
  methods: {
    "onEvent": function () {
      var followupEvents=[], c=null;
      for (let i=0; i < this.cattle.length; i++) {
        c = this.cattle[i];
        c.phase = CattlePhaseEL.SLAUGHTERED;
        c.carcassWeight = c.weight * sim.v.carcassWeightFactor;
        this.feedlot.liquidity += c.carcassWeight * this.pricePerKg;
        // update statistics
        sim.stat.nmrOfExits++;
        sim.stat.cumulativeExitWeight += c.weight;
      }
      return followupEvents;
    }
  }
});
