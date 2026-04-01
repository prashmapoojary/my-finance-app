import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path='/login' component={Login} />
        <Route path='/register' component={Register} />
        <ProtectedRoute path='/dashboard' component={Dashboard} />
        <ProtectedRoute path='/wallets' component={Wallets} />
        <ProtectedRoute path='/transactions' component={Transactions} />
        <ProtectedRoute path='/budgets' component={Budgets} />
        <ProtectedRoute path='/reports' component={Reports} />
        <Redirect from='/' exact to='/login' />
        <Redirect to='/login' />
      </Switch>
    </Router>
  );
};

export default App;