#pragma strict

var outColor = new Color(0,0,0,1);
var inColor = new Color(1,1,1,1);
var fadeAmount:FadeAmount = null;
private var anim : tk2dSprite = null;

function Awake () {
	anim = GetComponent( tk2dSprite );
//	origColor = anim.color;
}

function SetFadeAmount( t:float ) {
	anim.color = Color.Lerp( outColor, inColor, t );
}

function Update () {
	if( fadeAmount != null ) {
		SetFadeAmount(fadeAmount.GetFadeAmount());
	}
}