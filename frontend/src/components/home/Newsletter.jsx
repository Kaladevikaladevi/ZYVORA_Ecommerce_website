import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaPaperPlane } from 'react-icons/fa';
import './Newsletter.css';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    // Front-end only subscription — persists the intent locally.
    const list = JSON.parse(localStorage.getItem('zyvora_news') || '[]');
    if (!list.includes(email)) list.push(email);
    localStorage.setItem('zyvora_news', JSON.stringify(list));
    toast.success('Welcome to the Zyvora circle ✨');
    setEmail('');
  };

  return (
    <section className="news">
      <div className="container news__inner">
        <h2>Join the Zyvora Circle</h2>
        <p>
          Be the first to discover new arrivals, private sales, and exclusive
          member-only offers.
        </p>
        <form className="news__form" onSubmit={submit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            aria-label="Email address"
          />
          <button type="submit" className="btn btn-gold">
            Subscribe <FaPaperPlane />
          </button>
        </form>
        <span className="news__fine">
          No spam, only luxury. Unsubscribe anytime.
        </span>
      </div>
    </section>
  );
}
