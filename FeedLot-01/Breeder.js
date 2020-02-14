var Breeder = new cLASS({
  Name: "Breeder",
  shortLabel: "brdr",
  supertypeName: "oBJECT",
  properties: {
    "capacity": { range: "PositiveInteger", label: "Capacity", shortLabel: "cap"},
    "atFeedlotEntryAge": { range: "PositiveInteger"},
    "cattle": { range: "Cattle", label: "Cattle", shortLabel: "catl", minCard: 0, maxCard: Infinity}
  }
});
