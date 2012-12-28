#pragma strict

var outColor = new Color(1,1,1,0);
var inColor = new Color(1,1,1,1);
var fadeAmount:FadeAmount = null;
private var sprite : tk2dSprite = null;

function Awake () {
	sprite = GetComponent( tk2dSprite );
}

function SetFadeAmount( t:float ) {
	sprite.color = Color.Lerp( outColor, inColor, t );
}

function Update () {
	if( fadeAmount != null ) {
		SetFadeAmount(fadeAmount.GetFadeAmount());
	}
}
