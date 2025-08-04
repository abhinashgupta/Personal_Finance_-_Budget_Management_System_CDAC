import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiUser, FiEdit, FiSave, FiX } from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';

import StatusDisplay from '../components/common/StatusDisplay.jsx';

const UserProfilePage = () => {
    const { user, logout, isAuthenticated, loading: authLoading, checkAuthStatus } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        avatar: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const staticAvatars = [
        'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        'https://cdn-icons-png.flaticon.com/512/3135/3135789.png',
        'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
        'https://cdn-icons-png.flaticon.com/512/4140/4140047.png',
        'https://cdn-icons-png.flation.com/512/616/616438.png',
    ];

    const fetchUserProfile = async () => {
        setPageLoading(true);
        setError(null);
        try {
            const res = await axios.get('http://localhost:5000/users/profile', {
                withCredentials: true
            });
            if (res.data.success && res.data.user) {
                setProfileData({
                    firstname: res.data.user.firstname || '',
                    lastname: res.data.user.lastname || '',
                    email: res.data.user.email || '',
                    avatar: res.data.user.avatar || staticAvatars[0]
                });
            } else {
                setError(res.data.message || 'Failed to fetch user profile.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching user profile.');
            console.error("Fetch profile error:", err);
        } finally {
            setPageLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        setSuccessMessage(null);
        setError(null);

        if (!profileData.firstname || !profileData.lastname || !profileData.email) {
            setError('First name, last name, and email are required.');
            setUpdateLoading(false);
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email)) {
            setError('Invalid email format.');
            setUpdateLoading(false);
            return;
        }

        try {
            const res = await axios.put('http://localhost:5000/users/profile', profileData, {
                withCredentials: true
            });
            if (res.data.success) {
                setProfileData(res.data.user);
                checkAuthStatus();
                setSuccessMessage('Profile updated successfully!');
                setIsEditing(false);
            } else {
                setError(res.data.message || 'Failed to update profile.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile.');
            console.error("Update profile error:", err);
        } finally {
            setUpdateLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            fetchUserProfile();
        }
    }, [isAuthenticated, authLoading]);

    if (authLoading || pageLoading) {
        return <StatusDisplay type="loading" message="Loading profile..." />;
    }

    if (error && !isEditing) {
        return <StatusDisplay type="error" message={error} onRetry={fetchUserProfile} />;
    }

    return (
        <div className="flex flex-col">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                {successMessage && (
                    <p className="text-green-600 bg-green-50 p-3 rounded-md text-sm text-center mb-4 border border-green-200 animate-pulse">
                        {successMessage}
                    </p>
                )}
                {error && isEditing && (
                    <p className="text-red-600 bg-red-50 p-3 rounded-md text-sm text-center mb-4 border border-red-200">
                        {error}
                    </p>
                )}

                <div className="flex flex-col items-center mb-6">
                    <img
                        src={profileData.avatar || staticAvatars[0]}
                        alt="User Avatar"
                        className="w-32 h-32 rounded-full border-4 border-blue-400 object-cover mb-4 shadow-lg"
                    />
                    <h2 className="text-3xl font-bold text-gray-800">
                        {profileData.firstname} {profileData.lastname}
                    </h2>
                    <p className="text-gray-600">{profileData.email}</p>
                </div>

                {isEditing ? (
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Choose Avatar</label>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {staticAvatars.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Avatar ${index + 1}`}
                                        className={`w-16 h-16 rounded-full cursor-pointer object-cover
                                                ${profileData.avatar === url ? 'border-4 border-blue-600 shadow-md' : 'border border-gray-300'}
                                                hover:border-blue-500 transition-all duration-200`}
                                        onClick={() => setProfileData(prev => ({ ...prev, avatar: url }))}
                                    />
                                ))}
                            </div>
                        </div>
                        <hr className="my-4 border-gray-200" />

                        <div>
                            <label htmlFor="firstname" className="block text-gray-700 font-medium mb-1">First Name</label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    id="firstname"
                                    name="firstname"
                                    value={profileData.firstname}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, firstname: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="lastname" className="block text-gray-700 font-medium mb-1">Last Name</label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    id="lastname"
                                    name="lastname"
                                    value={profileData.lastname}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, lastname: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); setError(null); setSuccessMessage(null); }}
                                className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200 flex items-center gap-2"
                            >
                                <FiX /> Cancel
                            </button>
                            <button
                                type="submit"
                                className={`px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center gap-2
                                                ${updateLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                disabled={updateLoading}
                            >
                                {updateLoading ? <ImSpinner2 className="animate-spin" /> : <FiSave />} Save Changes
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 flex items-center gap-2 shadow-md"
                            >
                                <FiEdit /> Edit Profile
                            </button>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="flex items-center text-gray-700 font-medium mb-2">
                                <FiUser className="mr-2 text-blue-500" size={20} /> Full Name:{" "}
                                <span className="ml-2 font-normal text-gray-800">
                                    {profileData.firstname} {profileData.lastname}
                                </span>
                            </p>
                            <p className="flex items-center text-gray-700 font-medium">
                                <FiMail className="mr-2 text-blue-500" size={20} /> Email:{" "}
                                <span className="ml-2 font-normal text-gray-800">
                                    {profileData.email}
                                </span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;