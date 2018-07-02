import React, { Component } from 'react';
import "../App.css";
import Amplify,{API,graphqlOperation} from 'aws-amplify';
import aws_exports from '../aws-exports'; // specify the location of aws-exports.js file on your project
Amplify.configure(aws_exports);

const subscripeToPoints = `subscription subscripeToPoints {
          subscripeToPoints {
            __typename
            points
          }
        }`;

class Points extends Component {

  constructor(props){
    super(props);
    this.state = {
        points: ""
    };
  }
  
  componentWillReceiveProps(props) {
    this.setState({points: props.points});
  }
  
  render() {
    const subscription = API.graphql(graphqlOperation(subscripeToPoints)).subscribe({
        next: (event) => {
            console.log(event.value.data);
            this.setState({points: event.value.data.subscripeToPoints.points});
        }
    });
    return (
      <div className="Points bg-light card p-2">
        <h6><strong>Balance: {this.state.points} Unicoins</strong></h6>
      </div>
    );
  }
}

export default Points;