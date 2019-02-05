import * as React from "react";
import * as ReactDOM from "react-dom";

class SvgTests extends React.Component {
  static defaultProps = {
    radius: 60,
    progress: 0,
    transitionMilliseconds: 5000
  };
  state = {
    animateProgress: false
  };
  componentDidMount() {
    setTimeout(() => {
      this.setState({ animateProgress: true });
    });
  }
  render() {
    const { radius, progress, transitionMilliseconds } = this.props;
    const strokeWidth = radius;
    const realRadius = radius - strokeWidth / 2;
    const circunference = Math.ceil(2 * realRadius * Math.PI);
    //const offsetProgress = (circunference * (progress / 100));
    //const offset = Math.ceil(circunference - offsetProgress);
    return (
      <div>
        <svg class="progress-ring" width={radius * 2} height={radius * 2}>
          <circle
            style={{
              transition: `stroke-dashoffset ${transitionMilliseconds}ms ease-in`,
              strokeDasharray: `${circunference} ${circunference}`,
              strokeDashoffset: this.state.animateProgress ? 0 : circunference
            }}
            stroke="blue"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={realRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
      </div>
    );
  }
}

export default SvgTests;
