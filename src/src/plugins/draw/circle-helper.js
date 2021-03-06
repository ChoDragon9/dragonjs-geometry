/**
 * Polygon과 Line 꼭지점 Helper
 */
const IconHelper = require('./icon-helper')
const ElementController = require('../../common/ElementController')
const _ = require('../../common/fp')
const {ICON_HIDDEN_DELAY} = require('../../modules/constants')

module.exports = function CircleHelper (draw, rootSVG) { // eslint-disable-line
  var isLeave = false
  var iconHelper = new IconHelper(draw.groupHelper)
  var iconHelperTimer = null
  var hoveredPointIndex = null
  var circles = []

  const setDefaultColor = ElementController.setAttr('fill', draw.options.pointColor)
  const setSelectColor = setDefaultColor

  iconHelper.onClick(function (event) {
    iconHelper.hide()
    removeCircle.call({
      circleIndex: hoveredPointIndex
    }, event)
    update()
  })

  function addCircle (radius, useCircleEvent, useCircleCursor) {
    var newCircle = ElementController.createRect(radius * 2, radius * 2)
    if (
      draw.options.useResizeRectangle === true ||
      (draw.options.useEvent === true && useCircleEvent !== false)
    ) {
      bindEvent(newCircle)
    }
    setDefaultColor(newCircle)
    if (useCircleCursor !== false) {
      draw.drawView.setCursor(newCircle)
    }

    newCircle.circleIndex = circles.length
    circles.push(newCircle)
  }

  function bindEvent (circleElement) {
    circleElement.onmousedown = selectCircle
    circleElement.onmouseup = function () {
      isLeave = false
      if (draw.options.customDraw === true) {
        return
      }
      update()
    }
    circleElement.addEventListener('mouseleave', function () {
      isLeave = true
    })

    if (draw.options.fixedRatio !== true) {
      circleElement.customContextmenu = removeCircle
      circleElement.addEventListener('contextmenu', function (event) {
        event.preventDefault()
      })
      circleElement.addEventListener('mouseover', showDeleteIcon)
      circleElement.addEventListener('mouseout', hideDeleteIconWithDelay)
      circleElement.addEventListener('mousedown', hideDeleteIcon)
    }
  }

  function showDeleteIcon () {
    var pointsLength = draw.drawModel.getPointsLength()

    if (
      draw.selectedCircleIndex !== null ||
      pointsLength <= draw.options.minPoint) { // 최대 포인트일 때
      return
    }

    hoveredPointIndex = this.circleIndex

    var xAxis = parseInt(ElementController.getAttr('x')(this))
    var yAxis = parseInt(ElementController.getAttr('y')(this))
    var width = parseInt(ElementController.getAttr('width')(this))
    var height = parseInt(ElementController.getAttr('height')(this))

    if (xAxis - width * 2 < 0) {
      xAxis += width * 2
    } else {
      xAxis -= width
    }

    if (yAxis - width * 2 < 0) {
      yAxis += height * 2
    } else {
      yAxis -= height
    }

    clearTimeout(iconHelperTimer)

    iconHelper.changePosition(xAxis, yAxis)
    iconHelper.show()
  }

  function hideDeleteIcon () {
    iconHelper.hide()
  }

  function hideDeleteIconWithDelay () {
    clearTimeout(iconHelperTimer)
    iconHelperTimer = setTimeout(function () {
      iconHelper.hide()
    }, ICON_HIDDEN_DELAY)
  }

  function update () {
    setTimeout(function () {
      draw.callCustomEvent('mouseup', draw.getData())
    })
  }

  function isMouseLeave () {
    return isLeave
  }

  function removeCircle (event) {
    var self = this
    var points = draw.drawModel.getPoints()
    var pointsLength = points.length

    event.preventDefault()

    if (pointsLength <= draw.options.minPoint) {
      return
    }

    if (this.nodeName === 'text') {
      self = circles[pointsLength - 1]
    }

    points.splice(self.circleIndex, 1)
    draw.drawModel.setPoints(points)
    draw.reset()
    draw.init()
    draw.drawView.changeActiveStatus()
  }

  function selectCircle () {
    isLeave = false
    var self = this
    var pointsLength = draw.drawModel.getPointsLength()
    if (this.nodeName === 'text') {
      self = circles[pointsLength - 1]
    }

    setSelectColor(self)
    self.isSelected = true
    draw.drawView.setCursor(rootSVG)
  }

  function appendAll () {
    _.each(circle => draw.groupHelper.appendChild(circle))(circles)
    iconHelper.createIcon(false)
  }

  function changeRadius (index, radius) {
    _.divEq(
      ElementController.setAttr('width', radius * 2),
      ElementController.setAttr('height', radius * 2)
    )(circles[index])
  }

  function appendAtLast () {
    var circleLength = circles.length
    var newCircleElement = circles[circleLength - 1]
    var nextElementSibling = circles[circleLength - 2].nextElementSibling

    if (draw.options.textInCircle === null || nextElementSibling === null) {
      draw.groupHelper.appendChild(newCircleElement)
    } else {
      draw.groupHelper.insertBefore(
        newCircleElement,
        nextElementSibling
      )
    }
  }

  function removeAll () {
    _.each(circle => {
      draw.groupHelper.removeChild(circle)
    })(circles)
  }

  function getCircles () {
    return circles
  }

  function setCircles (_circles) {
    circles = _circles
  }

  this.addCircle = addCircle
  this.bindEvent = bindEvent
  this.selectCircle = selectCircle
  this.setDefaultColor = setDefaultColor
  this.setSelectColor = setSelectColor
  this.appendAll = appendAll
  this.changeRadius = changeRadius
  this.appendAtLast = appendAtLast
  this.removeAll = removeAll
  this.update = update
  this.isMouseLeave = isMouseLeave
  this.hide = ElementController.style('display', 'none')
  this.show = ElementController.style('display', 'inline')
  this.getCircles = getCircles
  this.setCircles = setCircles
}
