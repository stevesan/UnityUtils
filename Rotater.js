#pragma strict

var degreesPerSec = Vector3(0,0,90);

function Start () {

}

function Update () {

	transform.eulerAngles += degreesPerSec * Time.deltaTime;

}