"use client";

import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/80">
        <div className="flex flex-col items-center text-center mb-8">
          {/* Logo icon representation */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20 mb-4">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Welcome to Career Copilot
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to access your AI-powered career assistant
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-4">
          <div className="w-full max-w-[280px] flex justify-center scale-105 hover:scale-[1.07] transition-all duration-200">
            <GoogleLogin
              theme="filled_black"
              shape="pill"
              size="large"
              width="250"
              onSuccess={(credentialResponse) => {
                console.log("Login Success:", credentialResponse);
              }}
              onError={() => {
                console.log("Login Failed");
              }}
            />
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-zinc-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
