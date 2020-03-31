/**
 * @type {cLASS}
 */
var Sale = new cLASS({
  Name: "Sale",
  shortLabel: "sale",
  supertypeName: "eVENT",
  properties: {
    "feedlot": {range: "Feedlot", shortLabel: "fl"},
    "pricePerKg": { range: "PositiveDecimal", label: "Batch price", shortLabel: "pr"},
    "cattle": { range: "Cattle", label: "Sold cattle", minCard: 0, maxCard: Infinity}
  },
  methods: {
    "onEvent": function () {
      var followupEvents=[];
      this.feedlot.atFeedlotExitAge -= this.cattle.length;
      for (let i=0; i < this.cattle.length; i++) {
        let c = this.cattle[i];
        c.phase = CattlePhaseEL.SLAUGHTERED;
        c.carcassWeight = c.weight * sim.v.carcassWeightFactor;
        this.feedlot.liquidity += c.carcassWeight * this.pricePerKg;
        // update statistics
        sim.stat.nmrOfExits++;
        sim.stat.cumulativeExitWeight += c.weight;
        sim.stat.cumulativeExitAge += (sim.time - c.bornOn) / 30;
        sim.stat.maxExitAge = Math.max( sim.stat.maxExitAge, (sim.time - c.bornOn) / 30);
        if (sim.stat.minSalesBatchSize === 0) sim.stat.minSalesBatchSize = this.cattle.length;
        else sim.stat.minSalesBatchSize = Math.min( sim.stat.minSalesBatchSize, this.cattle.length);
        if (sim.stat.maxSalesBatchSize === 0) sim.stat.maxSalesBatchSize = this.cattle.length;
        else sim.stat.maxSalesBatchSize = Math.max( sim.stat.maxSalesBatchSize, this.cattle.length);
      }
      return followupEvents;
    }
  }
});
