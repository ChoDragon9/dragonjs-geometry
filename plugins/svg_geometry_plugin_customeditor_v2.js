"use strict";
/* globals SVGGeometry */
SVGGeometry.addPlugin('customEditorV2', function(_options) {
  var parentSvgMovedAttr = 'is-moved';
  var DEFAULT_OBJECT_SIZE = 30;

  var options = this.common.cloneObject(_options);
  //custom 함수에서는 start, end 이벤트만 사용한다.
  var minPoint = typeof options.minPoint === "undefined" ? 4 : options.minPoint;
  var customEvent = typeof options.event === "undefined" ? null : options.event;
  var fixedRatio = typeof options.fixedRatio === "undefined" ? false : options.fixedRatio;
  var useOnlyRectangle = typeof options.useOnlyRectangle === "undefined" ? false : options.useOnlyRectangle;
  var ratio = typeof options.ratio === "undefined" ? false : options.ratio;
  var minLineLength = typeof options.minLineLength === "undefined" ? 20 : options.minLineLength;
  var minSize = typeof options.minSize === "undefined" ? false : options.minSize;
  var currentPoint = 0;
  var svgObj = [];
  var currentSvgObjIndex = 0;
  var isDrawing = false;
  var mouseDownTimer = null;

  var self = this;
  var eventCtrl = self.eventController;
  var elemCtrl = self.elementController;
  var commonFunc = self.common;
  var funnyMath = self.funnyMath;

  var svgGeometry = new SVGGeometry(elemCtrl.getParentSvg());

  options.customDraw = true;

  function parentSVGMouseUpHandle(event) {
    //Right button

    if(mouseDownTimer !== null){
      clearTimeout(mouseDownTimer);
      mouseDownTimer = null;

      parentSVGClickHandle(event);
      eventCtrl.unbindParentEvent('mousedown', parentSVGMouseDownHandle);
      eventCtrl.unbindParentEvent('mouseup', parentSVGMouseUpHandle);

      eventCtrl.bindParentEvent('click', parentSVGClickHandle);
      return;
    }
    
    if (event.buttons === 2) {
      return;
    }

    if (
      elemCtrl.getParentSvgAttr(parentSvgMovedAttr) === "true" ||
      typeof svgObj[currentSvgObjIndex] === "undefined"
    ) {
      return;
    }
    svgObj[currentSvgObjIndex].endDraw();
    unbindCancelEvent();
    callEndEvent();
    currentPoint = 0;
    currentSvgObjIndex++;
  }

  function parentSVGMouseDownHandle(event) {
    if (
      event.buttons === 2 ||
      event.currentTarget !== event.target ||
      elemCtrl.getParentSvgAttr(parentSvgMovedAttr) === "true"
    ) {
      return;
    }

    var axis = commonFunc.getPageAxis(event);

    clearTimeout(mouseDownTimer);
    mouseDownTimer = setTimeout(function(axis, options){
      mouseDownTimer = null;
      options.points = [
        axis, [axis[0], axis[1] + DEFAULT_OBJECT_SIZE],
        [axis[0] + DEFAULT_OBJECT_SIZE, axis[1] + DEFAULT_OBJECT_SIZE],
        [axis[0] + DEFAULT_OBJECT_SIZE, axis[1]],
      ];

      options.useRectangleForCustomDraw = true;

      svgObj[currentSvgObjIndex] = svgGeometry.draw(options);
      currentPoint++;
      callStartEvent();
    }, self.CONFIG.CLICK_DETECION_TIME, axis, options);
  }

  function parentSVGClickHandle(event) {
    if (
      elemCtrl.getParentSvgAttr(parentSvgMovedAttr) === "true"
    ) {
      return;
    }

    var axis = commonFunc.getPageAxis(event);

    var addPoint = function() {
      svgObj[currentSvgObjIndex].addPoint(axis[0], axis[1]);
    };

    var endDraw = function() {
      svgObj[currentSvgObjIndex].endDraw();
      callEndEvent();
      currentPoint = 0;
      currentSvgObjIndex++;
    };

    var validateAllAxis = function() {
      var points = svgObj[currentSvgObjIndex].getData().points;
      var returnVal = true;

      if (minLineLength !== false) {
        for (var i = 0, ii = points.length; i < ii; i++) {
          var startAxis = points[i];
          var endAxis = i === ii - 1 ? points[0] : points[i + 1];

          if (funnyMath.pythagoreanTheorem(
              startAxis[0],
              startAxis[1],
              endAxis[0],
              endAxis[1]) < minLineLength) {
            returnVal = false;
          }
        }
      }

      return returnVal;
    };

    options.useRectangleForCustomDraw = false;

    if (useOnlyRectangle === true) {
      //처음 클릭을 할 때
      if (currentPoint === 0) {
        if (fixedRatio === true) {
          if (minSize === false) {
            options.points = [
              axis, [axis[0], axis[1] + ratio[1]],
              [axis[0] + ratio[0], axis[1] + ratio[1]],
              [axis[0] + ratio[0], axis[1]]
            ];
          } else {
            //영상 영역을 넘는 이슈로 0,0를 초기로 설정
            axis = [0, 0];
            options.points = [
              axis, [axis[0], axis[1] + minSize.height],
              [axis[0] + minSize.width, axis[1] + minSize.height],
              [axis[0] + minSize.width, axis[1]]
            ];
          }
        } else {
          options.points = [axis, axis, axis, axis];
        }
        svgObj[currentSvgObjIndex] = svgGeometry.draw(options);
        currentPoint++;
        callStartEvent();
      } else {
        endDraw();
      }
    } else {
      if (currentPoint === 0) {
        options.points = [axis, axis];
        svgObj[currentSvgObjIndex] = svgGeometry.draw(options);
        currentPoint = 2;
        callStartEvent();
      } else if (minPoint === currentPoint) {
        if (validateAllAxis() === false || svgObj[currentSvgObjIndex].validateStabilization() === false) {
          return;
        }

        endDraw();
      } else {
        if (validateAllAxis() === false) {
          return;
        }

        if (currentPoint > 2) {
          if (svgObj[currentSvgObjIndex].validateStabilization() === false) {
            return;
          }
        }

        addPoint();
        currentPoint++;
      }
    }
  }

  bindEvent();

  function callEndEvent() {
    restartDrawing();
    isDrawing = false;
    if ("end" in customEvent) {
      customEvent.end(svgObj[currentSvgObjIndex]);
    }
  }

  function callStartEvent() {
    bindCancelEvent();
    isDrawing = true;
    if ("start" in customEvent) {
      customEvent.start(svgObj[currentSvgObjIndex]);
    }
  }

  function handleESCKey(event) {
    if (event.keyCode === 27) {
      removeDrawingGeometry();
    }
  }

  function unbindEvent() {
    eventCtrl.unbindParentEvent('click', parentSVGClickHandle);

    eventCtrl.unbindParentEvent('mousedown', parentSVGMouseDownHandle);
    eventCtrl.unbindBodyEvent('mouseup', parentSVGMouseUpHandle);
  }

  function bindEvent() {
    eventCtrl.bindParentEvent('mousedown', parentSVGMouseDownHandle);
    eventCtrl.bindParentEvent('mouseup', parentSVGMouseUpHandle);
  }

  function bindCancelEvent() {
    eventCtrl.bindParentEvent("contextmenu", removeDrawingGeometry);
    document.addEventListener('keyup', handleESCKey);
  }

  function unbindCancelEvent() {
    eventCtrl.unbindParentEvent("contextmenu", removeDrawingGeometry);
    document.removeEventListener('keyup', handleESCKey);
  }

  function removeDrawingGeometry() {
    if (isDrawing) {
      svgObj[currentSvgObjIndex].destroy();
      restartDrawing();
      currentPoint = 0;
    }
  }

  function restartDrawing(){
    unbindCancelEvent();
    unbindEvent();
    bindEvent();
  }

  return {
    destroy: unbindEvent,
    stop: unbindEvent,
    start: bindEvent,
    removeDrawingGeometry: removeDrawingGeometry
  };
});