import { useEffect, useState } from 'react';
import api from '../services/api';
import Meta from '../components/ui/Meta';
import Hero from '../components/home/Hero';
import DealsCarousel from '../components/home/DealsCarousel';
import FeaturedCategories from '../components/home/FeaturedCategories';
import ProductSection from '../components/home/ProductSection';
import PromoBanner from '../components/home/PromoBanner';
import Newsletter from '../components/home/Newsletter';
import Testimonials from '../components/home/Testimonials';
import TrustBar from '../components/home/TrustBar';

export default function Home() {
  const [data, setData] = useState({
    deals: [],
    categories: [],
    featured: [],
    latest: [],
    bestSelling: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [deals, categories, featured, latest, bestSelling] =
          await Promise.all([
            api.get('/products/deals'),
            api.get('/categories'),
            api.get('/products/featured'),
            api.get('/products/latest'),
            api.get('/products/best-selling'),
          ]);
        if (!active) return;
        setData({
          deals: deals.data.products,
          categories: categories.data.categories,
          featured: featured.data.products,
          latest: latest.data.products,
          bestSelling: bestSelling.data.products,
        });
      } catch {
        /* errors surface via empty states */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Meta />
      <Hero />
      <TrustBar />
      <DealsCarousel deals={data.deals} />
      <FeaturedCategories categories={data.categories} />
      <ProductSection
        eyebrow="Handpicked for You"
        title="Featured Products"
        text="The pieces our curators can't stop talking about."
        products={data.featured}
        loading={loading}
        viewAll="/products"
      />
      <PromoBanner />
      <ProductSection
        eyebrow="Just Arrived"
        title="Latest Products"
        text="Fresh additions to the Zyvora collection."
        products={data.latest}
        loading={loading}
        viewAll="/products?sort=newest"
        tone="mist"
      />
      <ProductSection
        eyebrow="Most Coveted"
        title="Best Selling Products"
        text="Loved by thousands — see what everyone's wearing."
        products={data.bestSelling}
        loading={loading}
        viewAll="/products?sort=best-selling"
      />
      <Testimonials />
      <Newsletter />
    </>
  );
}
