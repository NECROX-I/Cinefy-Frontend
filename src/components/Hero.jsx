import { Search, Sparkles } from "lucide-react";
export default function Hero({ onSearchFocus, onClear }) {
  return <section className="hero"><div className="hero-orb orb-one" /><div className="hero-orb orb-two" /><div className="hero-content"><div className="hero-badge"><Sparkles size={13} /> PERSONAL STREAMING HUB</div><h1>What are you watching <em>tonight?</em></h1><p className="hero-copy">Discover movies and TV shows, explore trending titles, and keep your favourites in one clean place.</p><div className="hero-actions"><button className="button button-primary" onClick={onSearchFocus}><Search size={17} /> Search titles</button><button className="button button-secondary" onClick={onClear}>Reset</button></div></div><div className="hero-lines" /></section>;
}
