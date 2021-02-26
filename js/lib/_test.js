


/* ------------------------------------- TEST CODE FOR MOTION CONTROLS ------------------------------
/* moveDirectionX  and moveDirectionY are in a range from -1 to 1. I want to utilize this to 
create touch-based controller for mobile as well as an onscreen UI element for desktop and VR.


First we need to decide whether or not to directly link visual with touches (ie the graphic is 
part of the controller vs the graphic merely visualizes what is happening on the controller, kinda 
like 'read only').  For this demo use the latter, because it would be easier to implement with destop. */


// moveCircle && '.move-circle' will be a standin for the larger visual circle with values .x and .y in center of circle
// zoneRadius is the radius of the circle and should scale depending on device

// define boundaries of the zone:
var controlTop = moveCircle.y - zoneRadius;
var controlBottom = moveCirlc.y + zoneRadius;
var controlRight = moveCircle.x + zoneRadius;
var controlLeft = moveCircle.x - zoneRadius;


//pulled from the controls.js page for '.move-button' 

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
