var CattlePhaseEL = new eNUMERATION( "CattlePhaseEL",
    ["at breeder", "at feedlot", "slaughtered"] );
	
var Cattle = new cLASS({
  Name: "Cattle",
  shortLabel: "catl",
  supertypeName: "oBJECT",
  properties: {
    "bornOn": { range: "NonNegativeInteger", label: "Born on", shortLabel: "born"},
    "weight": { range: "PositiveDecimal", displayDecimalPlaces:2, label: "Weight", shortLabel: "weight"},
    "phase": { range: CattlePhaseEL, label: "Phase", shortLabel: "phase"},
    "carcassWeight": { range: "PositiveDecimal", displayDecimalPlaces:2, label: "Carcass weight", shortLabel: "carcwt", optional:true},
    "daysOnFeed": { range: "NonNegativeInteger", label: "Days on feed", shortLabel: "dFeed", optional:true}
  }
});
