"use strict";
/* globals SVGGeometryFactory */
/**
 * SVG를 사용한 Drawing 툴 모듈이다.
 * Plugin 중 'draw'를 통해서 영역을 조작한다.
 * 
 * @class
 * @param {Object} svgTag svg tag
 * @example
<caption>HTML Resource</caption>
<script src="./svg_drawing/modules/svg_geometry_factory.js"></script>
<script src="./svg_drawing/modules/svg_geometry.js"></script>

<script src="./svg_drawing/plugins/draw/arrow-image-helper.js"></script>
<script src="./svg_drawing/plugins/draw/circle-helper.js"></script>
<script src="./svg_drawing/plugins/draw/group-helper.js"></script>
<script src="./svg_drawing/plugins/draw/icon-helper.js"></script>
<script src="./svg_drawing/plugins/draw/line-helper.js"></script>
<script src="./svg_drawing/plugins/draw/polygon-helper.js"></script>
<script src="./svg_drawing/plugins/draw/text-helper.js"></script>
<script src="./svg_drawing/plugins/draw/wise-facedetection-helper.js"></script>
<script src="./svg_drawing/plugins/draw/svg_geometry_plugin_draw.js"></script>

* @example
<caption>HTML</caption>
<svg 
  width="500" 
  height="500" 
  id="svg_polygon"
  xmlns="http://www.w3.org/2000/svg" 
  xmlns:xlink="http://www.w3.org/1999/xlink">
</svg>

 * @example
<caption>Javascript</caption>
var svgTag = document.getElementById("svg_polygon");
var svgGeometry = new SVGGeometry(svgTag);
svgGeometry.draw({
  color: '#ff9832',
  selectedColor: '#ff5732',
  lineStrokeWidth: 5,
  circleRadius: 8,
  fill: true,
  fillOpacity: 0,
  useEvent: true,
  points: [
    [303,469],
    [437,461],
    [475,374],
    [423,248],
    [291,270],
    [224,388],
    [219,472]
  ]
});
 */
function SVGGeometry(svgTag) {
  this.svgTag = svgTag;
}

SVGGeometry.prototype.svgTag = null;

/**
 * Plugin 추가 함수
 * 
 * @param {String} name 플러그인 이름
 * @param {Function} callback 플러그인 호출 시 사용될 Callback 함수
 * @example
<caption>정의</caption>
SVGGeometry.addPlugin('draw', function(number){
  console.log(number);
});

<caption>사용</caption>
var svgTag = document.getElementById("svg_polygon");
var svgGeometry = new SVGGeometry(svgTag);
svgGeometry.draw(0);
svgGeometry.draw(1);
 */
SVGGeometry.addPlugin = function(name, callback) {
  SVGGeometry.prototype[name] = function() {
    return callback.apply(new SVGGeometryFactory(this.svgTag), arguments);
  };
};