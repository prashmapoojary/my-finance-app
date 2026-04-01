import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ component: Component, ...rest }) => {
    const user = useAuthStore((state) => state.user);
    return (
        <Route
            {...rest}
            render={props =>
                user ? <Component {...props} /> : <Redirect to='/login' />
            }
        />
    );
};

export default ProtectedRoute;