/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',                  // Frontend route
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`, // Backend URL
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
