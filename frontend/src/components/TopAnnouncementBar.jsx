import React, { useState, useEffect } from 'react';

export default function TopAnnouncementBar({ banner }) {
  // Real-time countdown timer initialized from banner data
  const [timeLeft, setTimeLeft] = useState({
    days: banner.countdown_days || 22,
    hours: banner.countdown_hours || 9,
    minutes: banner.countdown_minutes || 21,
    seconds: banner.countdown_seconds || 37,
  });

  useEffect(() => {
    // When banner settings change, update countdown state
    setTimeLeft({
      days: banner.countdown_days || 22,
      hours: banner.countdown_hours || 9,
      minutes: banner.countdown_minutes || 21,
      seconds: banner.countdown_seconds || 37,
    });
  }, [banner.countdown_days, banner.countdown_hours, banner.countdown_minutes, banner.countdown_seconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format2 = (val) => String(val).padStart(2, '0');

  return (
    <div className="announcement-bar">
      <div className="container">
        <div className="bar-content">
          <div className="promo-text">
            <span>{banner.announcement_text || "Website Sale Up to 30% off + Free Shipping"}</span>
            <a href="#catalog">{banner.announcement_link_text || "shop now"}</a>
          </div>

          <div className="countdown-timer">
            <div className="unit">
              <span className="digit">{format2(timeLeft.days)}</span>
              <span className="label">DAY</span>
            </div>
            <span className="sep">:</span>
            <div className="unit">
              <span className="digit">{format2(timeLeft.hours)}</span>
              <span className="label">HRS</span>
            </div>
            <span className="sep">:</span>
            <div className="unit">
              <span className="digit">{format2(timeLeft.minutes)}</span>
              <span className="label">MIN</span>
            </div>
            <span className="sep">:</span>
            <div className="unit">
              <span className="digit">{format2(timeLeft.seconds)}</span>
              <span className="label">SEC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
