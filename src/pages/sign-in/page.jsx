import React, { useState } from "react";
import { InputBase } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: handleLogin,
    isPending, isError } = useMutation({
      mutationFn: loginApi,
      onSuccess: async (data) => {
        console.log("Login success", data);
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.admin))
        navigate('/')

      },
      onError: (error) => {
        console.error("Login failed", error);
      },
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin({
      username,
      password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(90deg,#295270,#534176)]">
      <div className="w-full max-w-md bg-white rounded-md shadow-xl p-10">

        {/* Logo */}
        <div className="text-center mb-3 w-full flex justify-center">
          <img src="/assets/dark-logo.png" className="w-30" />
        </div>

        {/* Title */}
        <h2 className="text-center text-lg font-bold mb-2 text-gray-600">
          SIGN IN
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Enter your username and password to access admin panel.
        </p>

        <div className="space-y-4">

          {/* Username */}
          <div>
            <label className="block text-sm mb-1.5 text-gray-500 font-medium">
              Username
            </label>
            <div className="rounded-[5px] px-4 py-3 flex items-center bg-[#f3f5f9] border border-gray-200">
              <InputBase
                fullWidth
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  backgroundColor: "transparent",
                  fontSize: "14px",
                  color: "#374151",
                  "& input": {
                    padding: 0,
                  },
                  "&::placeholder": {
                    color: "#9ca3af",
                    opacity: 1,
                  },
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mt-5">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm text-gray-500 font-medium">Password</label>
            </div>

            <div className="rounded-[5px] px-4 py-3 flex items-center bg-[#f3f5f9] border border-gray-200">
              <InputBase
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  backgroundColor: "transparent",
                  fontSize: "14px",
                  color: "#374151",
                  "& input": {
                    padding: 0,
                  },
                  "&::placeholder": {
                    color: "#9ca3af",
                    opacity: 1,
                  },
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-gray-500 hover:text-gray-700 transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

          </div>

          {/* Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full bg-blue-950 font-medium hover:bg-blue-900 cursor-pointer text-white py-2.5 mt-3 rounded-md transition"
          >
            {isPending ? "Signing In..." : "Sign In"}
          </button>

          {/* Error */}
          {isError && (
            <p className="text-red-500 text-sm text-center">
              Invalid username or password
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
