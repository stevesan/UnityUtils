
// Quick component for making game objects do "fly" animations - ie. go from one
// spot to another in a non-linear way, useful for posting scores, etc.

var start : Vector3;
var end : Vector3;
var animSecs : float = 1.0;

var hideOnEnd = true;	// disable rendering when animation is done?

// set this flag to show it before animation
// but next time the anim is triggered, it will be hidden again
private var showUntilNextTrigger = false;	

private var remainSecs : float = 0.0;

function ShowButDonotAnim()
{
	showUntilNextTrigger = true;	
}

function Hide()
{
	showUntilNextTrigger = false;	
}

function StartAnim() {
	showUntilNextTrigger = false;	// reset this flag
	remainSecs = animSecs;
}

function Update () {

	if( remainSecs > 0.0 )
	{
		var alpha = 1 - remainSecs/animSecs;
		// TODO non linear interp
		transform.position = Vector3.Lerp( start, end, alpha*alpha );
			renderer.enabled = true;
		remainSecs -= Time.deltaTime;
	}
	else
	{
		if( showUntilNextTrigger )
			renderer.enabled = true;
		else {	
			if( hideOnEnd )
			{
				renderer.enabled = false;
			}
		}
	}
}