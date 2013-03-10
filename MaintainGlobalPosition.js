#pragma strict

private var origPos:Vector3;

function Awake()
{
	origPos = transform.position;
}

function Start () {

}

function Update () {

}

function LateUpdate()
{
	transform.position = origPos;
}