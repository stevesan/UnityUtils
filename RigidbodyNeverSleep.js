#pragma strict

function Start () {

}

function Update () {
	if( rigidbody && rigidbody.IsSleeping() )
			rigidbody.WakeUp();
}

