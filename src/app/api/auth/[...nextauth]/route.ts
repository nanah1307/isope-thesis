import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { supabase } from '@/app/lib/database';
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
         //Check if user exists

      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("Email", email)
        .maybeSingle();
        supabase.auth.signInWithOAuth({ provider: 'google' })

      //Insert only if it doesn't exist
      if (!existingUser) {
        const { error } = await supabase.from("users").insert({
          Email:email,
          Name:user.name,
          Role:"member"
        });
        
          await supabase.auth.signUp({
            email: email,
            password: 'iAcademy'
          })


        if (error) {
          console.error("❌ Supabase insert failed:", error);
          return "/login?error=unauthorized"; // block login if DB fails
        }
      }
        return true; //allow login
      } else {
        return "/login?error=unauthorized"; // block login
      }
      
    },
    async redirect({ url, baseUrl }) {
    // After login redirect to dashboard
    return "/dashboard";
  },
  //add roles of users
    async jwt({token, user}){

      //gets users Role and assigns user a specific role
      if (user?.email) {
        const { data, error } = await supabase
          .from("users")
          .select("Role")
          .eq("Email", user.email)
          .single();

        if (error) {
          token.role = "member";
        } else {
          token.role = data.Role; 
        }
        // Ensure token.role is one of the allowed string roles; otherwise default to "member"
        const validRoles = ["member", "admin", "osas", "org"];
        if (!validRoles.includes(String(token.role))) {
          token.role = "member";
        }
      }
      return token;
    },
      
      // if (user?.email) {
      //   const roleMap: Record<string, string> = {
      //     "admin@yourcompany.com": "osas",
      //     "manager@yourcompany.com": "adviser",
      //     "staff@yourcompany.com": "org",
      //   };
      //   token.picture = user.image;
      //   token.role = roleMap[user.email] ?? "member";
      // }
      //   return token;
      // },
      
       async session({ session, token }) {
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
