import { motion } from 'framer-motion';
import { FaQuoteLeft } from 'react-icons/fa';
import Rating from '../ui/Rating';
import SectionHeader from '../ui/SectionHeader';
import './Testimonials.css';

const REVIEWS = [
  {
    name: 'Anaya Kapoor',
    role: 'Verified Buyer',
    text: 'The craftsmanship is simply unmatched. My Zyvora watch turns heads everywhere I go. Truly a luxury experience from start to finish.',
    rating: 5,
    avatar: '1494790108377-be9c29b29330',
  },
  {
    name: 'Rohan Mehta',
    role: 'Verified Buyer',
    text: 'Packaging, delivery, product quality — everything screamed premium. Zyvora has earned a lifelong customer in me.',
    rating: 5,
    avatar: '1500648767791-00dcc994a43e',
  },
  {
    name: 'Sofia Almeida',
    role: 'Verified Buyer',
    text: 'I was skeptical about luxury online, but Zyvora exceeded every expectation. The attention to detail is extraordinary.',
    rating: 5,
    avatar: '1438761681033-6461ffad8d80',
  },
];
const av = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=160&q=80`;

export default function Testimonials() {
  return (
    <section className="section testi">
      <div className="container">
        <SectionHeader
          eyebrow="Loved Worldwide"
          title="What Our Clients Say"
          text="Join thousands who have made Zyvora their destination for luxury."
        />
        <div className="testi__grid">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={r.name}
              className="testi-card"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <FaQuoteLeft className="testi-card__quote" />
              <p>{r.text}</p>
              <Rating value={r.rating} />
              <div className="testi-card__author">
                <img src={av(r.avatar)} alt={r.name} loading="lazy" />
                <div>
                  <strong>{r.name}</strong>
                  <span>{r.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
