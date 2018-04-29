function LineState (svgGeometry) {
  this._svgGeometry = svgGeometry
  this._obj = null
  this._currentPoint = 0
  this._options = null
}
LineState.prototype = Object.create(State.prototype)
LineState.prototype.start = function (options, axis) {
  options.points = [axis, axis]
  State.prototype.start.call(this, options, axis)
  this._currentPoint = 2
}
LineState.prototype.end = function () {
  State.prototype.end.call(this)
}
LineState.prototype.add = function (axis) {
  if (this.validateAllAxis(this._options.minLineLength) === false) {
    return
  }

  if (this._currentPoint > 2) {
    if (this._obj.validateStabilization() === false) {
      return
    }
  }

  this._obj.addPoint(axis[0], axis[1])
  this._currentPoint++
}
LineState.prototype.isLast = function () {
  if (this._currentPoint == this._options.minPoint) {
    if (this.validateAllAxis(this._options.minLineLength) === false || this._obj.validateStabilization() === false) {
      return false
    }
    return true
  }
  return false
}
LineState.prototype.validateAllAxis = function() {
  var points = this._obj.getData().points;
  var pythagoreanTheorem = new FunnyMath().pythagoreanTheorem

  for (var i = 0, ii = points.length; i < ii; i++) {
    var startAxis = points[i];
    var endAxis = i === ii - 1 ? points[0] : points[i + 1];

    if (pythagoreanTheorem(
        startAxis[0],
        startAxis[1],
        endAxis[0],
        endAxis[1]) < this._options.minLineLength) {
      return false
    }
  }

  return true
}
LineState.prototype.constructor = LineState