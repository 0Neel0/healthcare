import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom'; // Not using navigate for login redirect to ensure full reload

const GoogleLoginButton = ({ text = "Sign in with Google" }) => {
    // const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        try {
            const { credential } = credentialResponse;
            const res = await authService.googleLogin(credential);
            const user = res.user;

            if (!user) {
                toast.error("Login failed: User data not received");
                return;
            }

            toast.success(`Welcome ${user.name || 'User'}!`);

            // Force a short delay to ensure LocalStorage is set before reload
            setTimeout(() => {
                const role = user.role || 'patient';
                const routes = {
                    'admin': '/admin',
                    'doctor': '/doctor/dashboard',
                    'patient': '/patient/dashboard'
                };

                const targetPath = routes[role] || '/patient/dashboard';
                // Using replace to avoid back-button loops and force a fresh state load
                window.location.replace(targetPath);
            }, 500);

        } catch (error) {
            console.error("Google Login Error:", error);
            const errorMessage = error.response?.data?.message || "Google Sign-In Failed";
            toast.error(errorMessage);
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
                // useOneTap // Disabled to prevent FedCM/AbortError issues
                theme="filled_blue"
                shape="pill"
                text={text}
                width="100%"
            />
        </div>
    );
};

export default GoogleLoginButton;
