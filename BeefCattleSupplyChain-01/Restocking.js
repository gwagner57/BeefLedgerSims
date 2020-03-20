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
      var followupEvents=[];
      return followupEvents;
    }
  }
});
