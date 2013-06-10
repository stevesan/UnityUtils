#pragma strict

var openCloseSecs = 1.0;
var alpha = new SlidingValue();

private var state = "open";

function Start()
{
	alpha.Set(0.0);
	state = "open";
}

function OpenCurtains()
{
	alpha.SlideTo(0.0);
	state = "opening";
}

function CloseCurtains()
{
	alpha.SlideTo(1.0);
	state = "closing";
}

function Update()
{
	alpha.Update(Time.deltaTime);

	if( state == "opening" )
	{
		if( alpha.Get() <= 0.0 )
		{
			state = "open";
			GetComponent(Connectable).TriggerEvent("OnCurtainsOpened");
		}
	}
	else if( state == "closing" )
	{
		if( alpha.Get() >= 1.0 )
		{
			state = "closed";
			GetComponent(Connectable).TriggerEvent("OnCurtainsClosed");
		}
	}

	GetComponent(tk2dSprite).color.a = alpha.Get();

}