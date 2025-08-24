"use client"

import { useState } from "react"
import { useMutation, gql } from "@apollo/client"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const SIGN_UP_ADMIN = gql`
  mutation SignUpAdmin($batches: [String!], $admin: String!, $password: String!) {
    signUpAdmin(batches: $batches, admin: $admin, password: $password) {
      id
      admin
      batches
    }
  }
`

export default function SignUpPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const [signUpAdmin, { loading }] = useMutation(SIGN_UP_ADMIN)

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const { data } = await signUpAdmin({
                variables: { admin: email, password, batches: null },
            })

            if (data?.signUpAdmin?.admin) {
                router.push("/signin")
            }
        } catch (err) {
            console.error("Sign Up Error:", err)
            alert("Failed to sign up ❌")
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#111] via-[#1a1a1a] to-[#111] px-4">
            <form 
                onSubmit={handleSignUp} 
                className="w-full max-w-md bg-[#1f1f1f]/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-[#333] space-y-6"
            >
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        Create Admin Account
                    </h1>
                    <p className="text-sm text-gray-400">
                        Sign up to manage batches and access admin dashboard
                    </p>
                </div>

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

                <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition-transform duration-200" 
                    disabled={loading}
                >
                    {loading ? "Signing Up..." : "Sign Up"}
                </Button>

                <p className="text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <span 
                        onClick={() => router.push("/signin")} 
                        className="text-yellow-400 hover:underline cursor-pointer"
                    >
                        Sign In
                    </span>
                </p>
            </form>
        </main>
    )
}
