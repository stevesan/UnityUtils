//----------------------------------------
//  A simple event-like system which allows you to route an event
//  to any function of a target object.
//  When the connectable triggers an event, all game objects
//  connected to that event will get sent the message of their choosing.
//----------------------------------------

#pragma strict

class Connection
{
    var target:GameObject;
    var event:String;
    var message:String;
}
var connections:Connection[];

private var dynamicConnections = new List.<Connection>();

function TriggerEvent( event:String )
{
    for( con in connections )
    {
        if( con.target != null && con.event == event )
            con.target.SendMessage(con.message, this.gameObject);
    }

    for( con in dynamicConnections )
    {
        if( con.target != null && con.event == event )
            con.target.SendMessage(con.message, this.gameObject);
    }
}

function AddListener(target:GameObject, event:String, message:String)
{
    var c = new Connection();
    c.target = target;
    c.event = event;
    c.message = message;
    dynamicConnections.Add(c);
}

function AddListener( target:GameObject, eventAndMsg:String )
{
    AddListener( target, eventAndMsg, eventAndMsg );
}
