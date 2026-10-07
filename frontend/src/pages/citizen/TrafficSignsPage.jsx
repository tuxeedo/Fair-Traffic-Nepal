import { useState } from 'react';

// ─── SVG Vector Signboard Renderer ───
function SignGraphic({ id, size = 80 }) {
  switch (id) {
    case 'stop':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          {/* Octagon Background */}
          <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#dc2626" stroke="#ffffff" strokeWidth="4" />
          <polygon points="32,8 68,8 92,32 92,68 68,92 32,92 8,68 8,32" fill="none" stroke="#ffffff" strokeWidth="2" />
          <text x="50" y="59" textAnchor="middle" fill="#ffffff" fontSize="24" fontFamily="Inter, sans-serif" fontWeight="900" letterSpacing="1">
            STOP
          </text>
        </svg>
      );

    case 'no-entry':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="#dc2626" stroke="#ffffff" strokeWidth="4" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="20" y="42" width="60" height="16" fill="#ffffff" rx="3" />
        </svg>
      );

    case 'speed-limit-40':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="#ffffff" stroke="#dc2626" strokeWidth="10" />
          <text x="50" y="62" textAnchor="middle" fill="#18181b" fontSize="36" fontFamily="Inter, sans-serif" fontWeight="900">
            40
          </text>
        </svg>
      );

    case 'no-parking':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="#2563eb" stroke="#dc2626" strokeWidth="9" />
          <text x="50" y="62" textAnchor="middle" fill="#ffffff" fontSize="42" fontFamily="Inter, sans-serif" fontWeight="900">
            P
          </text>
          <line x1="18" y1="18" x2="82" y2="82" stroke="#dc2626" strokeWidth="9" strokeLinecap="round" />
        </svg>
      );

    case 'no-overtaking':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="#ffffff" stroke="#dc2626" strokeWidth="9" />
          {/* Black Car Left */}
          <rect x="24" y="44" width="22" height="14" rx="3" fill="#18181b" />
          <circle cx="28" cy="58" r="3" fill="#ffffff" />
          <circle cx="42" cy="58" r="3" fill="#ffffff" />
          {/* Red Car Right */}
          <rect x="54" y="44" width="22" height="14" rx="3" fill="#dc2626" />
          <circle cx="58" cy="58" r="3" fill="#ffffff" />
          <circle cx="72" cy="58" r="3" fill="#ffffff" />
          {/* Slash */}
          <line x1="18" y1="18" x2="82" y2="82" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" />
        </svg>
      );

    case 'no-horn':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="#ffffff" stroke="#dc2626" strokeWidth="9" />
          {/* Bugle Horn Shape */}
          <polygon points="30,45 42,42 42,58 30,55" fill="#18181b" />
          <path d="M42,50 Q60,35 68,50 Q60,65 42,50 Z" fill="#18181b" />
          <line x1="18" y1="18" x2="82" y2="82" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" />
        </svg>
      );

    case 'one-way':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="#ffffff" stroke="#dc2626" strokeWidth="9" />
          <path d="M50,22 L70,48 L58,48 L58,76 L42,76 L42,48 L30,48 Z" fill="#18181b" />
        </svg>
      );

    case 'pedestrian-crossing':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          {/* Warning Triangle */}
          <polygon points="50,6 94,88 6,88" fill="#f59e0b" stroke="#18181b" strokeWidth="6" strokeLinejoin="round" />
          {/* Zebra lines */}
          <rect x="28" y="74" width="44" height="4" fill="#ffffff" />
          <rect x="32" y="66" width="36" height="4" fill="#ffffff" />
          {/* Walking Figure */}
          <circle cx="50" cy="38" r="5" fill="#18181b" />
          <path d="M50,44 L44,62 M50,44 L56,60 M42,52 L58,48" stroke="#18181b" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'school-ahead':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <polygon points="50,6 94,88 6,88" fill="#f59e0b" stroke="#18181b" strokeWidth="6" strokeLinejoin="round" />
          {/* Child 1 */}
          <circle cx="42" cy="40" r="4" fill="#18181b" />
          <path d="M42,44 L42,66 M36,52 L48,50" stroke="#18181b" strokeWidth="3.5" strokeLinecap="round" />
          {/* Child 2 */}
          <circle cx="58" cy="46" r="3.5" fill="#18181b" />
          <path d="M58,50 L58,68 M52,56 L64,54" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'sharp-bend-right':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <polygon points="50,6 94,88 6,88" fill="#f59e0b" stroke="#18181b" strokeWidth="6" strokeLinejoin="round" />
          <path d="M38,72 L38,48 Q38,36 54,36 L66,36 M60,28 L72,36 L60,44" fill="none" stroke="#18181b" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'narrow-bridge':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <polygon points="50,6 94,88 6,88" fill="#f59e0b" stroke="#18181b" strokeWidth="6" strokeLinejoin="round" />
          {/* Narrowing lines */}
          <path d="M30,76 L30,60 Q30,50 42,44 L42,32" stroke="#18181b" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M70,76 L70,60 Q70,50 58,44 L58,32" stroke="#18181b" strokeWidth="5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'steep-descent':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <polygon points="50,6 94,88 6,88" fill="#f59e0b" stroke="#18181b" strokeWidth="6" strokeLinejoin="round" />
          {/* Inclined Slope */}
          <polygon points="26,72 74,48 74,72" fill="#18181b" />
          <text x="60" y="66" fill="#ffffff" fontSize="12" fontWeight="800">10%</text>
        </svg>
      );

    case 'traffic-signal-ahead':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <polygon points="50,6 94,88 6,88" fill="#f59e0b" stroke="#18181b" strokeWidth="6" strokeLinejoin="round" />
          {/* Light Housing inside triangle */}
          <rect x="42" y="38" width="16" height="38" rx="4" fill="#18181b" />
          <circle cx="50" cy="45" r="4" fill="#dc2626" />
          <circle cx="50" cy="57" r="4" fill="#f59e0b" />
          <circle cx="50" cy="69" r="4" fill="#10b981" />
        </svg>
      );

    case 'hospital':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <rect x="5" y="5" width="90" height="90" rx="14" fill="#0284c7" stroke="#ffffff" strokeWidth="4" />
          <rect x="22" y="22" width="56" height="56" rx="8" fill="#ffffff" />
          {/* Red Cross */}
          <rect x="44" y="30" width="12" height="40" fill="#dc2626" rx="2" />
          <rect x="30" y="44" width="40" height="12" fill="#dc2626" rx="2" />
        </svg>
      );

    case 'parking-area':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <rect x="5" y="5" width="90" height="90" rx="14" fill="#0284c7" stroke="#ffffff" strokeWidth="4" />
          <text x="50" y="68" textAnchor="middle" fill="#ffffff" fontSize="56" fontFamily="Inter, sans-serif" fontWeight="900">
            P
          </text>
        </svg>
      );

    case 'petrol-pump':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <rect x="5" y="5" width="90" height="90" rx="14" fill="#0284c7" stroke="#ffffff" strokeWidth="4" />
          {/* Gas Pump */}
          <rect x="30" y="32" width="28" height="42" rx="4" fill="#ffffff" />
          <rect x="35" y="38" width="18" height="14" rx="2" fill="#0284c7" />
          <path d="M58,40 L68,40 L68,62 L62,62" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'roundabout':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <rect x="5" y="5" width="90" height="90" rx="14" fill="#0284c7" stroke="#ffffff" strokeWidth="4" />
          <circle cx="50" cy="50" r="24" fill="none" stroke="#ffffff" strokeWidth="6" strokeDasharray="25 10" />
          <path d="M50,22 L58,28 L50,34" fill="#ffffff" />
          <path d="M78,50 L72,58 L66,50" fill="#ffffff" />
          <path d="M50,78 L42,72 L50,66" fill="#ffffff" />
        </svg>
      );

    case 'red-light':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <rect x="25" y="10" width="50" height="80" rx="12" fill="#18181b" stroke="#3f3f46" strokeWidth="4" />
          {/* Red Light ON */}
          <circle cx="50" cy="26" r="11" fill="#dc2626" stroke="#f87171" strokeWidth="2" />
          <circle cx="50" cy="26" r="5" fill="#fca5a5" opacity="0.6" />
          {/* Yellow Light OFF */}
          <circle cx="50" cy="50" r="10" fill="#3f3f46" />
          {/* Green Light OFF */}
          <circle cx="50" cy="74" r="10" fill="#3f3f46" />
        </svg>
      );

    case 'yellow-light':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <rect x="25" y="10" width="50" height="80" rx="12" fill="#18181b" stroke="#3f3f46" strokeWidth="4" />
          {/* Red Light OFF */}
          <circle cx="50" cy="26" r="10" fill="#3f3f46" />
          {/* Yellow Light ON */}
          <circle cx="50" cy="50" r="11" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
          <circle cx="50" cy="50" r="5" fill="#fef08a" opacity="0.6" />
          {/* Green Light OFF */}
          <circle cx="50" cy="74" r="10" fill="#3f3f46" />
        </svg>
      );

    case 'green-light':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <rect x="25" y="10" width="50" height="80" rx="12" fill="#18181b" stroke="#3f3f46" strokeWidth="4" />
          {/* Red Light OFF */}
          <circle cx="50" cy="26" r="10" fill="#3f3f46" />
          {/* Yellow Light OFF */}
          <circle cx="50" cy="50" r="10" fill="#3f3f46" />
          {/* Green Light ON */}
          <circle cx="50" cy="74" r="11" fill="#10b981" stroke="#34d399" strokeWidth="2" />
          <circle cx="50" cy="74" r="5" fill="#a7f3d0" opacity="0.6" />
        </svg>
      );

    default:
      return null;
  }
}

const TRAFFIC_SIGNS = [
  // ─── Mandatory / Regulatory Signs ───
  {
    id: 'stop',
    category: 'regulatory',
    categoryName: 'Mandatory / Regulatory',
    title: 'STOP (रोक्नुहोस्)',
    description: 'Drivers must bring their vehicle to a complete stop at the stop line before proceeding safely when clear.',
    nepaliDesc: 'वाहनलाई पूर्ण रूपमा रोकेर दायाँबायाँ सुरक्षित भएपछि मात्र अघि बढाउनुपर्छ।',
    penalty: 'NPR 1,000 - 1,500 fine + 10 Safety Score deduction',
  },
  {
    id: 'no-entry',
    category: 'regulatory',
    categoryName: 'Mandatory / Regulatory',
    title: 'No Entry (प्रवेश निषेध)',
    description: 'No vehicles are allowed to enter this road from this direction.',
    nepaliDesc: 'यस दिशाबाट कुनै पनि सवारी साधन प्रवेश गर्न मनाही छ।',
    penalty: 'NPR 1,000 - 2,000 fine + 15 Safety Score deduction',
  },
  {
    id: 'speed-limit-40',
    category: 'regulatory',
    categoryName: 'Mandatory / Regulatory',
    title: 'Speed Limit 40 km/h (गति सीमा ४०)',
    description: 'Maximum permitted driving speed is 40 km per hour in this designated zone.',
    nepaliDesc: 'यस सडकखण्डमा अधिकतम गति ४० किमी प्रतिघन्टा मात्र हुनुपर्छ।',
    penalty: 'NPR 1,500 fine + 15 Safety Score deduction',
  },
  {
    id: 'no-parking',
    category: 'regulatory',
    categoryName: 'Mandatory / Regulatory',
    title: 'No Parking (पार्किङ निषेध)',
    description: 'Parking is strictly prohibited at all times along this road curb.',
    nepaliDesc: 'यस क्षेत्रमा सवारी साधन पार्किङ गर्न पूर्ण रूपमा निषेध गरिएको छ।',
    penalty: 'NPR 1,000 fine + Vehicle Towing Charges',
  },
  {
    id: 'no-overtaking',
    category: 'regulatory',
    categoryName: 'Mandatory / Regulatory',
    title: 'No Overtaking (ओभरटेक निषेध)',
    description: 'Overtaking any moving vehicle ahead is dangerous and illegal in this zone.',
    nepaliDesc: 'अगाडिको गाडीलाई उछिन्न वा ओभरटेक गर्न सख्त मनाही छ।',
    penalty: 'NPR 1,000 - 1,500 fine + 10 Safety Score deduction',
  },
  {
    id: 'no-horn',
    category: 'regulatory',
    categoryName: 'Mandatory / Regulatory',
    title: 'No Horn Zone (हर्न बजाउन निषेध)',
    description: 'Blowing horns is prohibited near hospitals, schools, and silent zones.',
    nepaliDesc: 'अस्पताल, विद्यालय तथा शान्त क्षेत्र वरिपरि हर्न बजाउन पाइने छैन।',
    penalty: 'NPR 500 - 1,000 fine',
  },
  {
    id: 'one-way',
    category: 'regulatory',
    categoryName: 'Mandatory / Regulatory',
    title: 'One-Way Traffic (एकतर्फी सडक)',
    description: 'Vehicles must travel only in the direction indicated by the arrow.',
    nepaliDesc: 'सवारी साधन केवल तोकिएको एक दिशा तर्फ मात्र लैजानुपर्छ।',
    penalty: 'NPR 1,000 fine + 10 Safety Score deduction',
  },

  // ─── Warning / Cautionary Signs ───
  {
    id: 'pedestrian-crossing',
    category: 'warning',
    categoryName: 'Warning / Cautionary',
    title: 'Pedestrian Crossing (पैदल यात्री क्रसिङ)',
    description: 'Drivers must slow down and prepare to yield right-of-way to pedestrians crossing ahead.',
    nepaliDesc: 'पैदल यात्री बाटो काट्दै हुन सक्छन्, गाडीको गति घटाएर प्राथमिकता दिनुहोस्।',
    penalty: 'Failure to yield: NPR 1,500 fine + 15 Safety Score deduction',
  },
  {
    id: 'school-ahead',
    category: 'warning',
    categoryName: 'Warning / Cautionary',
    title: 'School Zone Ahead (विद्यालय क्षेत्र)',
    description: 'School children may be crossing. Reduce speed significantly and stay alert.',
    nepaliDesc: 'अगाडि विद्यालय छ, बालबालिका बाटोमा हुन सक्छन्। गति कम गर्नुहोस्।',
    penalty: 'Speeding in school zone: NPR 1,500 fine',
  },
  {
    id: 'sharp-bend-right',
    category: 'warning',
    categoryName: 'Warning / Cautionary',
    title: 'Sharp Bend Right (तीव्र दायाँ मोड)',
    description: 'Approaching a sharp right curve. Decelerate before entering the turn.',
    nepaliDesc: 'अगाडि तीव्र दायाँ मोड छ, मोडिनु अघि गाडीको गति नियन्त्रण गर्नुहोस्।',
    penalty: 'Reckless turning: NPR 1,000 fine',
  },
  {
    id: 'narrow-bridge',
    category: 'warning',
    categoryName: 'Warning / Cautionary',
    title: 'Narrow Bridge Ahead (साँघुरो पुल)',
    description: 'The road ahead narrows onto a bridge. Allow oncoming traffic to clear if narrow.',
    nepaliDesc: 'अगाडि साँघुरो पुल छ, विपरित दिशाको गाडीलाई ध्यान दिई प्रवेश गर्नुहोस्।',
    penalty: 'Blocking bridge traffic: NPR 1,000 fine',
  },
  {
    id: 'steep-descent',
    category: 'warning',
    categoryName: 'Warning / Cautionary',
    title: 'Steep Descent (तीव्र ओरालो)',
    description: 'Steep downward slope ahead. Shift to lower gear and control speed with engine braking.',
    nepaliDesc: 'अगाडि कडा ओरालो छ, सानो गियर लगाएर ब्रेकको प्रयोग गरी नियन्त्रण गर्नुहोस्।',
    penalty: 'Neutral driving on slope: Danger warning',
  },
  {
    id: 'traffic-signal-ahead',
    category: 'warning',
    categoryName: 'Warning / Cautionary',
    title: 'Traffic Signals Ahead (ट्राफिक लाइट अगाडि)',
    description: 'Automated traffic light signals operating ahead. Be prepared to stop.',
    nepaliDesc: 'अगाडि ट्राफिक बत्ती छ, सङ्केत अनुसार रोकिन तयार रहनुहोस्।',
    penalty: 'Signal violation penalty applies',
  },

  // ─── Informational & Directional Signs ───
  {
    id: 'hospital',
    category: 'info',
    categoryName: 'Informational',
    title: 'Hospital (अस्पताल)',
    description: 'Medical hospital nearby. Drive quietly without honking.',
    nepaliDesc: 'जिकै अस्पताल छ। हर्न नबजाई ध्यानपूर्वक सवारी चलाउनुहोस्।',
    penalty: 'Quiet zone rule applies',
  },
  {
    id: 'parking-area',
    category: 'info',
    categoryName: 'Informational',
    title: 'Designated Parking (पार्किङ स्थल)',
    description: 'Authorized vehicle parking space designated ahead.',
    nepaliDesc: 'स्वीकृत पार्किङ स्थल। तोकिएको ठाउँमा मात्र गाडी राख्नुहोस्।',
    penalty: 'Free / Metered parking space',
  },
  {
    id: 'petrol-pump',
    category: 'info',
    categoryName: 'Informational',
    title: 'Fuel Station (पेट्रोल पम्प)',
    description: 'Fuel refilling station located ahead along the route.',
    nepaliDesc: 'अगाडि इन्धन भरिने पेट्रोल पम्प उपलब्ध छ।',
    penalty: 'Information sign',
  },
  {
    id: 'roundabout',
    category: 'info',
    categoryName: 'Informational',
    title: 'Roundabout / Traffic Circle (गोलचक्कर)',
    description: 'Traffic roundabout ahead. Yield right-of-way to vehicles already inside the circle.',
    nepaliDesc: 'अगाडि गोलचक्कर छ, पहिले नै घुमिरहेका सवारी साधनलाई प्राथमिकता दिनुहोस्।',
    penalty: 'Failure to yield: NPR 1,000 fine',
  },

  // ─── Traffic Signals & Lights ───
  {
    id: 'red-light',
    category: 'signals',
    categoryName: 'Traffic Signals & Lights',
    title: 'Red Light (रातो बत्ती - रोक्नुहोस्)',
    description: 'Red light means STOP completely behind the stop line or zebra line.',
    nepaliDesc: 'रातो बत्ती बलेमा रेखा भन्दा पछाडि पूर्ण रूपमा रोकिनुपर्छ।',
    penalty: 'Red light jump: NPR 1,500 - 2,500 fine + 20 Safety Score deduction',
  },
  {
    id: 'yellow-light',
    category: 'signals',
    categoryName: 'Traffic Signals & Lights',
    title: 'Yellow Light (पहेँलो बत्ती - तयार हुनुहोस्)',
    description: 'Prepare to stop safely. Do not speed up to cross the intersection.',
    nepaliDesc: 'रोकिनका लागि तयार हुनुहोस्। चौबाटो पार गर्न गति नबढाउनुहोस्।',
    penalty: 'Accelerating through yellow is dangerous',
  },
  {
    id: 'green-light',
    category: 'signals',
    categoryName: 'Traffic Signals & Lights',
    title: 'Green Light (हरियो बत्ती - अघि बढ्नुहोस्)',
    description: 'Go ahead if the intersection is clear of pedestrians and turning traffic.',
    nepaliDesc: 'चौबाटो खाली र सुरक्षित भएमा अघि बढ्नुहोस्।',
    penalty: 'Follow general safety rules',
  },
];

const QUIZ_QUESTIONS = [
  {
    question: 'What does a solid Red traffic light indicate?',
    options: ['Slow down and yield', 'Complete Stop behind stop line', 'Drive fast to clear', 'Overtake immediately'],
    correct: 1,
    explanation: 'A solid red light requires a complete stop before the stop line or zebra crossing.',
  },
  {
    question: 'Who has the right-of-way at a Traffic Roundabout (गोलचक्कर)?',
    options: ['Vehicles entering the roundabout', 'Vehicles already inside the roundabout', 'Heavy trucks only', 'Pedestrians on sidewalk'],
    correct: 1,
    explanation: 'Vehicles already circulating inside the roundabout always have priority right-of-way.',
  },
  {
    question: 'What is the fine and penalty for jumping a Red Traffic Light in Nepal?',
    options: ['No penalty', 'NPR 500 only', 'NPR 1,500-2,500 fine + 20 Safety Score deduction', 'Free warning'],
    correct: 2,
    explanation: 'Running a red light incurs severe fines (NPR 1,500-2,500) and deducts 20 points from your Driver Safety Score.',
  },
];

export default function TrafficSignsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'quiz'

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const filteredSigns = TRAFFIC_SIGNS.filter((sign) => {
    const matchesCategory = selectedCategory === 'all' || sign.category === selectedCategory;
    const matchesSearch =
      sign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.nepaliDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOptionSelect = (questionIdx, optionIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers({ ...quizAnswers, [questionIdx]: optionIdx });
  };

  const calculateQuizScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) score++;
    });
    return score;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: '28px 32px',
        background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-surface-raised))',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '2rem' }}>🚥</span>
            <h1 className="page-title" style={{ margin: 0 }}>
              Nepal Traffic Signs & Signals Guide
            </h1>
          </div>
          <p className="page-subtitle" style={{ margin: '4px 0 0' }}>
            नेपाल यातायात सङ्केतहरू, सडक नियम र जरिवाना जानकारी (Official Road Sign Graphics & Meanings)
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: 8, background: 'var(--bg-base)', padding: 4, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
          <button
            className={`btn btn-sm ${activeTab === 'guide' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('guide')}
          >
            📚 Signs Directory
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'quiz' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('quiz')}
          >
            🧠 Take Traffic Quiz
          </button>
        </div>
      </div>

      {activeTab === 'guide' && (
        <>
          {/* Controls: Search & Category Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="🔍 Search traffic signs by name, meaning, or penalty (e.g. Stop, Speed Limit, ओभरटेक)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 16, fontSize: '0.95rem', height: 46 }}
              />
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Signs (सबै सङ्केत)' },
                { id: 'regulatory', label: '🛑 Mandatory / Regulatory' },
                { id: 'warning', label: '⚠️ Warning / Cautionary' },
                { id: 'info', label: 'ℹ️ Informational' },
                { id: 'signals', label: '🚦 Traffic Signals' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{ borderRadius: 20 }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Traffic Signs Grid */}
          {filteredSigns.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>No traffic signs match your search</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Try searching for keywords like "Speed", "Parking", or "Signal".
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {filteredSigns.map((sign) => (
                <div key={sign.id} className="glass-card" style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'all 0.2s var(--ease-out)',
                }}>
                  {/* Sign Icon Representation Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Authentic Vector SVG Graphics Signboard Display */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
                      flexShrink: 0,
                    }}>
                      <SignGraphic id={sign.id} size={72} />
                    </div>

                    <div>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem', marginBottom: 4 }}>
                        {sign.categoryName}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        {sign.title}
                      </h3>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.875rem' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {sign.nepaliDesc}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      {sign.description}
                    </div>
                  </div>

                  {/* Violation Penalty Tag */}
                  <div style={{
                    marginTop: 'auto',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                    color: 'var(--color-danger)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <span>⚖️ Rule / Penalty:</span> {sign.penalty}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Quiz Tab */}
      {activeTab === 'quiz' && (
        <div className="glass-card" style={{ padding: 32, maxWidth: 720, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
              🧠 Traffic Rules & Signs Self-Test
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Test your driver knowledge of Nepal road rules and sign meanings.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {QUIZ_QUESTIONS.map((q, qIdx) => (
              <div key={qIdx} style={{
                padding: 20,
                borderRadius: 12,
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 12 }}>
                  {qIdx + 1}. {q.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = quizAnswers[qIdx] === optIdx;
                    const isCorrect = optIdx === q.correct;
                    let optionBg = 'var(--bg-surface)';
                    let optionBorder = 'var(--border-subtle)';

                    if (quizSubmitted) {
                      if (isCorrect) {
                        optionBg = 'rgba(16, 185, 129, 0.15)';
                        optionBorder = 'var(--color-success)';
                      } else if (isSelected && !isCorrect) {
                        optionBg = 'rgba(239, 68, 68, 0.15)';
                        optionBorder = 'var(--color-danger)';
                      }
                    } else if (isSelected) {
                      optionBg = 'rgba(79, 70, 229, 0.15)';
                      optionBorder = 'var(--color-primary)';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleOptionSelect(qIdx, optIdx)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: optionBg,
                          border: `1px solid ${optionBorder}`,
                          color: 'var(--text-primary)',
                          textAlign: 'left',
                          cursor: quizSubmitted ? 'default' : 'pointer',
                          fontWeight: isSelected ? 600 : 400,
                          fontSize: '0.875rem',
                          transition: 'all 0.15s',
                        }}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            ))}

            {/* Quiz Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              {!quizSubmitted ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                >
                  Submit & Check Score
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-success)' }}>
                    Your Score: {calculateQuizScore()} / {QUIZ_QUESTIONS.length} Correct! 🎉
                  </div>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                    }}
                  >
                    Retake Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
