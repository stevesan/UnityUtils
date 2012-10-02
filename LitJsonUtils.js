#pragma strict

import System.Text;
import LitJson;

/* Utilities for using LitJson */

class MyJsonWriter extends JsonWriter
{
	public function MyJsonWriter( sb:StringBuilder )
	{
		super(sb);
	}
	
	public function Write( v:Vector3 )
	{
		this.WriteArrayStart();
		this.Write(v.x);
		this.Write(v.y);
		this.Write(v.z);
		this.WriteArrayEnd();
	}

	public function Write( v:Vector2 )
	{
		this.WriteArrayStart();
		this.Write(v.x);
		this.Write(v.y);
		this.WriteArrayEnd();
	}
	
	// Shortcuts for properties
	public function Write( prop:String, v:Vector3 )
	{
		WritePropertyName(prop);
		Write(v);
	}

	public function Write( prop:String, v:Vector2 )
	{
		WritePropertyName(prop);
		Write(v);
	}
	
	public function Write( prop:String, v:float )
	{
		WritePropertyName(prop);
		Write(v);
	}
}

class ToStringJsonWriter extends MyJsonWriter
{
	private var sb = null;
	
	public function ToStringJsonWriter()
	{
		sb = new StringBuilder();
		super(sb);
	}
	
	public function GetString() : String { return sb.ToString(); }
}