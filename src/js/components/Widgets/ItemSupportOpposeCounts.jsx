import React, { Component, PropTypes } from "react";

export default class ItemSupportOpposeCounts extends Component {
  static propTypes = {
    supportProps: PropTypes.object
  };

  constructor (props) {
    super(props);
    this.state = { supportProps: this.props.supportProps };
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ supportProps: nextProps.supportProps });
  }

  percentageMajority () {
    const { support_count, oppose_count } = this.state.supportProps;
    return Math.round(100 * Math.max(support_count, oppose_count) / (support_count + oppose_count));
  }

  render () {
    if (this.state.supportProps === undefined) {
      return null;
    }

    var { support_count, oppose_count, is_support, is_oppose } = this.state.supportProps;
    if (support_count === undefined || oppose_count === undefined || is_support === undefined || is_oppose === undefined) {
      return null;
    }

    var bar_style = {
      width: this.percentageMajority() + "%"
    };

    var empty_bar_style = {
      borderWidth: "0"
    };

    var is_empty = support_count === 0 && oppose_count === 0;

    var is_support_and_oppose = support_count !== 0 && oppose_count !== 0;

    var is_majority_support = support_count >= oppose_count;

    var background_bar_class_name;
    if (is_support_and_oppose && is_majority_support) {
      // If there are both support and oppose positions, change the color of the bar background to the minority position
      background_bar_class_name = "network-positions__bar-well red-bar";
    } else if (is_support_and_oppose && !is_majority_support) {
      // If there are both support and oppose positions, change the color of the bar background to the minority position
      background_bar_class_name = "network-positions__bar-well green-bar";
    } else {
      background_bar_class_name = "network-positions__bar-well";
    }

    return <div className="network-positions">
      {/* <div className="network-positions__bar-label">
        { !is_empty ?
          "Positions in your network" :
          "No positions in your network"
        }
      </div> */}
      <div className="network-positions__support">
        <img src={ !is_empty && is_majority_support ? "/img/global/icons/up-arrow-color-icon.svg" : "/img/global/icons/up-arrow-gray-icon.svg" } className="network-positions__support-icon u-push--xs" width="20" height="20" />
        <div className="network-positions__count">
          { !is_empty ? support_count : null }
          <span className="sr-only"> Support</span>
        </div>
      </div>
      <div className={background_bar_class_name}>
        { is_majority_support ?
          <div className="network-positions__bar network-positions__bar--majority network-positions__bar--support" style={ !is_empty ? bar_style : empty_bar_style }>
            <span className="sr-only">{this.percentageMajority()}% Supports</span>
          </div> :
          <div className="network-positions__bar network-positions__bar--majority network-positions__bar--oppose" style={ !is_empty ? bar_style : empty_bar_style }>
            <span className="sr-only">{this.percentageMajority()}% Supports</span>
          </div>
        }
      </div>

      <div className="network-positions__oppose">
        <div className="network-positions__count u-push--xs">
          { !is_empty ? oppose_count : null }
          <span className="sr-only"> Oppose</span>
        </div>
        <img src={ !is_empty && !is_majority_support ? "/img/global/icons/down-arrow-color-icon.svg" : "/img/global/icons/down-arrow-gray-icon.svg" } className="network-positions__oppose-icon" width="20" height="20" />
      </div>
    </div>;
  }
}
