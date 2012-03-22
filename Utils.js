#pragma strict

import System.IO;

static function Assert( condition : boolean )
{
	if( !condition )
		Debug.LogError("assert failed");
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
//  Returns the counter-clockwise perpendicular vector from the given
//----------------------------------------
static function PerpCCW( v:Vector2 ) : Vector2
{
	return Vector2( -v.y, v.x );
}

//----------------------------------------
//  
//----------------------------------------
static function ClosestPointOn2DLine( p:Vector2, a:Vector2, b:Vector2 ) : Vector2
{
	var r = b-a;
	var t = (-r.x*(a.x-p.x) - r.y*(a.y-p.y)) / (r.x*r.x + r.y*r.y);
	var c = a+t*r;

	//Debug.DrawLine( a, b, Color.red, 0.0, false );
	//Debug.DrawLine( p, c, Color.green, 0.0, false );

	return c;
}

//----------------------------------------
//  Reflects p along the given line a->b
//----------------------------------------
static function Reflect2D( p:Vector2, a:Vector2, b:Vector2 ) : Vector2
{
	var c = ClosestPointOn2DLine( p, a, b );
	var perp = p-c;
	var ref = c - perp;
	return ref;
}

class Bounds2D
{
	var mins : Vector2;
	var maxs : Vector2;

	function SetTo( pts : Vector2[] )
	{
		mins = Vector2( Mathf.Infinity, Mathf.Infinity );
		maxs = Vector2( -Mathf.Infinity, -Mathf.Infinity );

		for( var i = 0; i < pts.length; i++ )
		{
			mins = Vector2.Min( mins, pts[i] );
			maxs = Vector2.Max( maxs, pts[i] );
		}
	}

	function GetCenter() : Vector2
	{
		return 0.5 * (mins+maxs);
	}
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

static function SlopeIntercept( s:Vector2, e:Vector2 ) : Vector2
{
	var dx = e.x - s.x;
	var dy = e.y - s.y;
	if( dx == 0.0 )
		return Vector2( Mathf.Infinity, Mathf.Infinity );
	var m = dy/dx;
	var b = s.y - m*s.x;
	return Vector2( m, b );
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


//----------------------------------------
//  a0/1, b0/1 specify two points on INFINITE lines.
//----------------------------------------
static function Intersect2DLines( s0:Vector2, e0:Vector2, s1:Vector2, e1:Vector2 )
	: Vector2
{
	var si0 = SlopeIntercept( s0, e0 );
	var si1 = SlopeIntercept( s1, e1 );
	var m0 = si0.x; var b0 = si0.y;
	var m1 = si1.x; var b1 = si1.y;

	if( m0 == Mathf.Infinity )
	{
		return Vector2( s0.x, m1*s0.x+b1 );
	}
	else if( m1 == Mathf.Infinity )
	{
		return Vector2( s1.x, m0*s1.x+b0 );
	}
	else
	{
		var x = (b1-b0) / (m0-m1);
		var y = m0*x + b0;
		return Vector2(x,y);
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