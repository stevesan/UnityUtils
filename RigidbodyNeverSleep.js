#pragma strict

function Start () {

}

function Update () {
	if( GetComponent.<Rigidbody>() && GetComponent.<Rigidbody>().IsSleeping() )
			GetComponent.<Rigidbody>().WakeUp();
}

