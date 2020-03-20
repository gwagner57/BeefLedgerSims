var Breeder = new cLASS({
  Name: "Breeder",
  supertypeName: "oBJECT",
  label: "Breeders",
  shortLabel: "brdr",
  properties: {
    "capacity": { range: "PositiveInteger", label: "Capacity", shortLabel: "cap"},
    "prefBuyer": { range: "Feedlot", label: "Pref. buyer", shortLabel: "prefB", optional:true},
    "atFeedlotEntryAge": { range: "PositiveInteger"},
    "cattle": { range: "Cattle", label: "Cattle", shortLabel: "catl", minCard: 0, maxCard: Infinity}
  }
});
