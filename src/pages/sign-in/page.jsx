import React, { useState } from "react";
import { InputBase } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {mutate: handleLogin,
      isPending, isError} = useMutation({
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-wide">KMA</h1>
        </div>

        {/* Title */}
        <h2 className="text-center text-lg font-semibold mb-1">
          SIGN IN
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Enter your username and password to access admin panel.
        </p>

        <div className="space-y-4">
          
          {/* Username */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Username
            </label>
            <div className="border rounded-md px-3 py-2">
              <InputBase
                fullWidth
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-700">Password</label>
            </div>

            <div className="border rounded-md px-3 py-2 flex items-center">
              <InputBase
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 text-sm ml-2"
              >
                👁
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="button"
            onClick={handleSubmit} 
            disabled={isPending}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition"
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
