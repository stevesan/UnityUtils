#pragma strict

var flakePrefab : GameObject;

var bounds : Bounds2D;
var numFlakes = 10;

var baseVelocity = Vector3( 0, -0.1, 0 );
var stdevVelocity = Vector3( 0.2, 0, 0 );
class Flake
{
	var obj:GameObject;
	var velocity:Vector3;
	var resetTime:float;

	function Flake( _obj:GameObject, _vel:Vector3 ) 
	{
		obj = _obj;
		velocity = _vel;
	}
}

private var flakes : Flake[];

function ResetFlake( flake:Flake ) : void
{
	flake.obj.transform.localPosition = bounds.RandomPosition();
	flake.resetTime = Time.time + Random.Range( 10.0, 20.0 );
	flake.velocity = baseVelocity + stdevVelocity*Utils.PseudoNormalRandom(0, 1.0);
}

function Start () {
	flakes = new Flake[ numFlakes ];

	for( var i = 0; i < numFlakes; i++ ) {
		var obj = Instantiate( flakePrefab );
		obj.transform.parent = transform;
		flakes[i] = new Flake( obj, Vector3(0,0,0) );
		ResetFlake( flakes[i] );
	}

	// hide prefab
	flakePrefab.renderer.enabled = false;
}

function Update () {
	// time-step all flakes..
	for( var i = 0; i < numFlakes; i++ ) {
		var xform = flakes[i].obj.transform;
		xform.localPosition = bounds.WrapPosition(
				xform.localPosition + flakes[i].velocity*Time.deltaTime );

		//if( flakes[i].resetTime < Time.time ) {
			// reset the flake
			//ResetFlake( flakes[i] );
		//}
	}

}