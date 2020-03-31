var Breeder = new cLASS({
  Name: "Breeder",
  supertypeName: "oBJECT",
  label: "Breeders",
  properties: {
    "capacity": { range: "PositiveInteger", label: "Capacity", shortLabel: "cap"},
    "prefBuyer": { range: "Feedlot", label: "Pref. buyer", shortLabel: "prefB", optional:true},
    "atFeedlotEntryAge": { range: "PositiveInteger"},
    "avgSalePricePerKg": { range: "Decimal", initialValue: 3.0},
    "cattle": { range: "Cattle", label: "Cattle", minCard: 0, maxCard: Infinity}
  },
  methods: {
    "getCapacityUtilization": function () {
      return this.cattle.length / this.capacity;
    },
    "getMinSalePricePerKg": function () {
      var minSalePricePerKg = sim.stat.avgPricePerKgFeedlotEntry;
      if (this.atFeedlotEntryAge/this.capacity > 0.1) {
        minSalePricePerKg -= minSalePricePerKg * 0.01  // 1% discount
      } else if (this.atFeedlotEntryAge/this.capacity < 0.05) {
        minSalePricePerKg += minSalePricePerKg * 0.01  // 1% increase
      }
      return minSalePricePerKg;
    }
  }
});
