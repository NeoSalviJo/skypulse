/** Raster plates & overlay layers bundled under `public/weather-hero/`. Generated artwork for cinematic hero layering. */

const dir = `${import.meta.env.BASE_URL}weather-hero`;

export const weatherHeroAssets = {
    skyDay: `${dir}/wx-plate-clear-day.png`,
    skyNight: `${dir}/wx-plate-clear-night.png`,
    skyStorm: `${dir}/wx-plate-storm.png`,
    cloudMid: `${dir}/wx-layer-cloud-mid.png`,
    cloudFg: `${dir}/wx-layer-cloud-fg.png`,
    godrays: `${dir}/wx-layer-godrays.png`,
    moon: `${dir}/wx-moon.png`,
} as const;
