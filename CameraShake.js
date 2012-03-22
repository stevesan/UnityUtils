#pragma strict

var shaking = true;
var shakeScale = Vector3(1,1,1);

private var origPos : Vector3;

function Start () {
	origPos = transform.position;
}

function Update () {

	if( shaking )
	{
		transform.position = origPos +
			Vector3.Scale( Random.insideUnitSphere, shakeScale );
	}

}