/**
 * @type {cLASS}
 */
var Restocking = new cLASS({
  Name: "Restocking",
  shortLabel: "restock",
  supertypeName: "eVENT",
  properties: {
    "feedlot": {range: "Feedlot"}
  },
  methods: {
    "onEvent": function () {
      var followupEvents=[], feedlot = this.feedlot,
          potSuppliers = feedlot.potSuppliers;
      potSuppliers.forEach( function (potSuppl) {
        var purchaseBatchSize=0, feedlotEntryBatch=[];
        if (potSuppl.atFeedlotEntryAge >= sim.v.purchaseMinBatchSize) {
          purchaseBatchSize = Math.floor( potSuppl.atFeedlotEntryAge / sim.v.purchaseMinBatchSize) *
              sim.v.purchaseMinBatchSize;
          // extract and remove the first purchaseBatchSize elements
          feedlotEntryBatch = potSuppl.cattle.splice(0, purchaseBatchSize);
          // create Purchase event
          followupEvents.push( new Purchase({
            feedlot: feedlot,
            breeder: potSuppl,
            batchPrice: feedlotEntryBatch.reduce((w,c) => w + c.weight, 0) * sim.v.purchasePricePerKg,
            cattle: feedlotEntryBatch
          }));
        }
      });
      return followupEvents;
    }
  }
});
