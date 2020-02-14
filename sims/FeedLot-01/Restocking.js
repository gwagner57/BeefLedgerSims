/**
 * @type {cLASS}
 */
var Restocking = new cLASS({
  Name: "Restocking",
  shortLabel: "restock",
  supertypeName: "eVENT",
  properties: {
    "feeder": {range: "Feeder"}
  },
  methods: {
    "onEvent": function () {
      var followupEvents=[], calve=null;
      return followupEvents;
    }
  }
});
