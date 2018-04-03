/////////////////////////////////////////////////////
const murphy = require("murphytest");
//////////////////////////////////////////////////////
eval(murphy.load(__dirname,"../WeeklyReview.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Notification.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Board.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Member.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Team.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/List.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Checklist.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Label.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Card.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/TrelloApi.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/TestConnector.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/IterableCollection.js"));
eval(murphy.load(__dirname,"../../trellinator/Trigger.js"));
eval(murphy.load(__dirname,"due_date_added.js"));
//////////////////////////////////////////////////////
TestConnector.test_base_dir   = __dirname;
TestConnector.live_key      = process.argv[2];
TestConnector.live_token    = process.argv[3];
var NoffsParameters = function(){};
NoffsParameters.trellinator_username = "trellinatordev";
var pushed_params = null;

scheduleLapsedReminder(due_date_added,"somesig");
actionLapsedReminder(pushed_params.parameters,"somesig");
weeklyCatchUp({id: "5a938de4e0c2896bd94c7434"},"somesig");

function push(date,params,sig)
{
    pushed_params = params;
};
function clear(){};
