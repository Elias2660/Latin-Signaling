import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                }
            }
        }),
    ],
    callbacks: {
        // invoke on successful sign in
        async signIn({ user, account, profile, email, credentials }: { user: any, account: any, profile?: any, email?: any, credentials?: any }) {
            // check in database if user exists
            // if not create user
            // return true to allow user to sign in
            /* The `return true;` statement in the `signIn` callback function is used to indicate that
            the sign-in process was successful and to allow the user to sign in. When this callback
            function is executed after a successful sign-in attempt, returning `true` signifies that
            the user should be allowed to proceed with the sign-in process. */
            // return true;
        },
        // session callback that
        async session({ session, token }: { session: any, token: any }) {
            // get user from database 
            // assign user id from session
            // return session
            // return session;
        }
    }
};



