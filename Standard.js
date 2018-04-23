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

    push(fourAmOnTheFirst(),{functionName: "shiftThisMonth",parameters: params},signature);
}

/***** 1. .Remind on due date ********/
/****** 3. .Make due dates Priority *****/
function scheduleDueDateReminder(notification,signature)
{
    var notif = new Notification(notification);
  
    try
    {      
        notif.actionOnDueDate("remindOnDueDate",signature);
    }
  
    catch(e)
    {
        writeInfo_("Due date reminder not scheduled: "+e);
    }
}

/***** 2. .Remind to Follow up *******/
function remindToFollowUp(notification,signature)
{
    try
    {
        var notif = new Notification(notification);
        var list = notif.listCardWasAddedTo(new RegExp("Follow up.*"));
        var remind_on = new Date().addDays(3);
        notif.card().setDue(remind_on);
    }
  
    catch(e)
    {
        writeInfo_("Not reminding to follow up: "+e);   
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
          var list_parts = num_exp.exec(list_name);
          var list_base_name = list_parts[1];
          var list_count = parseInt(list_parts[2]);
          var cards = parseInt(list.countCards());
          
          if(cards != list_count)
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
