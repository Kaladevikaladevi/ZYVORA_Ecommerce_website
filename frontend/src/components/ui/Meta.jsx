import { Helmet } from 'react-helmet-async';

// Dynamic SEO meta tags (title, description, Open Graph).
export default function Meta({
  title = 'Zyvora — Luxury E-Commerce',
  description = 'Where luxury meets elegance. Discover premium fashion, watches, beauty and more at Zyvora.',
  image = '/og-image.jpg',
}) {
  const full = title.includes('Zyvora') ? title : `${title} • Zyvora`;
  return (
    <Helmet>
      <title>{full}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
