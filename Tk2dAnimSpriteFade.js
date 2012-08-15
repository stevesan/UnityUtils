#pragma strict

private var origColor:Color;
private var anim : tk2dAnimatedSprite = null;

function Awake () {
	anim = GetComponent( tk2dAnimatedSprite );
	origColor = anim.color;
}

function SetFadeAmount( t:float ) {
	anim.color = t*origColor;
}

function Update () {

}