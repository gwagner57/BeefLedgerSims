var Feedlot = new cLASS({
  Name: "Feedlot",
  shortLabel: "fl",
  supertypeName: "oBJECT",
  properties: {
    "capacity": { range: "PositiveInteger", label: "Capacity"},
    "liquidity": { range: "Decimal", label: "Feed costs per day"},
    "feedCostsPerDay": { range: "Decimal", label: "Feed costs per day"},
    "cattle": { range: "Cattle", label: "Cattle", shortLabel: "cattle", minCard: 0, maxCard: Infinity},
    "potSuppliers": { range: "Breeder", label: "Potential suppliers", minCard: 0, maxCard: Infinity},
    "prefSuppliers": { range: "Breeder", label: "Preferred suppliers", minCard: 0, maxCard: Infinity},
    "atFeedlotExitAge": { range: "PositiveInteger", shortLabel: "exitAge"}
  }
});
