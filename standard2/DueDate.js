//DUE DATE REMINDERS
//When a due date is added to a card not in list "Coming up.*" (but not when it is moved to the board already containing a due date) move it to the "Coming up.*"
function scheduleDueDateActionFromDueDateAdded(notification,signature)
{
  var notif = new Notification(notification);
  var card = notif.addedDueDate();
  card.moveTo(/Coming up.*/);
}

//When a card is added to the "Coming up.*" list, if the card has no due date, automatically set the due date in 3 days, then regardless of whether it had a due date or not sort the list by due date descending
function setDueIn3DaysByDefault(notification)
{
  var card = new Notification(notification).movedCard(/Coming up.*/);
  
  if(!card.due())
    card.setDue(Trellinator.now().addDays(3));

  var trigger_signature = benkoBoardScheduledCardSignature(card);
  clear(trigger_signature);
  var date = new Date(card.due());
  ExecutionQueue.push("moveDueCardToPriorityAndNotifyIfRequired",notification,trigger_signature,date); 
  card.board().list(/Coming up.*/).sort(List.SORT_DATE_ASC);
}

//The moment a card is due move it to the top of the Priority list (whether the due date was added to the card or the card was moved to the board with a due date already) and if it has the label "Remind" post comment "@{boardname}"
function moveDueCardToPriorityAndNotifyIfRequired(notification)
{
    var card = new Notification(notification).card();
    card.moveToList(card.board().list(/Priority.*/),"top");
    
    try
    {
        card.label("Remind");
        card.postComment("@"+card.board().name());
    }
    
    catch(e)
    {
        Notification.expectException(InvalidDataException,e);
    }
}

function benkoBoardScheduledCardSignature(card)
{
  return "benko-board-scheduled-move-"+card.id();
}
