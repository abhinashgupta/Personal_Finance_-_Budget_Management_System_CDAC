export const checkValidData = (email, password) => {
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  if (!isEmailValid) return "❌ Email is not valid!";
  if (!isPasswordValid)
    return "❌ Password must be at least 8 characters long, include 1 uppercase, 1 lowercase, and 1 number.";

  return null;
};