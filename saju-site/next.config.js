/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 구글 폰트 CSS(한글은 500KB 넘음)를 모든 페이지 HTML에 통째로 넣지 않게 한다.
  // 넣으면 폰에서 첫 화면이 늦게 뜬다. 끄면 폰트 파일은 브라우저가 따로 받아온다.
  optimizeFonts: false,
}
module.exports = nextConfig
