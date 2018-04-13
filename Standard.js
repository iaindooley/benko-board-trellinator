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
    var notif = new Notification(notification);

    try
    {
        this.cardDueDateWasAddedTo();
        scheduleDueDateReminder(notification,signature);
    }
    
    catch(e)
    {
        try
        {
            //Check if the card was moved into Follow Up and add a due date if so
            remindToFollowUp(notif.card(),notif.listAfter(),notification,signature);
        }
        
        catch(e)
        {
            writeInfo_("Nothing to update: "+e);
        }
    }
}

function listTotalUpdates(notification,signature)
{
    var notif = new Notification(notification);

    try
    {
        if(notif.listAfter())
            //Update the list heading totals
            computeListTotals(notification,signature);
        //Update totals if list changed
        else
            computeListTotalById(notif.updatedList());
    }
    
    catch(e)
    {
        writeInfo_("List totals not updated: "+e);
    }
}

function globalComputeListTotalsForCardChanges(notification,signature)
{
    try
    {
        computeListTotalById(new Notification(notification).updatedList());
    }
    
    catch(e)
    {
        writeInfo_("No updated list: "+e);
    }
}

/***** TRIGGER on created or copied card *****/
function computeListTotalsForCardChanges(notification,signature)
{
    var notif = new Notification(notification);

    try
    {
        remindToFollowUp(notif.card(),notif.updatedList(),notification,signature);
    }
    
    catch(e)
    {
        writeInfo_("No updated list: "+e);
    }
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

    if(follow_up_regex.test(list.name()))
    {
        var remind_on = new Date().addDays(3);
        card.setDue(remind_on);
        var trigger_signature = signature+card.data.id;
        clear(trigger_signature);
        var params = {board: notification.model,card: notification.action.display.entities.card};
        push(new Date(remind_on),{functionName: "remindOnDueDate",parameters: params},trigger_signature);
    }
}

/********* X. List Totals (DashCards Replacement) ***********/
function computeListTotals(notification,signature)
{
    var notif = new Notification(notification);
    
    try
    {
        computeListTotalById(notif.listAfter());
        computeListTotalById(notif.listBefore());
    }
    
    catch(e)
    {
        writeInfo_("No totals to compute: "+e);
    }
}

//Called by Trigger on the due date
/***** 1. .Remind on due date ********/
/****** 3. .Make due dates Priority *****/
function remindOnDueDate(params,signature)
{
    try
    {
        var card = new Card(params.card);
        card.moveTo({list: new RegExp("Priority \\([0-9]+\\)"),position:"top"});
        computeListTotal(params.board.id,"Priority");
  

        if(card.labels().filterByName("Remind").length())
            card.postComment("@"+params.board.name+" you asked me to remind you about this");
    }
  
    catch(e)
    {
        writeInfo_("No labels present with name Remind: "+e);
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
    var num_exp = new RegExp("(.+) \\([0-9]+\\)","i")

    try
    {
        if(num_exp.test(list_name))
        {
          var list_base_name = num_exp.exec(list_name)[1];
          var cards = list.countCards();
          list.rename(list_base_name+" ("+cards+")");
        }
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
