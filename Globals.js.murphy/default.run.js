const murphy = require("murphytest");
//ADJUST THE PATH TO FIND THE FILES RELATIVE TO YOUR CURRENT DIRECTORY
eval(murphy.load(__dirname,"../../../apps/trellinator/ExecutionQueue.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator/Trellinator.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator/Trigger.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator/TrigTest.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Board.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Card.js")); 
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Attachment.js")); 
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/CheckItem.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Checklist.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Comment.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Exceptions.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/HttpApi.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/IterableCollection.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Label.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/List.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Member.js"));  
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Notification.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/Team.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/TestConnector.js"));
eval(murphy.load(__dirname,"../../../apps/trellinator-libs/TrelloApi.js"));
//INCLUDE ANY OTHER REQUIRED FILES HERE
eval(murphy.load(__dirname,"../Globals.js"));
eval(murphy.load(__dirname,"notifications/default.run.js/comment_added.js"));
//SET SOME MOCKING VARIABLES
TestConnector.test_base_dir = __dirname;
Trellinator.username = "";
/*OPTIONAL
TestConnector.fake_now = new Date("2001-01-01");
TestConnector.prefix = "actual";
ExecutionQueue.fake_push = function(name,params,signature,time)
{

}
*/

//TestConnector.nocache = true;//use this to test performance or do setup/teardown
//ADD YOUR TEST FUNCTIONS HERE
copyComment(comment_added);
