/* Update card */
function scheduleLapsedReminder(notification,signature)
{
/* The moment a card with an incomplete due date is due post comment “@iaindooley why did this lapse?”

Update your HoZ review lapse notifications to add to card instead of mention so that you can archive the mentions separately from the lapses*/
    try
    {
        new Notification(notification).actionOnDueDate(actionLapsedReminder,signature);
    }

    catch(e)
    {
        writeInfo_(e);
    }
}
/* Run from execution queue */
function actionLapsedReminder(params,signature)
{
    if(!params.notification.card().dueComplete())
        params.notification.card().addMember(new Member({username: "iaindooley"}));
}

/* Time trigger next friday at 9am */
function weeklyCatchUp(board,signature)
{
    /*
    Every Friday at 9am Sydney for each card in "Weekly catch up list" without the "Recurring" label create card "Hooked on Zero review with Iain and {cardname}" in list "ToDo" and post comment
    "@{multipliercardname} Hi there!
    
    If you're available Thursday for a meeting at Noffs HQ please tag @iaindooley in a comment with the best time.
    
    Otherwise you can choose a time here that suits you any other day of the week
    
    https://calendly.com/the-procedure-people/noffs-weekly-hoz-review-via-bluejeans
    
    Thanks!
    Iain" and add due date in 7 days
    */
    var board = new Board(board);

    board.list("Weekly catch up list").cards().each(function(card)
    {
        try
        {
            card.label("Recurring");
            Card.create(board.list("ToDo"),{name: "Hooked on Zero review with Iain and "+card.name()})
                .postComment(board.cards().findByName("Weekly HoZ Review Template").first().description().replace("USERNAME",card.name()).replace("LINK","https://calendly.com/the-procedure-people/noffs-weekly-hoz-review"))
                .setDue(Trigger.xDaysFromNow(4));
        }
        
        catch(e)
        {
        }
    });
    var func = {functionName: "weeklyCatchUp",
                parameters: board};
    push(new Date().next("Friday","9:00"),func,signature);
}

/* Update card */
function markAsComplete(notification)
{
    var notif = new Notification(notification);
    
    try
    {
        notif.cardDueDateWasCompletedOn().moveTo({list: "Done",position: "top"});
    }
    
    catch(e)
    {
        writeInfo_("No due date was marked as complete: "+e);
    }
}

/* Update card */
function addChecklist(notification)
{
    var notif = new Notification(notification);
    
    try
    {
        if(new RegExp("Doing.*").test(notif.listCardWasMovedTo().name()))
        {
            notif.board()
                 .list("Info")
                 .card("Checklist Templates")
                 .copyChecklist("HoZ Health Check",notif.card());
        }
    }
    
    catch(e)
    {
        writeInfo_("Card not moved to Doing list: "+e);
    }
}
