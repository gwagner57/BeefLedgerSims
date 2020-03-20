var sim = sim || {};
sim.model = sim.model || {};
sim.scenario = sim.scenario || {};
sim.config = sim.config || {};

var oes = oes || {};
oes.ui = oes.ui || {};
oes.ui.explanation = {};
oes.ui.i18n = {transDates:{}, changeDates:{}};

/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "BeefCattleSupplyChain-01";
sim.model.title = "A Beef Cattle Supply Chain with Breeders and Feedlots";
sim.model.systemNarrative = "Feedlots buy cattle from their contract breeders with a minimum age of 26 months at a fixed price of 3.00 AUD/kg, "+
    "feed them until a minimum age of 30 months and then sell them to a slaughterhouse at a fixed price of 6.50 AUD "+
    "per kg carcass weight. On each day, each breeder has a certain number of new born calves. "+
    "As soon as a breeder has a sufficiently large batch of feedlot-mature cattle, it offers them to its contract feedlot, " +
    "which buys it when it has enough free capacity. As soon as a feedlot has a sufficiently large batch of slaughter-mature cattle, " +
    "they are sold to a slaughterhouse. If a feedlot's contract breeders are not able to supply enough cattle for exceeding a level of 75% "+
    "of its total capacity, it checks with its potential suppliers if it can buy additional cattles from them.";
sim.model.shortDescription = "The model includes three object types: <i>Cattle</i>, <i>Breeder</i> and <i>Feedlot</i>, as well as three event types: " +
    "<i>Purchase</i>, <i>Sale</i> and <i>Restocking</i>. Calves are born each day at breeders with a weight of N(38,5) kg. "+
    "They gain N(550,150) g weight each day at breeders, while the daily weight gain at the feedlot is N(1400,300) g when they are still younger, "+
    "and declining to U(0,500) g when they are older. Each <i>Purchase</i> event involves a feedlot, a breeder and a batch of cattle. " +
    "Each <i>Sale</i> event involves a feedlot and a batch of cattle.";
sim.model.license = "CC BY-NC";
sim.model.creator = "Gerd Wagner";
sim.model.created = "2020-03-19";
sim.model.modified = "2020-03-20";
sim.model.contributors = "Valeri Natanelov and Uwe Dulleck";
