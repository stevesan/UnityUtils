#pragma strict

private var origColor:Color;
private var anim : tk2dSprite = null;

function Awake () {
	anim = GetComponent( tk2dSprite );
	origColor = anim.color;
}

function SetFadeAmount( t:float ) {
	anim.color = t*origColor;
}

function Update () {

}