"use client"

import { useState } from "react"
import { useMutation, gql } from "@apollo/client"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const SIGN_IN_ADMIN = gql`
  mutation SignInAdmin($admin: String!, $password: String!) {
    signInAdmin(admin: $admin, password: $password) {
      id
      admin
      batches
    }
  }
`

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const [signInAdmin, { loading }] = useMutation(SIGN_IN_ADMIN)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data } = await signInAdmin({
        variables: { admin: email, password },
      })

      if (data?.signInAdmin?.admin) {
        localStorage.setItem("adminEmail", data.signInAdmin.admin)
        router.push("/")
      }
    } catch (err) {
      console.error("Sign In Error:", err)
      alert("Invalid email or password ❌")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#111] via-[#1a1a1a] to-[#111] px-4">
      <form
        onSubmit={handleSignIn}
        className="w-full max-w-md bg-[#1f1f1f]/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-[#333] space-y-6"
      >
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-400">
            Sign in to access your admin dashboard
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:ring-2 focus:ring-yellow-500"
            required
          />
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500 focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>

        {/* Sign In Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition-transform duration-200"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>

        {/* Divider */}
        <p className="text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/signup")}
            className="text-yellow-400 hover:underline cursor-pointer"
          >
            Sign Up
          </span>
        </p>
      </form>
    </main>
  )
}
