function delegateToBoard(notification)
{
    var added = new Notification(notification).addedLabel(/delegate/i);
    var list_split = added.card.board().list("Reference").card("Delegate").description().split("\n");
    var target_list = new Trellinator().board(list_split[0]).list(list_split[1]);
    var share = list_split[2];
    var copy = added
    .card()
    .archive()
    .copyToList(target_list,"top");
    copy.attachment("View in Gmail").remove();
    var link = copy.attachment("All Attachments").link();
    DriveApp.getFolderById(new RegExp("https://.*/folders/(.+)").exec(link)[1]).addViewer(share);
}

function addNewBenkoBoardUserToGlobalCommandGroup()
{
  Trellinator.addBoardToGlobalCommandGroup(new Trellinator().board("NAME"),"Benko Boards");
}

function createNewBenkoBoardInstanceForTrellinator()
{
  var source = DriveApp.getFolderById("1boB-KXGYQPAoXWHQN_ZyoB7zqIKrlt4T");
  var target = DriveApp.createFolder("Benko Board by The Procedure People");
  createNewBenkoBoardInstanceForTrellinator.copyFolder(source,target);
  source.removeEditor(Session.getActiveUser().getEmail());
  target.getFoldersByName("Code").next().addEditor("iain.dooley@theprocedurepeople.com");
}

createNewBenkoBoardInstanceForTrellinator.copyFolder = function(source,target)
{
  var folders = source.getFolders();
  var files   = source.getFiles();
  
  while(files.hasNext()) {
    var file = files.next();
    file.makeCopy(file.getName(), target);
  }
  
  while(folders.hasNext()) {
    var subFolder = folders.next();
    var folderName = subFolder.getName();
    var targetFolder = target.createFolder(folderName);
    createNewBenkoBoardInstanceForTrellinator.copyFolder(subFolder, targetFolder);
  }  
}

/***** FUNCTIONS to move priorities over to the left *****/
function shiftTomorrowToToday(params,signature)
{
    var board = new Board(params);

    try
    {
        board.moveAllCards(board.list(RegExp("Tomorrow \\([0-9]+\\)")),board.list(new RegExp("If I have time today \\([0-9]+\\)")));
    }
  
    catch(e)
    {
      writeInfo_("Caught exception moving all cards in shiftTomorrowToToday: "+e);
    }
  
    push(dateFourAmTomorrow(),{functionName: "shiftTomorrowToToday",parameters: params},signature);
}

function shiftThisWeek(params,signature)
{
    var board = new Board(params);

    try
    {
        //Move from This week to if I have time today
        board.moveAllCards(board.list(new RegExp("This week \\([0-9]+\\)")),board.list(new RegExp("If I have time today \\([0-9]+\\)")));
    }
  
    catch(e)
    {
    }
  
    try
    {
        //Move from Next week to This week
        board.moveAllCards(board.list(new RegExp("Next week \\([0-9]+\\)")),board.list(new RegExp("This week \\([0-9]+\\)")));
    }
  
    catch(e)
    {
    }

    push(thisSunday1159pm(),{functionName: "shiftThisWeek",parameters: params},signature);
}

function shiftThisMonth(params,signature)
{
    var board = new Board(params);

    try
    {
        //Move from This month to if I have time today
        board.moveAllCards(board.list(new RegExp("This month \\([0-9]+\\)")),board.list(new RegExp("If I have time today \\([0-9]+\\)")));
    }
  
    catch(e)
    {
    }
  
    try
    {
        //Move from Next month to This month
        board.moveAllCards(board.list(new RegExp("Next month \\([0-9]+\\)")),board.list(new RegExp("This month \\([0-9]+\\)")));
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
        notif.actionOnDueDateAdded("remindOnDueDate",signature);
    }
  
    catch(e)
    {
        notif.listCardWasCreatedIn();
        notif.actionOnDueDate("remindOnDueDate",signature);
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
      notif.listAfter();
      computeListTotals(notification,signature);
    }
    
    catch(e)
    {
      computeListTotalById(notif.updatedList());
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
        var notif = Notification.fromDueDateAction(params);
        var card = notif.card();
        card.moveTo({list: new RegExp("Priority \\([0-9]+\\)"),position:"top"});
      
        if(card.labels().findByName("Remind").length())
            card.postComment("@"+notif.board().name()+" you asked me to remind you about this");
      
        computeListTotal(notif.board().data.id,"Priority");
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
