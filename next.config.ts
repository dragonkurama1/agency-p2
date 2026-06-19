import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async redirects() {
    return [
      // Exemple : si une ancienne ancre/URL du site mono-page doit rediriger
      // { source: "/services-old", destination: "/services", permanent: true },
    ];
  },
};

export default nextConfig;
