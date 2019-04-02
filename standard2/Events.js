//WORKFLOWS
/*
When a label is added to a card, if a card in the list "Move to Board" exists with the same name as the label and description matching:

Board: BOARDNAME
List: LISTNAME

move the card to that list on that board
*/
function moveCardToAnotherBoardFromBenkoBoard(notification)
{
    var label = new Notification(notification).addedLabel();
    
    if(parts = /Board: (.+)\nList: (.+)/.exec(label.card().board().list("Move to Board").card(label.name()).description()))
    {
        label.card().moveToList(new Trellinator().board(new RegExp(parts[1]+".*","i")).list(new RegExp(parts[2]+".*","i")));
    }
    
}

//When a label is added to a card, if a card in the list "Canned Responses" exists with the same name as the label, post the description from the found card as a comment on the trigger card
function postCannedResponseOnBenkoBoard(notification)
{
    var label = new Notification(notification).addedLabel();
    label.card().postComment(label.card().board().list("Canned Responses").card(label.name()).description());
}
