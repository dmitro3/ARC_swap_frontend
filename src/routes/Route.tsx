import React, { useContext } from 'react';
import {
  Route as ReactDOMRoute,
  RouteProps as ReactDOMRouteProps,
  Redirect,
} from 'react-router-dom';
import Loading from '../components/Loading/Loading';
import { AuthContext } from '../contexts/AuthProvider';

// import { useAuth } from '../contexts/AuthProvider'; USING OUR NEW USER CONTEXT

interface RouteProps extends ReactDOMRouteProps {
  isPrivate?: boolean;
  component: React.ComponentType;
}
const Route: React.FC<RouteProps> = ({
  isPrivate = false,
  component: Component,
  ...rest
}) => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <ReactDOMRoute
      {...rest}
      render={() =>
        isPrivate ? (
          <>
            {isAuthenticated === undefined ? (
              <div
                className="position-relative w-100"
                style={{
                  height: '90vh',
                }}
              >
                <Loading show />
              </div>
            ) : (
              <>{isAuthenticated ? <Component /> : <Redirect to="/" />}</>
            )}
          </>
        ) : (
          <Component />
        )
      }
    />
  );
};

export default Route;
