/*==================================================
src/App.js

This is the top-level component of the app.
It contains the top-level state.
==================================================*/
import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import axios from 'axios'; 

// Import other components
import Home from './components/Home';
import UserProfile from './components/UserProfile';
import LogIn from './components/Login';
import Credits from './components/Credits';
import Debits from './components/Debits';

class App extends Component {
  constructor() {  // Create and initialize state
    super(); 
    this.state = {
      accountBalance: 0.00, 
      creditList: [],
      debitList: [],
      currentUser: {
        userName: 'Joe Smith',
        memberSince: '11/22/99',
      }
    };
  }
  formDate = (newDate) => 
  {
    newDate = newDate.toLocaleString();
    let index = 0;
    let tally = 0;
    let month, day, collect = "";
    while(newDate[index]!==',')
    {
      if(newDate[index]!=='/')
        collect+=newDate[index];
      else
      {
          if(tally===0)
          {   if(collect.length<2)
                collect = '0' + collect;
            month=collect;
          }
          else if(tally===1)
          {
            if(collect.length<2)
                collect = '0'+ collect;
            day=collect;
          }
          tally++;
          collect="";
      }
      index++;
    }
    return (collect+'-'+month+'-'+day);
  }
  addCredit = (e) =>
  {
    e.preventDefault();
    let newCreditList = [...this.state.creditList];
    let newDate = new Date();
    newDate = this.formDate(newDate);
    let newCreditEntry = {amount: parseFloat(e.target.amount.value), date: newDate, description: e.target.description.value, id: this.state.creditList.length};
    newCreditList.push(newCreditEntry);
    this.setState({creditList: newCreditList});
    let newBalance = this.state.accountBalance + parseFloat(e.target.amount.value);
    this.setState({accountBalance: newBalance}); 
  }

  addDebit = (e) =>
  {
    e.preventDefault();
    let newDebitList = [...this.state.debitList];
    let newDate = new Date();
    newDate = this.formDate(newDate);
    let newDebitEntry = {amount: parseFloat(e.target.amount.value), date: newDate, description: e.target.description.value, id: this.state.debitList.length};
    newDebitList.push(newDebitEntry);
    this.setState({debitList: newDebitList});
    let newBalance = this.state.accountBalance - parseFloat(e.target.amount.value);
    this.setState({accountBalance: newBalance});
  }

  async componentDidMount()
  {
    let balance = 0.00;
    let apiCredits = 'https://johnnylaicode.github.io/api/credits.json';  // Link to remote API endpoint to get credits
    let apiDebits = 'https://johnnylaicode.github.io/api/debits.json';    // Link to remote API endpoint to get debits
    try {  // Accept success response as array of JSON objects (credits and debits)
      let responseCredits = await axios.get(apiCredits);  // Store received data in state's "creditList" object
      this.setState({creditList: responseCredits.data});  // set the state of creditList
      for(let i=0;i<this.state.creditList.length;i++)    // add up all of the credit amounts to balance
        balance += this.state.creditList[i].amount;
      let responseDebits = await axios.get(apiDebits);    // Store received data in state's "creditList" object
      this.setState({debitList: responseDebits.data});    // set the state of debitList
      for(let i=0;i<this.state.debitList.length;i++)      // subtract the debits from balance
        balance -= this.state.debitList[i].amount;
      balance += this.state.accountBalance;               // calculate the new accountBalance
      this.setState({accountBalance: balance});           // set the state of accountBalance
    } 
    // catches any errors when calling api
    catch (error) {  
      if (error.response) {
        console.log(error.response.data);  // Print out error message 
        console.log(error.response.status);  // Print out error status code 
      }    
    }
  }

  // Update state's currentUser (userName) after "Log In" button is clicked
  mockLogIn = (logInInfo) => {  
    const newUser = {...this.state.currentUser};
    newUser.userName = logInInfo.userName;
    this.setState({currentUser: newUser})
  }

  // Create Routes and React elements to be rendered using React components
  render() {  
    // Create React elements and pass input props to components
    const HomeComponent = () => (<Home accountBalance={this.state.accountBalance}/>)
    const UserProfileComponent = () => (
      <UserProfile userName={this.state.currentUser.userName} memberSince={this.state.currentUser.memberSince} />
    )
    const LogInComponent = () => (<LogIn user={this.state.currentUser} mockLogIn={this.mockLogIn} />)
    const CreditsComponent = () => (<Credits credits={this.state.creditList} accountBalance={this.state.accountBalance} addCredit={this.addCredit}/>) 
    const DebitsComponent = () => (<Debits debits={this.state.debitList} accountBalance={this.state.accountBalance} addDebit={this.addDebit}/>) 

    // Important: Include the "basename" in Router, which is needed for deploying the React app to GitHub Pages
    return (
      <Router basename="/bank-of-react-example-code-gh-pages">
        <div>
          <Route exact path="/" render={HomeComponent}/>
          <Route exact path="/userProfile" render={UserProfileComponent}/>
          <Route exact path="/login" render={LogInComponent}/>
          <Route exact path="/credits" render={CreditsComponent}/>
          <Route exact path="/debits" render={DebitsComponent}/>
        </div>
      </Router>
    );
  }
}

export default App;