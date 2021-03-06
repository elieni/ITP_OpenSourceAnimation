﻿//
// KinectToPin Motion Capture Tools v. 1.1
//
// by Nick Fox-Gieg and Victoria Nece
// kinecttopin.fox-gieg.com
//
// Requires CS3+ for 2D puppet setup and CS5.5+ for 3D puppet setup.
// Works with tracking data generated by the KinectToPin application, available here: https://github.com/N1ckFG/KinectToPin/downloads
//
// Thanks to Jeff Almasol, Dan Ebberts, Peter Kahrel and Chris Wright
// 

{

// KinectToPin UI Panel Setup

var jointNamesMaster = ["head", "neck", "torso", "l_shoulder", "l_elbow", "l_hand", "r_shoulder", "r_elbow", "r_hand", "l_hip", "l_knee", "l_foot", "r_hip", "r_knee", "r_foot"];


   function kinectToPin_panel(thisObj) {     
	var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "KinectToPin", undefined, {resizeable: true});

	   	//Jeff Almasol's solution to fix text color
	var winGfx = myPanel.graphics;
	var darkColorBrush = winGfx.newPen(winGfx.BrushType.SOLID_COLOR, [0,0,0], 1);
			
            myPanel.orientation = "column";
            myPanel.alignChildren = "left";
            
         var setupGroup = myPanel.add("panel", undefined, '2D Setup'); 
         setupGroup.orientation = "row";
         setupGroup.alignChildren = "left";					
		var but_01 = setupGroup.add("button", undefined, "Create 2D Template");
         var but_05 = setupGroup.add("button",undefined, "Import 2D MoCap Data");
          
         var importGroup = myPanel.add("panel",undefined, '3D Setup (CS5.5+ Only)');   
         importGroup.orientation="row";
         importGroup.alignChildren = "left";
         var but_02 = importGroup.add("button", undefined, "Create 3D Template");
         var but_06 = importGroup.add("button",undefined, "Import 3D MoCap Data");
         
         var charGroup = myPanel.add("panel",undefined,'Character Setup');   
         charGroup.orientation = "row";
         charGroup.alignChildren = "left";
		var but_03 = charGroup.add("button", undefined, "Rig Puppet Layers");
		var but_04 = charGroup.add("button", undefined,"Rig Head, Hands + Feet");

        myPanel.layout.layout();
	 	 
		but_01.onClick = create2DTemplate;
         but_02.onClick = create3DTemplate;
		but_03.onClick = rigPuppet;
		but_04.onClick = rigExtremities;
		but_05.onClick = importMocap2D;
         but_06.onClick = importMocap3D;
	 
	       return myPanel;
           
           myPanel.show();
				
            }
        


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Build the rig template with placeholder source pins and 2D control nulls

function create2DTemplate() { // KinectToPin Template Setup for UI Panels

 //start script
	app.beginUndoGroup("Create 2D Template");

	// create project if necessary
	var proj = app.project;
	if(!proj) proj = app.newProject();

	// create new comp named 'my comp'
	var compW = 1920; // comp width
	var compH = 1080; // comp height
	var compL = 15;  // comp length (seconds)
	var compRate = 24; // comp frame rate
	var compBG = [0/255,0/255,0/255]; // comp background color
	var myItemCollection = app.project.items;
	var myComp = myItemCollection.addComp('KinectToPin 2D Template',compW,compH,1,compL,compRate);
	myComp.bgColor = compBG;
	
	// add mocap source layer
	var mocap = myComp.layers.addSolid([0, 0, 0], "mocap", 640, 480, 1);
	mocap.guideLayer = true;
	mocap.locked = true;
	mocap.property("position").setValue([320,240]);
	mocap.property("opacity").setValue(0);
	
	// array of all points KinectToPin tracks
	var trackpoint = jointNamesMaster;
	
	
			// create source point control and control null for each
			for (var i = 0; i <= 14; i++){        

				// add source point
				var pointname = trackpoint[i];
				var myEffect = mocap.property("Effects").addProperty("Point Control");
				myEffect.name = pointname;
				var p = mocap.property("Effects")(pointname)("Point");
				p.expression = """smooth(.2,5)""";
			}

			for (var j = 14; j >= 0; j--){ 
				// add control null
				var pointname = trackpoint[j];
				var solid = myComp.layers.addSolid([1.0, 0, 0], pointname, 50, 50, 1);
				solid.guideLayer = true;
				solid.property("opacity").setValue(33);
				var p = solid.property("position");
				var expression = 
	//~~~~~~~~~~~~~expression here~~~~~~~~~~~~~~~
		"var sW = 640;" +
		"var sH = 480;" +
		"var dW = thisComp.width;" +
		"var dH = thisComp.height;" +
		"var x = fromComp(thisComp.layer(\"mocap\").effect(\"" + pointname +  "\")(\"Point\"))[0];" +
		"var y = fromComp(thisComp.layer(\"mocap\").effect(\"" + pointname + "\")(\"Point\"))[1];" +
		"[(1.5 * dW) + (x*(dW/sW)),dH + (y*(dH/sH))];";
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				p.expression = expression;
	
			}
	
	app.endUndoGroup();
    }  //end script



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Build the 3D rig template with placeholder source pins, virtual camera and control nulls

function create3DTemplate() { // KinectToPin Template Setup for UI Panels

 //start script
	app.beginUndoGroup("Create 3D Template");

    if(parseFloat(app.version) >= 10.5){

	// create project if necessary
	var proj = app.project;
	if(!proj) proj = app.newProject();
    
	// create new comp named 'my comp'
	var compW = 1920; // comp width
	var compH = 1080; // comp height
	var compL = 15;  // comp length (seconds)
	var compRate = 24; // comp frame rate
	var compBG = [0/255,0/255,0/255]; // comp background color
	var myItemCollection = app.project.items;
	var myComp = myItemCollection.addComp('KinectToPin 3D Template',compW,compH,1,compL,compRate);
	myComp.bgColor = compBG;
	
  
	// add mocap source layer
	var mocap = myComp.layers.addSolid([0, 0, 0], "mocap", 640, 480, 1);
	mocap.guideLayer = true;
	mocap.locked = true;
	mocap.property("position").setValue([320,240]);
	mocap.property("opacity").setValue(0);
	
	// array of all points KinectToPin tracks
	var trackpoint = jointNamesMaster;
	
	
			// create source point control and control null for each
			for (var i = 0; i <= 14; ++i){        

				// add source point
				var pointname = trackpoint[i];
				var myEffect = mocap.property("Effects").addProperty("3D Point Control");
				myEffect.name = pointname;
				var p = mocap.property("Effects")(pointname)("3D Point");
				p.expression = """smooth(.2,5)""";
			}

			for (var j=14; j >= 0; j--){
				// add control null
				var pointname = trackpoint[j];
				var solid = myComp.layers.addSolid([1.0, 0, 0], pointname, 50, 50, 1);
				solid.guideLayer = true;
                 solid.threeDLayer = true;
				solid.property("opacity").setValue(33);
				var p = solid.property("position");
				var expression = 
	//~~~~~~~~~~~~~expression here~~~~~~~~~~~~~~~
"pos = toComp(thisComp.layer(\"mocap\").effect(\"" + pointname + "\")(\"3D Point\"));[pos[0],pos[1],(pos[2]-2000)*10]"
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				p.expression = expression;
	
	}
	
    //add control camera
    myComp.layers.addCamera("KinectToPin Camera", [960,540]);    
    } else {
     // Alert users of incompatibility with older versions of AE
     alert("Sorry, this feature only works with CS5.5 and higher.");
     }
    
	app.endUndoGroup();
    }  //end script


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Connect puppet layers to control nulls and add scaling algorithm

function rigPuppet(){ //start script
    app.beginUndoGroup("Rig Puppet Layers");
    
 var theComp = app.project.activeItem;
 

// check if comp is selected
if (theComp == null || !(theComp instanceof CompItem)){

// if no comp selected, display an alert
alert("Please establish a comp as the active item and run the script again");

} else { 
    
// otherwise, loop through each layer in the selected comp
for (var i = 1; i <= theComp.numLayers; ++i){

        // define the layer in the loop we're currently looking at
        var curLayer = theComp.layer(i);
        
   
// Select layer to add expression to
if (curLayer.matchName == "ADBE AV Layer" && curLayer.effect.puppet != null){
    
        var scaleexpression = "try{g1 = (toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]));g2 = thisComp.activeCamera.toWorldVec([0,0,1]);find = dot(g1,g2);value/(find/2000);}catch(err){ value }"
        curLayer.property("Transform").property("Scale").expression = scaleexpression;
        
		// How many pins?
		wherePins = curLayer.property("Effects").property("Puppet").property("arap").property("Mesh").property("Mesh 1").property("Deform");
         var pinCount = wherePins.numProperties;
         
    for (var n = 1; n <= pinCount; n++)
				{
				
                // Get name of puppet pin and insert in expression string
                var pin = curLayer.property("Effects").property("Puppet").property("arap").property("Mesh").property("Mesh 1").property("Deform").property(n).name;
                var pinexpression = "fromComp(thisComp.layer(\"" + pin + "\").transform.position);"

                // Connect to control null
                curLayer.effect("Puppet").arap.mesh("Mesh 1").deform(n).position.expression = pinexpression;

				}   
    
 } 

// Warning for shape layers!
if (curLayer instanceof ShapeLayer && curLayer.effect.puppet != null){
        
        alert("Precompose shape layers before adding Puppet pins.");
 
    }
// End warning



}

}
    
    
    
    app.endUndoGroup();
}  //end script


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Connect non-puppet layers to control nulls
function rigExtremities(){ //start script
    app.beginUndoGroup("Rig Extremities");
    
 var theComp = app.project.activeItem;
 

// check if comp is selected
if (theComp == null || !(theComp instanceof CompItem)){

// if no comp selected, display an alert
alert("Please establish a comp as the active item and run the script again");

} else { 
    
// otherwise, loop through each layer in the selected comp
for (var i = 1; i <= theComp.numLayers; ++i){

        // define the layer in the loop we're currently looking at
        var curLayer = theComp.layer(i);
        
   
// Add expressions for left hand
if (curLayer.name == "l_hand_layer"){
    
        var scaleexpression = "try{g1 = (toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]));g2 = thisComp.activeCamera.toWorldVec([0,0,1]);find = dot(g1,g2);value/(find/2000);}catch(err){ value }";
        curLayer.property("Transform").property("Scale").expression = scaleexpression;
        
        var posexpression = "pos = thisComp.layer(\"l_hand\").transform.position;[pos[0], pos[1]];";
         curLayer.property("Transform").property("Position").expression = posexpression;
         
         var rotexpression = "this_point=thisComp.layer(\"l_hand\").transform.position;that_point=thisComp.layer(\"l_elbow\").transform.position;delta=sub(this_point, that_point);angle=Math.atan2(delta[1], delta[0]);ang = radians_to_degrees(angle);(ang+270)%360+transform.rotation;"
         curLayer.property("Transform").property("Rotation").expression = rotexpression;


}else{}

// Add expressions for left foot
if (curLayer.name == "l_foot_layer"){
    
        var scaleexpression = "try{g1 = (toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]));g2 = thisComp.activeCamera.toWorldVec([0,0,1]);find = dot(g1,g2);value/(find/2000);}catch(err){ value }";
        curLayer.property("Transform").property("Scale").expression = scaleexpression;
        
        var posexpression = "pos = thisComp.layer(\"l_foot\").transform.position;[pos[0], pos[1]];";
         curLayer.property("Transform").property("Position").expression = posexpression;
         
         var rotexpression = "this_point=thisComp.layer(\"l_foot\").transform.position;that_point=thisComp.layer(\"l_knee\").transform.position;delta=sub(this_point, that_point);angle=Math.atan2(delta[1], delta[0]);ang = radians_to_degrees(angle);(ang+270)%360+transform.rotation;"
         curLayer.property("Transform").property("Rotation").expression = rotexpression;


}else{}

// Add expressions for right hand
if (curLayer.name == "r_hand_layer"){
    
        var scaleexpression = "try{g1 = (toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]));g2 = thisComp.activeCamera.toWorldVec([0,0,1]);find = dot(g1,g2);value/(find/2000);}catch(err){ value }";
        curLayer.property("Transform").property("Scale").expression = scaleexpression;
        
        var posexpression = "pos = thisComp.layer(\"r_hand\").transform.position;[pos[0], pos[1]];";
         curLayer.property("Transform").property("Position").expression = posexpression;
         
         var rotexpression = "this_point=thisComp.layer(\"r_hand\").transform.position;that_point=thisComp.layer(\"r_elbow\").transform.position;delta=sub(this_point, that_point);angle=Math.atan2(delta[1], delta[0]);ang = radians_to_degrees(angle);(ang+270)%360+transform.rotation;"
         curLayer.property("Transform").property("Rotation").expression = rotexpression;


}else{}

// Add expressions for right foot
if (curLayer.name == "r_foot_layer"){
    
        var scaleexpression = "try{g1 = (toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]));g2 = thisComp.activeCamera.toWorldVec([0,0,1]);find = dot(g1,g2);value/(find/2000);}catch(err){ value }";
        curLayer.property("Transform").property("Scale").expression = scaleexpression;
        
        var posexpression = "pos = thisComp.layer(\"r_foot\").transform.position;[pos[0], pos[1]];";
         curLayer.property("Transform").property("Position").expression = posexpression;
         
         var rotexpression = "this_point=thisComp.layer(\"r_foot\").transform.position;that_point=thisComp.layer(\"r_knee\").transform.position;delta=sub(this_point, that_point);angle=Math.atan2(delta[1], delta[0]);ang = radians_to_degrees(angle);(ang+270)%360+transform.rotation;"
         curLayer.property("Transform").property("Rotation").expression = rotexpression;


}else{}

// Add expressions for head
if (curLayer.name == "head_layer"){
    
        var scaleexpression = "try{g1 = (toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]));g2 = thisComp.activeCamera.toWorldVec([0,0,1]);find = dot(g1,g2);value/(find/2000);}catch(err){ value }";
        curLayer.property("Transform").property("Scale").expression = scaleexpression;
        
        var posexpression = "pos = thisComp.layer(\"head\").transform.position;[pos[0], pos[1]];";
         curLayer.property("Transform").property("Position").expression = posexpression;
         
         var rotexpression = "this_point=thisComp.layer(\"neck\").transform.position;that_point=thisComp.layer(\"head\").transform.position;delta=sub(this_point, that_point);angle=Math.atan2(delta[1], delta[0]);ang = radians_to_degrees(angle);(ang+270)%360+transform.rotation;"
         curLayer.property("Transform").property("Rotation").expression = rotexpression;


}else{}

}

}
    
    
    
    app.endUndoGroup();
}  //end script


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Import XML or JSON file of tracking data for 2D characters
function importMocap2D(){  //start script
	app.beginUndoGroup("Import 2D Points From XML or JSON");

    var myComp = app.project.activeItem;
    var fileType="xml";
    var myRoot;
    //load xml or json file
	var myFile = File.openDialog();
	var fileOK = myFile.open("r");
	if (fileOK){
  		var myFileString = myFile.read();
  		if(myFile.name.split('.').pop()=="xml"){
  			fileType="xml";
  			myRoot = new XML(myFileString);
  		}else if(myFile.name.split('.').pop()=="json"){
  			fileType="json";
  			myRoot = eval("(" + myFileString + ")");
  		}
  		myFile.close();
	}

	if(fileType=="xml"){
	//~~~~~~~~~~~~~~~~~begin 2D XML version
		var compRate = parseFloat(myRoot.@fps); // comp frame rate

		var sW = parseFloat(myRoot.@width);
		var sH = parseFloat(myRoot.@height);

		var mocap = myComp.layer("mocap");

		var trackPoint = jointNamesMaster;

		// add joint information
		for(var j=0;j<trackPoint.length;j++){
			var myEffect = mocap.property("Effects").property(trackPoint[j]);
			myEffect.name = trackPoint[j];
			var p = mocap.property("Effects")(trackPoint[j])("Point");

			for(var i=0;i<myRoot.MocapFrame.length();i++){
				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				//keyframes go here
				//var pTfps = myRoot.@fps;
				var pT = i/compRate;
				var pXs = myRoot.MocapFrame[i].Skeleton.Joints.descendants(trackPoint[j]).@x;
				var pYs = myRoot.MocapFrame[i].Skeleton.Joints.descendants(trackPoint[j]).@y;

				if(pXs != "NaN" && pYs != "NaN"){
					var pX = parseFloat(pXs);
					var pY = parseFloat(pYs);
					p.setValueAtTime(pT, [pX * sW, pY * sH]);
				}
				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			}


		}
	//~~~~~~~~~~~~~~~~~end 2D XML version
	} else if(fileType=="json"){
	//~~~~~~~~~~~~~begin 2D JSON version
		var compRate = myRoot.MotionCapture.fps; // comp frame rate
		var sW = myRoot.MotionCapture.width;
		var sH = myRoot.MotionCapture.height;
		var sD = myRoot.MotionCapture.depth;
		
		var mocap = myComp.layer("mocap");

		var trackPoint = jointNamesMaster;

		// add joint information
		for(var name in myRoot.MotionCapture.MocapFrame.Skeleton[0].Joints){
			var myEffect = mocap.property("Effects").property(myRoot.MotionCapture.MocapFrame.Skeleton[0].Joints[name].name);
			myEffect.name = myRoot.MotionCapture.MocapFrame.Skeleton[0].Joints[name].name;
			var p = mocap.property("Effects")(myRoot.MotionCapture.MocapFrame.Skeleton[0].Joints[name].name)("Point");
			
			for(var i=0;i<myRoot.MotionCapture.numFrames;i++){
				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
					//keyframes go here
					var pT = i/compRate;
					var pX = myRoot.MotionCapture.MocapFrame.Skeleton[0].Joints[name].pos[i].x;
					var pY = myRoot.MotionCapture.MocapFrame.Skeleton[0].Joints[name].pos[i].y;
					p.setValueAtTime(pT, [pX,pY]);
					
				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			}
			
		}
	//~~~~~~~~~~~~~end 2D JSON version
	}

	app.endUndoGroup();
}  //end script


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Import XML or JSON file of tracking data for 3D characters
function importMocap3D(){  //start script
	app.beginUndoGroup("Import 3D Points From XML or JSON");

    if(parseFloat(app.version) >= 10.5){


    var myComp = app.project.activeItem;
    var fileType="xml";
    var myRoot;
	//load xml or json file
	var myFile = File.openDialog();
	var fileOK = myFile.open("r");
	if (fileOK){
  		var myFileString = myFile.read();
  		if(myFile.name.split('.').pop()=="xml"){
  			fileType="xml";
  			myRoot = new XML(myFileString);
  		}else if(myFile.name.split('.').pop()=="json"){
  			fileType="json";
  			myRoot = eval("(" + myFileString + ")");
  		}
  		myFile.close();
	}
    
	if(fileType=="xml"){
		//~~~~~~~~~~~~~~~~~begin 3D XML version
		var compRate = parseFloat(myRoot.@fps); // comp frame rate

		var sW = parseFloat(myRoot.@width);
		var sH = parseFloat(myRoot.@height);
		var sD = parseFloat(myRoot.@depth);

		var mocap = myComp.layer("mocap");

		var trackPoint = jointNamesMaster;

		// add joint information
		for(var j=0;j<trackPoint.length;j++){
			var myEffect = mocap.property("Effects").property(trackPoint[j]);
			myEffect.name = trackPoint[j];
			var p = mocap.property("Effects")(trackPoint[j])("3D Point");

			for(var i=0;i<myRoot.MocapFrame.length();i++){
				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				//keyframes go here
				//var pTfps = myRoot.@fps;
				var pT = i/compRate;
				var pXs = myRoot.MocapFrame[i].Skeleton.Joints.descendants(trackPoint[j]).@x;
				var pYs = myRoot.MocapFrame[i].Skeleton.Joints.descendants(trackPoint[j]).@y;
				var pZs = myRoot.MocapFrame[i].Skeleton.Joints.descendants(trackPoint[j]).@z;

				if(pXs != "NaN" && pYs != "NaN" && pZs != "NaN"){
					var pX = parseFloat(pXs);
					var pY = parseFloat(pYs);
					var pZ = parseFloat(pZs);
					p.setValueAtTime(pT, [pX * sW, pY * sH, pZ * sD]);
				}
				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			}


		}
		//~~~~~~~~~~~~~~~~~end 3D XML version
	} else if(fileType=="json"){
		//~~~~~~~~~~~~~begin 3D JSON version
			var compRate = myRoot.MotionCapture.fps; // comp frame rate
			var sW = myRoot.MotionCapture.width;
			var sH = myRoot.MotionCapture.height;
			var sD = myRoot.MotionCapture.depth;
			
			var mocap = myComp.layer("mocap");

			var trackPoint = jointNamesMaster;

			// add joint information
		for(var name in myRoot.MotionCapture.MocapFrame.Skeleton[0].Joints){
			var myEffect = mocap.property("Effects").property(myRoot.MotionCapture.MocapFrame.Skeleton[0].Joints[name].name);
			myEffect.name = myRoot.MotionCapture.MocapFrame.Skeleton[0].Joints[name].name;
			var p = mocap.property("Effects")(myRoot.MotionCapture.MocapFrame.Skeleton[0].Joints[name].name)("3D Point");
			
			for(var i=0;i<myRoot.MotionCapture.numFrames;i++){
				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
					//keyframes go here
					var pT = i/compRate;
					var pX = myRoot.MotionCapture.MocapFrame.Skeleton[0].Joints[name].pos[i].x;
					var pY = myRoot.MotionCapture.MocapFrame.Skeleton[0].Joints[name].pos[i].y;
					var pZ = myRoot.MotionCapture.MocapFrame.Skeleton[0].Joints[name].pos[i].z;
					p.setValueAtTime(pT, [pX,pY,pZ]);
					
				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			}
			
		}
		//~~~~~~~~~~~~~end 3D JSON version
	}		
} else {
             alert("Sorry, this feature only works with CS5.5 and higher.");
     }
 
	app.endUndoGroup();
}  //end script


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




 kinectToPin_panel(this);
 }

