const murphy = require("murphytest");
eval(murphy.load(__dirname,"../../trellinator-libs/Card.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Board.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/List.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Label.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Checklist.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/TrelloApi.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/HttpApi.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Notification.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Exceptions.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/TestConnector.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/IterableCollection.js"));
eval(murphy.load(__dirname,"../../trellinator/TrigTest.js"));
eval(murphy.load(__dirname,"../../trellinator/ExecutionQueue.js"));
eval(murphy.load(__dirname,"../../trellinator/Supporting.js"));
eval(murphy.load(__dirname,"../Standard.js"));
eval(murphy.load(__dirname,"trello_api_fixtures/notifications/default.run.php/due_card_copied.js"));
eval(murphy.load(__dirname,"trello_api_fixtures/notifications/default.run.php/not_due_card_created.js"));
TestConnector.test_base_dir = __dirname;
ExecutionQueue.fake_push = function(function_name,params,signature,dateobj)
{
    if(dateobj.toLocaleString() != "2018-5-25 16:59:00")
        throw new Error("Got the wrong datetime");
}

try
{
    scheduleDueDateReminder(due_card_copied,"newCardScheduleDueDatereminder");
}

catch(e)
{
    Notification.logException("scheduleDueDateReminder should not have thrown this exception: ",e);
}

ExecutionQueue.fake_push = function(function_name,params,signature,dateobj)
{
    throw new Error("Nothing should have been pushed");
}
try
{
    scheduleDueDateReminder(not_due_card_created,"updateCardScheduleDueDatereminder");
    writeInfo_("scheduleDueDateReminder should have thrown an exception for not due card created");
}

catch(e)
{
    Notification.expectException(InvalidActionException,e);
}
