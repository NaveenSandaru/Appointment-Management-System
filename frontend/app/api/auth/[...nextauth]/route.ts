import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        try {
          await fetch(`${process.env.BACKEND_URL}/auth/google_login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name,
              profile_picture: profile.image,
            }),
          })
        } catch (error) {
          console.error("Google login callback error:", error)
          return false
        }
      }
      return true
    },
  },
}

// ✅ Create and export named handlers
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
