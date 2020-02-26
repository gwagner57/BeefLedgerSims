/**
 * @type {cLASS}
 */
var Purchase = new cLASS({
  Name: "Purchase",
  shortLabel: "purch",
  supertypeName: "eVENT",
  properties: {
    "feedlot": {range: "Feedlot"},
    "breeder": {range: "Breeder", shortLabel: "brdr"},
    "batchPrice": { range: "PositiveDecimal", label: "Batch price", shortLabel: "price"},
    "cattle": { range: "Cattle", label: "Purchased cattle", shortLabel: "ctl", minCard: 0, maxCard: Infinity},
  },
  methods: {
    "onEvent": function () {
      var followupEvents=[], c=null;
      // deduct number of transferred cattle from atFeedlotEntryAge counter
      this.breeder.atFeedlotEntryAge -= this.cattle.length;
      // process transferred cattle
      for (let i=0; i < this.cattle.length; i++) {
        c = this.cattle[i];
        c.phase = CattlePhaseEL.AT_FEEDLOT;
        // update statistics
        sim.stat.nmrOfEntries++;
        sim.stat.cumulativeEntryWeight += c.weight;
        // test if purchased cattle has already passed feedlot exit age
        if (sim.time - c.bornOn >= sim.v.feedlotExitAgeThreshold * 30) {
          this.feedlot.atFeedlotExitAge++;
        }
      }
      this.feedlot.cattle.push(...this.cattle);  // appending the array this.cattle
      // negative values mean c1 comes before c2
      this.feedlot.cattle.sort( (c1,c2) => c1.bornOn - c2.bornOn);
      // update liquidity
      this.feedlot.liquidity -= this.batchPrice;
      return followupEvents;
    }
  }
});
