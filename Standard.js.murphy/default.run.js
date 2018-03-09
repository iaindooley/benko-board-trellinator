const murphy = require("murphytest");
const md5 = require("md5");
const fs = require("fs");
eval(murphy.load(__dirname,"../../trellinator-libs/Card.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Board.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/List.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Label.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/Checklist.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/TrelloApi.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/TestConnector.js"));
eval(murphy.load(__dirname,"../../trellinator-libs/IterableCollection.js"));
eval(murphy.load(__dirname,"../../trellinator/TrigTest.js"));
eval(murphy.load(__dirname,"../../trellinator/Supporting.js"));
eval(murphy.load(__dirname,"../Standard.js"));
eval(murphy.load(__dirname,"./sample_notifications.js"));
TestConnector.test_base_dir = __dirname;

triggerInit(__dirname);
scheduleDueDateReminder(new_date,"newCardScheduleDueDatereminder");
scheduleDueDateReminder(updated_date,"updateCardScheduleDueDatereminder");

if(TrigTest.used_fixture_file_names.length != 2)
    console.log("Got the incorrect number of trigger fixture files");

testTriggerFixture("Thu Mar 29 2018 12:00:00 GMT+1100 (AEDT)",1);
testTriggerFixture("Fri Mar 30 2018 12:00:00 GMT+1100 (AEDT)",0);

function testTriggerFixture(datestr,index)
{
    try
    {
        var parts1 = fs.readFileSync(TrigTest.used_fixture_file_names[index]).toString().split(":::");
    
        if(parts1[0] != datestr)
            console.log("Got incorrect date for first trigger fixture. Expected: "+datestr+" got: "+parts1[0]);
    
    }
    
    catch(e)
    {
        console.log("Exception testing trigger: "+index+" for "+datestr);
        console.log(e);
    }
}

triggerInit(__dirname);
var params = {board: new_date.model,card: new_date.action.data.card};
remindOnDueDate(params,md5("updateCardremindOnDueDate"));
var params = {board: updated_date.model,card: updated_date.action.data.card};
remindOnDueDate(params,md5("updateCardremindOnDueDate"));
