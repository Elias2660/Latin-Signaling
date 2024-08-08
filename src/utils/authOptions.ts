import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const authOptions: AuthOptions = {
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
            return true;
        },
        // session callback that
        async session({ session, token }: { session: any, token: any }) {
            // get user from database 
            // assign user id from session
            // return session
            return session;
        }
    }
};

export default authOptions;


