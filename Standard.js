/***** 1. .Remind on due date ********/
//Call when a due date is added to a card
function remindOnDueDate(notification)
{
    var trigger_signature = notification.cardId+"remindOnDueDate";
    TriggerLib.clear(trigger_signature);

    if(notification.cardLabels.indexOf("Remind") != -1)
        TriggerLib.push(notification.dueDate,{functionName: postReminder,parameters: notification},trigger_signature);
}
//Called by TriggerLib on the due date
function postReminder(notification)
{
    new Card(notification.idCard).postComment("@"+notification.boardName+" you asked me to remind you about this");
}

/***** 2. .Remind to Follow up *******/
//Call when a card is moved into a list
function remindToFollowUp(notification)
{
    if(notification.listName == "Follow Up")
        new Card(notification.cardId).setDue("in 3 working days");
}

/****** 3. .Make due dates Priority *****/
//Call when a due date is added to a card
function makeDueDatePriority(notification)
{
    var trigger_signature = notification.cardId+"makeDueDatePriority";
    TriggerLib.clear(trigger_signature);
    TriggerLib.push(notification.dueDate,{functionName: moveCardToPriority,parameters: notification},trigger_signature);
}

function moveCardToPriority(notification)
{
    new Card(notification.cardId).moveTo({list:"Priority",position:2});
}

/****** 4. .Shift tomorrow to today *****/
//Need to run this to establish execution ... somehow!
//The parameter passed in here, should be the board name for which this is being established
function recurAt4amDaily(board_id)
{
    TriggerLib.push("4am tomorrow",{functionName: shiftTomorrowToToday,parameters: {board_id: board_id}},"recurAt4amDaily");
}

function shiftTomorrowToToday(params)
{
    new Board(params.board_id).moveAllCards({from: new RegExp("Tomorrow \\([0-9]+\\)"),to: new RegExp("Today \\([0-9]+\\)")});
    computeListTotal(params.board_id,"Tomorrow");
    computeListTotal(params.board_id,"Today");
}

/******* 5. .Shift this week ********/
//Need to run this to establish execution ... somehow!
//The parameter passed in here, should be the board name for which this is being established
function recurAtMidnightWeekly(board_id)
{
    TriggerLib.push("this sunday at 11:59pm",{functionName: shiftThisWeek,parameters: {board_id: board_id}},"recurAtMidnightWeekly");
}

function shiftThisWeek(params)
{
    //Move from This week to if I have time today
    new Board(params.board_id).moveAllCards({from: new RegExp("This week \\([0-9]+\\)"),to: new RegExp("If I have time today \\([0-9]+\\)")});
    //Move from Next week to This week
    new Board(params.board_id).moveAllCards({from: new RegExp("Next week \\([0-9]+\\)"),to: new RegExp("This week \\([0-9]+\\)")});
    //Update the list totals
    computeListTotal(params.board_id,"This week");
    computeListTotal(params.board_id,"Next week");
    computeListTotal(params.board_id,"If I have time today");
}

/******** 6. .Shift this month *********/
//Need to run this to establish execution ... somehow!
//The parameter passed in here, should be the board name for which this is being established
function recurAt4amMonthly(board_id)
{
    TriggerLib.push("4am on the first of next month",{functionName: shiftThisMonth,parameters: {board_id: board_id}},"recurAt4amMonthly");
}

function shiftThisMonth(params)
{
    //Move from This month to if I have time today
    new Board(params.board_id).moveAllCards({from: new RegExp("This month \\([0-9]+\\)"),to: new RegExp("If I have time today \\([0-9]+\\)")});
    //Move from Next month to This month
    new Board(params.board_id).moveAllCards({from: new RegExp("Next month \\([0-9]+\\)"),to: new RegExp("This month \\([0-9]+\\)")});
    //Update the list totals
    computeListTotal(params.board_id,"This month");
    computeListTotal(params.board_id,"Next month");
    computeListTotal(params.board_id,"If I have time today");
}

/********* X. List Totals (DashCards Replacement) ***********/
function computeListTotalOnMovedCard(notification)
{
    //Indicates a card was moved
    if(notification.action.data.listAfter)
    {
        computeListTotalById(new List(notification.action.data.listAfter));
        computeListTotalById(new List(notification.action.data.listBefore));
    }
}

/******** Tools and Utilities *******/
function computeListTotal(board_id,list_name)
{
    var list = new Board({id: board_id}).list({name: new RegExp(list_name+" \\([0-9]+\\)")});
    computeListTotalById(list);
}

function computeListTotalById(list)
{
    var list_name = list.name();
    var num_exp = new RegExp("(.+) \\([0-9]+\\)","gi")

    try
    {
        var list_base_name = num_exp.exec(list_name)[1];
        var cards = list.countCards();
        list.rename(list_base_name+" ("+cards+")");
    }

    catch(e)
    {
        writeInfo_("Error computing list total: "+e);
    }
}
