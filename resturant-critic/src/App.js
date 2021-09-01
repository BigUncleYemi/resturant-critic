import React, { useEffect, Suspense, lazy } from "react";
import { Route, Switch } from "react-router-dom";
import { connect } from 'react-redux';
import { presistUser } from './redux/actions/auth';

const Home = lazy(() => import('./views/User/index'));
const Login = lazy(() => import('./views/Auth/Login'));
const Register = lazy(() => import('./views/Auth/Register'));
const OwnerDashboard = lazy(() => import('./views/Owner/index'));
const Restaurant = lazy(() => import('./views/Resturant/index'));
const Admin = lazy(() => import('./views/Admin/index'));

function App(props) {
  const _isMounted = React.useRef(true);
  const { presistUser } = props;
  useEffect(() => {
    presistUser();
    return () => {
      _isMounted.current = false;
    }
  }, [presistUser])
  return (
    <Suspense fallback={() => <div className="empty"><h2>Loading...</h2></div>}>
      <Switch>
        <Route path="/" exact component={(props) => <Home {...props} />} />
        <Route path="/login" component={(props) => <Login {...props} />} />
        <Route path="/register" component={(props) => <Register {...props} />} />
        <Route path="/owner" component={(props) => <OwnerDashboard {...props} />} />
        <Route path="/admin" component={(props) => <Admin {...props} />} />
        <Route path="/:id" component={(props) => <Restaurant {...props} />} />
      </Switch>
    </Suspense>
  )
}

const mapStateToProps = ({ auth }) => {
  const {
    loading, error,
  } = auth;
  return {
    loading,
    error,
  };
};

const mapDispatchToProps = {
  presistUser,
};


export default connect(mapStateToProps, mapDispatchToProps)(App);