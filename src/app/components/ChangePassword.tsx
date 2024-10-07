import React, { useState } from "react";
import {
  getAuth,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import Cookies from "js-cookie";

const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [logoutWarning, setLogoutWarning] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(10);

  const auth = getAuth();

  /* Displaying the user email
  useEffect(() => {
    const fetchUserData = async () => {
      onAuthStateChanged(auth, async (authUser ) => {
        if (authUser ) {
          const userEmail = authUser .email;
          setEmail(userEmail); // Set the email state with the current user's email
        }
      });
    };
  
    fetchUserData();
  }, []);*/

  // Handle form submission to send password reset email
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Check if the email entered is the same as the current user's email
      const user = auth.currentUser;
      if (user && user.email !== email) {
        setMessage("Incorrect email, please enter your registered email.");
        setLoading(false);
        return;
      }

      setLogoutWarning(true); // Show logout warning
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  // Handle logout warning confirmation
  const handleLogoutConfirmation = async () => {
    try {
      // Trigger Firebase password reset email
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
      setLogoutWarning(false);
      const timeoutId = setTimeout(async () => {
        await signOut(auth); // Update server-side session
        Cookies.remove("userSession"); // Remove client-side cookie
        window.location.href = "/login"; // Redirect to login page
        //window.location.reload();
      }, 10000); // 10 seconds
      setTimer(timeoutId);
      startCountdown();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  // Handle logout warning cancellation
  const handleLogoutCancellation = () => {
    setLogoutWarning(false);
    if (timer !== null) {
      clearTimeout(timer);
      setTimer(null);
    }
  };

  // Start countdown
  const startCountdown = () => {
    const intervalId = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);
    setTimeout(() => {
      clearInterval(intervalId);
    }, 10000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="transition duration-300 ease-in-out"
    >
      <h1 className="text-2xl font-bold mb-4 text-orange-900">
        Reset Password
      </h1>

      {/* Email Input */}
      <div className="flex flex-col gap-0.5 mb-4">
        <span className="text-sm text-gray-500">Email</span>
        <input
          className="border-2 border-solid border-orange-900 w-full h-10 pl-3 rounded-md bg-orange-50 focus:ring-2 focus:ring-orange-900 focus:outline-none"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Update Button */}
      <button
        type="submit"
        className="flex items-center justify-center space-x-2 w-full h-10 rounded-md shadow-md text-white bg-orange-950
          hover:bg-orange-900 duration-100 active:bg-orange-800 active:scale-95 transition ease-in-out"
        disabled={loading} // Disable button while loading
      >
        {loading ? (
          <div className="loader">
            <div className="line-loader"></div>
          </div>
        ) : (
          <span className="font-bold text-md">Send Reset Email</span>
        )}
      </button>

      {/* Success or Error Message */}
      {message && (
        <div
          className={`mt-4 ${
            message.startsWith("Error")
              ? "text-red-500"
              : message.includes("Incorrect")
              ? "text-red-500"
              : "text-green-500"
          }`}
        >
          {message}
        </div>
      )}

      {logoutWarning && (
        <div className="fixed top-0 left-0 w-full h-screen bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-4 rounded-md md:w-1/2 w-4/5">
            <h2 className="text-lg font-bold mb-2">
              Warning: You will be logged out on this process
            </h2>
            <p className="text-sm mb-4">
              To ensure your password is updated securely, you will be logged
              out during the process. For the reset to be successful, please
              remain logged out until you complete the reset via the email link.
            </p>
            <div className="flex justify-center md:justify-end">
              <button
                className="bg-orange-950 hover:bg-orange-900 text-white font-bold py-2 px-4 rounded-md active:bg-orange-800 active:scale-95 transition ease-in-out"
                onClick={handleLogoutConfirmation}
              >
                Send Reset Email
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md ml-2 md:ml-2 active:bg-gray-600 active:scale-95 transition ease-in-out"
                onClick={handleLogoutCancellation}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Countdown */}
      {timer !== null && (
        <div className="mt-4">
          You will be logged out in {countdown} seconds.
        </div>
      )}

      <style>
        {`
          .loader {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .line-loader {
            width: 20px;
            height: 20px;
            border: 2px solid #fff;
            border-top: 2px solid #ff9900;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </form>
  );
};

export default ChangePassword;