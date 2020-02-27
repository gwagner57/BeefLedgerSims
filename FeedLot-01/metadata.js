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
sim.model.name = "FeedLot-01";
sim.model.title = "Cattle Breeders and a Feedlot";
sim.model.systemNarrative = "A feedlot buys cattle from breeders at a minimum age of 26 months, feeds them until a minimum age "+
    "of 30 months and then sells them to a slaughterhouse. On each day, each breeder has a certain number of new born calves. "+
    "As soon as a breeder has a sufficiently large batch of feedlot-mature cattle, it offers them to the feedlot, " +
    "which buys it when it has enough free capacity. As soon as a feedlot has a sufficiently large batch of slaughter-mature cattle, " +
    "they are sold to a slaughterhouse.";
sim.model.shortDescription = "The model includes three object types: <i>Cattle</i>, <i>Breeder</i> and " +
    "<i>Feedlot</i>, as well as two event types: <i>Purchase</i> and <i>Sale</i>. Each Purchase event involves a feedlot, a breeder "+
    "and a batch of cattle. Each Sale event involves a feedlot and a batch of cattle.";
sim.model.license = "CC BY-NC";
sim.model.creator = "Gerd Wagner";
sim.model.created = "2020-02-06";
sim.model.modified = "2020-02-26";
sim.model.contributors = "Valeri Natanelov and Uwe Dulleck";
