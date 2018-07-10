import React, { Component } from 'react';
import "../App.css";
import Amplify,{API,graphqlOperation} from 'aws-amplify';
import aws_exports from '../aws-exports'; // specify the location of aws-exports.js file on your project
Amplify.configure(aws_exports);

//GraphQL
const subscribeToPoints = `subscription subscribeToPoints {
          subscribeToPoints {
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
  
  //Set points from App Component
  componentWillReceiveProps(props) {
    this.setState({points: props.points});
  }
  
  render() {
    //Create subscription for real-time points balance update
    const subscription = API.graphql(graphqlOperation(subscribeToPoints)).subscribe({
        next: (event) => {
            console.log("Subscription: "+event.value.data);
            this.setState({points: event.value.data.subscribeToPoints.points});
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