# MERN Stack Personal Finance & Budget Tracking Web App

A full-stack web application to help users track their income, expenses, budgets, and overall personal finances using the MERN stack (MongoDB, Express, React, Node.js).

---

## Features & Tasks

### 1. **User Authentication & Authorization**
- User registration and login
- Secure password hashing (bcrypt or similar)
- JWT-based authentication for API security
- Forgot password and reset functionality (optional)
- Protect routes to ensure only authenticated users access financial data

### 2. **Dashboard**
- Overview of current balance, total income, and expenses
- Visual charts showing spending habits (e.g., pie charts, bar graphs)
- Quick summary of budget status and upcoming bills

### 3. **Income & Expense Management**
- CRUD (Create, Read, Update, Delete) operations for income entries
- CRUD operations for expense entries
- Categorize transactions (e.g., Food, Rent, Utilities, Entertainment)
- Ability to add notes or tags to transactions
- Date filtering and sorting

### 4. **Budgeting**
- Create monthly or custom time-frame budgets per category
- Track budget usage against actual expenses
- Alerts or notifications when nearing or exceeding budgets

### 5. **Reports & Analytics**
- Generate detailed reports for selected periods
- Export reports as CSV or PDF (optional)
- Visualize trends over time with graphs and charts

### 6. **Settings & Profile**
- User profile management (name, email, password change)
- Preferences (currency, theme, notification settings)
- Data backup and restore (optional)

### 7. **Backend API**
- RESTful API with Express.js and Node.js
- MongoDB for data storage using Mongoose ORM
- Validation and error handling for API endpoints
- Secure endpoints with authentication middleware

### 8. **Frontend**
- Responsive React UI with React Router for navigation
- Forms with validation for transaction inputs
- State management (React Context or Redux)
- Interactive charts (using Chart.js, Recharts, or similar)

### 9. **Deployment**
- Deployment scripts or guidelines (Heroku, Vercel, Netlify, or any preferred platform)
- Environment variables setup for production
- Database connection and backup strategy

---

## Getting Started

1. Clone the repo
2. Install backend and frontend dependencies
3. Configure environment variables (MongoDB URI, JWT secret, etc.)
4. Run backend and frontend servers concurrently
5. Open the app in your browser and start tracking your finances!

---

## Future Enhancements (Optional)

- Multi-currency support
- Integration with bank APIs for automatic transaction import
- Mobile app or PWA version
- Social features (sharing budgets, goals with family/friends)

---

