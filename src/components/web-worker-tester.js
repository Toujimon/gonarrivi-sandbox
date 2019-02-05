import React from "react";

export default class WebWorkerTester extends React.Component {
  _worker = null;

  _handleClick = e => {
    if (this._worker) {
      this._worker.postMessage("something");
    }
  };

  _handleMessage = e => {
    console.log(e.data);
  };

  componentDidMount() {
    this._worker = new Worker("/worker-test.js");
    this._worker.addEventListener("message", this._handleMessage);
  }

  componentWillUnmount() {
    if (this._worker) {
      this._worker.terminate();
      this._worker = null;
    }
  }

  render() {
    return <button onClick={this._handleClick}>Send message to worker</button>;
  }
}
