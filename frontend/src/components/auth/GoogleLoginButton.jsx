import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = ({ text = "Sign in with Google" }) => {
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        try {
            const { credential } = credentialResponse;
            const res = await authService.googleLogin(credential);

            toast.success(`Welcome ${res.user.name}!`);

            // Redirect based on role
            if (res.user.role === 'admin') navigate('/admin');
            else if (res.user.role === 'doctor') navigate('/doctor/dashboard');
            else navigate('/patient/dashboard');

        } catch (error) {
            console.error("Google Login Error:", error);
            toast.error("Google Sign-In Failed");
        }
    };

    const handleError = () => {
        toast.error("Google Sign-In Failed");
    };

    return (
        <div className="w-full flex justify-center mt-4">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap
                theme="filled_blue"
                shape="pill"
                text={text}
                width="100%"
            />
        </div>
    );
};

export default GoogleLoginButton;
