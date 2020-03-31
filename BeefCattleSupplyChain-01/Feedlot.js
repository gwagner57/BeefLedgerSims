var Feedlot = new cLASS({
  Name: "Feedlot",
  label: "Feedlots",
  shortLabel: "fl",
  supertypeName: "oBJECT",
  properties: {
    "capacity": { range: "PositiveInteger", label: "Capacity"},
    "liquidity": { range: "Decimal", label: "Liquidity", shortLabel: "liq"},
    "fixedCostsPerDay": { range: "Decimal", label: "Fixed costs / day",
        hint: "Fixed costs per day (TAUD)"},
    "feedCostsPerDay": { range: "Decimal", label: "Feed costs / day",
        hint: "Feed costs per day (TAUD)"},
    "cattle": { range: "Cattle", label: "Cattle", minCard: 0, maxCard: Infinity},
    "potSuppliers": { range: "Breeder", label: "Potential suppliers",
        minCard: 0, maxCard: Infinity},
    "prefSuppliers": { range: "Breeder", label: "Preferred suppliers",
        minCard: 0, maxCard: Infinity},
    "atFeedlotExitAge": { range: "PositiveInteger"}
  },
  methods: {
    "getCapacityUtilization": function () {
        return this.cattle.length / this.capacity;
    },
    "getRestockingLevel": function () {
        return Math.floor(sim.v.restockingThresholdPercent / 100 * this.capacity);
    },
    "getMaxPurchasePricePerKg": function () {
      var maxPurchasePricePerKg = sim.stat.avgPricePerKgFeedlotEntry,
          capUtil = this.cattle.length / this.capacity;
      if (capUtil > 0.8) {
        maxPurchasePricePerKg -= maxPurchasePricePerKg * 0.01  // 1% decrease
      } else if (capUtil < 0.6) {
        maxPurchasePricePerKg += maxPurchasePricePerKg * 0.01  // 1% increase
      }
      return maxPurchasePricePerKg;
    }
  }
});

