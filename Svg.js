#pragma strict

import System.IO;

//----------------------------------------
//  TODO - add proper Mesh2D stuff, ie. edge list
//----------------------------------------
class SvgPathBuilder
{
	private var prevPt:Vector2 = Vector2(0,0);
	private var prevCtrl:Vector2 = Vector2(0,0);
	private var prevMoveOrClose = false;
	private var firstPoint = 0;
	private var nCubicDivs = 20;
	private var ptsBuiltin : Vector2[];
	
	private var pts : Array = new Array();

	function SetCubicDivs( n:int ) { nCubicDivs = n; }

	function GetPoints() : Vector2[] { return ptsBuiltin; }

	function Move( p:Vector2, isRel:boolean )
	{
		if( isRel ) p += prevPt;
		prevPt = p;
		prevMoveOrClose = true;
	}

	function CubicBezier( c1:Vector2, c2:Vector2, x2:Vector2, isRel:boolean )
	{
		if( isRel )
		{
			c1 += prevPt;
			c2 += prevPt;
			x2 += prevPt;
		}
		if( prevMoveOrClose ) pts.Push( prevPt );

		var x1 = prevPt;

		// tesselate out points
		for( var i:int = 0; i < nCubicDivs; i++ )
		{
			var t:float = (i+1.0) / nCubicDivs;

			var a = x1*(1-t) + c1*t;
			var b = c1*(1-t) + c2*t;
			var c = c2*(1-t) + x2*t;
			var d = a*(1-t) + b*t;
			var e = b*(1-t) + c*t;
			var p = d*(1-t) + e*t;

			pts.Push( p );
		} 

		prevPt = x2;
		prevCtrl = c2;
		prevMoveOrClose = false;
	}
	
	function CubicBezierShort( c2:Vector2, x2:Vector2, isRel:boolean )
	{
		var c1 = prevPt+(prevPt-prevCtrl);
		if( isRel ) 
		{
			c2 += prevPt;
			x2 += prevPt;
		}
		CubicBezier( c1, c2, x2, false );
	}

	function Line( p:Vector2, isRel:boolean )
	{
		if( isRel ) p += prevPt;
		if( prevMoveOrClose ) pts.Push( prevPt );
		pts.Push( p );
		prevMoveOrClose = false;
	}

	function Close()
	{
		pts.Push( pts[firstPoint] );
		firstPoint = pts.length;
		prevMoveOrClose = true;
	}

	function BeginBuilding()
	{
		pts.Clear();
	}

	function EndBuilding()
	{
		ptsBuiltin = (pts.ToBuiltin( Vector2 ) as Vector2[]);
		pts.Clear();
	}

	function BuildExample()
	{
		Move( Vector2(402.063000,225.000000), false );
		CubicBezier( Vector2(49.517000,87.256000), Vector2(99.718000,175.135000), Vector2(198.748000,175.135000), true );
		CubicBezier( Vector2(0.000000,0.000000), Vector2(106.559000,12.224000), Vector2(106.559000,-175.134000), true );
		CubicBezierShort( Vector2(600.816000,49.865000), Vector2(600.816000,49.865000), false );
		CubicBezier( Vector2(-198.767000,0.000000), Vector2(-198.767000,350.271000), Vector2(-397.533000,350.271000), true );
		CubicBezier( Vector2(0.000000,0.000000), Vector2(-100.653000,12.223000), Vector2(-100.653000,-175.135000), true );
		CubicBezierShort( Vector2(100.650000,-175.135000), Vector2(100.650000,-175.135000), true );
		CubicBezier( Vector2(97.910000,0.000000), Vector2(147.591000,84.994000), Vector2(196.558000,171.247000), true );
		Line( Vector2(402.063000,225.000000), false );;
		Close();
	}

	function ToLineRenderer( lr : LineRenderer )
	{
		lr.useWorldSpace = false;
		lr.SetVertexCount( ptsBuiltin.length );
		for( var i = 0; i < ptsBuiltin.length; i++ )
			lr.SetPosition( i, Utils.ToVector3(ptsBuiltin[i]) );
	}

	function Recenter()
	{
		var bounds = new Bounds2D();
		bounds.SetTo( ptsBuiltin );
		var c = bounds.GetCenter();

		for( var i = 0; i < ptsBuiltin.length; i++ )
			ptsBuiltin[i] -= c;
	}

	//----------------------------------------
	//	This executes commands as outputted by my Inkscape extension.
	//	An example of valid 'cmdsText' :
	// M 331.42857 232.36218
	// L 437.14286 395.21933
	// L 631.42857 358.07647
	// L 505.71429 543.79075
	// L 574.28571 806.6479
	// L 360.0 592.36218
	// L 174.28571 755.21933
	// L 277.14286 538.07647
	// L 102.85714 406.6479
	// L 262.85714 380.93361
	// Z
	//----------------------------------------
	function ExecuteCommands( reader:StringReader, height:float, scale:float, offset:Vector2 )
	{
		var line = reader.ReadLine();
		while( line != null )
		{
			var parts = line.Split( [' '], System.StringSplitOptions.RemoveEmptyEntries );
			if( parts[0] == 'M' )
			{
				var p = scale*Vector2( parseFloat(parts[1]), height-parseFloat(parts[2]) );
				Move( p+offset, false );
			}
			else if( parts[0] == 'L' )
			{
				p = scale*Vector2( parseFloat(parts[1]), height-parseFloat(parts[2]) );
				Line( p+offset, false );
			}
			else if( parts[0] == 'Z' )
				Close();

			line = reader.ReadLine();
		}
	}
}
