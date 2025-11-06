// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // Redirect here if not logged in
  },
});

export const config = {
  // Apply to all routes EXCEPT login and NextAuth API
  matcher: ["/((?!login|api/auth).*)"],
};