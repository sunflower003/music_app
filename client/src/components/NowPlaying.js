import React, { useState, useEffect } from "react";

export default function NowPlaying() {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Dữ liệu banner quảng cáo
  const banners = [
    {
      id: 1,
      title: "Premium Music Experience",
      subtitle: "Unlimited songs, ad-free",
      description: "Enjoy millions of songs with crystal clear quality",
      buttonText: "Try Premium",
      buttonLink: "/premium",
      backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
      icon: "ri-vip-crown-line"
    },
    {
      id: 2,
      title: "Discover New Artists",
      subtitle: "Fresh music daily",
      description: "Explore trending songs and hidden gems",
      buttonText: "Explore Now",
      buttonLink: "/discover",
      backgroundColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=200&fit=crop",
      icon: "ri-music-2-line"
    },
    {
      id: 3,
      title: "Create Your Playlist",
      subtitle: "Your music, your way",
      description: "Build the perfect soundtrack for every moment",
      buttonText: "Get Started",
      buttonLink: "/playlists",
      backgroundColor: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=200&fit=crop",
      icon: "ri-play-list-add-line"
    },
    {
      id: 4,
      title: "High Quality Audio",
      subtitle: "Lossless streaming",
      description: "Experience music the way artists intended",
      buttonText: "Learn More",
      buttonLink: "/quality",
      backgroundColor: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=200&fit=crop",
      icon: "ri-headphone-line"
    }
  ];

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Chuyển banner mỗi 5 giây

    return () => clearInterval(interval);
  }, [banners.length]);

  const currentBanner = banners[currentBannerIndex];

  return (
    <aside className="advertisement-sidebar">
      {/* Header */}
      <div className="ad-header">
        <h3>
          Promotions
        </h3>
        <div className="ad-indicators">
          {banners.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === currentBannerIndex ? 'active' : ''}`}
              onClick={() => setCurrentBannerIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Main Banner */}
      <div 
        className="main-banner"
        style={{ background: currentBanner.backgroundColor }}
      >
        <div className="banner-content">
          <div className="banner-icon">
            <i className={currentBanner.icon}></i>
          </div>
          <h4 className="banner-title">{currentBanner.title}</h4>
          <p className="banner-subtitle">{currentBanner.subtitle}</p>
          <p className="banner-description">{currentBanner.description}</p>
          <button 
            className="banner-btn"
            onClick={() => window.location.href = currentBanner.buttonLink}
          >
            {currentBanner.buttonText}
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
        <div className="banner-image">
          <img src={currentBanner.image} alt={currentBanner.title} />
        </div>
      </div>

     

      {/* Mini Offers */}
      <div className="mini-offers">
        <div className="mini-offer">
          <div className="offer-icon">
            <i className="ri-gift-line"></i>
          </div>
          <div className="offer-text">
            <span className="offer-title">Free Trial</span>
            <span className="offer-desc">30 days premium</span>
          </div>
          <button className="offer-btn">
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>

        <div className="mini-offer">
          <div className="offer-icon">
            <i className="ri-team-line"></i>
          </div>
          <div className="offer-text">
            <span className="offer-title">Family Plan</span>
            <span className="offer-desc">Up to 6 accounts</span>
          </div>
          <button className="offer-btn">
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="footer-banner">
        <div className="footer-content">
          <i className="ri-music-line"></i>
          <span>Enjoying the music?</span>
          <button className="footer-btn">Rate Us</button>
        </div>
      </div>
    </aside>
  );
}