var master_benko_board_id = "5a8fbd296df7bb170ae53f15";
//MANUALLY INITIALISE THESE - UPDATE THE BOARD ID FIRST
function recurAt4amDaily()
{
    push(dateFourAmTomorrow(),{functionName: shiftTomorrowToToday,parameters: {board_id: master_benko_board_id}},"recurAt4amDaily");
}

function recurAtMidnightWeekly()
{
    push(thisSunday1159pm(),{functionName: shiftThisWeek,parameters: {board_id: board_id}},"recurAtMidnightWeekly");
}

function recurAt4amMonthly(board_id)
{
    push(fourAmOnTheFirst(),{functionName: shiftThisMonth,parameters: {board_id: master_benko_board_id}},"recurAt4amMonthly");
}

/***** FUNCTIONS to move priorities over to the left *****/
function shiftTomorrowToToday(params)
{
    new Board(params.board_id).moveAllCards({from: new RegExp("Tomorrow \\([0-9]+\\)"),to: new RegExp("Today \\([0-9]+\\)")});
    computeListTotal(params.board_id,"Tomorrow");
    computeListTotal(params.board_id,"Today");
    push(dateFourAmTomorrow(),{functionName: shiftTomorrowToToday,parameters: params},"recurAt4amDaily");
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
    push(thisSunday1159pm(),{functionName: shiftThisWeek,parameters: {board_id: board_id}},"recurAtMidnightWeekly");
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
    push(fourAmOnTheFirst(),{functionName: shiftThisMonth,parameters: {board_id: master_benko_board_id}},"recurAt4amMonthly");
}

/***** TRIGGER on updated card ******/
//updateCard
function updateCardDispatch(notification,signature)
{
    //Indicates a due date was added to the card
    if(notification.action.data.card.due)
        remindOnDueDate(notification,signature);
    //Indicates a card was moved
    else if(notification.action.data.listAfter)
    {
        //Update the list heading totals
        computeListTotals(notification,signature);
        //Check if the card was moved into Follow Up and add a due date if so
        remindToFollowUp(notification,signature);
    }
}

/***** 1. .Remind on due date ********/
/****** 3. .Make due dates Priority *****/
function remindOnDueDate(notification,signature)
{
    var trigger_signature = signature+notification.action.display.entities.card.id;
    clear(trigger_signature);
    push(new Date(notification.action.data.card.due),{functionName: "remindOnDueDate",parameters: notification},trigger_signature);
}

/***** 2. .Remind to Follow up *******/
function remindToFollowUp(notification,signature)
{
    var follow_up_regex = new RegExp("Follow Up \\([0-9]+\\)");

    if(follow_up_regex.test(notification.action.data.listAfter))
    {
        var current_date = new Date();
        var minutes = 72*60;
        var newDateObj = new Date(current_date.getTime() + minutes*60000);
        new Card(notification.action.display.entities.card.id).setDue(newDateObj.toISOString());
    }
}

/********* X. List Totals (DashCards Replacement) ***********/
function computeListTotals(notification,signature)
{
    computeListTotalById(new List(notification.action.data.listAfter));
    computeListTotalById(new List(notification.action.data.listBefore));
}

//Called by Trigger on the due date
/***** 1. .Remind on due date ********/
/****** 3. .Make due dates Priority *****/
function remindOnDueDate(notification)
{
    var card = new Card({id: notification.action.display.entities.card.id});
    card.moveTo({list: new RegExp("Priority \\([0-9]+\\)"),position:"top"});
    computeListTotal(notification.model.id,"Priority");
  
    if(card.labels().filterByName("Remind").length())
        card.postComment("@"+notification.action.memberCreator.username+" you asked me to remind you about this");
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

function dateFourAmTomorrow()
{
    var ret  = new Date();
    ret.setDate(now.getDate() + 1)
    ret.setHours(4);
    ret.setMinutes(0);
    ret.setMilliseconds(0);
    return ret;
}

function thisSunday1159pm()
{
    var ret = new Date();
    ret.setDate(ret.getDate() + (7 - ret.getDay()));
    ret.setHours(23);
    ret.setMinutes(59);
    ret.setMilliseconds(0);
    return ret;
}

function fourAmOnTheFirst()
{
    var now = new Date();
    var ret = new Date(now.getFullYear(), now.getMonth()+1, 1);
    ret.setHours(4);
    ret.setMinutes(0);
    ret.setMilliseconds(0);
    return ret;
}
