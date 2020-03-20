var Feedlot = new cLASS({
  Name: "Feedlot",
  label: "Feedlots",
  shortLabel: "fl",
  supertypeName: "oBJECT",
  properties: {
    "capacity": { range: "PositiveInteger", label: "Capacity", shortLabel: "cap"},
    "liquidity": { range: "Decimal", label: "Liquidity"},
    "annualProfit": {range: "Decimal", label: "Annual profit",
      decimalPlaces: 1, historySize: 5},
    "fixedCostsPerDay": { range: "Decimal", label: "Fixed costs / day",
        hint: "Fixed costs per day (TAUD)"},
    "feedCostsPerDay": { range: "Decimal", label: "Feed costs / day",
        hint: "Feed costs per day (TAUD)"},
    "cattle": { range: "Cattle", label: "Cattle", minCard: 0, maxCard: Infinity},
    "potSuppliers": { range: "Breeder", label: "Potential suppliers", minCard: 0, maxCard: Infinity},
    "prefSuppliers": { range: "Breeder", label: "Preferred suppliers", minCard: 0, maxCard: Infinity},
    "atFeedlotExitAge": { range: "PositiveInteger"}
  }
});
