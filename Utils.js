#pragma strict

import System.IO;

//----------------------------------------
//  General utiliy functions
//----------------------------------------

static function Assert( condition : boolean ) : boolean
{
	if( !condition )
		Debug.LogError("Assert failed");
	return condition;
}

static function Assert( condition : boolean, msg:String ) : boolean
{
	if( !condition )
		Debug.LogError("ASSERT FAILED: "+msg);
	return condition;

}

static function DoAnalytics() : boolean
{
	#if UNITY_EDITOR
		return false;
	#else
		if( Debug.isDebugBuild )
			return false;
		else
			return true;
	#endif
}

static function RandomColor() : Color
{
	return Color( Random.value, Random.value, Random.value, 1.0 );
}

static function DebugDrawPlane( n:Vector3, p:Vector3, c:Color )
{
	// draw normal
	Debug.DrawLine( p, p+n/4.0, c, 0, false );

	// draw tangent
	var xcopy = n.x;
	n.x = n.y;
	n.y = -xcopy;

	var a = p+n;
	var b = p-n;
	Debug.DrawLine( a, b, c, 0, false );
}


//----------------------------------------
//  TODO - there's probably a builtin function I should use instead..?
//----------------------------------------
static function CopyArray( src : Array, target : Array )
{
	target.length = src.length;
	for( var i = 0; i < src.length; i++ )
		target[i] = src[i];
}

static function Duplicate( a:Vector2[] ) : Vector2[]
{ var d = new Vector2[a.length]; for( var i = 0; i < a.length; i++ ) d[i] = a[i]; return d; }
static function Duplicate( a:int[] ) : int[]
{ var d = new int[a.length]; for( var i = 0; i < a.length; i++ ) d[i] = a[i]; return d; }
static function Duplicate( a:float[] ) : float[]
{ var d = new float[a.length]; for( var i = 0; i < a.length; i++ ) d[i] = a[i]; return d; }

static function Concatenate( a:Vector2[], b:Vector2[] ) : Vector2[]
{
	var c = new Vector2[ a.length + b.length ];
	for( var i = 0; i < a.length; i++ )
		c[i] = a[i];
	for( var j = 0; j < b.length; j++ )
		c[ a.length+j ] = b[j];
	return c;
}

static function Concatenate( a:int[], b:int[] ) : int[]
{
	var c = new int[ a.length + b.length ];
	for( var i = 0; i < a.length; i++ )
		c[i] = a[i];
	for( var j = 0; j < b.length; j++ )
		c[ a.length+j ] = b[j];
	return c;
}

static function ToVector3( v:Vector2 ) : Vector3
{
	return ToVector3( v, 0.0 );
}

static function ToVector2( v:Vector3 ) : Vector2
{
	return Vector2( v.x, v.y );
}

static function ToVector3( v:Vector2, z:float ) : Vector3
{
	return Vector3( v.x, v.y, z );
}

static function To3Array( v:Vector3 ) : float[]
{
	return [v.x, v.y, v.z];
}

static function To2Array( v:Vector3 ) : float[]
{
	return [v.x, v.y];
}

static function SetTexture( obj : GameObject, tex : Texture2D )
{
	obj.renderer.material.mainTexture = tex;
}

static function SetParticleMatOpacity( mat : Material, frac : float )
{
	// works for particle shaders only..
	var c = mat.GetColor("_TintColor");
	c.a = frac / 2.0;	// for whatever reason, the tint color makes the rendering fully opaque when alpha = 0.5..
	mat.SetColor("_TintColor", c);
}

static function SetRenderFlagRecursively( obj : GameObject, value:boolean ) : void
{
	var renderer = obj.GetComponent(Renderer);
	if( renderer != null )
		renderer.enabled = value;
	for( var child:Transform in obj.transform ) {
		SetRenderFlagRecursively( child.gameObject, value );
	}
}

static function HideAll( obj : GameObject ) { SetRenderFlagRecursively( obj, false ); }
static function ShowAll( obj : GameObject ) { SetRenderFlagRecursively( obj, true ); }

static function DestroyObjs( objs : Array )
{
	for( var obj:GameObject in objs )
	{
		Destroy( obj );
	}
}

static function DestroyObjsViaComponent( comps : Array )
{
	for( var comp:Component in comps )
	{
		Destroy( comp.gameObject );
	}
}

// Non-inclusive for the right side
static function IsBetween( x:float, a:float, b:float ) : boolean
{
	return (x >= a) && (x < b);
}

static function Nearest( pts : Array, p:Vector2 ) : int
{
	var minDist = Mathf.Infinity;
	var minId = -1;

	for( var i = 0; i < pts.length; i++ )
	{
		var dist = Vector2.Distance( pts[i], p );
		if( dist < minDist )
		{
			minDist = dist;
			minId = i;
		}
	}

	return minId;
}

//----------------------------------------
//  Returns the SDF of the contact relative to the given box
//	IMPORTANT: 'normal' is assumed to be pointing outward from the box
//----------------------------------------
static function ContactBoxSDF( point : Vector3, normal : Vector3, box : BoxCollider ) : float
{
	// put everything in local space
	var localNorm = box.transform.InverseTransformDirection( normal );
	var localPos = box.transform.InverseTransformPoint( point );

	// compute SDF, using localScale, since that stretches the box
	// note that the normal is unaffected by scale (using xformDirection)
	var scaledPos = Vector3.Scale( localPos, box.transform.localScale );
	var scaledRadii = Vector3.Scale( box.size/2.0, box.transform.localScale );

	// We compute the SDF by considering 2 planes with normal localNorm, one containing the given point and the other
	// at the box's max-corner. We then simply compare their absolute distances, since we know the box contains the origin.
	var cornerPlaneToOrigin = Mathf.Abs( Vector3.Dot( localNorm, scaledRadii ) );
	var pointPlaneToOrigin = Mathf.Abs( Vector3.Dot( localNorm, scaledPos ) );
	var sdf = pointPlaneToOrigin - cornerPlaneToOrigin;

	return sdf;
}

static function GetBoxLesserLength( box : BoxCollider ) : float
{
	var scaledsize = Vector3.Scale( box.transform.localScale, box.size );
	var minL = Mathf.Min( scaledsize.x, scaledsize.y );
	return minL;
}

static function GetTransformedBounds( box : BoxCollider ) : Bounds
{
	var b = Bounds( box.center, box.size );
	b.min = box.transform.TransformPoint( b.min );
	b.max = box.transform.TransformPoint( b.max );
	return b;
}

class Square2D
{
	var center : Vector2;
	var radius : float;

	function DebugDraw( clr:Color, z:float ) : void
	{
		var a = Vector3( center.x-radius, center.y-radius, z );
		var b = Vector3( center.x+radius, center.y-radius, z );
		var c = Vector3( center.x+radius, center.y+radius, z );
		var d = Vector3( center.x-radius, center.y+radius, z );
		Debug.DrawLine( a, b, clr, 0, false );
		Debug.DrawLine( b, c, clr, 0, false );
		Debug.DrawLine( c, d, clr, 0, false );
		Debug.DrawLine( d, a, clr, 0, false );
	}
}

//----------------------------------------
//  Given two squares defined by center c* and radius r*,
//	assume square 2 is the larger one. This basically just shifts square 1
//	around so it's within the larger one.
//----------------------------------------
static function ShiftSquare( a:Square2D, b:Square2D )
{
	var leftOut = (b.center.x-b.radius) - (a.center.x-a.radius);
	var rightOut = (a.center.x+a.radius) - (b.center.x+b.radius);
	if( leftOut > 0.0 )
		a.center.x += leftOut;
	else if( rightOut > 0.0 )
		a.center.x -= rightOut;

	var botOut = (b.center.y-b.radius) - (a.center.y-a.radius);
	var topOut = (a.center.y+a.radius) - (b.center.y+b.radius);
	if( botOut > 0.0 )
		a.center.y += botOut;
	else if( topOut > 0.0 )
		a.center.y -= topOut;
}

class Mathd
{
	static function Abs( x:double )
	{
		return ( x > 0.0 ? x : -x );
	}
}

static function FindFirst( v:boolean[] ) : int
{
	for( var i = 0; i < v.length; i++ )
		if( v[i] ) return i;

	return -1;
}

class PdfSampler
{
	private var pdf:float[] = null;

	private var cdf:float[] = null;

	function Reset( _pdf:float[] ) : void
	{
		pdf = _pdf;

		// compute CDF
		cdf = new float[ pdf.length ];
		cdf[0] = pdf[0];
		for( var i = 1; i < pdf.length; i++ )
		{
			cdf[i] = cdf[i-1] + pdf[i];
		}
	}

	// returns the index of the bucket sampled
	function Sample() : int
	{
		var x = Random.Range( 0.0, cdf[ cdf.length-1 ] );
		// find which bucket it's in
		for( var i = 0; i < cdf.length; i++ )
		{
			if( x < cdf[i] )
				return i;
		}

		// we must've gotten the last bucket
		return cdf.length-1;
	}
}


class Matrix
{
	var ncols : int;
	var nrows : int;
	var data : double[] = new double[1];	// row major

	function Free()
	{
		data = null;
	}

	function Set( _data : double[] )
	{
		Utils.Assert( _data.length <= data.length );
		for( var i = 0; i < data.length; i++ )
			data[i] = _data[i];
	}

	function Set( _data : float[] )
	{
		Utils.Assert( _data.length <= data.length );
		for( var i = 0; i < data.length; i++ )
			data[i] = _data[i];
	}

	function Zero()
	{
		// zero out
		for( var i = 0; i < nrows*ncols; i++ )
			data[i] = 0.0;
	}

	// Only resizes if necessary
	function Reset( _nrows:int, _ncols:int )
	{
		ncols = _ncols;
		nrows = _nrows;

		if( ncols*nrows > data.length )
		{
			Debug.Log('** Re-allocating matrix for '+nrows+' by '+ncols);
			data = new double[ nrows * ncols ];
		}

		Zero();
	}

	function Reset( _data : double[], _ncols:int )
	{
		Utils.Assert( (_data.length % _ncols) == 0 );
		Reset( _data.length / _ncols, _ncols );
		Set( _data );
	}

	function Reset( _data : float[], _ncols:int )
	{
		Utils.Assert( (_data.length % _ncols) == 0 );
		Reset( _data.length / _ncols, _ncols );
		Set( _data );
	}

	function numRows() : int { return nrows; }
	function numCols() : int { return ncols; }

	function Elm( row:int, col:int ) : double { return data[ row*ncols + col ]; }
	function Set( row:int, col:int, val:double ) { data[ row*ncols + col ] = val; }

	function GetLastCol( row:int ) : double { return Elm( row, ncols-1 ); }

	function Matrix()
	{}

	function WriteAscii( sw : StreamWriter )
	{
		for( var r = 0; r < numRows(); r++ )
		{
			var line = "";
			for( var c = 0; c < numCols(); c++ )
			{
				line += Elm(r,c) + "\t";
			}
			sw.WriteLine( line );
		}
	}

	function SaveAscii( path : String )
	{
		Debug.Log('saving matrix to '+path);
    var sw : StreamWriter = new StreamWriter(path);
		WriteAscii( sw );
    sw.Flush();
    sw.Close();
	}
}

//----------------------------------------
//  Using the simple algo from: http://www.protonfish.com/random.shtml
//----------------------------------------
static function PseudoNormalRandom( mean:float, stdev:float )
{
	var G = Random.Range(-1.0, 1.0) + Random.Range(-1.0, 1.0 ) + Random.Range( -1.0, 1.0 );
	return G*stdev + mean;
}

//----------------------------------------
//  IO stuff
//----------------------------------------

//----------------------------------------
//  Goes up the ancestor tree until we find something with the component
//----------------------------------------

static function FindAncestorWithComponent( type:System.Type, start:GameObject ) : GameObject
{
	var obj = start;
	while( obj != null ) {
		var parent = obj.transform.parent.gameObject;
		if( parent != null && parent.GetComponent(type) != null ) {
			return parent;
		}
		obj = parent;
	}
}
