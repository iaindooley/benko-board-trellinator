//SHORTLISTING
//When a card is added to a list named "([0-9]+) days? .*" clear all previous executions for this card and schedule it to move back to Inbox in that number of days
function scheduleMoveCardToBenkoBoardInbox(notification,signature)
{
    var card = new Notification(notification).movedCard();
    
    if(parts = /([0-9]+) days?.*/.exec(card.currentListName()))
    {
        var sig = signature+"-scheduleMoveCardToBenkoBoardInbox-"+card.id();
        ExecutionQueue.clear(sig);
        ExecutionQueue.push("actionMoveCardToBenkoBoardInbox",{id: card.id()},sig,Trellinator.now().addDays(parseInt(parts[1])));
    }
}

function actionMoveCardToBenkoBoardInbox(card)
{
    var card = new Card(card);
    card.moveToList(card.board().list(/Inbox.*/),"top");
}
