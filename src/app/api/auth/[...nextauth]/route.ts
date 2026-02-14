import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { supabase } from '@/app/lib/database';
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const allowedDomain = "iacademy.edu.ph"; // change this to your domain


const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password required");
        }

        // Find user by username
        const { data: user, error } = await supabase
          .from("users")
          .select("id, Email, Username, PasswordHash, Name, Role")
          .eq("Username", credentials.username)
          .maybeSingle();

        if (error || !user) {
          throw new Error("Invalid username or password");
        }

        // Verify password with bcrypt
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.PasswordHash || ""
        );

        if (!isValidPassword) {
          throw new Error("Invalid username or password");
        }

        // Return user object if authentication succeeds
        return {
          id: user.id,
          email: user.Email,
          name: user.Name,
          username: user.Username,
          role: user.Role,
        };
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user }) {
      const email = user?.email || "";
      const domain = email.split("@")[1];
      
      if (domain === allowedDomain) {
        // Check if user exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("id, Username")
          .eq("Email", email)
          .maybeSingle();

        // If email exists and has a username, signup is already complete
        if (existingUser?.Username) {
          // Allow login since account is fully set up
          return true;
        }

        // Insert only if it doesn't exist
        if (!existingUser) {
          const { error } = await supabase.from("users").insert({
            Email: email,
            Name: user.name,
            Role: "member"
          });

          if (error) {
            console.error("❌ Supabase insert failed:", error);
            return "/login?error=unauthorized"; // block login if DB fails
          }
        }
        return true; // allow login
      } else {
        return "/login?error=unauthorized"; // block login
      }
      
    },
    async redirect({ url, baseUrl }) {
      // Allow internal redirects (e.g., from signup/complete with error params)
      try {
        const dest = new URL(url, baseUrl);
        const base = new URL(baseUrl);
        if (dest.origin === base.origin) {
          return dest.toString();
        }
      } catch (e) {
        // fallthrough
      }
      // Default redirect to dashboard after successful login
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
        const validRoles = ["member", "adviser", "osas", "org"];
        if (!validRoles.includes(String(token.role))) {
          token.role = "member";
        }
      } else if ((user as any)?.role) {
        // For credentials login, user object has role from authorize function
        token.role = (user as any).role;
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
      console.log(session)
      return session;
    }
      
  },
});

export { handler as GET, handler as POST };
