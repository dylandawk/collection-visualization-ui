


/* ------------------------------------- TEST CODE FOR MOTION CONTROLS ------------------------------
/* moveDirectionX  and moveDirectionY are in a range from -1 to 1. I want to utilize this to 
create touch-based controller for mobile as well as an onscreen UI element for desktop and VR.


First we need to decide whether or not to directly link visual with touches (ie the graphic is 
part of the controller vs the graphic merely visualizes what is happening on the controller, kinda 
like 'read only').  For this demo use the latter, because it would be easier to implement with destop. */


// moveCircle && '.move-circle' will be a standin for the larger visual circle with values .x and .y in center of circle
// zoneRadius is the radius of the circle and should scale depending on device

// defining boundaries of the zone:
var controlTop = moveCircle.y - zoneRadius;
var controlBottom = moveCirlc.y + zoneRadius;
var controlRight = moveCircle.x + zoneRadius;
var controlLeft = moveCircle.x - zoneRadius;


//following code based off of controls.js page for '.move-button' 

$('.move-circle').each(function(){
      var el = $(this)[0];
      var direction = {
          x: 0,
          y: 0,
      };

      var mc = new Hammer(el);
      mc.on("press", function(e) {
        // on touch get the x and y coordinates of the touch
        var touchX = e.center.x;
        var touchY = e.center.y;
        
        // compare touch coordinates to circle center
        var distanceX = touchX - moveCircle.x;
        var distanceY = touchY - moveCirlce.y;

        //determine distance from center and use as velocity magnitude
        var magnitude = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY)); // distance formula
        var n_Magnitude = (magnitude > zoneRadius) ? 1:magnitude / zoneRadius; // normalized magnitude with max magnitude = 1;

        // determine direction
        direction.x = (magnitude == 0) ? 0:(Math.cos(Math.acos(distanceX / magnitude))) * n_Magnitude;
        direction.y = (magnitude == 0) ? 0:(Math.sin(Math.asin(distanceY / magnitude))) * n_Magnitude;

        // set direction
        _this.moveDirectionX = direction.x;
        _this.moveDirectionY = direction.y;


      });

      mc.on("pressup", function(e){
        _this.moveDirectionY = 0;
        _this.moveDirectionX = 0;
      });
    });


    /* ------------------------------------- TEST CODE FOR INDICATOR UI ------------------------------*/
    /* story indicator presents a 2D UI indicator of where a potential story would be.  
    Given screen coordinates, determines the position of the indicator

    */

    const THREE = require("three");

    //screen position would be the converted 3D world point to screen point (Vector3)
    // possibly from here: https://stackoverflow.com/questions/11586527/converting-world-coordinates-to-screen-coordinates-in-three-js-using-projection
    
    var screenPosition  = new THREE.Vector3();
    var screenCenter = new THREE.Vector3();
    screenCenter.x = window.innerWidth / 2;
    screenCenter.y = window.innerHeight / 2;
    screenCenter.z = 0;

    // Distance offset of the indicators from the centre of the screen
    screenBoundOffset = 0.9; // set to desire offset percentage 0-1
    var screenBounds = new THREE.Vector3();
    screenBounds = screenCenter * screenBoundOffset;

    function GetIndicatorPositionAndAngle(screenPosition, screenCenter, screenBounds){
        var differencePosition = screenPosition - screenCenter;
        if(differencePosition.z < 0) differencePosition.z *= -1;

        
        // Angle between the x-axis (top of screen) and a vector starting at 
        // zero(top right corner of screen) and terminating at differencePosition.
        var angle = Math.atan(differencePosition.y/differencePosition.x);
        // Slope of the line starting from zero and terminating at differencePosition.
        var slope = Math.tan(angle);

        // perform boundary checks
        if(differencePosition.x > 0) {
          differencePosition = new THREE.Vector3(screenBounds.x, screenBounds.x * slope, 0);
        } else {
          differencePosition = new THREE.Vector3(-screenBounds.x, -screenBounds.x * slope, 0);
        }
        if(differencePosition.y > screenBounds.y){
          differencePosition = new THREE.Vector3( screenBounds.y / slope, screenBounds.y, 0);
        } else if(differencePosition.y < -screenBounds.y){
          differencePosition = new THREE.Vector3( - screenBounds.y / slope, - screenBounds.y, 0);
        }

        // Bring the ScreenPosition back to its original reference.
        screenPosition = differencePosition + screenCenter;
        return screenPosition;
    }


    