/**
 * 포인트 추가/삭제 아이콘
 * @example
 var iconHelper = new IconHelper();
  iconHelper.createIcon('+');
  iconHelper.changePosition(10, 10);
  iconHelper.show();

  iconHelper.hide();
  */
function IconHelper(groupHelper) {
  var PLUS_IMAGE = './base/images/plus.svg';
  var MINUS_IMAGE = './base/images/minus.svg';

  var iconText = null;
  var icon = null;
  var width = 16;
  var delay = 200;
  var self = this;
  var clickEventHandler = null;
  var leaveEventHandler =  null;
  var contextMenuEventHandler = null;

  /**
   * Plus, Minus 아이콘 생성
   * appendDom 시 사용
   * 
   * @param {Boolean} iconType true: Plus icon, false: Minus icon
   */
  function createIcon(iconType) {
    var src = iconType ? PLUS_IMAGE : MINUS_IMAGE;

    if (icon === null) {
      icon = ElementController.createRect(width, width);
      iconText = ElementController.createImage(src, width, width)[0];

      ElementController.setAttr(icon, 'fill', '#000000');

      icon.style.opacity = 0;
      iconText.style.opacity = 0;

      if (clickEventHandler !== null) {
        icon.style.cursor = 'pointer';
        iconText.style.cursor = 'pointer';

        icon.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          clickEventHandler(event);
        });
        iconText.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          if(clickEventHandler !== null){
            clickEventHandler(event);
          }
        });

        iconText.addEventListener('mouseleave', function(event) {
          event.preventDefault();
          event.stopPropagation();
          if(leaveEventHandler !== null){
            leaveEventHandler(event);
          }
        });

        iconText.addEventListener('contextmenu', function(event) {
          event.preventDefault();
          event.stopPropagation();
          if(contextMenuEventHandler !== null){
            contextMenuEventHandler(event);
          }
        });
      }
    }

    groupHelper.appendChild(icon);
    groupHelper.appendChild(iconText);
  };
  function changePosition(x, y) {
    ElementController.setAttr(icon, 'x', x - width / 2);
    ElementController.setAttr(icon, 'y', y - width / 2);
    ElementController.setAttr(iconText, 'x', x - width / 2);
    ElementController.setAttr(iconText, 'y', y - width / 2);
  };
  function show() {
    icon.style.opacity = 1;
    iconText.style.opacity = 1;
  };
  function hide() {
    if (icon === null) {
      return;
    }

    if (icon.style.opacity === '1') {
      icon.style.opacity = 0;
      iconText.style.opacity = 0;
      self.changePosition(0, 0);
    }
  };
  function onClick(callBack) {
    clickEventHandler = callBack;
  };
  function onLeave(callBack){
    leaveEventHandler = callBack;
  };
  function onContextMenu(callBack){
    contextMenuEventHandler = callBack;
  };

  this.createIcon = createIcon
  this.changePosition = changePosition
  this.show = show
  this.hide = hide
  this.onClick = onClick
  this.onLeave = onLeave
  this.onContextMenu = onContextMenu
}