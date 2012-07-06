//----------------------------------------
//  A component that records and manages which colliders are currently colliding
//	with the object.
//----------------------------------------
#pragma strict

var debugNumCols = false;
var debugColor = Color.red;
var debugDrawSecs = 0.1;
var debugContacts = false;

var minNormalY:float = -9999;

// Stores collider -> time of enter
private var col2expire = new Dictionary.<Collider, float>();

function OnCollisionEnter( col : Collision ) : void
{
	OnCollisionStay( col );
}

function OnCollisionStay( col : Collision ) : void
{
	for( var c : ContactPoint in col.contacts ) {
		if( c.normal.y > minNormalY ) {
			col2expire[ c.otherCollider ] = Time.time + Time.deltaTime;

			if( debugContacts ) {
				Debug.DrawRay( c.point, c.normal, debugColor, debugDrawSecs );
			}
		}
	}
}

function OnCollisionExit( col : Collision ) : void
{
	for( var c : ContactPoint in col.contacts ) {
		if( col2expire.ContainsKey( c.otherCollider ) )
			col2expire.Remove( c.otherCollider );
	}
}

function Update()
{
	if( debugNumCols ) {
		Debug.Log('num cols on ' + gameObject.name + ' = ' + col2expire.Count );
	}

	// we need to "expire" collisions, because if colliders are destroyed,
	// OnCollisionExit doesn't fire...
	// we have to do it this way...for dumb reasons...
	var keys = new Array();
	for( var key in col2expire.Keys ) keys.Push(key);
	for( var col in keys ) {
		var expireTime = col2expire[ col ];
		if( expireTime < Time.time ) {
			col2expire.Remove( col );
		}
	}
}
