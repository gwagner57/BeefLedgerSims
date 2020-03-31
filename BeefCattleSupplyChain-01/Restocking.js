/**
 * @type {cLASS}
 */
var Restocking = new cLASS({
  Name: "Restocking",
  shortLabel: "restock",
  supertypeName: "eVENT",
  properties: {
    "feedlot": {range: "Feedlot", shortLabel: "fl"}
  },
  methods: {
    "onEvent": function () {
      var followupEvents=[], feedlot = this.feedlot,
          potSuppliers = feedlot.potSuppliers,
          restockQty = feedlot.capacity - feedlot.cattle.length;
      if (restockQty < sim.v.purchaseMinBatchSize) return followupEvents;
      for (let potSuppl of potSuppliers) {
        let purchaseBatchSize=0, feedlotEntryBatch=[];
        if (potSuppl.atFeedlotEntryAge >= sim.v.purchaseMinBatchSize) {
          purchaseBatchSize = Math.min( restockQty, Math.floor( potSuppl.atFeedlotEntryAge / sim.v.purchaseMinBatchSize) *
              sim.v.purchaseMinBatchSize);
          restockQty -= purchaseBatchSize;
          if (restockQty < sim.v.purchaseMinBatchSize) break;
          // extract and remove the first purchaseBatchSize elements
          feedlotEntryBatch = potSuppl.cattle.splice(0, purchaseBatchSize);
          // deduct number of transferred cattle from atFeedlotEntryAge counter
          potSuppl.atFeedlotEntryAge -= purchaseBatchSize;
          // if price agreement, then purchase
          let batchWeight = feedlotEntryBatch.reduce((w,c) => w + c.weight, 0);
          let pricePerKg = 0;
          let maxPurchasePricePerKg = feedlot.getMaxPurchasePricePerKg();
          let minSalePricePerKg = potSuppl.getMinSalePricePerKg();
          if (minSalePricePerKg <= maxPurchasePricePerKg) {
            pricePerKg = Math.round( (minSalePricePerKg + maxPurchasePricePerKg) / 2 * 100) / 100;
            sim.stat.avgPricePerKgFeedlotEntry = (sim.stat.nmrOfEntries * sim.stat.avgPricePerKgFeedlotEntry +
                purchaseBatchSize * pricePerKg) / (sim.stat.nmrOfEntries + purchaseBatchSize);
            sim.scheduleEvent( new Purchase({
              feedlot: feedlot,
              breeder: potSuppl,
              batchPrice: batchWeight * pricePerKg,
              cattle: feedlotEntryBatch
            }));
          }
        }
      }
      return followupEvents;
    }
  }
});
