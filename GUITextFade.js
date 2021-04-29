#pragma strict

private var origColor:Color;

function Awake () {
	origColor = GetComponent.<GUIText>().material.color;
}

function SetFadeAmount( t:float ) {
	GetComponent.<GUIText>().material.color.a = t*origColor.a;
}

function Update () {

}
