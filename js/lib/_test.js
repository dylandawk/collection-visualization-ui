


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
    
    // screen center is the center of the viewport
    var screenCenter = new THREE.Vector3();
    screenCenter.x = window.innerWidth / 2;
    screenCenter.y = window.innerHeight / 2;
    screenCenter.z = 0;

    // Distance offset of the indicators from the center of the screen
    screenBoundOffset = 0.9; // set to desired offset  (range: 0-1)
    var screenBounds = new THREE.Vector3();
    screenBounds = screenCenter * screenBoundOffset;


    // Returns a Vector3 position and an angle (radians).
    function GetIndicatorPositionAndAngle(screenPosition, screenCenter, screenBounds){
        var differencePosition = screenPosition - screenCenter;
        if(differencePosition.z < 0) differencePosition.z *= -1;

        
        // Angle between the x-axis (top of screen) and a vector starting at 
        // zero(top right corner of screen) and terminating at differencePosition.
        var angle = Math.atan(differencePosition.y/differencePosition.x);
        if(screenPosition.x < screenCenter.x) angle += Math.PI;
        // Slope of the line starting from zero and terminating at differencePosition.
        var slope = Math.tan(angle);

        // perform boundary checks
        if(differencePosition.x > 0 ) {
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
        var positionAndAngle = {
          position: screenPosition,
          angle: angle
        }
        return positionAndAngle;
    }


/* ------------------------------------- TEST CODE FOR TIMELINE UI ------------------------------*/

/*  
Description of what I want to happen:
1. User moves mouse over timeline key -> camera movement stops
2. User hovers over timeline and depending on what year it is over the column changes color (#01D0D2)
*/

/*------Option #1-------*/

/*This code changes the actual <li> element when the mouse moves over a certain year.
 This would be placed in key.js possibly in Key.prototype.loadTimeline
*/
var options = this.opt;
this.$el.on('mousemove', '.timeline-data', function(e) {
  var x = e.pageX - $(this).offset().left;
  var percentX = x / $(this).width();
  var rangeLen = options.items.length;
  var year = Math.round(percentX * rangeLen ) + options.items[0].year;
  var $timelineData = $(this);
  _.each(options.items, function(item){
    var $yearBar = $timelineData.find('[data-year=' + item.year + ']');
    if(year == item.year){
      $yearBar.css({
        'background': '#01D0D2',
        'height' : "80%"
      });
    } else {
      var p = MathUtil.norm(item.value, minValue.value, maxValue.value);
      var itemHeight = Math.max(p * dataHeight, 1);
      $yearBar.css({
        'background': '#888',
        'height' : `${itemHeight}px`
      });
    }
  });
});

/*------Option #2-------*/

// in main.css add
/*
.timeline-wrapper .hover-marker {
  width: 4px;
  height: 80%;
  background: #01D0D2;
  bottom: 0;
  position: absolute;
  margin-left: -2px;
}
.timeline-wrapper .hover-marker-label {
  position: absolute;
  top: -20px;
  left: 50%;
  width: 100px;
  margin-left: -50px;
  text-align: center;
  white-space: nowrap;
}
*/

//when adding elements to html in Key.prototype.loadTimeline
html += '<div class="hover-marker"><div class="hover-marker-label"></div></div>';

// at end of Key.prototype.loadTimeline
var options = this.opt;
this.$el.on('mousemove', '.timeline-wrapper', function(e) {
  var x = e.pageX - $(this).offset().left;
  var percentX = x / $(this).width();
  var rangeLen = options.items.length;
  var year = Math.round(percentX * rangeLen ) + options.items[0].year;
  this.$hoverMarker = $(this).find('.hover-marker').first();
  this.$hoverMarkerLabel = $(this).find('.hover-marker-label').first();
  this.$hoverMarker.css({
    'left': (percentX*100)+'%'
  });
  this.$hoverMarkerLabel.text(year)
  
});


// For Camera movement

// in main.js
// add as option extension to new instance of Control (line 109)
'years' : this.opt.keys.years

// in 'controls.js'
// add to Controls.prototype.init
this.timelineControl = false;
this.targetPositionZ = 0;

// add listener to Controls.prototype.loadListeners
$doc.on("mouseup", '.timeline-wrapper', function(e){
  var x = e.pageX - $(this).offset().left;
  var percentX = x / $(this).width();
  var rangeLen = _this.opt.years.items.length;
  var year = Math.round(percentX * rangeLen ) + _this.opt.years.items[0].year;
  var yearNormalized = (year - _this.opt.years.items[0].year)/rangeLen;

  // find target camera position given the corresponding year
  var cameraZ = (yearNormalized * (_this.opt.bounds[3]-_this.opt.bounds[2])) + _this.opt.bounds[2];
  _this.timelineControl = true;
  _this.targetPositionZ = cameraZ
});


// add to Controls.prototype.updateAxis
if(this.timelineControl){
  let range = 1000; // range such that when camera is in close range of target year decceleration stops at year
  if(Math.abs(this.targetPositionZ - this.camera.position.z) > range){
    if(axis === 'Y'){
      moveDirection = (this.targetPositionZ > this.camera.position.z) ? 1:-1;
    }
  } else {
    this.timelineControl = false;
    moveDirection = 0;
  }
} 
