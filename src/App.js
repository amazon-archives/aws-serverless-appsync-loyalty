import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import Unicorns from "./components/Unicorns";
import Points from "./components/Points";
import Order from "./components/Order";
import Amplify,{Auth,Analytics,API,graphqlOperation} from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import aws_exports from './aws-exports'; // specify the location of aws-exports.js file on your project
Amplify.configure(aws_exports);

const registerUser = `mutation registerUser($userId: ID!, $username: String!) {
        registerUser(userId: $userId, username: $username) {
          __typename
          userId
          username
          points
        }
      }`;
      
const updateUserBalance = `mutation updateUserBalance($userId: ID!, $username: String!, $points: Int!) {
        updateUserBalance(userId: $userId, username: $username, points: $points) {
          __typename
          points
        }
      }`;
const createOrder = `mutation createOrder($orderId:ID!,$itemId:ID!,$totalOrder:Int,$count:Int){
  createOrder(orderId:$orderId,itemId:$itemId,totalOrder:$totalOrder,count:$count){
    orderId
    itemId
    count
    totalOrder
    date
  }
}`

class App extends Component {

  constructor(props){
    super(props);
    this.state={
      user:"",
      sub:"",
      points:"",
      order:"",
      display: false
    }
  }
  
  async componentDidMount(){
    this.session = await Auth.currentSession();
    console.log('Decoded Acess Token:');
    console.log(JSON.stringify(this.session.accessToken.payload, null, 2));
    this.setState({user: this.session.accessToken.payload.username});
    this.setState({sub: this.session.accessToken.payload.sub});
    const getUser = await API.graphql(graphqlOperation(
    `query getMe{
      getMe(userId: "`+this.state.sub+`"){
        __typename
        userId
        username
        points
      }
    }`));
    this.setState({points: getUser.data.getMe.points});
    this.userDetails = {
        userId: this.state.sub,
        username: this.state.user,
        points: this.state.points
    };
    if (getUser.data.getMe.userId ===""){
      const newUser = await API.graphql(graphqlOperation(registerUser, this.userDetails));
      this.userDetails.points = newUser.data.registerUser.points;
    }
    this.updateBalance(this.userDetails.points);
  }
  
  async updateBalance(points){
    this.userDetails.points = points;
    const lastPoints = await API.graphql(graphqlOperation(updateUserBalance, this.userDetails));
    console.log(lastPoints);
  }
  
  async createOrder(order){
    console.log(order);
    const putOrder = await API.graphql(graphqlOperation(createOrder, order));
    console.log(JSON.stringify(putOrder));
    this.setState({order: putOrder.data.createOrder});
    this.setState({display: true});
    Analytics.record({
      name: 'unicornsPurchase', 
      attributes: {}, 
      metrics: { totalOrder: order.totalOrder }
    });
    Analytics.record('_monetization.purchase', {
        _currency: 'USD',
        _product_id: order.itemId,
      }, {
        _item_price: order.unitPrice,
        _quantity: order.count,
      })
  }
  
  orderData = (details,balance,total) => {
    let orderId = Math.random().toString(36).substring(2, 15).toUpperCase();
    let orderDetails = {
      orderId: orderId,
      itemId: "",
      unitPrice: "",
      count: 0,
      totalOrder:0
    }
    details.forEach((item)=>{
      if (item.count !== null){
        orderDetails.itemId = item.itemId;
        orderDetails.count = item.count;
        orderDetails.unitPrice = item.price;
        orderDetails.totalOrder = total;
        this.createOrder(orderDetails);
      }
    })
    this.updateBalance(balance);
  }
  
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Unicorn Loyalty</h1>
          <small>Powered by Serverless GraphQL</small>
        </header>
        <p className="App-intro alert alert-dark">
          Sign up by January 2019 and get 1000 Unicoin points for free!
        </p>
        <div className="mx-auto row">
          <div className="col-sm-2"></div>
          <div className="col-sm-8 container">
            <br/>
            <Points points={this.state.points}/>
            <br/>
            <Unicorns points={this.state.points} order={this.orderData}/>
          </div>
          <div className="col-sm-2"></div>
        </div>
        <br/>
        {this.state.display ? <Order order={this.state.order}/> : null }
        <br/>
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });
