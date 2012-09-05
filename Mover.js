#pragma strict

//----------------------------------------
//  General component for things that move
//	Meant to be controlled by other components
//----------------------------------------

var speed:float;

private var goalPos:Vector3;
private var direction:Vector3;

enum MoverState { STILL, TARGET, DIRECTION };
private var state = MoverState.STILL;

function MoveTo( p:Vector3 ) : void
{
	goalPos = p;
	state = MoverState.TARGET;
}

function MoveInDirection( d:Vector3 ) : void 
{
	direction = d;
	direction.Normalize();
	state = MoverState.DIRECTION;
}

function GetState() : MoverState { return state; }

function Update () {
	if( state == MoverState.TARGET ) {
		var goalDist = Vector2.Distance( goalPos, transform.position );
		var maxDist = speed * Time.deltaTime;
		if( goalDist > maxDist ) {
			var dir = goalPos - transform.position;
			dir.Normalize();
			transform.position += dir * maxDist;
		}
		else {
			transform.position = goalPos;
			state = MoverState.STILL;
		}
	}
	else if( state == MoverState.DIRECTION ) {
		transform.position += speed * Time.deltaTime * direction;	
	}
}
