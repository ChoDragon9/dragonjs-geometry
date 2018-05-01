/**
 * Text 태그 헬퍼
 */
function TextTagHelper(draw, product) {

  var textTag = null;
  function addText() {
    if (draw.options.textInCircle !== null) {
      textTag = ElementController.createText(draw.options.textInCircle);
      textTag.style.fontSize = '12px';
      draw.drawView.setCursor(textTag);
      bindEvent();
    }
  }

  function bindEvent() {
    var circles = draw.circleHelper.getCircles();
    var pointsLength = draw.drawModel.getPointsLength();
    var lastCircle = circles[pointsLength - 1];

    textTag.onmousedown = lastCircle.onmousedown;
    textTag.onmouseup = lastCircle.onmouseup;
    if (draw.options.fixedRatio !== true) {
      textTag.addEventListener('contextmenu', lastCircle.customContextmenu);
    }
  }

  function append() {
    if (draw.options.textInCircle !== null) {
      draw.groupHelper.appendChild(textTag);
    }
  }

  function remove() {
    if (draw.options.textInCircle !== null) {
      draw.groupHelper.removeChild(textTag);
    }
  }

  function show() {
    if (draw.options.textInCircle !== null) {
      textTag.style.display = 'inline';
    }
  }

  function hide() {
    if (draw.options.textInCircle !== null) {
      textTag.style.display = 'none';
    }
  }

  function getTextTag(){
    return textTag;
  }

  function setTextTag(_textTag){
    textTag = _textTag;
  }

  this.addText = addText
  this.append = append
  this.remove = remove
  this.show = show
  this.hide = hide
  this.getTextTag = getTextTag
  this.setTextTag = setTextTag
}