//SHORTLISTING
//When a card is added to a list named "([0-9]+) days? .*" clear all previous executions for this card and schedule it to move back to Inbox in that number of days
function scheduleMoveCardToBenkoBoardInbox(notification,signature)
{
  var card = new Notification(notification).movedCard();
  var sig = benkoBoardScheduledCardSignature(card);
  
  if(!/Coming up.*/.test(card.currentList().name()))
    ExecutionQueue.clear(sig);
  
  if(parts = /([0-9]+) days?.*/.exec(card.currentList().name()))
  ExecutionQueue.push("actionMoveCardToBenkoBoardInbox",{id: card.id()},sig,Trellinator.now().addDays(parseInt(parts[1])));
}

function actionMoveCardToBenkoBoardInbox(card)
{
    var card = new Card(card);
    card.moveToList(card.board().list(/If I have time today.*/),"top");
}
