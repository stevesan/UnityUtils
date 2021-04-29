
// Quick component for making game objects do "fly" animations - ie. go from one
// spot to another in a non-linear way, useful for posting scores, etc.

var applyAsDelta = false;
var start : Vector3;
var end : Vector3;
var animSecs : float = 1.0;

var inScreenSpace = false;
var mainCamera : Camera = null;

var hideOnEnd = true;	// disable rendering when animation is done?

// set this flag to show it before animation
// but next time the anim is triggered, it will be hidden again
private var showUntilNextTrigger = false;	

private var remainSecs : float = 0.0;
private var posAtStart:Vector3;

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

	if( applyAsDelta )
		posAtStart = transform.position;
}

function Play() { StartAnim(); }

function Update () {

	if( remainSecs > 0.0 )
	{
		var alpha = 1 - remainSecs/animSecs;
		var value = Vector3.Lerp( start, end, alpha*alpha );

		if( inScreenSpace ) {
			var ray = mainCamera.ScreenPointToRay( value );
			var t = -ray.origin.z / ray.direction.z;
			value = ray.origin + t*ray.direction;
		}

		if( applyAsDelta )
			transform.position = posAtStart + value;
		else
			transform.position = value;

		if( GetComponent.<Renderer>() )
			GetComponent.<Renderer>().enabled = true;

		remainSecs -= Time.deltaTime;
	}
	else
	{
		if( GetComponent.<Renderer>() ) {
			if( showUntilNextTrigger )
				GetComponent.<Renderer>().enabled = true;
			else {	
				if( hideOnEnd )
				{
					GetComponent.<Renderer>().enabled = false;
				}
			}
		}
	}
}