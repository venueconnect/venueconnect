/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'pdjizjvsffovqjavnbhy.supabase.co' },
      { protocol: 'https', hostname: 'lfkwwyeemrvwyahtzwji.supabase.co' },
      { protocol: 'https', hostname: 'pgjoyxhcmqcsnmhwbkgi.supabase.co' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'www.baps.org' },
      { protocol: 'https', hostname: 'www.espitravels.in' },
    ],
  },
  trailingSlash: true,
};

export default nextConfig;
