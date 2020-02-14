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
      var followupEvents=[];
      for (let i=0; i < this.cattle.length; i++) {
        this.cattle[i].phase = CattlePhaseEL.AT_FEEDLOT;
      }
      this.feedlot.cattle.push(...this.cattle);
      this.feedlot.liquidity -= this.batchPrice;
      return followupEvents;
    }
  }
});
