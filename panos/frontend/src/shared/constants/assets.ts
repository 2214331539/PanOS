// 图片与静态资源的唯一来源。
// 不在 CSS / 组件里硬编码图片地址；壁纸通过 --panos-wallpaper CSS 变量注入。
// V1 使用远程 URL；后续可由后台 site_settings + media_assets 覆盖。

interface ImageAsset {
  url: string;
  alt: string;
}

export interface SiteAssets {
  wallpaper: ImageAsset;
  ogImage: string;
}

export const ASSETS: SiteAssets = {
  wallpaper: {
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2400&q=80",
    alt: "PanOS desktop wallpaper",
  },
  ogImage: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
};
