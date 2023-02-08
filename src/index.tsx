import React, {PureComponent} from 'react';
import {
  Animated,
  Easing,
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

type AnimatedConfig = Animated.TimingAnimationConfig;

export type AnimatedAction = (
  event: GestureResponderEvent,
  state: PanResponderGestureState,
  instance: Swipeable,
) => void;

type AnimatedFn = typeof Animated.timing;

type RefFn = (instance: Swipeable) => void;

type AnimatedValueFn = (pan: Animated.ValueXY) => void;

interface Props {
  // elements
  children: JSX.Element;
  leftContent?: JSX.Element;
  rightContent?: JSX.Element;
  leftButtons?: JSX.Element[];
  rightButtons?: JSX.Element[];

  // left action lifecycle
  onLeftActionActivate?: AnimatedAction;
  onLeftActionDeactivate?: AnimatedAction;
  onLeftActionRelease?: AnimatedAction;
  onLeftActionComplete?: AnimatedAction;
  leftActionActivationDistance?: number;
  leftActionReleaseAnimationFn?: AnimatedFn;
  leftActionReleaseAnimationConfig?: AnimatedConfig;

  // right action lifecycle
  onRightActionActivate?: AnimatedAction;
  onRightActionDeactivate?: AnimatedAction;
  onRightActionRelease?: AnimatedAction;
  onRightActionComplete?: AnimatedAction;
  rightActionActivationDistance?: number;
  rightActionReleaseAnimationFn?: AnimatedFn;
  rightActionReleaseAnimationConfig?: AnimatedConfig;

  // left buttons lifecycle
  onLeftButtonsActivate?: AnimatedAction;
  onLeftButtonsDeactivate?: AnimatedAction;
  onLeftButtonsOpenRelease?: AnimatedAction;
  onLeftButtonsOpenComplete?: AnimatedAction;
  onLeftButtonsCloseRelease?: AnimatedAction;
  onLeftButtonsCloseComplete?: AnimatedAction;
  leftButtonWidth?: number;
  leftButtonsActivationDistance?: number;
  leftButtonsOpenReleaseAnimationFn?: AnimatedFn;
  leftButtonsOpenReleaseAnimationConfig?: AnimatedConfig;
  leftButtonsCloseReleaseAnimationFn?: AnimatedFn;
  leftButtonsCloseReleaseAnimationConfig?: AnimatedConfig;

  // right buttons lifecycle
  onRightButtonsActivate?: AnimatedAction;
  onRightButtonsDeactivate?: AnimatedAction;
  onRightButtonsOpenRelease?: AnimatedAction;
  onRightButtonsOpenComplete?: AnimatedAction;
  onRightButtonsCloseRelease?: AnimatedAction;
  onRightButtonsCloseComplete?: AnimatedAction;
  rightButtonWidth?: number;
  rightButtonsActivationDistance?: number;
  rightButtonsOpenReleaseAnimationFn?: AnimatedFn;
  rightButtonsOpenReleaseAnimationConfig?: AnimatedConfig;
  rightButtonsCloseReleaseAnimationFn?: AnimatedFn;
  rightButtonsCloseReleaseAnimationConfig?: AnimatedConfig;

  // base swipe lifecycle
  onSwipeStart?: AnimatedAction;
  onSwipeMove?: AnimatedAction;
  onSwipeRelease?: AnimatedAction;
  onSwipeComplete?: AnimatedAction;
  swipeReleaseAnimationFn?: AnimatedFn;
  swipeReleaseAnimationConfig?: AnimatedConfig;

  // misc
  onRef?: RefFn;
  onPanAnimatedValueRef?: AnimatedValueFn;
  swipeStartMinDistance?: number;

  // styles
  style?: ViewStyle;
  leftContainerStyle?: ViewStyle;
  leftButtonContainerStyle?: ViewStyle;
  rightContainerStyle?: ViewStyle;
  rightButtonContainerStyle?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

interface State {
  pan: Animated.ValueXY;
  width: number;
  lastOffset: Extract<
    Animated.TimingAnimationConfig['toValue'],
    {x: number; y: number}
  >;
  leftActionActivated: boolean;
  leftButtonsActivated: boolean;
  leftButtonsOpen: boolean;
  rightActionActivated: boolean;
  rightButtonsActivated: boolean;
  rightButtonsOpen: boolean;
}

const defaultAnimatedConfig: AnimatedConfig = {
  toValue: {x: 0, y: 0},
  duration: 250,
  easing: Easing.elastic(0.5),
  useNativeDriver: false,
};

function noop() {}

export default class Swipeable extends PureComponent<Props, State> {
  static defaultProps = {
    leftContent: null,
    rightContent: null,
    leftButtons: null,
    rightButtons: null,

    // left action lifecycle
    onLeftActionActivate: noop,
    onLeftActionDeactivate: noop,
    onLeftActionRelease: noop,
    onLeftActionComplete: noop,
    leftActionActivationDistance: 125,
    leftActionReleaseAnimationFn: null,
    leftActionReleaseAnimationConfig: null,

    // right action lifecycle
    onRightActionActivate: noop,
    onRightActionDeactivate: noop,
    onRightActionRelease: noop,
    onRightActionComplete: noop,
    rightActionActivationDistance: 125,
    rightActionReleaseAnimationFn: null,
    rightActionReleaseAnimationConfig: null,

    // left buttons lifecycle
    onLeftButtonsActivate: noop,
    onLeftButtonsDeactivate: noop,
    onLeftButtonsOpenRelease: noop,
    onLeftButtonsOpenComplete: noop,
    onLeftButtonsCloseRelease: noop,
    onLeftButtonsCloseComplete: noop,
    leftButtonWidth: 75,
    leftButtonsActivationDistance: 75,
    leftButtonsOpenReleaseAnimationFn: null,
    leftButtonsOpenReleaseAnimationConfig: null,
    leftButtonsCloseReleaseAnimationFn: null,
    leftButtonsCloseReleaseAnimationConfig: null,

    // right buttons lifecycle
    onRightButtonsActivate: noop,
    onRightButtonsDeactivate: noop,
    onRightButtonsOpenRelease: noop,
    onRightButtonsOpenComplete: noop,
    onRightButtonsCloseRelease: noop,
    onRightButtonsCloseComplete: noop,
    rightButtonWidth: 75,
    rightButtonsActivationDistance: 75,
    rightButtonsOpenReleaseAnimationFn: null,
    rightButtonsOpenReleaseAnimationConfig: null,
    rightButtonsCloseReleaseAnimationFn: null,
    rightButtonsCloseReleaseAnimationConfig: null,

    // base swipe lifecycle
    onSwipeStart: noop,
    onSwipeMove: noop,
    onSwipeRelease: noop,
    onSwipeComplete: noop,
    swipeReleaseAnimationFn: Animated.timing,
    swipeReleaseAnimationConfig: defaultAnimatedConfig,

    // misc
    onRef: noop,
    onPanAnimatedValueRef: noop,
    swipeStartMinDistance: 15,
  };

  state: State = {
    pan: new Animated.ValueXY(),
    width: 0,
    lastOffset: {x: 0, y: 0},
    leftActionActivated: false,
    leftButtonsActivated: false,
    leftButtonsOpen: false,
    rightActionActivated: false,
    rightButtonsActivated: false,
    rightButtonsOpen: false,
  };

  componentDidMount() {
    const {onPanAnimatedValueRef, onRef} = this.props;

    onRef?.(this);
    onPanAnimatedValueRef?.(this.state.pan);
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  recenter = (
    animationFn = this.props.swipeReleaseAnimationFn,
    animationConfig = this.props.swipeReleaseAnimationConfig,
    onDone?: Animated.EndCallback,
  ) => {
    const {pan} = this.state;

    this.setState({
      lastOffset: {x: 0, y: 0},
      leftActionActivated: false,
      leftButtonsActivated: false,
      leftButtonsOpen: false,
      rightActionActivated: false,
      rightButtonsActivated: false,
      rightButtonsOpen: false,
    });

    pan.flattenOffset();

    if (animationConfig) {
      animationFn?.(pan, animationConfig).start(onDone);
    }
  };

  _unmounted = false;

  _handlePan = Animated.event(
    [
      null,
      {
        dx: this.state.pan.x,
        dy: this.state.pan.y,
      },
    ],
    {useNativeDriver: false},
  );

  _handleMoveShouldSetPanResponder = (
    _event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) =>
    this.props.swipeStartMinDistance
      ? Math.abs(gestureState.dx) > this.props.swipeStartMinDistance
      : false;

  _handlePanResponderStart = (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
    const {lastOffset, pan} = this.state;

    pan.setOffset(lastOffset);
    this.props.onSwipeStart?.(event, gestureState, this);
  };

  _handlePanResponderMove = (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
    const {
      leftActionActivationDistance,
      leftButtonsActivationDistance,
      onLeftActionActivate,
      onLeftActionDeactivate,
      onLeftButtonsActivate,
      onLeftButtonsDeactivate,
      rightActionActivationDistance,
      rightButtonsActivationDistance,
      onRightActionActivate,
      onRightActionDeactivate,
      onRightButtonsActivate,
      onRightButtonsDeactivate,
      onSwipeMove,
    } = this.props;
    const {
      lastOffset,
      leftActionActivated,
      leftButtonsActivated,
      rightActionActivated,
      rightButtonsActivated,
    } = this.state;
    const {dx, vx} = gestureState;
    const x = dx + lastOffset.x;
    const canSwipeRight = this._canSwipeRight();
    const canSwipeLeft = this._canSwipeLeft();
    const hasLeftButtons = this._hasLeftButtons();
    const hasRightButtons = this._hasRightButtons();
    const isSwipingLeft = vx < 0;
    const isSwipingRight = vx > 0;
    let nextLeftActionActivated = leftActionActivated;
    let nextLeftButtonsActivated = leftButtonsActivated;
    let nextRightActionActivated = rightActionActivated;
    let nextRightButtonsActivated = rightButtonsActivated;

    this._handlePan(event, gestureState);
    onSwipeMove?.(event, gestureState, this);

    if (
      !leftActionActivated &&
      canSwipeRight &&
      leftActionActivationDistance &&
      x >= leftActionActivationDistance
    ) {
      nextLeftActionActivated = true;
      onLeftActionActivate?.(event, gestureState, this);
    }

    if (
      leftActionActivated &&
      canSwipeRight &&
      leftActionActivationDistance &&
      x < leftActionActivationDistance
    ) {
      nextLeftActionActivated = false;
      onLeftActionDeactivate?.(event, gestureState, this);
    }

    if (
      !rightActionActivated &&
      canSwipeLeft &&
      rightActionActivationDistance &&
      x <= -rightActionActivationDistance
    ) {
      nextRightActionActivated = true;
      onRightActionActivate?.(event, gestureState, this);
    }

    if (
      rightActionActivated &&
      canSwipeLeft &&
      rightActionActivationDistance &&
      x > -rightActionActivationDistance
    ) {
      nextRightActionActivated = false;
      onRightActionDeactivate?.(event, gestureState, this);
    }

    if (
      !leftButtonsActivated &&
      hasLeftButtons &&
      !isSwipingLeft &&
      leftButtonsActivationDistance &&
      x >= leftButtonsActivationDistance
    ) {
      nextLeftButtonsActivated = true;
      onLeftButtonsActivate?.(event, gestureState, this);
    }

    if (leftButtonsActivated && hasLeftButtons && isSwipingLeft) {
      nextLeftButtonsActivated = false;
      onLeftButtonsDeactivate?.(event, gestureState, this);
    }

    if (
      !rightButtonsActivated &&
      hasRightButtons &&
      !isSwipingRight &&
      rightButtonsActivationDistance &&
      x <= -rightButtonsActivationDistance
    ) {
      nextRightButtonsActivated = true;
      onRightButtonsActivate?.(event, gestureState, this);
    }

    if (rightButtonsActivated && hasRightButtons && isSwipingRight) {
      nextRightButtonsActivated = false;
      onRightButtonsDeactivate?.(event, gestureState, this);
    }

    const needsUpdate =
      nextLeftActionActivated !== leftActionActivated ||
      nextLeftButtonsActivated !== leftButtonsActivated ||
      nextRightActionActivated !== rightActionActivated ||
      nextRightButtonsActivated !== rightButtonsActivated;

    if (needsUpdate) {
      this.setState({
        leftActionActivated: nextLeftActionActivated,
        leftButtonsActivated: nextLeftButtonsActivated,
        rightActionActivated: nextRightActionActivated,
        rightButtonsActivated: nextRightButtonsActivated,
      });
    }
  };

  _handlePanResponderEnd = (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ): boolean => {
    const {
      onLeftActionRelease,
      onLeftActionDeactivate,
      onLeftButtonsOpenRelease,
      onLeftButtonsCloseRelease,
      onRightActionRelease,
      onRightActionDeactivate,
      onRightButtonsOpenRelease,
      onRightButtonsCloseRelease,
      onSwipeRelease,
    } = this.props;
    const {
      leftActionActivated,
      leftButtonsOpen,
      leftButtonsActivated,
      rightActionActivated,
      rightButtonsOpen,
      rightButtonsActivated,
      pan,
    } = this.state;
    const animationFn = this._getReleaseAnimationFn();
    const animationConfig = this._getReleaseAnimationConfig();
    const axes = animationConfig?.toValue as Extract<
      AnimatedConfig['toValue'],
      {x: number; y: number}
    >;

    onSwipeRelease?.(event, gestureState, this);

    if (leftActionActivated) {
      onLeftActionRelease?.(event, gestureState, this);
    }

    if (rightActionActivated) {
      onRightActionRelease?.(event, gestureState, this);
    }

    if (leftButtonsActivated && !leftButtonsOpen) {
      onLeftButtonsOpenRelease?.(event, gestureState, this);
    }

    if (!leftButtonsActivated && leftButtonsOpen) {
      onLeftButtonsCloseRelease?.(event, gestureState, this);
    }

    if (rightButtonsActivated && !rightButtonsOpen) {
      onRightButtonsOpenRelease?.(event, gestureState, this);
    }

    if (!rightButtonsActivated && rightButtonsOpen) {
      onRightButtonsCloseRelease?.(event, gestureState, this);
    }

    this.setState({
      lastOffset: {x: axes.x, y: axes.y},
      leftActionActivated: false,
      rightActionActivated: false,
      leftButtonsOpen: leftButtonsActivated,
      rightButtonsOpen: rightButtonsActivated,
    });

    pan.flattenOffset();

    if (animationConfig) {
      animationFn?.(pan, animationConfig).start(() => {
        if (this._unmounted) {
          return;
        }

        const {
          onLeftActionComplete,
          onLeftButtonsOpenComplete,
          onLeftButtonsCloseComplete,
          onRightActionComplete,
          onRightButtonsOpenComplete,
          onRightButtonsCloseComplete,
          onSwipeComplete,
        } = this.props;

        onSwipeComplete?.(event, gestureState, this);

        if (leftActionActivated) {
          onLeftActionComplete?.(event, gestureState, this);
          onLeftActionDeactivate?.(event, gestureState, this);
        }

        if (rightActionActivated) {
          onRightActionComplete?.(event, gestureState, this);
          onRightActionDeactivate?.(event, gestureState, this);
        }

        if (leftButtonsActivated && !leftButtonsOpen) {
          onLeftButtonsOpenComplete?.(event, gestureState, this);
        }

        if (!leftButtonsActivated && leftButtonsOpen) {
          onLeftButtonsCloseComplete?.(event, gestureState, this);
        }

        if (rightButtonsActivated && !rightButtonsOpen) {
          onRightButtonsOpenComplete?.(event, gestureState, this);
        }

        if (!rightButtonsActivated && rightButtonsOpen) {
          onRightButtonsCloseComplete?.(event, gestureState, this);
        }
      });
    }

    return true;
  };

  _panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
    onMoveShouldSetPanResponderCapture: this._handleMoveShouldSetPanResponder,
    onPanResponderGrant: this._handlePanResponderStart,
    onPanResponderMove: this._handlePanResponderMove,
    onPanResponderRelease: this._handlePanResponderEnd,
    onPanResponderTerminate: this._handlePanResponderEnd,
    onPanResponderTerminationRequest: this._handlePanResponderEnd,
  });

  _handleLayout = ({
    nativeEvent: {
      layout: {width},
    },
  }: LayoutChangeEvent) => this.setState({width});

  _canSwipeRight() {
    return this.props.leftContent || this._hasLeftButtons();
  }

  _canSwipeLeft() {
    return this.props.rightContent || this._hasRightButtons();
  }

  _hasLeftButtons() {
    const {leftButtons, leftContent} = this.props;

    return !leftContent && leftButtons && leftButtons.length;
  }

  _hasRightButtons() {
    const {rightButtons, rightContent} = this.props;

    return !rightContent && rightButtons && rightButtons.length;
  }

  _getReleaseAnimationFn() {
    const {
      leftActionReleaseAnimationFn,
      leftButtonsOpenReleaseAnimationFn,
      leftButtonsCloseReleaseAnimationFn,
      rightActionReleaseAnimationFn,
      rightButtonsOpenReleaseAnimationFn,
      rightButtonsCloseReleaseAnimationFn,
      swipeReleaseAnimationFn,
    } = this.props;
    const {
      leftActionActivated,
      leftButtonsActivated,
      leftButtonsOpen,
      rightActionActivated,
      rightButtonsActivated,
      rightButtonsOpen,
    } = this.state;

    if (leftActionActivated && leftActionReleaseAnimationFn) {
      return leftActionReleaseAnimationFn;
    }

    if (rightActionActivated && rightActionReleaseAnimationFn) {
      return rightActionReleaseAnimationFn;
    }

    if (leftButtonsActivated && leftButtonsOpenReleaseAnimationFn) {
      return leftButtonsOpenReleaseAnimationFn;
    }

    if (
      !leftButtonsActivated &&
      leftButtonsOpen &&
      leftButtonsCloseReleaseAnimationFn
    ) {
      return leftButtonsCloseReleaseAnimationFn;
    }

    if (rightButtonsActivated && rightButtonsOpenReleaseAnimationFn) {
      return rightButtonsOpenReleaseAnimationFn;
    }

    if (
      !rightButtonsActivated &&
      rightButtonsOpen &&
      rightButtonsCloseReleaseAnimationFn
    ) {
      return rightButtonsCloseReleaseAnimationFn;
    }

    return swipeReleaseAnimationFn;
  }

  _getReleaseAnimationConfig() {
    const {
      leftActionReleaseAnimationConfig,
      leftButtons,
      leftButtonsOpenReleaseAnimationConfig,
      leftButtonsCloseReleaseAnimationConfig,
      leftButtonWidth,
      rightActionReleaseAnimationConfig,
      rightButtons,
      rightButtonsOpenReleaseAnimationConfig,
      rightButtonsCloseReleaseAnimationConfig,
      rightButtonWidth,
      swipeReleaseAnimationConfig,
    } = this.props;
    const {
      leftActionActivated,
      leftButtonsActivated,
      leftButtonsOpen,
      rightActionActivated,
      rightButtonsActivated,
      rightButtonsOpen,
    } = this.state;

    if (leftActionActivated && leftActionReleaseAnimationConfig) {
      return leftActionReleaseAnimationConfig;
    }

    if (rightActionActivated && rightActionReleaseAnimationConfig) {
      return rightActionReleaseAnimationConfig;
    }

    if (leftButtonsActivated && leftButtonWidth && leftButtons) {
      return {
        ...(swipeReleaseAnimationConfig || defaultAnimatedConfig),
        ...(leftButtonsOpenReleaseAnimationConfig || defaultAnimatedConfig),
        toValue: {
          x: leftButtons.length * leftButtonWidth,
          y: 0,
        },
      };
    }

    if (rightButtonsActivated && rightButtons && rightButtonWidth) {
      return {
        ...(swipeReleaseAnimationConfig || defaultAnimatedConfig),
        ...(rightButtonsOpenReleaseAnimationConfig || defaultAnimatedConfig),
        toValue: {
          x: rightButtons.length * rightButtonWidth * -1,
          y: 0,
        },
      };
    }

    if (
      !leftButtonsActivated &&
      leftButtonsOpen &&
      leftButtonsCloseReleaseAnimationConfig
    ) {
      return leftButtonsCloseReleaseAnimationConfig;
    }

    if (
      !rightButtonsActivated &&
      rightButtonsOpen &&
      rightButtonsCloseReleaseAnimationConfig
    ) {
      return rightButtonsCloseReleaseAnimationConfig;
    }

    return swipeReleaseAnimationConfig;
  }

  _renderButtons(buttons: JSX.Element[], isLeftButtons: boolean) {
    const {leftButtonContainerStyle, rightButtonContainerStyle} = this.props;
    const {pan, width} = this.state;
    const canSwipeLeft = this._canSwipeLeft();
    const canSwipeRight = this._canSwipeRight();
    const count = buttons.length;
    const leftEnd = canSwipeLeft ? -width : 0;
    const rightEnd = canSwipeRight ? width : 0;
    const inputRange = isLeftButtons ? [0, rightEnd] : [leftEnd, 0];

    return buttons.map((buttonContent, index) => {
      const outputMultiplier = -index / count;
      const outputRange = isLeftButtons
        ? [0, rightEnd * outputMultiplier]
        : [leftEnd * outputMultiplier, 0];
      const transform = [
        {
          translateX: pan.x.interpolate({
            inputRange,
            outputRange,
            extrapolate: 'clamp',
          }),
        },
      ];
      const buttonStyle = [
        StyleSheet.absoluteFill,
        {width, transform},
        isLeftButtons ? leftButtonContainerStyle : rightButtonContainerStyle,
      ];

      return (
        <Animated.View key={index} style={buttonStyle}>
          {buttonContent}
        </Animated.View>
      );
    });
  }

  render() {
    const {
      children,
      contentContainerStyle,
      leftButtons,
      leftContainerStyle,
      leftContent,
      rightButtons,
      rightContainerStyle,
      rightContent,
      style,
      ...props
    } = this.props;
    const {pan, width} = this.state;
    const canSwipeLeft = this._canSwipeLeft();
    const canSwipeRight = this._canSwipeRight();
    const transform = [
      {
        translateX: pan.x.interpolate({
          inputRange: [canSwipeLeft ? -width : 0, canSwipeRight ? width : 0],
          outputRange: [
            canSwipeLeft ? -width + StyleSheet.hairlineWidth : 0,
            canSwipeRight ? width - StyleSheet.hairlineWidth : 0,
          ],
          extrapolate: 'clamp',
        }),
      },
    ];

    return (
      <View
        onLayout={this._handleLayout}
        style={[styles.container, style]}
        {...this._panResponder.panHandlers}
        {...props}>
        {canSwipeRight && (
          <Animated.View
            style={[
              {transform, marginLeft: -width, width},
              leftContainerStyle,
            ]}>
            {leftContent ||
              (leftButtons && this._renderButtons(leftButtons, true))}
          </Animated.View>
        )}
        <Animated.View
          style={[{transform}, styles.content, contentContainerStyle]}>
          {children}
        </Animated.View>
        {canSwipeLeft && (
          <Animated.View
            style={[
              {transform, marginRight: -width, width},
              rightContainerStyle,
            ]}>
            {rightContent ||
              (rightButtons && this._renderButtons(rightButtons, false))}
          </Animated.View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
});
