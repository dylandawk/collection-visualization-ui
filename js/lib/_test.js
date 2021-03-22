


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
2. User hovers over timeline and separate marker shows what year to move to
3. User clicks or touches year and camera moves to year
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
this.targetPositionX = 0;

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

/* ------------------------------------- TEST CODE FOR MAP UI ------------------------------*/

/* This is for creating an interactive Map UI 

Description of what I want to happen:
1. User moves mouse over map key, hover marker moves with it, when mouse off, it disappears
2. User hovers over timeline and separate marker shows what year to move to
3. User clicks or touches location and camera moves to spot
*/

// in main.css
/*
.map.key .hover-marker {
  width: 20px;
  height: 20px;
  margin-left: -10px;
  margin-top: -10px;
  border: 3px solid #01D0D2;
  border-radius: 50%;
  opacity:0;
  position: absolute;
}
*/

// in key.js

//in Key.prototype.loadMap
html += '<div class="hover-marker"></div>';

<svg version="1.1" id="ico-info" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 226 226" xml:space="preserve">
  <style>
    .st0{fill:#fff}
  </style>
  <switch>
    <g>
      <path class="st0" d="M113 14c54.7 0 99 44.3 99 99s-44.3 99-99 99-99-44.3-99-99c.1-54.7 44.3-98.9 99-99m0-14C50.6 0 0 50.6 0 113s50.6 113 113 113 113-50.6 113-113S175.4 0 113 0z"/>
      <path class="st0" d="M113 164.5c-3.9 0-7-3.1-7-7V98c0-3.9 3.1-7 7-7s7 3.1 7 7v59.5c0 3.9-3.1 7-7 7zM113 77.4c-3.9 0-7-3.1-7-7v-2.5c0-3.9 3.1-7 7-7s7 3.1 7 7v2.5c0 3.9-3.1 7-7 7z"/>
    </g>
  </switch>
</svg>

<svg version="1.1" id="ico-map" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 540 540" xml:space="preserve">
  <style>
    .st0{fill:#fff}
  </style>
  <path class="st0" d="M195.3 376l-60-30V164.7l60 30zM265.4 164.7l-60 30V376l60-30zM302.5 279.1c0 7.5 5.2 18.7 5.8 19.9l26.8 52.4V376l-60-30V164.7l60 30V242c-18.4 2.4-32.6 18.1-32.6 37.1zM404.7 164.7V346l-60 30v-23.8l26.9-52.9.1-.1c.6-1.3 5.8-12.5 5.8-20 0-19-14.3-34.8-32.7-37.2v-47.3l59.9-30z"/>
  <path class="st0" d="M367.4 279.1c0 4-2.9 11.7-4.8 15.7l-17.9 35.3-4.7 9.2-5-9.7-17.8-34.8c-1.9-4-4.8-11.7-4.8-15.6 0-13.5 9.8-24.7 22.6-27 1.6-.3 3.2-.5 4.9-.5 1.6 0 3.2.1 4.7.4 12.9 2.2 22.8 13.5 22.8 27z"/>
</svg>

<svg version="1.1" id="ico-racetracks" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 540 540" xml:space="preserve">
  <style>
    .st0{fill:#fff}
  </style>
  <path class="st0" d="M192.5 328.1V149c0-2.6-2.1-4.7-4.7-4.7h-34.6c-2.6 0-4.7 2.1-4.7 4.7v179.1h44zM148.6 334.9V382c0 2.6 2.1 4.7 4.7 4.7h34.6c2.6 0 4.7-2.1 4.7-4.7v-47.1h-44zM259.4 281.2V149c0-2.6-2.1-4.7-4.7-4.7h-34.6c-2.6 0-4.7 2.1-4.7 4.7v132.2h44zM215.5 288v94c0 2.6 2.1 4.7 4.7 4.7h34.6c2.6 0 4.7-2.1 4.7-4.7v-94h-44zM325.4 217.9v-69c0-2.6-2.1-4.7-4.7-4.7h-34.6c-2.6 0-4.7 2.1-4.7 4.7v69h44zM281.5 224.7V382c0 2.6 2.1 4.7 4.7 4.7h34.6c2.6 0 4.7-2.1 4.7-4.7V224.7h-44zM391.3 169.5V149c0-2.6-2.1-4.7-4.7-4.7H352c-2.6 0-4.7 2.1-4.7 4.7v20.6h44zM347.4 176.4V382c0 2.6 2.1 4.7 4.7 4.7h34.6c2.6 0 4.7-2.1 4.7-4.7V176.4h-44z"/>
</svg>

<svg version="1.1" id="ico-tunnel" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 540 540" xml:space="preserve">
  <style>
    .st0{fill:#fff}
  </style>
  <path class="st0" d="M340.2 340.8c-3.3 0-6-2.7-6-6v-84.1c0-35.4-28.8-64.2-64.2-64.2s-64.2 28.8-64.2 64.2v84.1c0 3.3-2.7 6-6 6s-6-2.7-6-6v-84.1c0-42 34.2-76.2 76.2-76.2s76.2 34.2 76.2 76.2v84.1c0 3.3-2.7 6-6 6z"/>
  <path class="st0" d="M401.3 369.8c-16.5 0-29.8-13.4-29.8-29.8v-91.8c0-56.4-45.3-102.4-101-102.6-27.2-.1-52.7 10.4-71.9 29.6s-29.8 44.7-29.8 71.8v93c0 16.5-13.4 29.8-29.8 29.8-3.3 0-6-2.7-6-6s2.7-6 6-6c9.8 0 17.8-8 17.8-17.8v-93c0-30.4 11.8-58.9 33.4-80.3 21.5-21.4 50.1-33.2 80.4-33.1 62.3.2 113 51.6 113 114.6V340c0 9.8 8 17.8 17.8 17.8 3.3 0 6 2.7 6 6s-2.8 6-6.1 6z"/>
</svg>