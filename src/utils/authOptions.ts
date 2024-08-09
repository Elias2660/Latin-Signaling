import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/config/database";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    // invoke on successful sign in
    async signIn({
      user,
      account,
      profile,
      email,
      credentials,
    }: {
      user: any;
      account: any;
      profile?: any;
      email?: any;
      credentials?: any;
    }) {
      await connectDB();
      const userExists = await User.findOne({ email: profile.email });
      if (!userExists) {
        await User.create({
          // truncate if too long
          name: profile.name.substring(0, 20),
          email: profile.email,
          image: profile.image,
        });
      }
      // if not create user
      // return true to allow user to sign in
      /* The `return true;` statement in the `signIn` callback function is used to indicate that
            the sign-in process was successful and to allow the user to sign in. When this callback
            function is executed after a successful sign-in attempt, returning `true` signifies that
            the user should be allowed to proceed with the sign-in process. */
      // return true;
      return true;
    },
    // session callback that
    async session({ session, token }: { session: any; token: any }) {
      // get user from database
      // assign user id from session
      // return session
      // return session;
      const user = await User.findOne({ email: session.user.email });
      session.user.id = user._id.toString();
      return session;
    },
  },
};
