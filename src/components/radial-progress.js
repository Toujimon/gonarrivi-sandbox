import * as React from "react";

class RadialProgress extends React.Component {
  static defaultProps = {
    size: 120,
    transitionMilliseconds: 1000
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
    const { size, progress, transitionMilliseconds } = this.props;
    const radius = Math.floor(size / 2);
    const strokeWidth = radius;
    const realRadius = radius - strokeWidth / 2;
    const circunference = Math.ceil(2 * realRadius * Math.PI);
    //const offsetProgress = (circunference * (progress / 100));
    //const offset = Math.ceil(circunference - offsetProgress);
    return (
      <div style={{ width: size, height: size }}>
        <svg className="progress-ring" width={size} height={size}>
          <circle
            style={{
              transition: `stroke-dashoffset ${transitionMilliseconds}ms ease-in`,
              strokeDasharray: `${circunference} ${circunference}`,
              strokeDashoffset: this.state.animateProgress ? 0 : circunference,
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%"
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

export default RadialProgress;
