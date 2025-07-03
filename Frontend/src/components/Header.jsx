import React from "react";
import { CiLogin } from "react-icons/ci";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div>
      <div className="p-3 shadow-lg h-20 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Expense Tracker</h1>

        <div>
          <button className="mr-4 text-xl font-bold rounded-md p-2 bg-yellow-300 hover:bg-yellow-400 cursor-pointer border border-2 border-yellow-500 transform hover:scale-110 transition duration-500">
            <div className="flex justify-center items-center">
              <CiLogin />
              <Link to="/login">
                <p>LogIn</p>
              </Link>
            </div>
          </button>
          <button className="mr-4 text-xl font-bold rounded-md p-2 bg-red-500 hover:bg-red-600 cursor-pointer border border-2 border-red-700 transform hover:scale-110 transition duration-500">
            <div className="flex justify-center items-center">
              <img src="image/add-user.png" alt="" width="20px" height="20px" />
              <Link to="/signup">
                <p>SignUp</p>
              </Link>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
