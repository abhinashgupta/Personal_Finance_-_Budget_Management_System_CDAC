import React from "react";
import { MdDashboard } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="p-3 w-1/6 h-screen shadow-lg mt-5">
      <ul className="space-y-6">
        <li>
          <Link
            to="/dashboard"
            className="flex font-bold text-xl items-center mb-16 transform hover:scale-110 transition duration-500 pl-2"
          >
            <MdDashboard size={25} />
            <p className="pl-2">Dashboard</p>
          </Link>
        </li>

        <li>
          <Link
            to="/income"
            className="flex font-bold text-xl items-center mb-16 transform hover:scale-110 transition duration-500 pl-2"
          >
            <img src="image/icons8-income-50.png" alt="" width="25px" />
            <p className="pl-2">Income</p>
          </Link>
        </li>

        <li>
          <Link
            to="/expense"
            className="flex font-bold text-xl items-center mb-16 transform hover:scale-110 transition duration-500 pl-2"
          >
            <img src="image/icons8-expense-50.png" alt="" width="25px" />
            <p className="pl-2">Expense</p>
          </Link>
        </li>

        <li>
          <Link
            to="/budget"
            className="flex font-bold text-xl items-center mb-16 transform hover:scale-110 transition duration-500 pl-2"
          >
            <img src="image/icons8-budget-50.png" alt="" width="25px" />
            <p className="pl-2">Budget</p>
          </Link>
        </li>

        <li>
          <Link
            to="/setting"
            className="flex font-bold text-xl items-center mb-16 transform hover:scale-110 transition duration-500 pl-2"
          >
            <IoIosSettings size={25} />
            <p className="pl-2">Setting</p>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
