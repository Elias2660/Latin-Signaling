import { protocol } from 'socket.io-client';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                pathname: "**"
            }
        ]
    }
};

export default nextConfig;
