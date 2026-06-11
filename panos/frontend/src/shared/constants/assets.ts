// 图片与静态资源的唯一来源。
// 不在 CSS / 组件里硬编码图片地址；壁纸通过 --panos-wallpaper CSS 变量注入。
// 壁纸为仓库内静态资源（public/wallpapers），不依赖外链；后续可由后台
// site_settings + media_assets 覆盖。

interface ImageAsset {
  url: string;
  alt: string;
}

export interface SiteAssets {
  wallpapers: readonly ImageAsset[];
  ogImage: string;
}

// 桌面壁纸轮播序列（15s 交叉淡入切换）。
// 全部为印尼珀尼达岛精灵崖（Kelingking）同族风景，来源 Unsplash，免费授权。
export const ASSETS: SiteAssets = {
  wallpapers: [
    { url: "/wallpapers/kelingking.jpg", alt: "Kelingking cliff, Nusa Penida" },
    { url: "/wallpapers/kelingking-beach.jpg", alt: "Kelingking beach aerial" },
    { url: "/wallpapers/kelingking-surf.jpg", alt: "Turquoise surf at Kelingking" },
    { url: "/wallpapers/kelingking-shore.jpg", alt: "Kelingking shoreline" },
    { url: "/wallpapers/kelingking-wave.jpg", alt: "Wave against the cliff" },
  ],
  ogImage:
    "https://images.unsplash.com/photo-1568507058983-7e7fc6682ab8?q=80&w=1200&h=630&fit=crop",
};
