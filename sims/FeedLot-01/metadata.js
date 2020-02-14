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
sim.model.systemNarrative = "On each day, each breeder has a certain number of new born calves. "+
    "A feedlot restocks its cattle stock by purchasing cattle from breeders whenever " +
    "its stock falls below a certain threshold. After feeding the cattle some time, " +
    "they are sold to a slaughterhause.";
sim.model.shortDescription = "The model includes three object types: <i>Cattle</i>, <i>Breeder</i> and " +
    "<i>Feeder</i>, as well as four event types: <i>DailyBirths</i>, <i>Restocking</i>, <i>Purchase</i>, "+
    "and <i>Sale</i>.";
sim.model.license = "CC BY-NC";
sim.model.creator = "Gerd Wagner";
sim.model.created = "2020-02-06";
sim.model.modified = "2020-02-06";
sim.model.contributors = "Valeri Natanelov and Uwe Dulleck";
