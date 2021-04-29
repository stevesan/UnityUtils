
var textures : Texture2D[];

function SetTexture( i:int )
{
	if( i < textures.length )
	{
		GetComponent.<Renderer>().material.mainTexture = textures[i];
	}
	else
	{
		Debug.LogError('index = ' +i+ ' is out of range, my name = ' + gameObject.name);
	}
}

function SetColor( c : Color )
{
	GetComponent.<Renderer>().material.color = c;
}

function Update () {
	// TEMP
	if( Time.timeSinceLevelLoad > 2.0 )
	{
		Debug.Log('Changing');
		SetTexture(0);
		SetColor( Color.red );
	}
	if( Time.timeSinceLevelLoad > 4.0 )
	{
		Debug.Log('Changing');
		SetTexture(0);
		SetColor( Color.green );
	}
}

@script RequireComponent( Renderer )