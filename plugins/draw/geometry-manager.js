function GeometryManager(){
  var draw = this; 
  var elemCtrl = this.elementController;
  var funnyMath = this.funnyMath;
  var commonFunc = this.common;
  var geometryManager = {
    points: commonFunc.cloneObject(draw.options.points),
    isAllSelected: false,
    setPoints: function(points){
      geometryManager.points = commonFunc.cloneObject(points);
    },
    getPoints: function(){
      return commonFunc.cloneObject(geometryManager.points);
    },
    getPointsLength: function(){
      return geometryManager.points.length;
    },
    setAxis: function(index, x, y) {
      geometryManager.points[index] = [x, y];
    },
    appendAxis: function(index, x, y) {
      geometryManager.points.splice(index, 0, [x, y]);
    },
    getAxis: function(index) {
      return geometryManager.points[index];
    },
    getAll: function() {
      return {
        points: geometryManager.getPoints(),
        arrow: draw.arrowImageHelper.getArrow()
      };
    },
    addAxis: function(xAxis, yAxis, appendIndex) {
      var lastPoint = null;
      var newPoint = null;

      var offset = commonFunc.parentOffset();

      var pointsLength = geometryManager.getPointsLength();

      if (typeof xAxis === "undefined" && typeof yAxis === "undefined") {
        lastPoint = geometryManager.getAxis(pointsLength - 1);
        newPoint = [lastPoint[0], lastPoint[1]];
        newPoint[0] += draw.options.circleRadius;
        newPoint[1] += draw.options.circleRadius;

        if (newPoint[0] < 0) {
          newPoint[0] = 0;
        }
        if (newPoint[1] < 0) {
          newPoint[1] = 0;
        }
        if (newPoint[0] > offset.width) {
          newPoint[0] = offset.width;
        }
        if (newPoint[1] > offset.height) {
          newPoint[1] = offset.height;
        }
      } else {
        newPoint = [xAxis, yAxis];
      }

      if (typeof appendIndex !== "undefined") {
        geometryManager.appendAxis(appendIndex, newPoint[0], newPoint[1]);
      } else {
        geometryManager.setAxis(pointsLength, newPoint[0], newPoint[1]);
      }

      pointsLength++;
    },
    validateAxis: function(xAxis, yAxis) {
      var offset = commonFunc.parentOffset();
      var returnVal = true;

      if (
        xAxis < 0 ||
        yAxis < 0 ||
        xAxis > offset.width ||
        yAxis > offset.height
      ) {
        returnVal = false;
      }

      return returnVal;
    },
    validateAllPoint: function(movedXAxis, movedYAxis) {
      var returnVal = true;
      var points = geometryManager.getPoints();
      var pointsLength = points.length;

      for (var i = 0; i < pointsLength; i++) {
        var self = points[i];
        if (geometryManager.validateAxis(self[0] + movedXAxis, self[1] + movedYAxis) === false) {
          returnVal = false;
          break;
        }
      }

      return returnVal;
    },
    validateGeometrySize: function(geometryWidth, geometryHeight) {
      var isOk = true;

      if (typeof draw.options.minSize !== "undefined") {
        if (geometryWidth < draw.options.minSize.width || geometryHeight < draw.options.minSize.height) {
          isOk = false;
        }
      }

      if (typeof draw.options.maxSize !== "undefined") {
        if (geometryWidth > draw.options.maxSize.width || geometryHeight > draw.options.maxSize.height) {
          isOk = false;
        }
      }

      return isOk;
    },
    //모든 SVG 태그들을 좌표를 기준으로 변경한다.
    changeAxis: function() {
      var polygonPoint = '';
      var idx = 0;
      var len = 0;
      var height = 0;
      var lines = draw.lineHelper.getLines();
      var circles = draw.circleHelper.getCircles();
      var textTag = draw.textTagHelper.getTextTag();
      var polygon = draw.polygonHelper.getPolygon();
      var points = geometryManager.getPoints();

      for (idx = 0, len = lines.length; idx < len; idx++) {
        var startAxis = points[idx];
        var endAxisIndex = draw.options.fill === true && idx === len - 1 ? 0 : idx + 1;
        var endAxis = points[endAxisIndex];
        var startXAxis = startAxis[0];
        var endXAxis = endAxis[0];

        lines[idx].setAttributeNS(null, 'x1', startXAxis);
        lines[idx].setAttributeNS(null, 'y1', startAxis[1]);
        lines[idx].setAttributeNS(null, 'x2', endXAxis);
        lines[idx].setAttributeNS(null, 'y2', endAxis[1]);
      }

      for (idx = 0, len = circles.length; idx < len; idx++) {
        var pointAxis = points[idx];
        var circleXAxis = pointAxis[0];
        var circleYAxis = pointAxis[1];
        var selfCircle = circles[idx];
        var width = parseInt(elemCtrl.getAttr(selfCircle, 'width'));
        height = parseInt(elemCtrl.getAttr(selfCircle, 'height'));

        /**
         * 고정비 사각형일 때, 부모의 영역를 넘어갈 경우 Safari에서
         * 정상적으로 Cursor가 지정이 안되므로 2px 이동 시킨다.
         */
        if (draw.options.fixedRatio === false && draw.options.useOnlyRectangle === false) {
          circleXAxis -= width / 2;
          circleYAxis -= height / 2;
        } else if (draw.options.fixedRatio === true) {
          switch (idx) {
            case draw.rectangleIndex[0]:
              circleXAxis -= width - draw.options.lineStrokeWidth / 2;
              circleYAxis -= height - draw.options.lineStrokeWidth / 2;
              break;
            case draw.rectangleIndex[1]:
              circleXAxis -= draw.options.lineStrokeWidth / 2;
              circleYAxis -= height - draw.options.lineStrokeWidth / 2;
              break;
            case draw.rectangleIndex[2]:
              circleXAxis -= width - draw.options.lineStrokeWidth / 2;
              circleYAxis -= height - draw.options.lineStrokeWidth / 2;
              break;
            case draw.rectangleIndex[3]:
              circleXAxis -= width - draw.options.lineStrokeWidth / 2;
              circleYAxis -= draw.options.lineStrokeWidth / 2;
              break;
          }
        }

        selfCircle.setAttributeNS(null, "x", circleXAxis);
        selfCircle.setAttributeNS(null, "y", circleYAxis);

        if (idx === len - 1 && draw.options.textInCircle !== null) {
          textTag.setAttributeNS(null, 'x', pointAxis[0] - 3);
          textTag.setAttributeNS(null, 'y', pointAxis[1] + 4);
        }

        if (draw.options.fill === true) {
          polygonPoint += pointAxis[0] + ',' + pointAxis[1] + ' ';
        }
      }

      if (draw.options.fill === true) {
        polygon.setAttributeNS(null, 'points', polygonPoint.replace(/[\s]{1}$/, ''));
      }

      if (draw.useArrow === true) {
        draw.arrowImageHelper.changeArrowImage();
      }

      if (
        draw.options.wiseFaceDetection !== false &&
        Object.keys(draw.wiseFaceDetectionHelper).length > 0
        ) {
        var firstPoint = points[0];
        var secondPoint = points[1];
        var thridPoint = points[2];
        var xAxis = funnyMath.getLineCenter(secondPoint[0], secondPoint[1], thridPoint[0], thridPoint[1])[0];
        var yAxis = funnyMath.getLineCenter(firstPoint[0], firstPoint[1], secondPoint[0], secondPoint[1])[1];
        height = 0;

        if ("heightRatio" in draw.options.wiseFaceDetection) {
          height = firstPoint[1] - secondPoint[1];
        } else if ("widthRatio" in draw.options.wiseFaceDetection) {
          height = firstPoint[0] - secondPoint[0];
        }

        height = Math.abs(height);

        draw.wiseFaceDetectionHelper.updateCircle(xAxis, yAxis, height);
      }
    },
    resetAllColor: function() {
      var idx = 0;
      var len = 0;
      var lines = draw.lineHelper.getLines();
      var circles = draw.circleHelper.getCircles();

      for (idx = 0, len = lines.length; idx < len; idx++) {
        draw.lineHelper.setDefaultColor(lines[idx]);
      }
      for (idx = 0, len = circles.length; idx < len; idx++) {
        draw.circleHelper.setDefaultColor(circles[idx]);
      }

      draw.polygonHelper.setDefaultColor();

      geometryManager.isAllSelected = false;
    },
    setAllColor: function() {
      var idx = 0;
      var len = 0;
      var lines = draw.lineHelper.getLines();
      var circles = draw.circleHelper.getCircles();

      for (idx = 0, len = lines.length; idx < len; idx++) {
        draw.lineHelper.setSelectColor(lines[idx]);
      }
      for (idx = 0, len = circles.length; idx < len; idx++) {
        draw.circleHelper.setSelectColor(circles[idx]);
      }

      draw.polygonHelper.setSelectColor();

      geometryManager.isAllSelected = true;
    }
  };

  return geometryManager;
}