import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const allowedDomain = "iacademy.edu.ph"; // change this to your domain

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    
      
    async signIn({ user }) {
      const email = user?.email || "";
      const domain = email.split("@")[1];

      if (domain === allowedDomain) {
        return true; // ✅ allow login
      } else {
        console.warn(`❌ Unauthorized login attempt: ${email}`);
        return false; // ❌ block login
      }

      
    },
    async jwt({token, user}){
      if (user?.email) {
        const roleMap = {
          "admin@yourcompany.com": "admin",
          "manager@yourcompany.com": "manager",
          "staff@yourcompany.com": "staff",
        };
        token.role = roleMap[user.email] || "guest";
      }
        return token;
      },
    
       async session({ session, token }) {
      session.user.role = token.role;
      return session;
    }
      
  },
});

export { handler as GET, handler as POST };
