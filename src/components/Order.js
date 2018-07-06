import React, { Component } from 'react';
import unicorn from '../images/unicorn.png';

class Order extends Component {

  constructor(props){
    super(props);
    this.state = {
        order: ""
    };
  }
  
  //Receive order data from App component
  componentWillReceiveProps(props) {
    this.setState({order: props.order});
  }
  
  render() {
    console.log(this.state.order);
    console.log(this.props.order);
    const order = [].concat(this.props.order)
      .map((item,i) => 
       <tbody key={i}>
        <tr>
          <td>{item.orderId}</td>
          <td>{item.date}</td>
          <td>{item.totalOrder}</td>
        </tr>
       </tbody>
      ); 
    return (
      <div className="mx-auto row">
        <div className="col-sm-2"></div>
          <div className="container col-sm-8">
            <div className='center'>
            <img src={unicorn} alt="Unicorn"/>
              <p>
                <h4>Order Placed!</h4>
                <small> Unicorns are on the way </small>
              </p>
              <table className="table center">
                <thead>
                  <tr>
                    <td><strong>OrderID</strong></td>
                    <td><strong>Date </strong></td>
                    <td><strong>UniCoins</strong></td>
                  </tr>
                </thead>
                {order}
              </table>
           </div>
         </div>
       <div className="col-sm-2"></div>
      </div>
    );
    }
  }

export default Order;