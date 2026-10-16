// Presentation assets are separate from the established SEO copy and route data.
const duckSunset = {
  url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Sunset_-_Duck_-_North_Carolina.jpg/1280px-Sunset_-_Duck_-_North_Carolina.jpg',
  alt: 'A wooden dock and calm soundside water at sunset in Duck, North Carolina',
  caption: 'Duck, North Carolina',
  credit: 'Watts',
  creditUrl: 'https://commons.wikimedia.org/wiki/File:Sunset_-_Duck_-_North_Carolina.jpg',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  adaptation: 'Cropped for this layout.',
};

export function getGuideImage(page) {
  return page.slug === 'duck-nc-home-insurance' ? duckSunset : page.image;
}
