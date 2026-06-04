import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaBolt } from 'react-icons/fa';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { formatPrice, effectivePrice, discountPercent } from '../../utils/helpers';
import './DealsCarousel.css';

// Hero carousel of products that are more than 50% off.
// Autoplays every 4 seconds as required.
export default function DealsCarousel({ deals = [] }) {
  if (!deals.length) return null;

  return (
    <section className="deals">
      <div className="container">
        <div className="deals__head">
          <span className="badge badge-gold">
            <FaBolt /> Flash Deals
          </span>
          <h2>Over 50% Off — Limited Time</h2>
          <p className="muted">
            Exceptional luxury at exceptional prices. Gone in a flash.
          </p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={deals.length > 2}
          pagination={{ clickable: true }}
          navigation
          spaceBetween={22}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="deals__swiper"
        >
          {deals.map((p) => (
            <SwiperSlide key={p._id}>
              <Link to={`/products/${p.slug || p._id}`} className="deal-card">
                <div className="deal-card__media">
                  <img src={p.images?.[0]?.url} alt={p.name} loading="lazy" />
                  <span className="deal-card__off">-{discountPercent(p)}%</span>
                </div>
                <div className="deal-card__body">
                  <span className="deal-card__cat">
                    {p.category?.name || 'Luxury'}
                  </span>
                  <h3>{p.name}</h3>
                  <div className="deal-card__price">
                    <span className="now">{formatPrice(effectivePrice(p))}</span>
                    <span className="was">{formatPrice(p.price)}</span>
                  </div>
                  <span className="deal-card__cta">
                    Shop Now <FaArrowRight />
                  </span>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
