// Small inline SVG: scales cleanly and makes no image or network requests.
export default function DashboardArtwork() {
  return (
    <svg className="dashboard-artwork" viewBox="0 0 360 220" fill="none" aria-hidden="true">
      <circle cx="230" cy="110" r="96" fill="white" fillOpacity=".06" />
      <circle cx="230" cy="110" r="73" stroke="white" strokeOpacity=".12" />
      <path d="M60 210 180 90h70L360 200" stroke="#a5b4fc" strokeWidth="48" strokeOpacity=".18" />
      <path d="m63 210 119-117h66l110 106" stroke="white" strokeOpacity=".4" strokeWidth="2" strokeDasharray="10 12" />
      <g transform="translate(164 102) rotate(-35)">
        <rect width="81" height="42" rx="13" fill="#c7d2fe" />
        <rect x="19" y="5" width="39" height="32" rx="9" fill="#4f46e5" />
        <path d="M29 7v28m18-28v28" stroke="#e0e7ff" strokeWidth="2" />
        <rect x="73" y="7" width="4" height="9" rx="2" fill="white" />
        <rect x="73" y="26" width="4" height="9" rx="2" fill="white" />
      </g>
      <path d="M277 126v58" stroke="#c7d2fe" strokeWidth="6" />
      <rect x="260" y="56" width="34" height="80" rx="13" fill="#182a55" stroke="#a5b4fc" strokeWidth="2" />
      <circle cx="277" cy="73" r="7" fill="#fb7185" />
      <circle cx="277" cy="96" r="7" fill="#fbbf24" />
      <circle cx="277" cy="119" r="7" fill="#34d399" />
      <path d="m103 71 8 8 16-19" stroke="#6ee7b7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="115" cy="72" r="27" stroke="#6ee7b7" strokeOpacity=".3" strokeWidth="2" />
    </svg>
  );
}
