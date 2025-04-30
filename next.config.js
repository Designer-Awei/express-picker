/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['antd', '@ant-design/icons', 'rc-util', '@rc-component'],
  modularizeImports: {
    '@ant-design/icons': {
      transform: '@ant-design/icons/lib/icons/${member}',
    },
  },
}

module.exports = nextConfig 