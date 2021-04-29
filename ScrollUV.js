
var changePerSec = Vector2( 1.0, 1.0 );
private var offset = Vector2( 0, 0 );

function Awake()
{
	// TEMP TEMP HACKY - we're only storing the offset for the first one..
	offset = GetComponent.<Renderer>().materials[0].GetTextureOffset( '_MainTex' );
}

function Update () {
	offset += Time.deltaTime * changePerSec;

	// wrap..just in case
	offset.x = offset.x % 1.0;
	offset.y = offset.y % 1.0;

	for( var i = 0; i < GetComponent.<Renderer>().materials.length; i++ )
	{
		GetComponent.<Renderer>().materials[i].SetTextureOffset( '_MainTex', offset );
	}
}