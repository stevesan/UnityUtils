#pragma strict

@script RequireComponent(Connectable)

public static var main:FadeCurtains = null;

var openCloseSecs = 1.0;
var alpha = new SlidingValue();
var startOpen = false;

private var state = "open";

function Awake()
{
    Utils.Assert( main == null );
    main = this;
}

function Start()
{
    if( startOpen )
    {
        alpha.Set(0.0);
        state = "open";
    }
    else
    {
        alpha.Set(1.0);
        state = "closed";
    }
}

function Open()
{
    if( state == "closing" || state == "closed" )
    {
        alpha.SlideTo(0.0);
        state = "opening";
        GetComponent(Connectable).TriggerEvent("OnCurtainsOpening");
    }
}

function Close()
{
    if( state == "open" || state == "opening" )
    {
        alpha.SlideTo(1.0);
        state = "closing";
        GetComponent(Connectable).TriggerEvent("OnCurtainsClosing");
    }
    else if( state == "closed" )
    {
        // fire event immediately
        GetComponent(Connectable).TriggerEvent("OnCurtainsClosed");
    }
}

private function OnAlphaChanged()
{
    var alphaComp = GetComponent(AlphaHierarchy);
    Utils.Assert(alphaComp);
    alphaComp.SetLocalAlpha( alpha.Get(), true );
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
        OnAlphaChanged();
	}
	else if( state == "closing" )
	{
		if( alpha.Get() >= 1.0 )
		{
			state = "closed";
			GetComponent(Connectable).TriggerEvent("OnCurtainsClosed");
		}
        OnAlphaChanged();
	}
    else
    {
    }


}
