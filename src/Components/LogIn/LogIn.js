import React, { Component } from 'react'
import './LogIn.css'
import Grid from '@mui/material/Grid';
import { Link, Navigate } from 'react-router-dom'
import SlideShow_2 from '../SlideShow/SlideShow_2';
import { updateLoginTime, debugAuth } from '../utils/userUtils';

class LogIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            rememberMe: false,
            error: '',
            loading: false,
            loginSuccess: false,
            debugInfo: null
        };
    }

    componentDidMount() {
        this.checkExistingAuth();

        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            this.setState({
                email: savedEmail,
                rememberMe: true
            });
        }

        this.testBackendConnection();
    }

    checkExistingAuth = async () => {
        const authData = localStorage.getItem('authData');

        if (authData) {
            try {
                const parsedAuthData = JSON.parse(authData);

                if (parsedAuthData.isAuthenticated && parsedAuthData.email) {
                    console.log('✅ User already authenticated, checking session...');

                    // Check if session is still valid (within 24 hours)
                    const loginTime = new Date(parsedAuthData.loginTime);
                    const now = new Date();
                    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

                    if (hoursDiff < 24) {
                        console.log('✅ Session still valid, redirecting to user page...');
                        this.setState({ loginSuccess: true });
                        return;
                    } else {
                        console.log('❌ Session expired, clearing auth data...');
                        this.clearAuthData();
                    }
                }
            } catch (error) {
                console.log('❌ Error parsing stored auth data:', error);
                this.clearAuthData();
            }
        }
    }

    clearAuthData = () => {
        localStorage.removeItem('authData');
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        sessionStorage.clear();
        console.log('🧹 Auth data cleared');
    }

    // In testBackendConnection method, improve error message and retry suggestion
    testBackendConnection = async () => {
        try {
            const response = await fetch('https://jose-flux-founded-move.trycloudflare.com/test');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Backend connection test:', data);

            // Clear any previous connection errors
            if (this.state.error.includes('Cannot connect to backend')) {
                this.setState({ error: '' });
            }

        } catch (error) {
            console.error('❌ Backend connection failed:', error);
            this.setState({
                error: 'Cannot connect to backend. Please check your internet connection or try again later.'
            });
        }
    }

    // In handleSubmit method, improve error handling and messages
    handleSubmit = async (e) => {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        this.setState({ loading: true, error: '' });

        const loginData = {
            email: this.state.email.trim().toLowerCase(),
            password: this.state.password
        };

        console.log('📤 Sending login request for:', loginData.email);

        try {
            const response = await fetch('https://jose-flux-founded-move.trycloudflare.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            if (!response.ok) {
                // Handle specific HTTP errors with user-friendly messages
                if (response.status === 500) {
                    throw new Error('Server error. Please try again later.');
                } else if (response.status === 404) {
                    throw new Error('Login endpoint not found. Please contact support.');
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }

            const data = await response.json();
            console.log('📥 Login response:', data);
            if (data.success) {
                // ... (rest of success logic unchanged)
            } else {
                this.setState({
                    error: data.message || 'Invalid email or password',
                    loading: false
                });
            }
        } catch (error) {
            console.error('❌ Login error:', error);

            let errorMessage = error.message || 'Network error. Please check your connection and try again.';

            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
            }

            this.setState({
                error: errorMessage,
                loading: false
            });
        }
    }


    handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            this.setState({ [name]: checked });
        } else {
            this.setState({
                [name]: value,
                error: '' // Clear error when user starts typing
            });
        }
    }

    validateForm = () => {
        const { email, password } = this.state;

        if (!email || !password) {
            this.setState({ error: 'Please enter both email and password' });
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.setState({ error: 'Please enter a valid email address' });
            return false;
        }

        if (password.length < 6) {
            this.setState({ error: 'Password must be at least 6 characters long' });
            return false;
        }

        return true;
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        this.setState({ loading: true, error: '' });

        const loginData = {
            email: this.state.email.trim().toLowerCase(), // Normalize email
            password: this.state.password
        };

        console.log('📤 Sending login request for:', loginData.email);

        try {
            const response = await fetch('https://jose-flux-founded-move.trycloudflare.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📥 Login response:', data);
            if (data.success) {
                const currentTime = new Date().toISOString();

                const authData = {
                    email: loginData.email,
                    password: this.state.password,
                    isAuthenticated: true,
                    loginTime: currentTime
                };

                const userData = {
                    email: data.data.email,
                    username: data.data.username,
                    picture: data.data.profile?.picture || null,
                    bio: data.data.profile?.bio || null,
                    location: data.data.profile?.location || null,
                    phoneNumber: data.data.profile?.phoneNumber || null,
                    loginTime: currentTime,
                    authMethod: 'local'
                };

                // Store data
                localStorage.setItem('authData', JSON.stringify(authData));
                localStorage.setItem('userData', JSON.stringify(userData));

                // Handle remember me
                if (this.state.rememberMe) {
                    localStorage.setItem('rememberedEmail', loginData.email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                // Store in sessionStorage
                sessionStorage.setItem('userEmail', data.data.email);
                sessionStorage.setItem('username', data.data.username);
                sessionStorage.setItem('userPicture', data.data.profile?.picture || '');
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('loginTime', currentTime);

                console.log('✅ User data and auth stored successfully');

                // Debug what was stored
                debugAuth();

                this.setState({
                    loginSuccess: true,
                    loading: false,
                    error: ''
                });
            }
            else {
                this.setState({
                    error: data.message || 'Invalid email or password',
                    loading: false
                });
            }
        } catch (error) {
            console.error('❌ Login error:', error);

            let errorMessage = 'Network error. Please check your connection and try again.';

            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
            } else if (error.message.includes('HTTP 500')) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.message.includes('HTTP 404')) {
                errorMessage = 'Login endpoint not found. Please check server configuration.';
            }

            this.setState({
                error: errorMessage,
                loading: false
            });
        }
    }

    handleGoogleLogin = async () => {
        console.log('Google login clicked');
        this.setState({ error: 'Google login coming soon!' });
    }

    // Static methods for other components to use
    static logout = () => {
        console.log('🚪 Logging out user');
        localStorage.removeItem('authData');
        localStorage.removeItem('userData');
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('authToken');
        sessionStorage.clear();
        window.location.href = '/login';
    }

    static isUserLoggedIn = () => {
        const authData = localStorage.getItem('authData');
        const userData = localStorage.getItem('userData');

        if (authData && userData) {
            try {
                const parsedAuthData = JSON.parse(authData);
                const parsedUserData = JSON.parse(userData);

                // Check if authenticated and has required data
                if (parsedAuthData.isAuthenticated && parsedUserData.email) {
                    // Check if session is still valid (within 24 hours)
                    const loginTime = new Date(parsedAuthData.loginTime);
                    const now = new Date();
                    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

                    return hoursDiff < 24;
                }
            } catch (error) {
                console.error('Error checking login status:', error);
                return false;
            }
        }
        return false;
    }

    static getCurrentUser = () => {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    }

    render() {
        const { email, password, rememberMe, error, loading, loginSuccess } = this.state;

        // If login is successful, redirect to user page
        if (loginSuccess) {
            return <Navigate to="/user" replace />;
        }

        return (
            <div className='login_back'>
                <Grid container>
                    <Grid className='login_first_grid' item xs={6}>
                        <div className='slideshow_2_container'>
                            <SlideShow_2 />
                        </div>
                    </Grid>
                    <Grid className='login_second_grid' item xs={6}>
                        <div className='login_container' role="main" aria-labelledby="login-heading">
                            <div className='login_container_topic'>
                                <h1 id="login-heading" tabIndex={-1}>Login</h1>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    aria-live="assertive"
                                    style={{
                                        color: '#d32f2f',
                                        textAlign: 'center',
                                        marginBottom: '15px',
                                        padding: '10px',
                                        backgroundColor: '#ffebee',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        border: '1px solid #ffcdd2'
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            {loginSuccess && (
                                <div
                                    role="status"
                                    aria-live="polite"
                                    style={{
                                        color: '#2e7d32',
                                        textAlign: 'center',
                                        marginBottom: '15px',
                                        padding: '10px',
                                        backgroundColor: '#e8f5e9',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        border: '1px solid #c8e6c9'
                                    }}
                                >
                                    ✅ Login successful! Redirecting...
                                </div>
                            )}

                            <form onSubmit={this.handleSubmit} noValidate>
                                <div>
                                    <label htmlFor="email" className="visually-hidden">Email</label>
                                    <input
                                        id="email"
                                        className='login_input'
                                        type='email'
                                        placeholder='Email'
                                        name='email'
                                        value={email}
                                        onChange={this.handleInputChange}
                                        required
                                        disabled={loading}
                                        autoComplete="email"
                                        aria-describedby="emailHelp"
                                    />
                                    <br />
                                    <label htmlFor="password" className="visually-hidden">Password</label>
                                    <input
                                        id="password"
                                        className='login_input'
                                        type='password'
                                        placeholder='Password'
                                        name='password'
                                        value={password}
                                        onChange={this.handleInputChange}
                                        required
                                        disabled={loading}
                                        autoComplete="current-password"
                                        aria-describedby="passwordHelp"
                                    />
                                    <br /><br />
                                </div>

                                <div className='login_checkbox'>
                                    <input
                                        id="rememberMe"
                                        type='checkbox'
                                        name='rememberMe'
                                        checked={rememberMe}
                                        onChange={this.handleInputChange}
                                        disabled={loading}
                                    />
                                    <label htmlFor="rememberMe" style={{ marginLeft: '8px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                        Remember Me
                                    </label>
                                </div>

                                <div className='login'>
                                    <button
                                        type='submit'
                                        disabled={loading}
                                        style={{
                                            opacity: loading ? 0.7 : 1,
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            transition: 'background-color 0.3s ease',
                                            padding: '10px 20px',
                                            fontWeight: 'bold',
                                            borderRadius: '4px',
                                            border: 'none',
                                            backgroundColor: loading ? '#9e9e9e' : '#1976d2',
                                            color: '#fff',
                                        }}
                                        aria-busy={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner" aria-hidden="true" style={{
                                                    display: 'inline-block',
                                                    width: '16px',
                                                    height: '16px',
                                                    border: '2px solid #fff',
                                                    borderTop: '2px solid transparent',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite',
                                                    marginRight: '8px',
                                                    verticalAlign: 'middle'
                                                }}></span>
                                                LOGGING IN...
                                            </>
                                        ) : (
                                            'LOGIN'
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className='login_or' aria-hidden="true" style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                                <hr className='hr1_login' style={{ flex: 1, borderColor: '#ccc' }} />
                                <span style={{ margin: '0 10px', color: '#666' }}>OR</span>
                                <hr className='hr2_login' style={{ flex: 1, borderColor: '#ccc' }} />
                            </div>

                            <div className='have_account' style={{ textAlign: 'center' }}>
                                <span>Don't have an account? <Link to="/signup">Sign Up</Link></span>
                            </div>

                            {/* Spinner keyframes style */}
                            <style>
                                {`
                                    @keyframes spin {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                    .visually-hidden {
                                        position: absolute !important;
                                        height: 1px; width: 1px;
                                        overflow: hidden;
                                        clip: rect(1px, 1px, 1px, 1px);
                                        white-space: nowrap;
                                    }
                                `}
                            </style>
                        </div>

                    </Grid>
                </Grid>
            </div>
        )
    }
}

export default LogIn
