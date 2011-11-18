/** 
 * \file xml3d_extensions.js
 * 
 * Provides useful extensions to the standard datatypes of xml3d. 
 */

// ----------------------------------------------------------------------------
// --- XML3DRotation ---
// ----------------------------------------------------------------------------
/** 
 * Return the rotation as axis-angle string. 
 */
XML3DRotation.prototype.toString = function() {
	return this.axis.toString() + " " + this.angle; 
};

if(!XML3DRotation.fromMatrix)
{
	XML3DRotation.fromMatrix = function(mat) {
		
		// for column-major 
		
		var q = new XML3DRotation();
		var trace = mat.m11 + mat.m22 + mat.m33;
		if (trace > 0) {		
			var s = 2.0 * Math.sqrt(trace + 1.0);
			q.w = 0.25 * s;
			q.x = (mat.m23 - mat.m32) / s;
			q.y = (mat.m31 - mat.m13) / s;
			q.z = (mat.m12 - mat.m21) / s;
		} else {
			if (mat.m11 > mat.m22 && mat.m11 > mat.m33) {
				var s = 2.0 * Math.sqrt(1.0 + mat.m11 - mat.m22 - mat.m33);
				q.w = (mat.m23 - mat.m32) / s;
				q.x = 0.25 * s;
				q.y = (mat.m21 + mat.m12) / s;
				q.z = (mat.m31 + mat.m13) / s;
			} else if (mat.m22 > mat.m33) {
				var s = 2.0 * Math.sqrt(1.0 + mat.m22 - mat.m11 - mat.m33);
				q.w = (mat.m31 - mat.m13) / s;
				q.x = (mat.m21 + mat.m12) / s;
				q.y = 0.25 * s;
				q.z = (mat.m32 + mat.m23) / s;
			} else {
				var s = 2.0 * Math.sqrt(1.0 + mat.m33 - mat.m11 - mat.m22);
				q.w = (mat.m12 - mat.m21) / s;
				q.x = (mat.m31 + mat.m13) / s;
				q.y = (mat.m32 + mat.m23) / s;
				q.z = 0.25 * s;
			}
		}
		var img = new XML3DVec3(q.x, q.y, q.z); 
		if(img.equals(new XML3DVec3(0,0,0)))
		{
			q = new XML3DRotation(); 
		}
		else 
			q.setQuaternion(img, q.w);
		
		return q;
	};
}

//----------------------------------------------------------------------------
// --- XML3DRay --- 
//----------------------------------------------------------------------------
XML3DRay.prototype.toString = function() { 
	return "[ pos: " + this.origin.toString() + "; dir: " + this.direction.toString() + "]";  
};

//----------------------------------------------------------------------------
// --- XML3DMatrix --- 
//----------------------------------------------------------------------------
/** Multiplies this matrix with the given vector */ 
XML3DMatrix.prototype.multiplyDir = function(vec) {
	
	return this.multiplyPt(vec, 0); 
};

/** Multiplies this matrix with the given point, that 
 *  is represented by a 3D vector and a scalar w for the 4th dimension. */ 
XML3DMatrix.prototype.multiplyPt = function(vec, w) {

	if(w === undefined || w === null)
		w = 1;
	
	var _x = 0; var _y = 0; var _z = 0; var _w = w; 
	  	  	 
	// column-major multiplication: translation in last column 
  	_x = this.m11 * vec.x + this.m21 * vec.y + this.m31 * vec.z + this.m41 * w; 
	_y = this.m12 * vec.x + this.m22 * vec.y + this.m32 * vec.z + this.m42 * w;  
	_z = this.m13 * vec.x + this.m23 * vec.y + this.m33 * vec.z + this.m43 * w; 
	_w = this.m14 * vec.x + this.m24 * vec.y + this.m34 * vec.z + this.m44 * w;
	
	if(_w != 0)
	{
		_x = _x/_w;
		_y = _y/_w; 
		_z = _z/_w; 
	}
	
	return new XML3DVec3(_x, _y, _z); 
};

/** 
 * Convert the matrix to a string, optionally using a table. The returned string 
 * is output row-major (although XML3DMatrix is column-major). 
 * 
 * @pretty do a pretty output by wrapping the matrix in a table.
 */
XML3DMatrix.prototype.toString = function(pretty) { 
	
	var ret = ""; // return string
	var es = " "; // element separator
	var rs = ""; // row start 
	var re = " | "; // row end
	
	if(pretty)
	{
		var td_style = "width:50px;"; 
		ret = "<table>";
		es = "</td><td style=\"" + td_style + "\">"; 
		rs = "<tr><td style=\"" + td_style + "\">"; 
		re = "</td></tr>";
	}
		
	ret += rs + this.m11.toFixed(3) + es + this.m21.toFixed(3) + es + this.m31.toFixed(3) + es + this.m41.toFixed(3) + re;
	ret += rs + this.m12.toFixed(3) + es + this.m22.toFixed(3) + es + this.m32.toFixed(3) + es + this.m42.toFixed(3) + re;
	ret += rs + this.m13.toFixed(3) + es + this.m23.toFixed(3) + es + this.m33.toFixed(3) + es + this.m43.toFixed(3) + re;
	ret += rs + this.m14.toFixed(3) + es + this.m24.toFixed(3) + es + this.m34.toFixed(3) + es + this.m44.toFixed(3) + re;
	
	if(pretty)
	{
		ret += "</table>"; 
	}
	
	return ret; 
};

if(!XML3DMatrix.prototype.transpose)
{
	XML3DMatrix.prototype.transpose = function() {		
		return new XML3DMatrix(
			this.m11, this.m21, this.m31, this.m41, 
			this.m12, this.m22, this.m32, this.m42,
			this.m13, this.m23, this.m33, this.m43,
			this.m14, this.m24, this.m34, this.m44
		);
	}; 
}

/** 
 * Return the translation of this matrix as XML3DVec3. 
 */
XML3DMatrix.prototype.translation = function() 
{	
	return new XML3DVec3(this.m41, this.m42, this.m43); 
}

/** 
 * Return the scale of this matrix as XML3DVec3. 
 */
XML3DMatrix.prototype.scale = function() 
{	
	var v = new XML3DVec3(); 
	
	// scale factor are the magnitudes of the first three basis vectors
	// cf. http://www.gamedev.net/topic/491578-get-scale-factor-from-a-matrix/
	v.x = this.m11; v.y = this.m12; v.z = this.m13; 
	var sx = v.length();
	
	v.x = this.m21; v.y = this.m22; v.z = this.m23; 
	var sy = v.length(); 
	
	v.x = this.m31; v.y = this.m32; v.z = this.m33;
	var sz = v.length(); 
	
	return new XML3DVec3(sx, sy, sz); 
};  

/** 
 * Return the rotation of this matrix as XML3DRotation. 
 */
XML3DMatrix.prototype.rotation = function() 
{
	return XML3DRotation.fromMatrix(this); 
}; 

//----------------------------------------------------------------------------
// --- XML3DVec3 ---
//----------------------------------------------------------------------------
XML3DVec3.prototype.toString = function() { 
	return this.x.toFixed(3) + " " + this.y.toFixed(3) + " " + this.z.toFixed(3); 
};

XML3DVec3.prototype.equals = function(other) { 
	
	if(!other)
		return false; 
	
	return org.xml3d.math.epsilonEquals(this.x, other.x) 
		&& org.xml3d.math.epsilonEquals(this.y, other.y) 
		&& org.xml3d.math.epsilonEquals(this.z, other.z);
}; 

XML3DVec3.prototype.inverse = function() { 
	
	return new XML3DVec3(1/this.x, 1/this.y, 1/this.z); 
}; 

//----------------------------------------------------------------------------
// --- XML3DBox ---
//----------------------------------------------------------------------------
XML3DBox.prototype.size = function() { 
	
	return this.max.subtract(this.min); 
};
 
XML3DBox.prototype.intersects = function(other) { 
	
	return (this.min.x < other.max.x) && (this.max.x > other.min.x) 
	&&     (this.min.y < other.max.y) && (this.max.y > other.min.y) 
	&&     (this.min.z < other.max.z) && (this.max.z > other.min.z); 
	
};

XML3DBox.prototype.toString = function() { 
	return "[ min: " + this.min.toString() + "; max: " + this.max.toString() + "]";  
};

XML3DBox.prototype.equals = function(other)
{
	return this.min.equals(other.min)
		&& this.max.equals(other.max); 
};

/** 
 * Transforms the min and max of this box with the given matrix. 
 * Afterwards validates it. 
 */
XML3DBox.prototype.transform = function(mat)
{
	this.min = mat.multiplyPt(this.min); 
	this.max = mat.multiplyPt(this.max); 	
	
	this.validate(); 
	
	return this; 
}; 

/** 
 * Returns the box that sets the min and max properties to 
 * the minimal and maximal vectors of min and max, respectively.
 */
XML3DBox.prototype.validate = function() 
{
	var mi = this.min; 
	var ma = this.max; 
	
	this.min = org.xml3d.math.minVec(mi, ma); 
	this.max = org.xml3d.math.maxVec(mi, ma);
	
	return this; 
}; 