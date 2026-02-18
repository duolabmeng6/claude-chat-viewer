/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允许读取本地文件系统
  serverRuntimeConfig: {
    PROJECT_ROOT: process.cwd()
  }
}

module.exports = nextConfig
