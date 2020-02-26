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
      this.feedlot.atFeedlotExitAge -= this.cattle.length;
      for (let i=0; i < this.cattle.length; i++) {
        c = this.cattle[i];
        c.phase = CattlePhaseEL.SLAUGHTERED;
        c.carcassWeight = c.weight * sim.v.carcassWeightFactor;
        this.feedlot.liquidity += c.carcassWeight * this.pricePerKg;
        // update statistics
        sim.stat.nmrOfExits++;
        sim.stat.cumulativeExitWeight += c.weight;
        if (sim.stat.minSalesBatchSize === 0) sim.stat.minSalesBatchSize = this.cattle.length;
        else sim.stat.minSalesBatchSize = Math.min( sim.stat.minSalesBatchSize, this.cattle.length);
        if (sim.stat.maxSalesBatchSize === 0) sim.stat.maxSalesBatchSize = this.cattle.length;
        else sim.stat.maxSalesBatchSize = Math.max( sim.stat.maxSalesBatchSize, this.cattle.length);
      }
      return followupEvents;
    }
  }
});
