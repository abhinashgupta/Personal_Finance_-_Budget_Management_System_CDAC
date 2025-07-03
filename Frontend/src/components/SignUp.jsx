import React from "react";

const SignUp = () => {
  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form className="bg-white p-6 rounded shadow-md w-80">
          <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600"
          >
            Sign Up
          </button>

          <p className="text-center text-gray-600 mt-4">
            Already have an account?
            <a href="/Login" className="text-blue-500 hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </>
  );
};

export default SignUp;
