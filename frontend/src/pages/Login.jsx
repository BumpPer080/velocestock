import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext.jsx';

const StyledWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, rgba(255, 107, 53, 0.25), transparent 65%),
              radial-gradient(circle at bottom, rgba(0, 0, 0, 0.2), transparent 45%), #f8fafc;
  padding: 2rem;

  .login-surface {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .login-heading {
    text-align: center;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.4em;
    color: #0f172a;
  }

  .login-container {
    position: relative;
    perspective: 1000px;
    width: 260px;
  }

  .login-card {
    position: relative;
    width: 100%;
    height: 100px;
    background: linear-gradient(135deg, #ff3366, #ff6b35);
    border: 4px solid #000;
    box-shadow:
      8px 8px 0 #000,
      16px 16px 0 rgba(255, 51, 102, 0.3);
    cursor: pointer;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    transform-style: preserve-3d;
  }

  .login-card:hover {
    height: 260px;
    transform: translateZ(20px) rotateX(5deg) rotateY(-5deg);
    box-shadow:
      12px 12px 0 #000,
      24px 24px 0 rgba(255, 51, 102, 0.4),
      0 0 50px rgba(255, 51, 102, 0.6);
  }

  .login-title {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: inherit;
    transition: all 0.4s ease;
  }

  .login-text {
    color: #000;
    font-weight: 800;
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 2px 2px 0 rgba(255, 255, 255, 0.3);
    transition: all 0.4s ease;
  }

  .login-card:hover .login-text {
    opacity: 0;
    transform: translateY(-30px) scale(0.8);
  }

  .login-form {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 20px;
    box-sizing: border-box;
    opacity: 0;
    transform: translateY(30px) scale(0.8);
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .login-card:hover .login-form,
  .login-form:focus-within {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .input-group {
    position: relative;
    width: 100%;
  }

  .login-input {
    width: 100%;
    padding: 12px 10px;
    background: rgba(255, 255, 255, 0.9);
    border: 3px solid #000;
    font-weight: 700;
    color: #000;
    box-shadow: 4px 4px 0 #000;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .login-input:focus {
    outline: none;
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 #000;
  }

  .login-input::placeholder {
    color: #000;
    opacity: 0.6;
  }

  .login-btn {
    width: 100%;
    padding: 12px;
    background: #000;
    color: #fff;
    border: none;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    box-shadow: 4px 4px 0 rgba(255, 255, 255, 0.3);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .login-btn:hover {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 rgba(255, 255, 255, 0.3);
    background: #333;
  }

  .login-btn[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: 4px 4px 0 rgba(255, 255, 255, 0.3);
  }

  .login-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    transition: left 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .login-card:hover::before {
    left: 100%;
  }

  .login-card::after {
    content: "";
    position: absolute;
    top: -4px;
    right: -4px;
    width: 20px;
    height: 20px;
    background: #000;
    clip-path: polygon(0 0, 100% 0, 100% 100%);
    transition: all 0.6s ease;
  }

  .login-card:hover::after {
    transform: scale(1) rotate(0deg);
    background: rgb(246, 168, 116);
  }

  .login-container::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 51, 102, 0.1);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.6s ease;
    z-index: -1;
  }

  .login-container:hover::before {
    width: 420px;
    height: 420px;
  }

  .login-error {
    min-height: 1.5rem;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: #e11d48;
    text-transform: uppercase;
  }
`;

function Login() {
  const [formValues, setFormValues] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login, isProcessing, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, redirectPath, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login({
        username: formValues.username.trim(),
        password: formValues.password,
      });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
    }
  };

  return (
    <StyledWrapper>
      <div className="login-surface">
        <h1 className="login-heading">VeloceStock Access</h1>
        <div className="login-error" role="alert" aria-live="polite">
          {error}
        </div>
        <div className="login-container">
          <div className="login-card">
            <div className="login-title">
              <span className="login-text">เข้าสู่ระบบ</span>
            </div>
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  required
                  name="username"
                  placeholder="Username"
                  className="login-input"
                  type="text"
                  value={formValues.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
              <div className="input-group">
                <input
                  required
                  name="password"
                  placeholder="Password"
                  className="login-input"
                  type="password"
                  value={formValues.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
              <button className="login-btn" type="submit" disabled={isProcessing}>
                {isProcessing ? 'Loading…' : 'เข้าสู่ระบบ'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

export default Login;

