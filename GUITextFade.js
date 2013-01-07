#pragma strict

private var origColor:Color;

function Awake () {
	origColor = guiText.material.color;
}

function SetFadeAmount( t:float ) {
	guiText.material.color.a = t*origColor.a;
}

function Update () {

}
