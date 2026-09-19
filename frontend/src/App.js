import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Subscriptions from './pages/Subscriptions';
import Forecast from './pages/Forecast';
import Reports from './pages/Reports';

const App = () => {
  return (
    <ToastProvider>
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <ProtectedRoute path="/dashboard" component={Dashboard} />
          <ProtectedRoute path="/wallets" component={Wallets} />
          <ProtectedRoute path="/transactions" component={Transactions} />
          <ProtectedRoute path="/budgets" component={Budgets} />
          <ProtectedRoute path="/goals" component={Goals} />
          <ProtectedRoute path="/subscriptions" component={Subscriptions} />
          <ProtectedRoute path="/forecast" component={Forecast} />
          <ProtectedRoute path="/reports" component={Reports} />
          <Redirect from="/" exact to="/login" />
          <Redirect to="/login" />
        </Switch>
      </Router>
    </ToastProvider>
  );
};

export default App;