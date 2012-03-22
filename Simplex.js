//----------------------------------------
//  Largely based on this tutorial:
//	http://www.zweigmedia.com/RealWorld/tutorialsf4/framesSimplex2.html
//----------------------------------------
#pragma strict

function Awake()
{
	TestGT();
	TestSquareProb();
	TestSimple();
	TestCenterPull();
	TestCenterPullTableau();
}

//----------------------------------------
//  http://en.wikipedia.org/wiki/Simplex_algorithm#Standard_form
//----------------------------------------
static function TestSimple()
{
	var tabData  = [
		1, 2, 3, 4, 0, 0, 0.0,
		0, 3, 2, 1, 1, 0, 10.0,
		0, 2, 5, 3, 0, 1, 15.0 ];

	var tab = new Matrix();
	tab.Reset( tabData, 7 );

	// test writing
	//tab.SaveAscii( '/Users/stevesan84/DUMP-TestSimpleMatrix.txt' );

	SimplexSolver.Solve( tab );
	var x = SimplexSolver.GetSolutionValue( tab, 1 );
	var y = SimplexSolver.GetSolutionValue( tab, 2 );
	var z = SimplexSolver.GetSolutionValue( tab, 3 );
	var OPT = -2*x - 3*y - 4*z;
	Debug.Log('-- TestSimple answer, should be -20 = ' + OPT);

	//tab.SaveAscii( '/Users/stevesan84/DUMP-TestSimpleMatrix-solved.txt' );
}

static function TestGT()
{
	// setup a problem with an aux variable and a GT constraint
	// min z=x, st: x >= 10
	var tabData  = [
		1 , -1 , 0  , 0.0  , 
		0 , 1 , -1 , 10.0
		];

	var tab = new Matrix();
	tab.Reset( tabData, 4 );

	// test writing
	//tab.SaveAscii( '/Users/stevesan84/matrix-test.txt' );

	SimplexSolver.Solve( tab );
	var opt = SimplexSolver.GetSolutionValue( tab, 1 );
	Debug.Log('-- TestGT answer, should be 10 = ' + opt);
}

static function TestSquareProb()
{
	var planeNorms : Vector2[] = [
		Vector2(1,-1).normalized,
		Vector2( 1, 0),
		Vector2(0, 1),
		Vector2(-1,0),
		Vector2(0,-1) ];

	var planePoints : Vector2[] = [
		Vector2(0,0.5),
		Vector2(0,0),
		Vector2(0,0),
		Vector2(1,1),
		Vector2(1,1) ];

	var sq = new Square2D();
	SimplexSolver.SolveMaxSquareProblem(
			planeNorms,
			planePoints,
			Vector2(0,0),
			Vector2( 0.5, 0.5 ),
			0.1,
			new Matrix(),
			sq );
	Debug.Log('-- TestSquareProb  opt radius = ' + sq.radius + ' center = ' + sq.center );
}

static function TestCenterPull()
{
	var planeNorms : Vector2[] = [
		Vector2(0, -1),
		Vector2(0, 1) ];

	var planePoints : Vector2[] = [
		Vector2(0,1),
		Vector2(0,0) ];

	Debug.Log('TestCenterPull');
	var sq = new Square2D();
	SimplexSolver.SolveMaxSquareProblem(
			planeNorms,
			planePoints,
			Vector2(0,0),
			Vector2(5, 0),
			0.1,
			new Matrix(),
			sq );
	Debug.Log('-- TestCenterPull  opt radius = ' + sq.radius + ' center = ' + sq.center );
}

static function TestCenterPullTableau()
{

	var data = [
		-1.0 , 0.0 , 0 , 1  , -0.1 , -0.1 , 0  , 0 , 0 , 0  , 0 , 0  , 0    , 
		0   , 0   , -1 , 1 , 0    , 0    , 1 , 0 , 0 , 0  , 0 , 0  , 0    , 
		0   , 0   , 1 , 1  , 0    , 0    , 0  , 1 , 0 , 0  , 0 , 0  , 1    , 
		0   , 1   , 0 , 0  , -1   , 0    , 0  , 0 , 1 , 0  , 0 , 0  , 5    , 
		0   , 1   , 0 , 0  , 1    , 0    , 0  , 0 , 0 , -1 , 0 , 0  , 5    , 
		0   , 0   , 1 , 0  , 0    , -1   , 0  , 0 , 0 , 0  , 1 , 0  , 0    , 
		0   , 0   , -1 , 0  , 0    , -1    , 0  , 0 , 0 , 0  , 0 , 1 , 0 ];
	
	var tab = new Matrix();
	tab.Reset( data, 13 );

	SimplexSolver.Solve( tab );
	var x = SimplexSolver.GetSolutionValue( tab, 1 );
	var y = SimplexSolver.GetSolutionValue( tab, 2 );
	var r = SimplexSolver.GetSolutionValue( tab, 3 );
	//tab.SaveAscii('/Users/stevesan84/DUMP-centerPullTableauTest-solved.txt');
	Debug.Log('-- Tableau test answer: x = '+x+' y = '+y+' r = '+r );
}

class SimplexSolver
{
	static function CollectNegBasics( tab:Matrix, rowIsNB:boolean[] ) : void
	{
		for( var row = 0; row < tab.numRows(); row++ )
			rowIsNB[row] = false;

		for( var varNum = 1; varNum < tab.numCols()-1; varNum++ )
		{
			var eyeRow = GetEyeRow( tab, varNum );
			if( eyeRow != -1 && tab.Elm(eyeRow, varNum) < 0.0 )
				// got one
				rowIsNB[ eyeRow ] = true;
		}
	}

	static function NegateZeroNegBasics( tab:Matrix, rowIsNB:boolean[] ) : void
	{
		for( var row = 1; row < tab.numRows(); row++ )
		{
			if( rowIsNB[row] && tab.GetLastCol(row) == 0 )
			{
				// negate all coefficients to make this a normal constraint
				for( var col = 0; col < tab.numCols()-1; col++ )
				{
					var elm = tab.Elm(row,col);
					tab.Set( row, col, elm * -1.0 );
				}
				// no longer NB
				rowIsNB[row] = false;
			}
		}
	}

	static function EliminateNegBasics( tab:Matrix ) : void
	{
		var rowIsNB = new boolean[ tab.numRows() ];

		//Debug.Log('-- Elim NBs');

		while( true )
		{
			CollectNegBasics( tab, rowIsNB );
			NegateZeroNegBasics( tab, rowIsNB );
			var nbRow = Utils.FindFirst( rowIsNB );

			if( nbRow == -1 )
				break;

			// find column with largest positive value
			var maxCol = -1;
			var maxColVal = -Mathf.Infinity;
			// exclude last column of RHSs
			for( var col = 0; col < tab.numCols()-1; col++ )
			{
				var val = tab.Elm( nbRow, col );
				if( val > 0.0 && val > maxColVal )
				{
					maxCol = col;
					maxColVal = val;
				}
			}

			if( maxCol == -1 )
			{
				Debug.LogError( "Could not find a pivot column to eliminate neg-basics!");
				return;
			}

			// find minimum test ratio row
			var minRow = -1;
			var minRowRatio = Mathf.Infinity;
			// exclude top row
			for( var row = 1; row < tab.numRows(); row++ )
			{
				val = tab.Elm( row, maxCol );
				if( val > 0.0 )
				{
					var ratio = tab.GetLastCol(row) / val;
					if( ratio < minRowRatio )
					{
						minRow = row;
						minRowRatio = ratio;
					}
					else if( ratio == minRowRatio && rowIsNB[row] )
					{
						// current row is NB, make sure to use it to break ties
						minRow = row;
						minRowRatio = ratio;
					}
				}
			}

			//----------------------------------------
			//  Now pivot!
			//----------------------------------------
			DoPivot( tab, minRow, maxCol );
		}
	}

	static function SelectPivotCol( tab:Matrix ) : int
	{
		var maxPosCol = -1;
		var maxPosVal = -Mathf.Infinity;
		// do not count the first and last columns
		for( var col = 1; col < tab.numCols()-1; col++ )
		{
			// allow us to pick 0's, so allow some stalling
			if( tab.Elm(0, col) > 0 && tab.Elm(0, col) > maxPosVal )
			{
				maxPosCol = col;
				maxPosVal = tab.Elm(0, col);
			}
		}

		return maxPosCol;
	}

	static function SelectPivotRow( tab:Matrix, col:int ) : int
	{
		var minRatio = Mathf.Infinity;
		var minRow = -1;

		for( var row = 1; row < tab.numRows(); row++ )
		{
			var rhs = tab.GetLastCol(row);
			var acr = tab.Elm( row, col );
			if( acr > 0.0 && rhs/acr < minRatio )
			{
				minRow = row;
				minRatio = rhs/acr;
			}
		}

		if( minRow == -1 )
		{
			tab.SaveAscii( '/Users/stevesan84/tableau-minRowError.txt');
			Debug.LogError('could not find minrow?? no elements in column '+col+' above 0?');
		}

		return minRow;
	}

	static function DoPivot( tab:Matrix, pivotRow:int, pivotCol:int )
	{
		//----------------------------------------
		//  Pivot
		//----------------------------------------

		//Debug.Log('pivoting '+pivotRow+', '+pivotCol );
		var oldPivotElm = tab.Elm( pivotRow, pivotCol );

		// first unitize pivot element
		for( var j = 0; j < tab.numCols(); j++ )
		{
			var e = tab.Elm( pivotRow, j );
			tab.Set( pivotRow, j, e / oldPivotElm );
		}

		// zero out other rows
		for( var i = 0; i < tab.numRows(); i++ )
		{
			if( i == pivotRow ) continue;
			var toZero = tab.Elm( i, pivotCol );
			if( toZero == 0.0 ) continue;
			var factor = toZero / tab.Elm( pivotRow, pivotCol );

			for( j = 0; j < tab.numCols(); j++ )
			{
				e = tab.Elm( i, j );
				var pivElm = tab.Elm( pivotRow, j );
				e -= factor*pivElm;
				tab.Set( i, j, e );
			}
		}
	}

	static function Solve( tab : Matrix ) : int
	{
		// check that RHS is all non-neg..
		for( var row = 0; row < tab.numRows(); row++ )
		{
			if( tab.GetLastCol(row) < 0.0 )
			{
				tab.SaveAscii( '/Users/stevesan84/DUMP-tableau-rhsHasNegEntry.txt');
				Debug.LogError('negative entry found in RHS of simplex tableau..');
			}
		}

		//----------------------------------------
		//  Put in standard form by eliminating negative basic variables
		//----------------------------------------
		EliminateNegBasics( tab );

		//----------------------------------------
		//  Pivot iteration
		//----------------------------------------
		var numPivots = 0;
		while( true )
		{
			var pivotCol = SelectPivotCol( tab );
			if( pivotCol == -1 ) break;

			var pivotRow = SelectPivotRow( tab, pivotCol );

			if( pivotRow == -1 )
			{
				Debug.LogError('Could not find valid pivoting row..');
				return;
			}

			DoPivot( tab, pivotRow, pivotCol );
			numPivots++;

			//tab.SaveAscii( '/Users/stevesan84/DEBUG-afterPiv'+numPivots+'-'+pivotRow+'-'+pivotCol+'.txt');
		}

		//Debug.Log('problem is '+tab.numRows() + 'x'+tab.numCols()+' done after '+numPivots+' pivots');
		return numPivots;
	}

	//----------------------------------------
	//  If tab(1:end, col) is an identity column, this returns the row of the 1
	//	Otherwise, -1
	//----------------------------------------
	static function GetEyeRow( tab:Matrix, col:int )
	{
		var EPS = 1e-8;
		var nnz = 0;
		var nzRow = -1;

		for( var r = 0; r < tab.numRows(); r++ )
		{
			if( Mathd.Abs( tab.Elm(r,col) ) > 0.0 )
			{
				nnz++;
				nzRow = r;
			}
		}

		if( nnz != 1 )
			// not an identity row
			return -1;
		else
			return nzRow;
	}

	//----------------------------------------
	//  Essentially just looks to see if the given sub-column is an identity
	//	column or not. If so, returns the entry of b corresponding to the 1's row
	//----------------------------------------
	static function GetSolutionValue( tab:Matrix, col:int )
	{
		var row = GetEyeRow( tab, col );

		if( row == -1 )
			// not a basic var
			return 0.0;
		else
			// is basic var
			return tab.GetLastCol( row ) / tab.Elm( row, col );
	}

	static function SolveMaxSquareProblem(
			planeNorms : Vector2[],
			planePoints : Vector2[],
			botLeftLimit : Vector2,
			pullCenter : Vector2,	// the point the solution should pull towards, but this isn't weighted that heavily
			pullWeight : double,	// relative to 1.0, how much we should pull towards the center vs. maximize the radius
			tab : Matrix,	// for speed, it would be nice if this was pre-allocated
			out : Square2D
			) : int
	{
		var i = 0;
		var r = 0;
		var c = 0;
		var j = 0;
		
		var numCons = planeNorms.length + 4;	// last 4 are for center pulling
		var numRows = 1 + numCons;	// obj func, constraints
		var numCols = 1 + 3 + 2 + numCons + 1; // obj, x,y,radius, pulling aux's, slacks, RHS bounds

		// shift everything up so the bottom-left corner limit is origin,
		// so everything is >= 0

		for( i = 0; i < planePoints.length; i++ )
		{
			planePoints[i] -= botLeftLimit;

			// It's OK if the plane points themselves are out of bounds - they are just a point of reference for the plane
			//Utils.Assert( planePoints[i].x >= 0.0 );
			//Utils.Assert( planePoints[i].y >= 0.0 );
		}

		pullCenter -= botLeftLimit;
		Utils.Assert( pullCenter.x >= 0.0 );
		Utils.Assert( pullCenter.y >= 0.0 );

		//----------------------------------------
		// set up tableau: U/V are our auxillary vars for distance
		//  Z & X   & Y   & R           & U   & V   & slacks & bound
		//  1 & 0   & 0   & 1           & w   & w   & ...    & 0
		//  0 & nix & niy & (?nix ?niy) & 0   & 0   & ...    & (ni dot pi)
		//	0 & 1   & 0   & 0           & -1  & 0 	& ...    & px
		//	0 & -1  & 0   & 0           & -1  & 0 	& ...    & -px
		//	0 & 0   & 1   & 0           & 0   & -1	& ...    & py
		//	0 & 0   & -1  & 0           & 0   & -1 	& ...    & -py
		//----------------------------------------

		tab.Reset( numRows, numCols );

		// first column
		tab.Set( 0, 0, 1.0 );
		for( r = 1; r < tab.numRows(); r++ )
			tab.Set( r, 0, 0.0 );

		// first row
		for( c = 1; c < tab.numCols(); c++ )
			tab.Set( 0, c, 0.0 );
		// column 3 is our radius variable - the only thing we care about
		// we set this to positive 1.0 because we want to MAXIMIZE it
		tab.Set( 0, 3, 1.0 );
		// aux center-pulling vars. Make sure we make weights negative..
		// since we're actually trying to minimize them..
		tab.Set( 0, 4, -pullWeight );
		tab.Set( 0, 5, -pullWeight );

		// fill out the body
		for( i = 0; i < planeNorms.length; i++ )
		{
			r = i+1;

			// we use the reverse norm, as we want our box to be on the "positive" side of the plane
			var norm = -1 * planeNorms[i];
			var pt = planePoints[i];

			var bound = Vector2.Dot( norm, pt );
			// We can't have negative RHS, so just flip the signs of all
			// coefficients and turn this into a >= constraint if need be
			var rhsSign = ( bound >= 0.0 ? 1.0 : -1.0 );

			// set X,Y coefficients
			tab.Set( r, 1, rhsSign*norm.x );
			tab.Set( r, 2, rhsSign*norm.y );

			// set identity entry for slack var
			tab.Set( r, 5+r, rhsSign*1.0 );

			// set constraint bound
			tab.Set( r, tab.numCols()-1, rhsSign*bound );

			// Set the R coefficients
			// The signs of the normal component determines which corner we care about
			var xSign = ( norm.x >= 0.0 ? 1.0 : -1.0 );
			var ySign = ( norm.y >= 0.0 ? 1.0 : -1.0 );

			tab.Set( r, 3, rhsSign*(xSign*norm.x+ySign*norm.y) );
		}

		//----------------------------------------
		//  Fill out center-pulling aux var constraints and slack vars
		//----------------------------------------
		r = planeNorms.length + 1;
		var last = tab.numCols()-1;

		// x-u <= px
		tab.Set( r+0, 1, 1.0 );
		tab.Set( r+0, 4, -1.0 );
		tab.Set( r+0, last-4, 1.0 );
		tab.Set( r+0, last, pullCenter.x );

		// x+u >= px
		tab.Set( r+1, 1, 1.0 );
		tab.Set( r+1, 4, 1.0 );
		tab.Set( r+1, last-3, -1.0 );
		tab.Set( r+1, last, pullCenter.x );

		// y-u <= py
		tab.Set( r+2, 2, 1.0 );
		tab.Set( r+2, 5, -1.0 );
		tab.Set( r+2, last-2, 1.0 );
		tab.Set( r+2, last, pullCenter.y );

		// y+u >= py
		tab.Set( r+3, 2, 1.0 );
		tab.Set( r+3, 5, 1.0 );
		tab.Set( r+3, last-1, -1.0 );
		tab.Set( r+3, last, pullCenter.y );

		// TEMP write it out
		//tab.SaveAscii( '/Users/stevesan84/squareProblemTableau.txt');

		// DO IT
		var npivots = Solve(tab);

		out.center.x = GetSolutionValue( tab, 1 );
		out.center.y = GetSolutionValue( tab, 2 );
		out.radius = GetSolutionValue( tab, 3 );

		// reapply bot left offset
		out.center += botLeftLimit;

		//Debug.Log('-- MaxSquare np='+planeNorms.length+ ' opt radius = ' + out.radius + ' center = ' + out.center );

		//tab.SaveAscii( '/Users/stevesan84/squareProblemTableau-solved.txt');

		if( out.radius < 1e-4 )
		{
			Debug.Log('very small radius, npivs = '+npivots);
			tab.SaveAscii('/Users/stevesan84/DEBUG-smallRadiusTableau.txt');
		}
		else
		{
			//Debug.Log('normal radius, npivs = '+npivots);
			//tab.SaveAscii('/Users/stevesan84/DEBUG-normalRadiusTableau.txt');
		}


		return npivots;
	}
}