
import React, { useEffect } from "react";
import { connect } from "react-redux";

// eslint-disable-next-line
export default ChildComponent => {
  const ComposedComponent = props => {
    useEffect(() => {
      if (props.auth === "owner") {
        return props.history.push("/owner");
      } else if (props.auth === "admin") {
        return props.history.push("/admin");
      } else { 
        return props.history.push("/");
      }
    }, [props.auth, props.history]);

    return <ChildComponent {...props} />;
  };

  function mapStateToProps(state) {
    return {
      auth: (state.auth.user && state.auth.user.userType) || null,
    };
  }

  return connect(mapStateToProps)(ComposedComponent);
};