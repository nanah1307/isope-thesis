import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
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
    async redirect({ url, baseUrl }) {
    // After login redirect to dashboard
    return "/dashboard";
  },
  //add roles of users
    async jwt({token, user}){

      // if (user?.email) {
      //   const { data, error } = await supabaseServer
      //     .from("users")
      //     .select("role")
      //     .eq("email", user.email)
      //     .single();

      //   if (error) {
      //     console.warn("Member Found", error);
      //     token.role = "member";
      //   } else {
      //     token.role = data.role; 
      //   }
      // }
      
      if (user?.email) {
        const roleMap: Record<string, string> = {
          "admin@yourcompany.com": "osas",
          "manager@yourcompany.com": "adviser",
          "staff@yourcompany.com": "org",
        };
        token.picture = user.image;
        token.role = roleMap[user.email] ?? "member";
      }
        return token;
      },
      
       async session({ session, token }) {
      console.log(" Current Token:",);
      session.user = session.user ?? {
        name: token.name ?? null,
        email: token.email ?? null,
        image: token.picture??null
      };
      (session.user as any).role = token.role ?? "member";
      return session;
    }
      
  },
});

export { handler as GET, handler as POST };
