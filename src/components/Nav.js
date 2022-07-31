import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import config from '../config/AppConfig';
import '../asset/scss/Home.scss';
import { Button } from 'antd';
import { signOut } from '../redux/actions/auth';

function Nav(props) {
  const { user, signOut } = props;
  return (
    <header>
      <nav>
        <Link to="/">
          <h1 className="rc">{config.AppName}</h1>
        </Link>
        <div>
          {
            user && user.name ? (
              <ul>
                <li>
                  Hi, {user.name}
                </li>
                <li>
                  <Button onClick={() => signOut()}>
                    <i className="fas fa-sign-out-alt"></i>
                    Log Out
                  </Button>
                </li>
              </ul>
            ) : (
              <ul>
                <li>
                  <Link to="/login">
                    Log In
                  </Link>
                </li>
                <li>
                  <Link id="duo" to="/register">
                    Sign Up
                  </Link>
                </li>
              </ul>
            )
          }
        </div>
      </nav>
    </header>
  )
}

const mapStateToProps = ({ auth }) => {
  const {
    user,
  } = auth;
  return {
    user,
  };
};

const mapDispatchToProps = {
  signOut
};

export default connect(mapStateToProps, mapDispatchToProps)(Nav);
