const ElementController = require('../../common/ElementController')
const _ = require('../../common/fp')

function DrawModel (draw, rootSVG) {
  var self = this
  this.points = _.clone(draw.options.points)
  this.isAllSelected = false
  this.setIsAllSelectedState = function (state) {
    this.isAllSelected = state
  }
  this.modifyPoints = function (points) {
    this.setPoints(points)
    // Notify
    draw.changeAxis()
  }
  this.getRectangleIndex = function () {
    var indexList = []
    var isFlip = draw.options.flip
    var isMirror = draw.options.mirror
    var isMirrorAndFlip = isFlip && isMirror

    indexList[0] = isMirrorAndFlip ? 2 : (isFlip ? 1 : (isMirror ? 3 : 0))
    indexList[1] = isMirrorAndFlip ? 3 : (isFlip ? 0 : (isMirror ? 2 : 1))
    indexList[2] = isMirrorAndFlip ? 0 : (isFlip ? 3 : (isMirror ? 1 : 2))
    indexList[3] = isMirrorAndFlip ? 1 : (isFlip ? 2 : (isMirror ? 0 : 3))

    return indexList
  }
  this.alignCenter = function () {
    var parentSvgSize = ElementController.getSize(rootSVG)
    var firstPoint = self.getAxis(0)
    var thirdPoint = self.getAxis(2)
    var geometryWidth = thirdPoint[0] - firstPoint[0]
    var geometryHeight = thirdPoint[1] - firstPoint[1]

    var changedX1 = Math.round(parentSvgSize.width / 2 - geometryWidth / 2)
    var changedY1 = Math.round(parentSvgSize.height / 2 - geometryHeight / 2)
    var changedX3 = changedX1 + geometryWidth
    var changedY3 = changedY1 + geometryHeight

    self.setAxis(0, changedX1, changedY1)
    self.setAxis(1, changedX1, changedY3)
    self.setAxis(2, changedX3, changedY3)
    self.setAxis(3, changedX3, changedY1)

    draw.changeAxis()
  }
  this.changeMinSizeOption = function (newMinSize) {
    draw.options.minSize = _.clone(newMinSize)
  }
  this.changeMaxSizeOption = function (newMaxSize) {
    draw.options.maxSize = _.clone(newMaxSize)
  }
  this.addAxis = function (xAxis, yAxis, appendIndex) {
    var lastPoint = null
    var newPoint = null

    var offset = ElementController.getSVGOffset(rootSVG)()

    var pointsLength = this.getPointsLength()

    if (_.isUndefined(xAxis) && _.isUndefined(yAxis)) {
      lastPoint = this.getAxis(pointsLength - 1)
      newPoint = [lastPoint[0], lastPoint[1]]
      newPoint[0] += draw.options.circleRadius
      newPoint[1] += draw.options.circleRadius

      if (newPoint[0] < 0) {
        newPoint[0] = 0
      }
      if (newPoint[1] < 0) {
        newPoint[1] = 0
      }
      if (newPoint[0] > offset.width) {
        newPoint[0] = offset.width
      }
      if (newPoint[1] > offset.height) {
        newPoint[1] = offset.height
      }
    } else {
      newPoint = [xAxis, yAxis]
    }

    if (_.negate(_.isUndefined(appendIndex))) {
      this.appendAxis(appendIndex, newPoint[0], newPoint[1])
    } else {
      this.setAxis(pointsLength, newPoint[0], newPoint[1])
    }
  }
  this.validateAxis = function (xAxis, yAxis) {
    var offset = ElementController.getSVGOffset(rootSVG)()
    var returnVal = true

    if (
      xAxis < 0 ||
      yAxis < 0 ||
      xAxis > offset.width ||
      yAxis > offset.height
    ) {
      returnVal = false
    }

    return returnVal
  }
  this.validateAllPoint = function (movedXAxis, movedYAxis) {
    return !_.find(point => {
      return !this.validateAxis(point[0] + movedXAxis, point[1] + movedYAxis)
    })(this.getPoints())
  }
}
DrawModel.prototype = {
  setPoints: function (points) {
    this.points = _.clone(points)
  },
  getPoints: function () {
    return _.clone(this.points)
  },
  getPointsLength: function () {
    return this.points.length
  },
  setAxis: function (index, x, y) {
    this.points[index] = [x, y]
  },
  appendAxis: function (index, x, y) {
    this.points.splice(index, 0, [x, y])
  },
  getAxis: function (index) {
    return this.points[index]
  }
}

module.exports = DrawModel