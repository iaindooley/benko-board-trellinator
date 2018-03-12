var master_benko_board_id = "58f36ea57cdd8c5334a1ffc9";
//MANUALLY INITIALISE THESE - UPDATE THE BOARD ID FIRST
function recurAt4amDaily()
{
    push(dateFourAmTomorrow(),{functionName: "shiftTomorrowToToday",parameters: {id: master_benko_board_id}},"recurAt4amDaily");
}

function recurAtMidnightWeekly()
{
    push(thisSunday1159pm(),{functionName: "shiftThisWeek",parameters: {id: master_benko_board_id}},"recurAtMidnightWeekly");
}

function recurAt4amMonthly(board_id)
{
    push(fourAmOnTheFirst(),{functionName: "shiftThisMonth",parameters: {id: master_benko_board_id}},"recurAt4amMonthly");
}

/***** FUNCTIONS to move priorities over to the left *****/
function shiftTomorrowToToday(params,signature)
{
    try
    {
        new Board(params).moveAllCards({from: new RegExp("Tomorrow \\([0-9]+\\)"),to: new RegExp("If I have time today \\([0-9]+\\)")});
    }
  
    catch(e)
    {
      writeInfo_("Caught exception moving all cards in shiftTomorrowToToday: "+e);
    }
  
    try
    {
        computeListTotal(params.id,"Tomorrow");
        computeListTotal(params.id,"If I have time today");
    }
  
    catch(e)
    {
      writeInfo_("Caught exception computing list totals: "+e);
    }
  
    push(dateFourAmTomorrow(),{functionName: "shiftTomorrowToToday",parameters: params},signature);
}

function shiftThisWeek(params,signature)
{
    try
    {
        //Move from This week to if I have time today
        new Board(params).moveAllCards({from: new RegExp("This week \\([0-9]+\\)"),to: new RegExp("If I have time today \\([0-9]+\\)")});
    }
  
    catch(e)
    {
    }
  
    try
    {
        //Move from Next week to This week
        new Board(params).moveAllCards({from: new RegExp("Next week \\([0-9]+\\)"),to: new RegExp("This week \\([0-9]+\\)")});
    }
  
    catch(e)
    {
    }

    //Update the list totals
    computeListTotal(params.id,"This week");
    computeListTotal(params.id,"Next week");
    computeListTotal(params.id,"If I have time today");
    push(thisSunday1159pm(),{functionName: "shiftThisWeek",parameters: params},signature);
}

function shiftThisMonth(params,signature)
{
    try
    {
        //Move from This month to if I have time today
        new Board(params).moveAllCards({from: new RegExp("This month \\([0-9]+\\)"),to: new RegExp("If I have time today \\([0-9]+\\)")});
    }
  
    catch(e)
    {
    }
  
    try
    {
        //Move from Next month to This month
        new Board(params).moveAllCards({from: new RegExp("Next month \\([0-9]+\\)"),to: new RegExp("This month \\([0-9]+\\)")});
    }
  
    catch(e)
    {
    }
    //Update the list totals
    computeListTotal(params.id,"This month");
    computeListTotal(params.id,"Next month");
    computeListTotal(params.id,"If I have time today");
    push(fourAmOnTheFirst(),{functionName: "shiftThisMonth",parameters: params},signature);
}

/***** TRIGGER on updated card ******/
//updateCard
function updateCardDispatch(notification,signature)
{
    //Indicates a due date was added to the card
    if(notification.action.data.card.due)
        scheduleDueDateReminder(notification,signature);
    //Indicates a card was moved
    else if(notification.action.data.listAfter)
    {
        //Update the list heading totals
        computeListTotals(notification,signature);
        //Check if the card was moved into Follow Up and add a due date if so
        remindToFollowUp(notification.action.display.entities.card,notification.action.data.listAfter,notification,signature);
    }
    //Update totals if list changed
    else
        computeListTotalById(new List(notification.action.data.list));
}

/***** TRIGGER on created or copied card *****/
function computeListTotalsForCardChanges(notification,signature)
{
    computeListTotalById(new List(notification.action.data.list));
    remindToFollowUp(notification.action.display.entities.card,notification.action.data.list,notification,signature);
}

/***** 1. .Remind on due date ********/
/****** 3. .Make due dates Priority *****/
function scheduleDueDateReminder(notification,signature)
{
    var trigger_signature = signature+notification.action.display.entities.card.id;
    clear(trigger_signature);
    var params = {board: notification.model,card: notification.action.display.entities.card};
    push(new Date(notification.action.data.card.due),{functionName: "remindOnDueDate",parameters: params},trigger_signature);
}

/***** 2. .Remind to Follow up *******/
function remindToFollowUp(card,list,notification,signature)
{
    var follow_up_regex = new RegExp("Follow up \\([0-9]+\\)");

    if(follow_up_regex.test(list.name))
    {
        var remind_on = Trigger.xDaysFromNow(3);
        new Card(card).setDue(remind_on.toISOString());
        var trigger_signature = signature+card.id;
        clear(trigger_signature);
        var params = {board: notification.model,card: notification.action.display.entities.card};
        push(new Date(remind_on),{functionName: "remindOnDueDate",parameters: params},trigger_signature);
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
function remindOnDueDate(params,signature)
{
    var card = new Card(params.card);
    card.moveTo({list: new RegExp("Priority \\([0-9]+\\)"),position:"top"});
    computeListTotal(params.board.id,"Priority");
  
    if(card.labels().filterByName("Remind").length())
        card.postComment("@"+params.board.name+" you asked me to remind you about this");
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
    ret.setDate(ret.getDate() + 1)
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
