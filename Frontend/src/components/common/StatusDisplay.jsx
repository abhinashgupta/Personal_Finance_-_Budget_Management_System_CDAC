import React from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { FiAlertCircle, FiFrown, FiPlusCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const StatusDisplay = ({ type, message, onRetry, emptyActionText, emptyActionPath }) => {
    const navigate = useNavigate();

    const renderContent = () => {
        switch (type) {
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-gray-700 h-full w-full">
                        <ImSpinner2 className="animate-spin text-blue-500 mb-4" size={48} />
                        <p className="text-xl font-semibold">Loading data...</p>
                        {message && <p className="text-sm mt-2">{message}</p>}
                    </div>
                );
            case 'error':
                return (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-red-700 bg-red-50 rounded-lg shadow-sm border border-red-200 h-full w-full">
                        <FiAlertCircle className="text-red-500 mb-4" size={48} />
                        <p className="text-xl font-semibold">Oops! Something went wrong.</p>
                        <p className="text-md mt-2">{message || "Failed to load data. Please try again."}</p>
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 shadow"
                            >
                                Retry
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-2 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200 shadow"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                );
            case 'empty':
                return (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-gray-600 bg-white rounded-lg shadow-sm border border-gray-200 h-full w-full">
                        <FiFrown className="text-gray-400 mb-4" size={48} />
                        <p className="text-xl font-semibold">No data found.</p>
                        <p className="text-md mt-2">{message || "It looks like there's nothing here yet."}</p>
                        {emptyActionText && emptyActionPath && (
                            <button
                                onClick={() => navigate(emptyActionPath)}
                                className="mt-4 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200 shadow flex items-center gap-2"
                            >
                                <FiPlusCircle /> {emptyActionText}
                            </button>
                        )}
                        {!emptyActionText && (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="mt-2 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200 shadow"
                            >
                                Go to Dashboard
                            </button>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex justify-center items-center">
            {renderContent()}
        </div>
    );
};

export default StatusDisplay;