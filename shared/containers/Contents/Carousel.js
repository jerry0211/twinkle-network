import React from 'react';
import ReactDom from 'react-dom';
import tweenState from 'kw-react-tween-state';
import assign from 'object-assign';
import ExecutionEnvironment from 'exenv';
import ButtonGroup from 'components/ButtonGroup';

const addEvent = function(elem, type, eventHandle) {
  if (elem === null || typeof (elem) === 'undefined') {
    return;
  }
  if (elem.addEventListener) {
    elem.addEventListener(type, eventHandle, false);
  } else if (elem.attachEvent) {
    elem.attachEvent('on' + type, eventHandle);
  } else {
    elem['on' + type] = eventHandle;
  }
};

const removeEvent = function(elem, type, eventHandle) {
  if (elem === null || typeof (elem) === 'undefined') {
    return;
  }
  if (elem.removeEventListener) {
    elem.removeEventListener(type, eventHandle, false);
  } else if (elem.detachEvent) {
    elem.detachEvent('on' + type, eventHandle);
  } else {
    elem['on' + type] = null;
  }
};

const Carousel = React.createClass({
  displayName: 'Carousel',

  mixins: [tweenState.Mixin],

  getDefaultProps() {
    return {
      afterSlide: function() { },
      beforeSlide: function() { },
      cellAlign: 'left',
      cellSpacing: 0,
      data: function() {},
      dragging: true,
      easing: 'easeOutCirc',
      edgeEasing: 'easeOutElastic',
      framePadding: '0px',
      slideIndex: 0,
      slidesToScroll: 1,
      slidesToShow: 1,
      slideWidth: 1,
      speed: 500,
      vertical: false,
      width: '100%'
    }
  },

  getInitialState() {
    return {
      currentSlide: this.props.slideIndex,
      dragging: false,
      frameWidth: 0,
      left: 0,
      slideCount: 0,
      slidesToScroll: this.props.slidesToScroll,
      slideWidth: 0,
      top: 0
    }
  },

  componentWillMount() {
    this.setInitialDimensions();
  },

  componentDidMount() {
    this.setDimensions();
    this.bindEvents();
    this.setExternalData();
  },

  componentWillReceiveProps(nextProps) {
    this.setState({
      slideCount: nextProps.children.length
    });
    this.setDimensions();
    if (nextProps.slideIndex !== this.state.currentSlide) {
      this.goToSlide(nextProps.slideIndex);
    }
  },

  componentWillUnmount() {
    this.unbindEvents();
  },

  render() {
    var self = this;
    var children = React.Children.count(this.props.children) > 1 ? this.formatChildren(this.props.children) : this.props.children;
    const slideFraction = (this.state.currentSlide + 1)/this.state.slideCount;
    return (
      <div className={['slider', this.props.className || ''].join(' ')} ref="slider" style={assign(this.getSliderStyles(), this.props.style || {})}>
        <div
          className="text-center"
        >
          <ButtonGroup
            buttons={[
              {
                label: 'Prev',
                onClick: this.previousSlide,
                buttonClass: 'btn-default',
                disabled: this.state.currentSlide === 0 ? true : false
              },
              {
                label: this.state.currentSlide + 1 === this.state.slideCount ? 'Finish' : 'Next',
                onClick: this.state.currentSlide + 1 === this.state.slideCount ? this.props.onFinish : this.nextSlide,
                buttonClass: 'btn-default',
              }
            ]}
          />
        </div>
        <div
          className="progress"
          style={{marginTop: '2rem'}}
        >
          <div
            className="progress-bar progress-bar-success"
            role="progressbar"
            aria-valuenow="0"
            aria-valuemin="0"
            aria-valuemax="100"
            style={{width: `${slideFraction*100}%`}}
          >{`${this.state.currentSlide + 1}/${this.state.slideCount}`}</div>
        </div>
        <div className="slider-frame"
          ref="frame"
          style={this.getFrameStyles()}
          {...this.getTouchEvents()}
          {...this.getMouseEvents()}
          onClick={this.handleClick}>
          <ul className="slider-list" ref="list" style={this.getListStyles()}>
            {children}
          </ul>
        </div>
        <style type="text/css" dangerouslySetInnerHTML={{__html: self.getStyleTagStyles()}}/>
      </div>
    )
  },

  // Touch Events

  touchObject: {},

  getTouchEvents() {
    var self = this;

    return {
      onTouchStart(e) {
        self.touchObject = {
          startX: e.touches[0].pageX,
          startY: e.touches[0].pageY
        }
      },
      onTouchMove(e) {
        var direction = self.swipeDirection(
          self.touchObject.startX,
          e.touches[0].pageX,
          self.touchObject.startY,
          e.touches[0].pageY
        );

        if (direction !== 0) {
          e.preventDefault();
        }

        var length = self.props.vertical ? Math.round(Math.sqrt(Math.pow(e.touches[0].pageY - self.touchObject.startY, 2)))
                                         : Math.round(Math.sqrt(Math.pow(e.touches[0].pageX - self.touchObject.startX, 2)))

        self.touchObject = {
          startX: self.touchObject.startX,
          startY: self.touchObject.startY,
          endX: e.touches[0].pageX,
          endY: e.touches[0].pageY,
          length: length,
          direction: direction
        }

        self.setState({
          left: self.props.vertical ? 0 : self.getTargetLeft(self.touchObject.length * self.touchObject.direction),
          top: self.props.vertical ? self.getTargetLeft(self.touchObject.length * self.touchObject.direction) : 0
        });
      },
      onTouchEnd(e) {
        self.handleSwipe(e);
      },
      onTouchCancel(e) {
        self.handleSwipe(e);
      }
    }
  },

  clickSafe: true,

  getMouseEvents() {
    var self = this;

    if (this.props.dragging === false) {
      return null;
    }

    return {
      onMouseDown(e) {
        self.touchObject = {
          startX: e.clientX,
          startY: e.clientY
        };

        self.setState({
          dragging: true
        });
      },
      onMouseMove(e) {
        if (!self.state.dragging) {
          return;
        }

        var direction = self.swipeDirection(
          self.touchObject.startX,
          e.clientX,
          self.touchObject.startY,
          e.clientY
        );

        if (direction !== 0) {
          e.preventDefault();
        }

        var length = self.props.vertical ? Math.round(Math.sqrt(Math.pow(e.clientY - self.touchObject.startY, 2)))
                                         : Math.round(Math.sqrt(Math.pow(e.clientX - self.touchObject.startX, 2)))

        self.touchObject = {
          startX: self.touchObject.startX,
          startY: self.touchObject.startY,
          endX: e.clientX,
          endY: e.clientY,
          length: length,
          direction: direction
        };

        self.setState({
          left: self.props.vertical ? 0 : self.getTargetLeft(self.touchObject.length * self.touchObject.direction),
          top: self.props.vertical ? self.getTargetLeft(self.touchObject.length * self.touchObject.direction) : 0
        });
      },
      onMouseUp(e) {
        if (!self.state.dragging) {
          return;
        }

        self.handleSwipe(e);
      },
      onMouseLeave(e) {
        if (!self.state.dragging) {
          return;
        }

        self.handleSwipe(e);
      }
    }
  },

  handleClick(e) {
    if (this.clickSafe === true) {
      e.preventDefault();
      e.stopPropagation();

      if (e.nativeEvent) {
        e.nativeEvent.stopPropagation();
      }
    }
  },

  handleSwipe(e) {
    if (typeof (this.touchObject.length) !== 'undefined' && this.touchObject.length > 44) {
      this.clickSafe = true;
    } else {
      this.clickSafe = false;
    }

    if (this.touchObject.length > (this.state.slideWidth / this.props.slidesToShow) / 5) {
      if (this.touchObject.direction === 1) {
        if (this.state.currentSlide >= React.Children.count(this.props.children) - this.props.slidesToShow) {
          this.animateSlide(tweenState.easingTypes[this.props.edgeEasing]);
        } else {
          this.nextSlide();
        }
      } else if (this.touchObject.direction === -1) {
        if (this.state.currentSlide <= 0) {
          this.animateSlide(tweenState.easingTypes[this.props.edgeEasing]);
        } else {
          this.previousSlide();
        }
      }
    } else {
      this.goToSlide(this.state.currentSlide);
    }

    this.touchObject = {};

    this.setState({
      dragging: false
    });
  },

  swipeDirection(x1, x2, y1, y2) {

    var xDist, yDist, r, swipeAngle;

    xDist = x1 - x2;
    yDist = y1 - y2;
    r = Math.atan2(yDist, xDist);

    swipeAngle = Math.round(r * 180 / Math.PI);
    if (swipeAngle < 0) {
      swipeAngle = 360 - Math.abs(swipeAngle);
    }
    if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
      return 1;
    }
    if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
      return 1;
    }
    if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
      return -1;
    }
    if (this.props.vertical === true) {
      if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
        return 1;
      } else {
        return -1;
      }
    }
    return 0;

  },

  // Action Methods

  goToSlide(index) {
    var self = this;
    if (index >= React.Children.count(this.props.children) || index < 0) {
      return;
    }

    this.props.beforeSlide(this.state.currentSlide, index);

    this.setState({
      currentSlide: index
    }, function() {
      self.animateSlide();
      this.props.afterSlide(index);
      self.setExternalData();
    });
  },

  nextSlide() {
    var childrenCount = React.Children.count(this.props.children);
    if (this.state.currentSlide >= childrenCount - this.props.slidesToShow) {
      return;
    }

    this.goToSlide(Math.min(this.state.currentSlide + this.state.slidesToScroll, childrenCount - this.props.slidesToShow));
  },

  previousSlide() {
    if (this.state.currentSlide <= 0) {
      return;
    }

    this.goToSlide(Math.max(0, this.state.currentSlide - this.state.slidesToScroll));
  },

  // Animation

  animateSlide(easing, duration, endValue) {
    this.tweenState(this.props.vertical ? 'top' : 'left', {
      easing: easing || tweenState.easingTypes[this.props.easing],
      duration: duration || this.props.speed,
      endValue: endValue || this.getTargetLeft()
    });
  },

  getTargetLeft(touchOffset) {
    var offset;
    switch (this.props.cellAlign) {
    case 'left': {
      offset = 0;
      offset -= this.props.cellSpacing * (this.state.currentSlide);
      break;
    }
    case 'center': {
      offset = (this.state.frameWidth - this.state.slideWidth) / 2;
      offset -= this.props.cellSpacing * (this.state.currentSlide);
      break;
    }
    case 'right': {
      offset = this.state.frameWidth - this.state.slideWidth;
      offset -= this.props.cellSpacing * (this.state.currentSlide);
      break;
    }
    }

    if (this.props.vertical) {
      offset = offset / 2;
    }

    offset -= touchOffset || 0;

    return ((this.state.slideWidth * this.state.currentSlide) - offset) * -1;
  },

  // Bootstrapping

  bindEvents() {
    var self = this;
    if (ExecutionEnvironment.canUseDOM) {
      addEvent(window, 'resize', self.onResize);
      addEvent(document, 'readystatechange', self.onReadyStateChange);
    }
  },

  onResize() {
    this.setDimensions();
  },

  onReadyStateChange() {
    this.setDimensions();
  },

  unbindEvents() {
    var self = this;
    if (ExecutionEnvironment.canUseDOM) {
      removeEvent(window, 'resize', self.onResize);
      removeEvent(document, 'readystatechange', self.onReadyStateChange);
    }
  },

  formatChildren(children) {
    var self = this;
    return React.Children.map(children, function(child, index) {
      return <li className="slider-slide" style={self.getSlideStyles()} key={index}>{child}</li>
    });
  },

  setInitialDimensions() {
    var self = this, slideWidth, frameHeight, slideHeight;

    slideWidth = this.props.vertical ? (this.props.initialSlideHeight || 0) : (this.props.initialSlideWidth || 0);
    slideHeight = this.props.initialSlideHeight ? this.props.initialSlideHeight * this.props.slidesToShow : 0;

    frameHeight = slideHeight + ((this.props.cellSpacing / 2) * (this.props.slidesToShow - 1));

    this.setState({
      frameWidth: this.props.vertical ? frameHeight : '100%',
      slideCount: React.Children.count(this.props.children),
      slideWidth: slideWidth
    }, function() {
      self.setLeft();
      self.setExternalData();
    });
  },

  setDimensions() {
    var self = this,
      slideWidth,
      slidesToScroll,
      firstSlide,
      frame,
      frameWidth,
      frameHeight,
      slideHeight;

    slidesToScroll = this.props.slidesToScroll;
    frame = this.refs.frame;
    firstSlide = frame.childNodes[0].childNodes[0];
    if (firstSlide) {
      firstSlide.style.height = 'auto';
      slideHeight = firstSlide.offsetHeight * this.props.slidesToShow;
    } else {
      slideHeight = 100;
    }

    if (typeof this.props.slideWidth !== 'number') {
      slideWidth = parseInt(this.props.slideWidth);
    } else {
      if (this.props.vertical) {
        slideWidth = (slideHeight / this.props.slidesToShow) * this.props.slideWidth;
      } else {
        slideWidth = (frame.offsetWidth / this.props.slidesToShow) * this.props.slideWidth;
      }
    }

    if (!this.props.vertical) {
      slideWidth -= this.props.cellSpacing * ((100 - (100 / this.props.slidesToShow)) / 100);
    }

    frameHeight = slideHeight + ((this.props.cellSpacing / 2) * (this.props.slidesToShow - 1));
    frameWidth = this.props.vertical ? frameHeight : frame.offsetWidth;

    if (this.props.slidesToScroll === 'auto') {
      slidesToScroll = Math.floor(frameWidth / (slideWidth + this.props.cellSpacing));
    }

    this.setState({
      frameWidth: frameWidth,
      slideWidth: slideWidth,
      slidesToScroll: slidesToScroll,
      left: this.props.vertical ? 0 : this.getTargetLeft(),
      top: this.props.vertical ? this.getTargetLeft() : 0
    }, function() {
      self.setLeft()
    });
  },

  setLeft() {
    this.setState({
      left: this.props.vertical ? 0 : this.getTargetLeft(),
      top: this.props.vertical ? this.getTargetLeft() : 0
    })
  },

  // Data

  setExternalData() {
    if (this.props.data) {
      this.props.data();
    }
  },

  // Styles

  getListStyles() {
    var listWidth = this.state.slideWidth * React.Children.count(this.props.children);
    var spacingOffset = this.props.cellSpacing * React.Children.count(this.props.children);
    var transform = 'translate3d(' +
      this.getTweeningValue('left') + 'px, ' +
      this.getTweeningValue('top') + 'px, 0)'
    return {
      transform,
      WebkitTransform: transform,
      msTransform: 'translate(' +
        this.getTweeningValue('left') + 'px, ' +
        this.getTweeningValue('top') + 'px)',
      position: 'relative',
      display: 'block',
      margin: this.props.vertical ? (this.props.cellSpacing / 2) * -1 + 'px 0px'
                                  : '0px ' + (this.props.cellSpacing / 2) * -1 + 'px',
      padding: 0,
      height: this.props.vertical ? listWidth + spacingOffset : 'auto',
      width: this.props.vertical ? 'auto' : listWidth + spacingOffset,
      cursor: this.state.dragging === true ? 'pointer' : 'inherit',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box'
    }
  },

  getFrameStyles() {
    return {
      position: 'relative',
      display: 'block',
      overflow: 'hidden',
      height: this.props.vertical ? this.state.frameWidth || 'initial' : 'auto',
      margin: this.props.framePadding,
      padding: 0,
      transform: 'translate3d(0, 0, 0)',
      WebkitTransform: 'translate3d(0, 0, 0)',
      msTransform: 'translate(0, 0)',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box'
    }
  },

  getSlideStyles() {
    return {
      display: this.props.vertical ? 'block' : 'inline-block',
      listStyleType: 'none',
      verticalAlign: 'top',
      width: this.props.vertical ? '100%' : this.state.slideWidth,
      height: 'auto',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box',
      marginLeft: this.props.vertical ? 'auto' : this.props.cellSpacing / 2,
      marginRight: this.props.vertical ? 'auto' : this.props.cellSpacing / 2,
      marginTop: this.props.vertical ? this.props.cellSpacing / 2 : 'auto',
      marginBottom: this.props.vertical ? this.props.cellSpacing / 2 : 'auto'
    }
  },

  getSliderStyles() {
    return {
      position: 'relative',
      display: 'block',
      width: this.props.width,
      height: 'auto',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box',
      visibility: this.state.slideWidth ? 'visible' : 'hidden'
    }
  },

  getStyleTagStyles() {
    return '.slider-slide > img {width: 100%; display: block;}'
  },

  getDecoratorStyles(position) {
    switch (position) {
    case 'TopLeft':
      {
        return {
          position: 'absolute',
          top: 0,
          left: 0
        };
      }
    case 'TopCenter':
      {
        return {
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          WebkitTransform: 'translateX(-50%)',
          msTransform: 'translateX(-50%)'
        };
      }
    case 'TopRight':
      {
        return {
          position: 'absolute',
          top: 0,
          right: 0
        };
      }
    case 'CenterLeft':
      {
        return {
          position: 'absolute',
          top: '50%',
          left: 0,
          transform: 'translateY(-50%)',
          WebkitTransform: 'translateY(-50%)',
          msTransform: 'translateY(-50%)'
        };
      }
    case 'CenterCenter':
      {
        return {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          WebkitTransform: 'translate(-50%, -50%)',
          msTransform: 'translate(-50%, -50%)'
        };
      }
    case 'CenterRight':
      {
        return {
          position: 'absolute',
          top: '50%',
          right: 0,
          transform: 'translateY(-50%)',
          WebkitTransform: 'translateY(-50%)',
          msTransform: 'translateY(-50%)'
        };
      }
    case 'BottomLeft':
      {
        return {
          position: 'absolute',
          bottom: 0,
          left: 0
        };
      }
    case 'BottomCenter':
      {
        return {
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          WebkitTransform: 'translateX(-50%)',
          msTransform: 'translateX(-50%)'
        };
      }
    case 'BottomRight':
      {
        return {
          position: 'absolute',
          bottom: 0,
          right: 0
        };
      }
    case 'Relative':
      {
        return {
          position: 'relative'
        }
      }
    default:
      {
        return {
          position: 'absolute',
          top: 0,
          left: 0
        };
      }
    }
  }

});

Carousel.ControllerMixin = {
  getInitialState() {
    return {
      carousels: {}
    }
  },
  setCarouselData(carousel) {
    var data = this.state.carousels;
    data[carousel] = this.refs[carousel];
    this.setState({
      carousels: data
    });
  }
}

export default Carousel;
