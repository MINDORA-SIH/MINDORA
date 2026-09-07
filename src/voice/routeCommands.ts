import { VoiceIntent } from './VoiceNavigation';

export interface RouteCommand {
  intent: VoiceIntent;
  route: string | null;
  label: string;
  aliases: Record<string, string[]>;
}

export const ROUTE_COMMANDS: RouteCommand[] = [
  {
    intent: VoiceIntent.OPEN_GAMES,
    route: '/',
    label: 'Games',
    aliases: {
      en: ['games', 'play games', 'go to games', 'open games'],
      hi: ['खेल', 'गेम्स', 'खेल खेलें', 'गेम्स खोलें'],
      as: ['খেল', 'গেম'],
      bn: ['খেলা', 'গেমস', 'খেলতে যান'],
      ne: ['खेल', 'खेलहरू', 'खेल खेल्नुहोस्'],
      brx: ['गेलेमु', 'गेम'],
      mni: ['শান্নবা', 'গেম'],
      lus: ['in fiamna', 'games'],
      kha: ['ialehkai', 'games'],
      trp: ['thwngmung', 'games']
    }
  },
  {
    intent: VoiceIntent.OPEN_DASHBOARD,
    route: '/dashboard',
    label: 'Dashboard',
    aliases: {
      en: ['dashboard', 'my dashboard', 'view dashboard', 'open dashboard'],
      hi: ['डैशबोर्ड', 'मेरा डैशबोर्ड', 'डैशबोर्ड दिखाएं', 'डैशबोर्ड खोलें'],
      as: ['ডেশবৰ্ড', 'মোৰ ডেশবৰ্ড'],
      bn: ['ড্যাশবোর্ড', 'আমার ড্যাশবোর্ড'],
      ne: ['ड्यासबोर्ड', 'मेरो ड्यासबोर्ड'],
      brx: ['ड्यासबर्ड', 'आंनि ड्यासबर्ड'],
      mni: ['ড্যাশবোর্ড', 'ঐগী ড্যাশবোর্ড'],
      lus: ['dashboard', 'ka dashboard'],
      kha: ['dashboard', 'dashboard jong nga'],
      trp: ['dashboard', 'ani dashboard']
    }
  },
  {
    intent: VoiceIntent.OPEN_MANAGE_DATA,
    route: '/manage-data',
    label: 'Manage Data',
    aliases: {
      en: ['manage data', 'data management', 'open data', 'view data'],
      hi: ['डेटा प्रबंधित करें', 'डेटा प्रबंधन', 'डेटा खोलें', 'डेटा दिखाएं'],
      as: ['তথ্য পৰিচালনা', 'ডাটা পৰিচালনা'],
      bn: ['ডেটা পরিচালনা', 'তথ্য পরিচালনা'],
      ne: ['डाटा प्रबन्ध गर्नुहोस्', 'डाटा व्यवस्थापन'],
      brx: ['डाटा मेनेज', 'डाटा'],
      mni: ['ডাটা শেন্নবা', 'ডাটা'],
      lus: ['data manage', 'data'],
      kha: ['pyniaid data', 'data'],
      trp: ['data manage', 'data']
    }
  },
  {
    intent: VoiceIntent.OPEN_REMINDERS,
    route: '/reminders',
    label: 'Reminders',
    aliases: {
      en: ['reminders', 'my reminders', 'show reminders', 'open reminders'],
      hi: ['रिमाइंडर', 'याद दिलाएं', 'मेरे रिमाइंडर', 'रिमाइंडर दिखाएं'],
      as: ['ৰিমাইণ্ডাৰ', 'সোঁৱৰণী'],
      bn: ['রিমাইন্ডার', 'মনে করিয়ে দেওয়া'],
      ne: ['रिमाइन्डर', 'रिमाइन्डरहरू'],
      brx: ['रिमाइन्डर', 'गोसोखां'],
      mni: ['নিংশিংবা', 'রিমাইন্ডার'],
      lus: ['hriatnawntirna', 'reminders'],
      kha: ['jingpynkynmaw', 'reminders'],
      trp: ['mwkthang', 'reminders']
    }
  },
  {
    intent: VoiceIntent.OPEN_SETTINGS,
    route: '/settings',
    label: 'Settings',
    aliases: {
      en: ['settings', 'preferences', 'open settings', 'go to settings'],
      hi: ['सेटिंग्स', 'सेटिंग', 'सेटिंग्स खोलें', 'सेटिंग्स पर जाएं'],
      as: ['ছেটিংছ', 'পছন্দ'],
      bn: ['সেটিংস', 'পছন্দসমূহ'],
      ne: ['सेटिङहरू', 'सेटिङ'],
      brx: ['सेटिं', 'सेटिंस'],
      mni: ['সেটিংস', 'মওং'],
      lus: ['settings', 'siamthatna'],
      kha: ['settings', 'jingpyn मिलाai'],
      trp: ['settings', 'sajakmung']
    }
  },
  {
    intent: VoiceIntent.OPEN_PROFILE,
    route: '/profile',
    label: 'Profile',
    aliases: {
      en: ['profile', 'my profile', 'view profile', 'open profile'],
      hi: ['प्रोफ़ाइल', 'मेरी प्रोफ़ाइल', 'प्रोफ़ाइल दिखाएं', 'प्रोफ़ाइल खोलें'],
      as: ['প্ৰফাইল', 'মোৰ প্ৰফাইল'],
      bn: ['প্রোফাইল', 'আমার প্রোফাইল'],
      ne: ['प्रोफाइल', 'मेरो प्रोफाइल'],
      brx: ['प्रफाइल', 'आंनि प्रफाइल'],
      mni: ['প্রোফাইল', 'ঐগী প্রোফাইল'],
      lus: ['profile', 'ka profile'],
      kha: ['profile', 'profile jong nga'],
      trp: ['profile', 'ani profile']
    }
  },
  {
    intent: VoiceIntent.OPEN_CHATBOT,
    route: '/chatbot',
    label: 'Chatbot',
    aliases: {
      en: ['chatbot', 'assistant', 'chat', 'talk to bot'],
      hi: ['चैटबॉट', 'सहायक', 'चैट', 'बॉट से बात करें'],
      as: ['চেটবট', 'সহায়িকা'],
      bn: ['চ্যাটবট', 'সহকারী'],
      ne: ['च्याटबट', 'सहायक'],
      brx: ['च्याटबट', 'हेफाजाब'],
      mni: ['চ্যাটবট', 'অসিস্টেন্ট'],
      lus: ['chatbot', 'puitu'],
      kha: ['chatbot', 'nongiarap'],
      trp: ['chatbot', 'kwtal']
    }
  },
  {
    intent: VoiceIntent.OPEN_DAILY_ROUTINE,
    route: '/daily-routine',
    label: 'Daily Routine',
    aliases: {
      en: ['daily routine', 'my routine', 'routine', 'daily tasks'],
      hi: ['दिनचर्या', 'मेरी दिनचर्या', 'रोज का काम', 'डेली रूटीन'],
      as: ['দৈনন্দিন কাম', 'ৰুটিন'],
      bn: ['দৈনন্দিন রুটিন', 'আমার রুটিন'],
      ne: ['दैनिक दिनचर्या', 'मेरो दिनचर्या'],
      brx: ['सान्फ्रोमनि हाबा', 'रुतिन'],
      mni: ['নোংমগী থবক', 'রুটিন'],
      lus: ['nitin hna', 'routine'],
      kha: ['kam man ka sngi', 'routine'],
      trp: ['salbrumni samung', 'routine']
    }
  },
  {
    intent: VoiceIntent.OPEN_WHO_IS_THIS,
    route: '/who-is-this',
    label: 'Who Is This',
    aliases: {
      en: ['who is this', 'recognize person', 'identify person', 'face game'],
      hi: ['यह कौन है', 'व्यक्ति को पहचानें', 'चेहरा पहचानें', 'पहचान गेम'],
      as: ['এইজন কোন', 'মানুহ চিনাক্ত কৰক'],
      bn: ['ইনি কে', 'মানুষ চিনুন'],
      ne: ['यो को हो', 'व्यक्ति पहिचान'],
      brx: ['बियो सोर', 'सुबुं सिनायथि'],
      mni: ['মসি কনানো', 'মী শক্তাকপা'],
      lus: ['tunge heihi', 'mi hriat chian'],
      kha: ['une u dei uei', 'ithuh briew'],
      trp: ['obo sabo', 'borok sinimung']
    }
  },
  {
    intent: VoiceIntent.OPEN_SPOT_THE_DIFFERENCE,
    route: '/spot-the-difference',
    label: 'Spot the Difference',
    aliases: {
      en: ['spot the difference', 'find difference', 'difference game', 'spot difference'],
      hi: ['अंतर पहचानें', 'अंतर खोजें', 'फर्क पहचानें', 'डिफरेंस गेम'],
      as: ['পাৰ্থক্য বিচাৰক', 'পাৰ্থক্য উলিয়াওক'],
      bn: ['পার্থক্য খুঁজুন', 'পার্থক্য বের করুন'],
      ne: ['फरक पत्ता लगाउनुहोस्', 'फरक खोज्नुहोस्'],
      brx: ['फारागखौ नागिर', 'फाराग दिहुन'],
      mni: ['খেৎনবা পুথোকউ', 'খেৎনবা থিবা'],
      lus: ['adanglamna zawng rawh', 'danglam zawng'],
      kha: ['shem ia ka jingiapher', 'wad jingiapher'],
      trp: ['slaitwng nangkho', 'kwslai nangkho']
    }
  },
  {
    intent: VoiceIntent.OPEN_COLOR_SEQUENCE,
    route: '/color-sequence',
    label: 'Color Sequence',
    aliases: {
      en: ['color sequence', 'color game', 'sequence game', 'colors'],
      hi: ['रंग क्रम', 'रंग गेम', 'कलर गेम', 'कलर सीक्वेंस'],
      as: ['ৰঙৰ ক্ৰম', 'ৰং খেল'],
      bn: ['রঙের ক্রম', 'রঙের খেলা'],
      ne: ['रङको क्रम', 'रङ खेल'],
      brx: ['गाबनि सिरी', 'गाब गेलेमु'],
      mni: ['মচু শান্নবা', 'মচু'],
      lus: ['rawng indawt', 'rawng games'],
      kha: ['rong pynbeit', 'rong games'],
      trp: ['rong sajagmung', 'rong thwngmung']
    }
  },
  {
    intent: VoiceIntent.GO_BACK,
    route: null,
    label: 'Go Back',
    aliases: {
      en: ['go back', 'back', 'previous', 'return'],
      hi: ['पीछे जाएं', 'वापस', 'पिछला', 'पीछे'],
      as: ['উভতি যাওক', 'পিছলৈ'],
      bn: ['ফিরে যান', 'পিছনে'],
      ne: ['पछाडि जानुहोस्', 'पछाडि'],
      brx: ['उनथिं थां', 'उनथिं'],
      mni: ['হন্দোকউ', 'মমাং'],
      lus: ['let leh', 'hnungah'],
      kha: ['leit phai', 'shadien'],
      trp: ['uplo thangkho', 'uplo']
    }
  },
  {
    intent: VoiceIntent.GO_HOME,
    route: '/',
    label: 'Home',
    aliases: {
      en: ['home', 'go home', 'main page', 'start page'],
      hi: ['होम', 'घर जाएं', 'मुख्य पृष्ठ', 'होम पेज'],
      as: ['হোম', 'মূল পৃষ্ঠালৈ'],
      bn: ['হোম', 'মূল পাতা'],
      ne: ['गृहपृष्ठ', 'मुख्य पृष्ठ'],
      brx: ['न', 'गाहाय बिलाइ'],
      mni: ['হোম', 'মেন পেজ'],
      lus: ['in', 'home page'],
      kha: ['home', 'sla ba hakhmat'],
      trp: ['nok', 'mong bwlai']
    }
  }
];
