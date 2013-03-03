//----------------------------------------
//  Detects and generates mouse enter/exit events for a given set of game objects.
//----------------------------------------
#pragma strict

class MouseEventManager
{
    interface Listener
    {
        // The renderer's bounds will be used to determine mouse-collision
        function GetBounds() : Bounds;
        function OnMouseEnter() : void;
        function OnMouseExit() : void;
    };

    var enterMessage = "OnMouseEnter";
    var exitMessage = "OnMouseExit";

    // ID of the object the mouse is currently over, -1 if none.
    private var currTargetId = -1;
    private var currTarget:Listener = null;
    private var prevTarget:Listener = null;

    private var targets:List.<Listener> = null;

    function GetCurrentTargetId() : int { return currTargetId; }
    function GetCurrentTarget() : Listener { return currTarget; }

    function SetTargets( _targets:List.<Listener> )
    {
        targets = _targets;
    }

    function Update()
    {
        if( targets == null )
            return;

        if( Camera.main == null )
            return;

        var wsRay = Camera.main.ScreenPointToRay( Input.mousePosition );
        var distToZ0Plane = -wsRay.origin.z / wsRay.direction.z;
        var wsMousePos = wsRay.origin + distToZ0Plane*wsRay.direction;

        currTargetId = -1;

        for( var i = 0; i < targets.Count; i++ )
        {
            var target = targets[i];
            if( target == null )
                continue;

            var bounds = target.GetBounds();

            var testPt = Vector3( wsMousePos.x, wsMousePos.y, bounds.center.z );
            if( bounds.Contains(testPt) )
            {
                currTargetId = i;
                break;
            }
        }

        if( currTargetId >= 0 )
            currTarget = targets[currTargetId];
        else
            currTarget = null;

        if( currTarget != prevTarget )
        {
            if( currTarget != null )
                currTarget.OnMouseEnter();

            if( prevTarget != null )
                prevTarget.OnMouseExit();

            prevTarget = currTarget;
        }
    }
}
