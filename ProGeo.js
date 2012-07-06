#pragma strict

import System.Collections.Generic;

//----------------------------------------
//  Various procedural geometry tools
//----------------------------------------

//----------------------------------------
//  Works in the XY plane, and basically uses XY position as UVs
//	TODO - have two radii - left and right radius
//----------------------------------------
static function Stroke2D( pts:Vector2[], width:float, mesh:Mesh )
{
	var npts = pts.length;
	var radius : float = width/2.0;

	var vertices = new Vector3[ 2 * npts ];
	var uvs = new Vector2[ 2 * npts ];

	var a = pts[0];
	var b = pts[1];
	var e0 = b-a;
	var n = Math2D.PerpCCW( e0 ).normalized;
	vertices[0] = a + n*radius;
	vertices[1] = a - n*radius;
	uvs[ 0 ] = Vector2( 0,0 );
	uvs[ 1 ] = Vector2( 1,0 );

	for( var i = 1; i < npts-1; i++ )
	{
		var p0 = pts[i-1];
		var p1 = pts[i];
		var p2 = pts[i+1];
		e0 = p1-p0;
		var e1 = p2-p1;

		var e0n = e0.normalized;
		var e1n = e1.normalized;
		var theta0 = Mathf.Atan2( e0n.y, e0n.x );
		var theta1 = Mathf.Atan2( e1n.y, e1n.x );

		// make sure we're getting the positive CCW angle from e0 to e1
		if( theta1 < theta0 )
			theta1 += 2*Mathf.PI;

		var dtheta = theta1 - theta0;
		var alpha = radius * Mathf.Tan( dtheta/2.0 );

		n = Math2D.PerpCCW( e0 ).normalized;
		vertices[ 2*i ] = p1+radius*n - alpha*e0n;
		vertices[ 2*i+1 ] = p1-radius*n + alpha*e0n;

		var v = (1.0*i) / (npts-1.0);
		uvs[ 2*i ] = Vector2( 0, v );
		uvs[ 2*i+1 ] = Vector2( 1, v );
	}

	// last one
	a = pts[ npts-2 ];
	b = pts[ npts-1 ];
	e0 = b-a;
	n = Math2D.PerpCCW( e0 ).normalized;
	vertices[ 2*npts-2 ] = b + n*radius;
	vertices[ 2*npts-1 ] = b - n*radius;
	uvs[ 2*npts-2 ] = Vector2( 0, 1 );
	uvs[ 2*npts-1 ] = Vector2( 1, 1 );

	//----------------------------------------
	//  Triangles
	//----------------------------------------
	var ntris = 2*(npts-1);
	var triangles = new int[ ntris * 3 ];
	for( i = 0; i < (npts-1); i++ )
	{
		triangles[ 6*i + 0 ] = 2 * i + 0;
		triangles[ 6*i + 1 ] = 2 * i + 2;
		triangles[ 6*i + 2 ] = 2 * i + 1;

		triangles[ 6*i + 3 ] = 2 * i + 1;
		triangles[ 6*i + 4 ] = 2 * i + 2;
		triangles[ 6*i + 5 ] = 2 * i + 3;
	}

	//----------------------------------------
	//  Assign
	//----------------------------------------
	mesh.vertices = vertices;
	mesh.uv = uvs;
	mesh.triangles = triangles;

	// set all normals to -Z
	var normals = new Vector3[ 2 * npts ];
	for( i = 0; i < normals.length; i++ )
		normals[i] = Vector3( 0, 0, -1 );

	mesh.normals = normals;
}

//----------------------------------------
//  pts - the ordered points of a closed polygon
//----------------------------------------
static function ClipByLine(
		pts:Vector2[],
		l0:Vector2,
		l1:Vector2,
		keepRight:boolean )
		: Array
{
	var npts = pts.length;

	if( !keepRight )
	{
		// just swap the two
		var temp = l0;
		l0 = l1;
		l1 = temp;
	}

	var lineDir = (l1-l0).normalized;
	var rightDir = -1 * Math2D.PerpCCW( lineDir ).normalized;

	// figure out which line segs cross the line
	var ptIsOnRight = new boolean[ npts ];
	
	for( var i = 0; i < npts; i++ )
	{
		var toPt = (pts[i] - l0).normalized;
		ptIsOnRight[i] = (Vector2.Dot( toPt, rightDir ) > 0 );
	}

	var segCrosses = new boolean[npts];
	for( i = 0; i < npts; i++ )
	{
		if( ptIsOnRight[i] != ptIsOnRight[(i+1)%npts] )
			segCrosses[i] = true;
		else
			segCrosses[i] = false;
	}

	//----------------------------------------
	//  Now perform the generation of the new polygon
	//	Pretty simple logic.
	//----------------------------------------
	var newPts = new Array();

	for( i = 0; i < npts; i++ )
	{
		if( ptIsOnRight[i] )
			newPts.Push( pts[i] );

		if( segCrosses[i] )
		{
			// add the intersection point
			var p0 = pts[i];
			var p1 = pts[(i+1)%npts];
			var intx = Math2D.Intersect2DLines( l0, l1, p0, p1 );
			newPts.Push(intx);
		}
	}

	return newPts;
}

static function CompareByXThenY( a:Vector2, b:Vector2 ) 
{
	if( a.x == b.x ) {
		// order by Y coordinate instead
		return Mathf.RoundToInt( Mathf.Sign( a.y - b.y ) );
	}
	else
		return Mathf.RoundToInt( Mathf.Sign( a.x - b.x ) );
}

//----------------------------------------
//  TODO - Mes
//----------------------------------------
class Polygon2D
{
	var pts : Vector2[] = null;
	var edgeA : int[] = null;
	var edgeB : int[] = null;

	function Duplicate() : Polygon2D
	{
		var dupe = new Polygon2D();
		dupe.pts = Utils.Duplicate( pts );
		dupe.edgeA = Utils.Duplicate( edgeA );
		dupe.edgeB = Utils.Duplicate( edgeB );
		return dupe;
	}

	function GetNumVertices() : int { return pts.length; }
	function GetNumEdges() : int { return edgeA.length; }

	function DebugDraw( color:Color, dur:float )
	{
		for( var e = 0; e < edgeA.length; e++ )
		{
			var a = edgeA[e];
			var b = edgeB[e];
			Debug.DrawLine( Utils.ToVector3( pts[a]), Utils.ToVector3(pts[b]), color, dur, false );
		}
	}

	function ScalePoints( s:float )
	{
		for( var i = 0; i < pts.length; i++ )
			pts[i] *= s;
	}

	function Reflect( l0:Vector2, l1:Vector2, keepRight:boolean )
	{
		var npts = pts.length;

		if( !keepRight )
		{
			// just swap the two
			var temp = l0;
			l0 = l1;
			l1 = temp;
		}
		var lineDir = (l1-l0).normalized;
		var rightDir = -1 * Math2D.PerpCCW( lineDir ).normalized;

		// see which points are on the right side
		var ptIsOnRight = new boolean[ npts ];
		for( var i = 0; i < npts; i++ )
		{
			var toPt = (pts[i] - l0).normalized;
			ptIsOnRight[i] = (Vector2.Dot( toPt, rightDir ) > 0 );
		}

		// keep right points and add their reflections
		var newPts = new Array();
		var pt2refl = new int[ npts ];
		var old2new = new int[ npts ];
		for( i = 0; i < npts; i++ )
		{
			if( ptIsOnRight[i] )
			{
				newPts.Push( pts[i] );
				old2new[i] = newPts.length-1;

				// add reflection
				newPts.Push( Math2D.Reflect2D( pts[i], l0, l1 ) );
				pt2refl[i] = newPts.length-1;
			}
		}

		// go through edges
		var newA = new Array();
		var newB = new Array();

		for( i = 0; i < edgeA.length; i++ )
		{
			var a = edgeA[i];
			var b = edgeB[i];

			if( ptIsOnRight[a] && ptIsOnRight[b] )
			{
				// yay add both this one and its reflection, going in the opposite direction
				newA.Push( old2new[a] );
				newB.Push( old2new[b] );

				// note the opposite direction
				newA.Push( pt2refl[b] );
				newB.Push( pt2refl[a] );
			}
			else if( ptIsOnRight[a] && !ptIsOnRight[b] )
			{
				// add the intersection point
				var intx = Math2D.Intersect2DLines( l0, l1, pts[a], pts[b] );
				newPts.Push( intx );
				var c = newPts.length-1;

				// register new edges
				newA.Push( old2new[a] );
				newB.Push( c );

				// now its reflection with opposite direction
				newA.Push( c );
				newB.Push( pt2refl[a] );
			}
			else if( !ptIsOnRight[a] && ptIsOnRight[b] )
			{
				// add the intersection point
				intx = Math2D.Intersect2DLines( l0, l1, pts[a], pts[b] );
				newPts.Push( intx );
				c = newPts.length-1;

				// register new edges
				newA.Push( pt2refl[b] );
				newB.Push( c );

				// now its reflection with opposite direction
				newA.Push( c );
				newB.Push( old2new[b] );
			}
			else
			{
				// edge is completely on left side - ignore
			}
		}

		pts = newPts.ToBuiltin(Vector2);
		edgeA = newA.ToBuiltin(int);
		edgeB = newB.ToBuiltin(int);
	}

	function Append( other:Polygon2D )
	{
		if( pts == null ) pts = new Vector2[0];
		if( edgeA == null ) edgeA = new int[0];
		if( edgeB == null ) edgeB = new int[0];
		var oldNumPts = pts.length;
		var oldNumEdges = edgeA.length;

		pts = Utils.Concatenate( pts, other.pts );
		edgeA = Utils.Concatenate( edgeA, other.edgeA );
		edgeB = Utils.Concatenate( edgeB, other.edgeB );

		// need to increment other edge indices
		for( var i = 0; i < other.edgeA.length; i++ )
		{
			edgeA[ oldNumEdges + i ] += oldNumPts;
			edgeB[ oldNumEdges + i ] += oldNumPts;
		}
	}
}

//----------------------------------------
//  For efficient vertex-neighbor queries
//----------------------------------------
class PolyVertexNbors
{
	private var data:int[];

	function GetPrev( vid:int ):int { return data[ 2*vid + 0 ]; }
	function GetNext( vid:int ):int { return data[ 2*vid + 1 ]; }

	function SetPrev( vid:int, nbor:int ) { data[ 2*vid + 0 ] = nbor; }
	function SetNext( vid:int, nbor:int ) { data[ 2*vid + 1 ] = nbor; }

	function AreNeighbors( a:int, b:int ) {
		return GetPrev( a ) == b || GetPrev( b ) == a;
	}

	function IsUsed( vid:int ) { return data[2*vid+0] != -1; }

	function Reset( poly:Polygon2D, isClockwise:boolean )
	{
		data = new int[ 2*poly.GetNumVertices() ];
		for( var i = 0; i < data.length; i++ )
			data[i] = -1;

		for( var eid = 0; eid < poly.GetNumEdges(); eid++ )
		{
			var a = poly.edgeA[ eid ];
			var b = poly.edgeB[ eid ];

			if( isClockwise ) {
				a = poly.edgeB[ eid ];
				b = poly.edgeA[ eid ];
			}

			SetPrev( b, a );
			SetNext( a, b );
		}
	}

	// a variant for a sub-polygon
	function Reset( numVerts:int, edge2verts:List.<int>, activeEdges:List.<int> )
	{
		data = new int[ 2*numVerts ];
		for( var i = 0; i < 2*numVerts; i++ )
			data[i] = -1;

		for( var edgeNum = 0; edgeNum < activeEdges.Count; edgeNum++ ) {
			var eid = activeEdges[edgeNum];
			var a = edge2verts[ 2*eid+0 ];
			var b = edge2verts[ 2*eid+1 ];
			SetPrev( b, a );
			SetNext( a, b );
		}
	}

}

class Vector2IdPair {
	var v : Vector3;
	var id : int;

	static function CompareByX( a:Vector2IdPair, b:Vector2IdPair ) : int {
		return ProGeo.CompareByXThenY( a.v, b.v );
	}
}

class TriIndices {
	var verts = new int[3];
}

//----------------------------------------
//  Helper class for simple poly triangulation
//----------------------------------------
class PlaneSweep
{

	//----------------------------------------
	//  Pointers to helper info
	//----------------------------------------
	private var poly:Polygon2D;
	private var edge2verts:List.<int>;
	private var sortedVerts:List.<Vector2IdPair>;
	private var nbors:PolyVertexNbors;

	//----------------------------------------
	//  Internal state
	//----------------------------------------

	class ActiveEdgeInfo {
		var helperVertId:int;
		var helperIsMergeVert:boolean;
	}
	private var edge2info = new List.<ActiveEdgeInfo>();

	private var vert2prevEdge = new List.<int>();
	private var vert2nextEdge = new List.<int>();
	private var currSid:int;

	//----------------------------------------
	//  Performs the plane sweep algorithm and adds edges for a
	//	monotone-polygon decompostion of the given polygon
	//----------------------------------------
	function Reset(
			_poly:Polygon2D,
			_edge2verts:List.<int>,	// this will be modified with new edges
			_sortedVerts:List.<Vector2IdPair>,
			_nbors:PolyVertexNbors )
	{
		poly = _poly;
		edge2verts = _edge2verts;
		sortedVerts = _sortedVerts;
		nbors = _nbors;
		currSid = 0;

		//----------------------------------------
		//  Compute vert2 edge tables
		//----------------------------------------
		var NE = edge2verts.Count/2;
		var NV = poly.pts.length;
		vert2prevEdge = new List.<int>(NV);
		vert2nextEdge = new List.<int>(NV);
		for( var i = 0; i < NV; i++ ) {
			vert2prevEdge.Add(0);
			vert2nextEdge.Add(0);
		}

		for( var eid = 0; eid < NE; eid++ ) {
			vert2nextEdge[ edge2verts[ 2*eid + 0 ] ] = eid;
			vert2prevEdge[ edge2verts[ 2*eid + 1 ] ] = eid;
		}

		//----------------------------------------
		//  Init swept edges table
		//----------------------------------------
		edge2info = new List.<ActiveEdgeInfo>(NE);
		for( eid = 0; eid < NE; eid++ ) {
			edge2info.Add(null);
		}
	}

	function GetEdgeStart( eid:int ) { return poly.pts[ edge2verts[2*eid+0] ]; }
	function GetEdgeEnd( eid:int ) { return poly.pts[ edge2verts[2*eid+1] ]; }
	function GetEdgeHelper( eid:int ) { return edge2info[ eid ].helperVertId; }

	function FindEdgeAbove( p:Vector2 ) : int
	{
		var bestEid = -1;
		var bestDist = 0.0;

		for( var eid = 0; eid < edge2info.Count; eid++ ) {
			if( edge2info[eid] != null ) {
				// edge is still in sweep
				var y = Math2D.EvalLineAtX( GetEdgeStart(eid), GetEdgeEnd(eid), p.x );
				if( y > p.y ) {
					var dist = y-p.y;
					if( bestEid == -1 || dist < bestDist ) {
						bestEid = eid;
						bestDist = dist;
					}
				}
			}
		}

		return bestEid;
	}

	//----------------------------------------
	//  
	//----------------------------------------
	function DebugDrawActiveEdges( c:Color, diagColor:Color )
	{
		// draw active edges
		for( var eid = 0; eid < edge2info.Count; eid++ ) {
			if( edge2info[eid] != null ) {
				Debug.DrawLine( GetEdgeStart(eid), GetEdgeEnd(eid), c );
			}
		}

		// draw added diagonals
		for( eid = edge2info.Count; eid < edge2verts.Count/2; eid++ ) {
				Debug.DrawLine( GetEdgeStart(eid), GetEdgeEnd(eid), diagColor );
		}
	}

	//----------------------------------------
	//  Stuff for polygon triangulation
	//----------------------------------------
	enum VertType { REGULAR_TOP, REGULAR_BOTTOM, START, END, MERGE, SPLIT };

	function EvalVertType( vid:int ) : VertType
	{
		var pos = poly.pts[ vid ];
		var prevPos = poly.pts[ nbors.GetPrev( vid ) ];
		var nextPos = poly.pts[ nbors.GetNext( vid ) ];
		var prevCmp = ProGeo.CompareByXThenY( prevPos, pos );
		var nextCmp = ProGeo.CompareByXThenY( nextPos, pos );

		if( prevCmp == nextCmp ) {
			// both on same "side", cannot be colinear
			if( prevCmp < 0 ) {
				// both on left
				// assume CCW
				if( Math2D.IsLeftOfLine( nextPos, prevPos, pos ) ) {
					return VertType.END;
				} else {
					return VertType.MERGE;
				}
			} else {
				// both on right
				if( Math2D.IsLeftOfLine( nextPos, prevPos, pos ) ) {
					return VertType.START;
				} else {
					return VertType.SPLIT;
				}
			}
		} else {
			if( prevCmp < 0 )
				return VertType.REGULAR_BOTTOM;
			else
				return VertType.REGULAR_TOP;
		}
	}

	private function AddDiagonalIfMergeHelper( eid:int, other:int )
	{
		if( edge2info[ eid ] != null && edge2info[ eid ].helperIsMergeVert ) 
			AddDoubledDiagonal( edge2info[eid].helperVertId, other );
	}

	private function ActivateEdge( eid:int, helper:int, isMerge:boolean )
	{
		Utils.Assert( edge2info[eid] == null );
		var info = new ActiveEdgeInfo();
		info.helperVertId = helper;
		info.helperIsMergeVert = isMerge;
		edge2info[ eid ] = info;
	}

	private function DeactivateEdge( eid:int ) 
	{
		edge2info[ eid ] = null;
	}

	private function AddDoubledDiagonal( v1:int, v2:int ) 
	{
		edge2verts.Add( v1 );
		edge2verts.Add( v2 );
		edge2verts.Add( v2 );
		edge2verts.Add( v1 );
	}

	//----------------------------------------
	//  Performs one step of the plane sweep algo.
	//	Returns true if more steps are needed
	//----------------------------------------
	function Step() : boolean { return Step(false); }
	function Step( verbose:boolean ) : boolean
	{
		// safety
		if( currSid >= sortedVerts.Count )
			return false;

		var NV = poly.pts.length;
		var currVid = sortedVerts[ currSid ].id;
		var currType = EvalVertType( currVid );
		var e1 = vert2prevEdge[currVid];
		var e2 = vert2nextEdge[currVid];
		var aboveEdge = -1;

		if( currType == VertType.START ) {
			if( verbose ) Debug.Log('START event');
			ActivateEdge( e1, currVid, false );
			//OPT: ActivateEdge( e2, currVid, false );
		}
		else if( currType == VertType.END ) {
			if( verbose ) Debug.Log('END event');
			AddDiagonalIfMergeHelper( e1, currVid );
			AddDiagonalIfMergeHelper( e2, currVid );
			DeactivateEdge( e1 );
			DeactivateEdge( e2 );
		}
		else if( currType == VertType.SPLIT ) {
			if( verbose ) Debug.Log('SPLIT event');

			// add diag to above edge
			aboveEdge = FindEdgeAbove( poly.pts[currVid] );
			if( verbose ) Debug.Log('above edge = '+aboveEdge);
			if( verbose ) Debug.Log('above edge helper = '+edge2info[aboveEdge].helperVertId);
			Utils.Assert( aboveEdge != -1 );
			AddDoubledDiagonal( currVid, edge2info[aboveEdge].helperVertId );
			edge2info[aboveEdge].helperVertId = currVid;
			edge2info[aboveEdge].helperIsMergeVert = false;

			ActivateEdge( e1, currVid, false );
			//OPT: ActivateEdge( e2, currVid, false );
		}
		else if( currType == VertType.MERGE ) {
			if( verbose ) Debug.Log('MERGE event');
			AddDiagonalIfMergeHelper( e1, currVid );
			AddDiagonalIfMergeHelper( e2, currVid );
			DeactivateEdge( e1 );
			DeactivateEdge( e2 );
			
			// change helper
			aboveEdge = FindEdgeAbove( poly.pts[currVid] );
			AddDiagonalIfMergeHelper( aboveEdge, currVid );
			edge2info[aboveEdge].helperVertId = currVid;
			edge2info[aboveEdge].helperIsMergeVert = true;
		}
		else if( currType == VertType.REGULAR_TOP ) {
			if( verbose ) Debug.Log('REG TOP event');
			AddDiagonalIfMergeHelper( e2, currVid );
			DeactivateEdge( e2 );
			ActivateEdge( e1, currVid, false );
		}
		else if( currType == VertType.REGULAR_BOTTOM ) {
			if( verbose ) Debug.Log('REG BoT event');
			AddDiagonalIfMergeHelper( e1, currVid );
			DeactivateEdge( e1 );

			// Steve: This is my "bug fix" that both algo descriptions seem to ignore, but it's necessary to keep the helper invariant
			aboveEdge = FindEdgeAbove( poly.pts[currVid] );
			AddDiagonalIfMergeHelper( aboveEdge, currVid );
			edge2info[aboveEdge].helperVertId = currVid;
			edge2info[aboveEdge].helperIsMergeVert = false;
			if( verbose ) Debug.Log('edge '+aboveEdge+' new helper = '+currVid);

			// It's important to add this edge after we do the above helper-change, since we don't want this edge influenceing the above-search
			//OPT: ActivateEdge( e2, currVid, false );
		}

		// step
		currSid++;
		var moreSteps = currSid < sortedVerts.Count;

		return moreSteps;
	}
}

//----------------------------------------
//  
//----------------------------------------
static function TriangulateSimplePolygon( poly:Polygon2D, mesh:Mesh, isClockwise:boolean )
{
	var NV = poly.GetNumVertices();

	// create nbor query datastructure
	var nbors = new PolyVertexNbors();
	nbors.Reset( poly, isClockwise );

	// every 2-block is an oriented edge of vertex IDs
	var edge2verts = new List.<int>();

	// create oriented edges of original polygon
	for( var vid = 0; vid < NV; vid++ ) {
		edge2verts.Add( vid );
		edge2verts.Add( nbors.GetNext( vid ) );
	}

	//----------------------------------------
	//  Sort vertices by X,Y
	//----------------------------------------

	// First we need to sort the verts by X for determining diagonal ends
	var sortedVerts = new List.<Vector2IdPair>();

	// Store them in this datastructure so we can do this sorting
	for( var i = 0; i < poly.GetNumVertices(); i++ ) {
		var pair = new Vector2IdPair();
		pair.v = poly.pts[i];
		pair.id = i;
		sortedVerts.Add( pair );
	}

	sortedVerts.Sort( Vector2IdPair.CompareByX );

	//----------------------------------------
	//  Let the plane sweep algorithm do its thing
	//----------------------------------------
	var ps = new PlaneSweep();
	ps.Reset( poly, edge2verts, sortedVerts, nbors );
	while( ps.Step() );

	//----------------------------------------
	//  Traverse the graph to extract and triangulate monotone pieces
	// 	TODO TEMP - it may be possible to extract the pieces as we're doing the decomposition, so we don't have to do this somewhat expensive monotone-piece extraction part
	//----------------------------------------

	// we'll store the tri specs in this list
	var tris = new List.<TriIndices>();

	var NE = edge2verts.Count/2;
	var edgeVisited = new boolean[ NE ];
	for( var eid = 0; eid < NV; eid++ )
		edgeVisited[ eid ] = false;

	var firstEid = 0;

	while( firstEid < NV ) {
		// move the first vid cursor to the next unvisited edge
		while( firstEid < NV && edgeVisited[ firstEid ] )
			firstEid++;

		if( firstEid >= NV )
			// all done
			break;

		// find a new monotone piece
		var pieceEdges = new List.<int>();
		pieceEdges.Add( firstEid );

		var currEid = firstEid;

		// follow the edge loop from firstEid until we hit the firstEid again
		while( true ) {
			edgeVisited[currEid] = true;
			var currStart = edge2verts[ 2*currEid ];
			var currEnd = edge2verts[ 2*currEid+1 ];

			// find the outgoing edge from the current edge's end with the LARGEST angle
			var bestEid = -1;
			var bestAngle = 0.0;
			var backToFirst = false;
			// TODO - optimize this with a data struct so we're not doing an N^2 search for the next edge
			for( var otherEid = 0; otherEid < NE; otherEid++ ) {
				var otherStart = edge2verts[ 2*otherEid ];
				var otherEnd = edge2verts[ 2*otherEid+1 ];

				if( otherStart != currEnd )
					continue;

				// back to first? make sure we do this before the visited check,
				// since obviously the first edge was visited
				if( otherEid == firstEid ) {
					backToFirst = true;
					break;
				}

				if( edgeVisited[ otherEid ] )
					continue;

				// this is a next edge candidate
				// compute CCW angle with curr edge
				var otherAngle = Math2D.CCWAngle(
						poly.pts[currEnd], poly.pts[currStart],	// yes, we are intentionally flipping. Draw it out for the CCW winding case
						poly.pts[otherStart], poly.pts[otherEnd] );
				if( bestEid == -1 || otherAngle > bestAngle ) {
					bestEid = otherEid;
					bestAngle = otherAngle;
				}
			}

			if( backToFirst )
				// done!
				break;

			// got the next edge
			Utils.Assert( bestEid != -1 );
			pieceEdges.Add( bestEid );
			currEid = bestEid;
		}
		
		//----------------------------------------
		//  Draw it
		//	TEMP TEMP DEBUG
		//----------------------------------------
		if( false ) {
			var c = Color.red;
			for( var ie = 0; ie < pieceEdges.Count; ie++ ) {
				eid = pieceEdges[ie];
				var s = edge2verts[ 2*eid + 0 ];
				var e = edge2verts[ 2*eid + 1 ];
				Debug.DrawLine( poly.pts[s], poly.pts[e], c, 0 );
			}
		}

		//----------------------------------------
		//  Triangulate this piece
		//----------------------------------------
		TriangulateMonotonePolygon( sortedVerts, edge2verts, pieceEdges, tris );
	}

	//----------------------------------------
	//  Finally, transfer to the mesh
	//	TODO - store these so we're not allocating everytime..
	//----------------------------------------
	var meshVerts = new Vector3[ poly.GetNumVertices() ];
	var triangles = new int[ 3*tris.Count ];

	for( i = 0; i < poly.GetNumVertices(); i++ ) {
		meshVerts[i] = poly.pts[i];
	}
	for( i = 0; i < tris.Count; i++ ) {
		// remember, our tri verts are CCW, but unity expects them in CW
		// thus, the 2/1 flip
		triangles[ 3*i + 0 ] = tris[i].verts[0];
		triangles[ 3*i + 1 ] = tris[i].verts[2];
		triangles[ 3*i + 2 ] = tris[i].verts[1];
	}

	mesh.vertices = meshVerts;
	mesh.triangles = triangles;
	
	var uv = new Vector2[ poly.GetNumVertices() ];
	for( i = 0; i < uv.length; i++ ) uv[i] = meshVerts[i];
	mesh.uv = uv;

	mesh.RecalculateBounds();
	
	//Debug.Log('triangulated polygon to '+tris.Count+' triangles');
}

//----------------------------------------
//	O( n log n) polygon triangulation algorithm
//  Reference: http://www.cs.ucsb.edu/~suri/cs235/Triangulation.pdf
//----------------------------------------
static function TriangulateMonotonePolygon(
		sortedVerts:List.<Vector2IdPair>,
		edge2verts:List.<int>,
		pieceEdges:List.<int>,	// the edges that are part of the monotone piece
		tris:List.<TriIndices> )
{
	var i = 0;
	// create nbor query datastructure
	var nbors = new PolyVertexNbors();
	nbors.Reset( sortedVerts.Count, edge2verts, pieceEdges );

	var sidStack = new Stack.<int>();

	// push first two used vertices onto the stack
	for( var aSid = 0; sidStack.Count < 2; aSid++ ) {
		if( nbors.IsUsed( sortedVerts[aSid].id ) ) {
			sidStack.Push( aSid );
		}
	}

	// start right after the one last pushed
	for( aSid = aSid; aSid < sortedVerts.Count; aSid++ )
	{
		var aVid = sortedVerts[ aSid ].id;
		var aPt = sortedVerts[ aSid ].v;

		// skips verts that aren't in the sub-piece
		if( !nbors.IsUsed( aVid ) )
			continue;

		var topSid = sidStack.Peek();
		var topVid = sortedVerts[ topSid ].id;

		if( nbors.AreNeighbors( aVid, topVid ) )
		{
			var botCase = (nbors.GetPrev( aVid ) == topVid);

			while( sidStack.Count > 0 ) {
				var bSid = sidStack.Pop();
				var bVid = sortedVerts[ bSid ].id;
				if( sidStack.Count == 0 ) {
					// 
					sidStack.Push( bSid );
					sidStack.Push( aSid );
					break;
				}
				var cSid = sidStack.Pop();
				var cVid = sortedVerts[ cSid ].id;

				// see if this makes a valid inside-polygon triangle
				var bPt = sortedVerts[ bSid ].v;
				var cPt = sortedVerts[ cSid ].v;

				var tri:TriIndices = null;
				if( botCase ) {
					if( Math2D.IsRightOfLine( bPt, cPt, aPt ) ) {
						tri = new TriIndices();
						tri.verts[0] = aVid;
						tri.verts[1] = cVid;
						tri.verts[2] = bVid;
					}
				}
				else {
					if( Math2D.IsLeftOfLine( bPt, cPt, aPt ) ) {
						tri = new TriIndices();
						tri.verts[0] = aVid;
						tri.verts[1] = bVid;
						tri.verts[2] = cVid;
					}
				}

				if( tri != null ) {
					tris.Add( tri );
					sidStack.Push( cSid );
				}
				else {
					// couldn't make a tri, push these guys back on, and we're done
					sidStack.Push( cSid );
					sidStack.Push( bSid );
					sidStack.Push( aSid );
					break;
				}
			}
		}
		else {
			// not neighbors
			while( sidStack.Count > 0 ) {
				bSid = sidStack.Pop();
				// was this our last one?
				if( sidStack.Count == 0 ) break;
				bVid = sortedVerts[ bSid ].id;
				cSid = sidStack.Pop();
				cVid = sortedVerts[ cSid ].id;

				// see if this makes a valid inside-polygon triangle
				bPt = sortedVerts[ bSid ].v;
				cPt = sortedVerts[ cSid ].v;

				tri = new TriIndices();

				if( Math2D.IsRightOfLine( bPt, cPt, aPt ) ) {
					tri.verts[0] = aVid;
					tri.verts[1] = cVid;
					tri.verts[2] = bVid;
					tris.Add(tri);
				}
				else if( Math2D.IsLeftOfLine( bPt, cPt, aPt ) ) {
					tri.verts[0] = aVid;
					tri.verts[1] = bVid;
					tri.verts[2] = cVid;
					tris.Add(tri);
				}
				// don't add degen tris
				
				// put C back on for the next iter
				sidStack.Push( cSid );
			}

			// done
			sidStack.Push( topSid );
			sidStack.Push( aSid );
		}
	}

}

static function BuildBeltMesh(
		pts:Vector2[],
		edgeA:int[], edgeB:int[],
		zMin:float, zMax:float,
		normalPointingRight:boolean,
		mesh:Mesh )
{
	var npts = pts.length;

	var vertices = new Vector3[ 2*npts ];
	for( var i = 0; i < npts; i++ )
	{
		var p = pts[i];
		vertices[2*i+0] = Vector3( p.x, p.y, zMin );
		vertices[2*i+1] = Vector3( p.x, p.y, zMax );
	}

	var ntris = 2 * edgeA.length;
	var triangles = new int[ ntris * 3 ];

	for( i = 0; i < edgeA.length; i++ )
	{
		var a = edgeA[i];
		var b = edgeB[i];

		if( normalPointingRight )
		{
			triangles[ 6*i + 0 ] = 2 * a + 0;
			triangles[ 6*i + 1 ] = 2 * b + 0;
			triangles[ 6*i + 2 ] = 2 * a + 1;

			triangles[ 6*i + 3 ] = 2 * b + 0;
			triangles[ 6*i + 4 ] = 2 * b + 1;
			triangles[ 6*i + 5 ] = 2 * a + 1;
		}
		else
		{
			triangles[ 6*i + 0 ] = 2 * a + 0;
			triangles[ 6*i + 1 ] = 2 * a + 1;
			triangles[ 6*i + 2 ] = 2 * b + 0;

			triangles[ 6*i + 3 ] = 2 * b + 0;
			triangles[ 6*i + 4 ] = 2 * a + 1;
			triangles[ 6*i + 5 ] = 2 * b + 1;
		}
	}

	// finalize
	mesh.vertices = vertices;
	mesh.triangles = triangles;
	mesh.RecalculateNormals();
}