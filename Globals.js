/* update Card */
function checkOffArchivedCard(notification)
{
    var notif = new Notification(notification);

/* When a card with label "HoZ Linked Card" is archived find the first card linked in the attachments and check item "{boardname}: {triggercardlink}" */
    var arched = notif.archivedCard();
    arched.label(new RegExp("(Benko|HoZ) Linked Card"));
    arched.cardsLinkedInAttachments().first().checkItemByName(new RegExp(".*: "+notif.card().link()));
}

/* add comment to card */
function copyComment(notification)
{
/* When a comment is added to a card with label "HoZ Linked Card" find the first card linked in the attachments and add a comment "{username} said: {commenttext}" */
    var notif = new Notification(notification);
    
    if(!notif.member().notTrellinator())
      return false;
  
    var comment = notif.commentAddedToCard();
    notif.card().label(new RegExp("(Benko|HoZ) Linked Card"));

    try
    {
        notif.card().cardsLinkedInAttachments().each(function(card)
        {
            try
            {
                card.label("Benko Master");

                card.checklist("Linked Cards").items().each(function(item)
                {
                    if(item.name().indexOf(notif.card().link()) > -1)
                        throw card;
                });
            }
            
            catch(e)
            {
                Notification.expectException(InvalidDataException,e);
            }
        });
    }
    
    catch(e)
    {
        Notification.expectException(Card,e);
        e.postComment(notif.member().name()+" said: "+comment.text().replace("@",""));
    }
}

/* update card */
function checkOffSplittedCard(notification)
{
    var notif       = new Notification(notification);
    var split_regex = "Split (.*)";
    
/* When a card with label "Split {*}" is archived, find the card mentioned in the description and check item "{triggercardlink}" in checklist "{labelwildcard1}" */
    if(
        (arch = notif.archivedCard()) && 
        (arch.label(new RegExp(split_regex)))
      )
        arch.cardLinkedInDescription().checkItemByName(notif.card().link());
}

/* add label to card */
function bucket(notification)
{
    var notif = new Notification(notification);
/* When the label "Bucket" is added to a card remove the "Bucket" label and collect cards in list "{triggercardname}" into linked items in checklist "Sub-tasks" and archive list "{triggercardname}" */
    var label = notif.labelAddedToCard("Bucket");
    var trig = notif.card();
    trig.removeLabel(label);
    var list = notif.board().list(trig.name());

    list.cards().each(function(loop)
    {
        trig.addChecklist("Sub-tasks",function(list)
        {
            list.addItem(loop.link());
        });
        
        loop.archive();
    });
    
    list.archive();
}

/* add label to card */
function split(notification)
{
    var notif = new Notification(notification);
/* When the label "Split {*}" is added to a card add list "{triggercardname} Split: {labelwildcard1}" in top position and
convert the checklist "{labelwildcard1}" into linked cards at the bottom of list "{triggercardname} Split: {labelwildcard1}"
copying labels and members and find card with id "{triggercardid}" and remove label "Split {labelwildcard1}" */

    var added_label = notif.labelAddedToCard();
    var board = notif.board();

    if(parts = new RegExp("Split (.*)").exec(added_label.name()))
    {
        try
        {
            var cl = notif.card().checklist(parts[1])
            var list = board.findOrCreateList(notif.card().name()+" Split: "+parts[1]);
            var params = {
                          idLabels: notif.card().labels().transform(function(label)
                                    {
                                        return label.data.id;
                                    }).implodeValues(",")
                         };
            cl.convertIntoLinkedCards(list,params);
            notif.card().removeLabel(added_label);
        }
        
        catch(e)
        {
            Notification.expectException(InvalidDataException,e);
            notif.replyToMember("There was no checklist named: "+parts[1]);
        }
    }
}
