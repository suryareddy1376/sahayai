import { LanguageCode } from '../types';
import { bn, te, gu } from './lang_bn';
import { ur, kn, od, ml } from './lang_ur';

export const LANGUAGES = [
  { code: 'hi' as LanguageCode, name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', greeting: 'नमस्ते' },
  { code: 'bn' as LanguageCode, name: 'Bengali', nativeName: 'বাংলা', flag: '🌸', greeting: 'নমস্কার' },
  { code: 'mr' as LanguageCode, name: 'Marathi', nativeName: 'मराठी', flag: '🚩', greeting: 'नमस्कार' },
  { code: 'te' as LanguageCode, name: 'Telugu', nativeName: 'తెలుగు', flag: '🌾', greeting: 'నమస్కారం' },
  { code: 'ta' as LanguageCode, name: 'Tamil', nativeName: 'தமிழ்', flag: '🏛️', greeting: 'வணக்கம்' },
  { code: 'gu' as LanguageCode, name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🦁', greeting: 'નમસ્તે' },
  { code: 'ur' as LanguageCode, name: 'Urdu', nativeName: 'اردو', flag: '☪️', greeting: 'آداب' },
  { code: 'kn' as LanguageCode, name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🐘', greeting: 'ನಮಸ್ಕಾರ' },
  { code: 'od' as LanguageCode, name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🛕', greeting: 'ନମସ୍କାର' },
  { code: 'ml' as LanguageCode, name: 'Malayalam', nativeName: 'മലയാളം', flag: '🌴', greeting: 'നമസ്കാരം' },
  { code: 'en' as LanguageCode, name: 'English', nativeName: 'English', flag: '🌐', greeting: 'Welcome' },
];

export interface TranslationStrings {
  appTagline: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  getStarted: string;
  securePortal: string;
  
  // Stepper
  stepOf: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;
  step6: string;
  back: string;

  // Trust Banner
  trustTitle: string;
  trustSubtitle: string;
  ministryBadge: string;
  noFeeBadge: string;

  // Landing & Voice
  tapToSpeak: string;
  tapToStop: string;
  typeInstead: string;
  listeningNow: string;
  speakPrompt: string;
  audioPlayback: string;
  playingAudio: string;
  examplePromptsTitle: string;
  promptTailor: string;
  promptDairy: string;
  promptGrocery: string;
  promptWelding: string;
  searchingSchemes: string;
  submitNeed: string;
  voiceUnavailableNotice: string;
  addPhoto?: string;
  addDocument?: string;
  attachmentAdded?: string;
  removeAttachment?: string;

  // Scheme Results
  schemeHeroTitle: string;
  whyDoIQualify: string;
  incomeMatch: string;
  projectMatch: string;
  locationMatch: string;
  communityMatch: string;
  nearMatchTitle: string;
  compareButton: string;
  seeEMIButton: string;
  interestRateLabel: string;
  maxAmountLabel: string;
  govtBackedLabel: string;
  selectToCompare: string;
  selectedForComparison: string;

  // EMI Screen
  emiHeroTitle: string;
  monthlyPaymentLabel: string;
  perMonth: string;
  gracePeriodTitle: string;
  gracePeriodDescription: string;
  loanAmountQuestion: string;
  tenureQuestion: string;
  months: string;
  years: string;
  findPartnerCTA: string;
  comparisonHeader: string;
  schemeA: string;
  schemeB: string;
  firstZeroMonths: string;
  totalRepaymentLabel: string;

  // Partner Locator
  partnerTitle: string;
  partnerSubtitle: string;
  activeStatusBadge: string;
  nextNearestBadge: string;
  callBranchCTA: string;
  docsToCarryTitle: string;
  aadhaarDoc: string;
  incomeDoc: string;
  passbookDoc: string;
  businessPhotoDoc: string;
  viewMap: string;
  viewList: string;
  applyHereCTA: string;

  // Confirmation & Tracker
  confirmedTitle: string;
  confirmedSubtitle: string;
  receiptNumberLabel: string;
  timelineTitle: string;
  stageSubmitted: string;
  stageReview: string;
  stageApproved: string;
  submittedDesc: string;
  reviewDesc: string;
  approvedDesc: string;
  smsWhatsappNotice: string;
  phoneLabel: string;
  saveReceiptButton: string;
  startNewButton: string;
}

export const translations: Record<LanguageCode, TranslationStrings> = {
  hi: {
    appTagline: "छोटे शिल्प, दुकान और व्यापार मालिकों के लिए सरकारी वित्तीय योजनाएं।",
    welcomeTitle: "सहाय AI में आपका स्वागत है",
    welcomeSubtitle: "आसानी से सही सरकारी योजनाएं खोजें",
    getStarted: "शुरू करें",
    securePortal: "सुरक्षित नागरिक पोर्टल",
    stepOf: 'कदम',
    step1: 'भाषा और भरोसा',
    step2: 'अपनी ज़रूरत बोलें',
    step3: 'आपके लिए योजनाएं',
    step4: 'मासिक क़िस्त (EMI)',
    step5: 'पास का सरकारी केंद्र',
    step6: 'आवेदन रसीद और ट्रैकर',
    back: 'वापस जाएं',

    trustTitle: 'सरकारी सेवा - पूरी तरह सुरक्षित',
    trustSubtitle: 'यह सामाजिक न्याय एवं अधिकारिता मंत्रालय की सीधी सेवा है। कोई दलाल या बिचौलिया नहीं।',
    ministryBadge: 'भारत सरकार मान्यता प्राप्त',
    noFeeBadge: '100% मुफ़्त सेवा',

    tapToSpeak: 'माइक दबाएं और अपनी ज़रूरत बोलें',
    tapToStop: 'बोलना समाप्त करने के लिए दबाएं',
    typeInstead: 'लिखकर बताना चाहते हैं? यहाँ क्लिक करें',
    listeningNow: 'सुन रहे हैं... कृपया साफ बोलें',
    speakPrompt: 'बताइए आपको अपने काम या दुकान के लिए कितने पैसे चाहिए?',
    audioPlayback: 'बोलकर सुनाएं',
    playingAudio: 'सुनाई दे रहा है...',
    examplePromptsTitle: 'या इन उदाहरणों में से कोई एक चुनें:',
    promptTailor: 'सिलाई की दुकान बढ़ानी है, ₹80,000 चाहिए',
    promptDairy: 'डेयरी के लिए दो गाय/भैंस लेनी हैं, ₹1.5 लाख चाहिए',
    promptGrocery: 'किराने की दुकान का सामान भरना है, ₹50,000 चाहिए',
    promptWelding: 'वेल्डिंग मशीन और औज़ार खरीदने हैं, ₹70,000 चाहिए',
    searchingSchemes: 'आपके लिए सबसे सही सरकारी योजना ढूंढ रहे हैं...',
    submitNeed: 'योजनाएं खोजें',
    voiceUnavailableNotice: 'आवाज़ पहचान समर्थित नहीं है, नीचे टाइप करें या उदाहरण चुनें',
    addPhoto: 'फ़ोटो जोड़ें',
    addDocument: 'दस्तावेज़ / PDF जोड़ें',
    attachmentAdded: 'संलग्नक जोड़ा गया',
    removeAttachment: 'हटाएं',

    schemeHeroTitle: 'आपको ₹1.4 लाख तक की सरकारी योजना में तुरंत मंज़ूरी मिल सकती है!',
    whyDoIQualify: 'यह योजना आपके लिए सही क्यों है?',
    incomeMatch: 'वार्षिक पारिवारिक आय ₹3 लाख से कम है',
    projectMatch: 'छोटे व्यापार और रोज़गार विस्तार के लिए उपयुक्त',
    locationMatch: 'आपके क्षेत्र और वर्ग के लिए विशेष छूट उपलब्ध',
    communityMatch: 'मंत्रालय द्वारा प्राथमिकता प्राप्त श्रेणी',
    nearMatchTitle: 'अगर आप समूह में आवेदन करें, तो ₹2.5 लाख तक मिल सकता है',
    compareButton: 'दो योजनाओं की तुलना करें',
    seeEMIButton: 'मेरी मासिक क़िस्त देखें',
    interestRateLabel: 'सरकारी ब्याज दर',
    maxAmountLabel: 'अधिकतम राशि',
    govtBackedLabel: 'सीधी सरकारी सब्सिडी',
    selectToCompare: 'तुलना के लिए चुनें',
    selectedForComparison: 'तुलना के लिए चुना गया',

    emiHeroTitle: 'हर महीने आपको कितना देना होगा?',
    monthlyPaymentLabel: 'आपकी मासिक क़िस्त',
    perMonth: 'प्रति माह',
    gracePeriodTitle: 'पहले 6 महीने एक भी रुपया नहीं देना!',
    gracePeriodDescription: 'काम शुरू करने और कमाई जमने तक 6 महीने की छूट है। इसके बाद ही आसान क़िस्त शुरू होगी।',
    loanAmountQuestion: 'आपको कितनी राशि चाहिए?',
    tenureQuestion: 'कितने महीनों में लौटाना चाहते हैं?',
    months: 'महीने',
    years: 'साल',
    findPartnerCTA: 'देखें आवेदन कहाँ जमा करना है',
    comparisonHeader: 'दोनों योजनाओं की आसान तुलना',
    schemeA: 'योजना 1',
    schemeB: 'योजना 2',
    firstZeroMonths: 'शुरुआती छूट (₹0)',
    totalRepaymentLabel: 'कुल वापसी राशि',

    partnerTitle: 'आपके सबसे नज़दीक आवेदन केंद्र',
    partnerSubtitle: 'यहाँ जाकर बिना किसी परेशानी के आवेदन जमा करें',
    activeStatusBadge: '🟢 आज आवेदन स्वीकार कर रहे हैं',
    nextNearestBadge: 'निकटतम दूसरा विकल्प',
    callBranchCTA: 'सीधा फोन मिलाएं',
    docsToCarryTitle: 'साथ ले जाने वाले ज़रूरी कागज़ात',
    aadhaarDoc: 'आधार कार्ड की कॉपी',
    incomeDoc: 'आय प्रमाण पत्र या राशन कार्ड',
    passbookDoc: 'बैंक पासबुक की फोटोकॉपी',
    businessPhotoDoc: 'दुकान या काम की फ़ोटो',
    viewMap: 'नक्शा देखें',
    viewList: 'सूची देखें',
    applyHereCTA: 'इस केंद्र पर आवेदन की पुष्टि करें',

    confirmedTitle: 'बधाई! आपका आवेदन सफलतापूर्वक दर्ज हो गया है',
    confirmedSubtitle: 'आपको बैंक में लाइन में नहीं लगना होगा। अधिकारी आपसे संपर्क करेंगे।',
    receiptNumberLabel: 'आवेदन रसीद संख्या (UPI जैसी ट्रैकिंग)',
    timelineTitle: 'आपके आवेदन की स्थिति',
    stageSubmitted: 'आवेदन जमा हुआ',
    stageReview: 'सरकारी अधिकारी द्वारा जांच',
    stageApproved: 'स्वीकृत और खाते में राशि',
    submittedDesc: 'आपका विवरण सीधे नोडल अधिकारी को भेज दिया गया है।',
    reviewDesc: 'कागज़ात सत्यापन जारी है (अनुमानित समय: 2 दिन)',
    approvedDesc: 'स्वीकृति के बाद राशि सीधे बैंक खाते में जमा होगी।',
    smsWhatsappNotice: 'आपको हर प्रगति का WhatsApp और SMS संदेश भेजा जाएगा।',
    phoneLabel: 'आपका मोबाइल नंबर',
    saveReceiptButton: 'रसीद डाउनलोड / साझा करें',
    startNewButton: 'नया आवेदन शुरू करें',
  },

  en: {
    appTagline: "Government financial schemes for small craft, shop & trade owners.",
    welcomeTitle: "Welcome to Sahay AI",
    welcomeSubtitle: "Find the right government schemes easily",
    getStarted: "Get Started",
    securePortal: "Secure Citizen Portal",
    stepOf: 'Step',
    step1: 'Language & Trust',
    step2: 'Speak Your Need',
    step3: 'Matching Schemes',
    step4: 'Monthly Payment (EMI)',
    step5: 'Nearest Partner Branch',
    step6: 'Application Receipt & Tracker',
    back: 'Go Back',

    trustTitle: 'Direct Government Service - Safe & Private',
    trustSubtitle: 'Direct service by Ministry of Social Justice & Empowerment. No agents, zero commission.',
    ministryBadge: 'Govt. of India Recognized',
    noFeeBadge: '100% Free Service',

    tapToSpeak: 'Tap and speak your need',
    tapToStop: 'Tap when finished speaking',
    typeInstead: 'Prefer typing? Click here',
    listeningNow: 'Listening... Please speak clearly',
    speakPrompt: 'Tell us how much money you need and for what business.',
    audioPlayback: 'Read aloud',
    playingAudio: 'Reading out loud...',
    examplePromptsTitle: 'Or pick one of these examples:',
    promptTailor: 'I want to expand my tailoring shop, need ₹80,000',
    promptDairy: 'Need ₹1.5 lakh to purchase two dairy cows/buffaloes',
    promptGrocery: 'Need ₹50,000 to stock inventory for my grocery shop',
    promptWelding: 'Need ₹70,000 for welding machine and hand tools',
    searchingSchemes: 'Finding the right government schemes for you…',
    submitNeed: 'Find Schemes',
    voiceUnavailableNotice: 'Speech recognition not available on this browser. Type below or choose an example.',
    addPhoto: 'Add Photo',
    addDocument: 'Add Document / PDF',
    attachmentAdded: 'Attachment added',
    removeAttachment: 'Remove',

    schemeHeroTitle: 'You qualify for up to ₹1.4 lakh under government-backed support!',
    whyDoIQualify: 'Why do you qualify for this scheme?',
    incomeMatch: 'Household annual income is under ₹5 Lakh',
    projectMatch: 'Your trade/craft matches government expansion focus',
    locationMatch: 'Eligible for special interest subsidy in your district',
    communityMatch: 'Priority category recognized by Social Justice Ministry',
    nearMatchTitle: 'If applying as a group, you could qualify for up to ₹2.5 lakh',
    compareButton: 'Compare 2 Schemes',
    seeEMIButton: 'See My Monthly Payment',
    interestRateLabel: 'Govt. Interest Rate',
    maxAmountLabel: 'Maximum Amount',
    govtBackedLabel: 'Direct Subsidy',
    selectToCompare: 'Select to Compare',
    selectedForComparison: 'Selected for Comparison',

    emiHeroTitle: 'How much do you pay each month?',
    monthlyPaymentLabel: 'Your Monthly Payment',
    perMonth: 'per month',
    gracePeriodTitle: 'Pay ₹0 for the first 6 months (Grace Period)',
    gracePeriodDescription: 'No payments required until your business starts generating income. Pay with ease after 6 months.',
    loanAmountQuestion: 'How much funding do you need?',
    tenureQuestion: 'Over how many months would you like to repay?',
    months: 'months',
    years: 'years',
    findPartnerCTA: 'Find Where to Apply',
    comparisonHeader: 'Side-by-Side Comparison',
    schemeA: 'Scheme 1',
    schemeB: 'Scheme 2',
    firstZeroMonths: 'Grace Period (₹0)',
    totalRepaymentLabel: 'Total Repayment',

    partnerTitle: 'Nearest Verified Partner Branches',
    partnerSubtitle: 'Visit with your documents to submit your application directly',
    activeStatusBadge: '🟢 Actively processing applications today',
    nextNearestBadge: 'Next-nearest option',
    callBranchCTA: 'Tap to Call Branch',
    docsToCarryTitle: 'Documents to carry with you',
    aadhaarDoc: 'Aadhaar Card copy',
    incomeDoc: 'Income Certificate or Ration Card',
    passbookDoc: 'Bank Passbook front page copy',
    businessPhotoDoc: 'Photo of your workplace / shop',
    viewMap: 'View on Map',
    viewList: 'View List',
    applyHereCTA: 'Confirm and Apply Here',

    confirmedTitle: 'Congratulations! Your Application is Registered',
    confirmedSubtitle: 'No long queues at banks. A verified nodal officer will review your submission.',
    receiptNumberLabel: 'Application Reference ID (UPI-style)',
    timelineTitle: 'Application Status Timeline',
    stageSubmitted: 'Submitted Successfully',
    stageReview: 'Official Verification',
    stageApproved: 'Approved & Disbursed',
    submittedDesc: 'Details sent directly to the local nodal channel partner.',
    reviewDesc: 'Document verification in progress (Estimated: 2 days)',
    approvedDesc: 'Sanction amount will be deposited directly into your bank account.',
    smsWhatsappNotice: 'You will receive real-time updates via SMS and WhatsApp.',
    phoneLabel: 'Your Registered Mobile Number',
    saveReceiptButton: 'Download / Share Receipt',
    startNewButton: 'Start Another Application',
  },

  mr: {
    appTagline: "Government financial schemes for small craft, shop & trade owners.",
    welcomeTitle: "Welcome to Sahay AI",
    welcomeSubtitle: "Find the right government schemes easily",
    getStarted: "Get Started",
    securePortal: "Secure Citizen Portal",
    stepOf: 'पायरी',
    step1: 'भाषा आणि विश्वास',
    step2: 'तुमची गरज बोला',
    step3: 'तुमच्यासाठी सरकारी योजना',
    step4: 'मासिक हप्ता (EMI)',
    step5: 'जवळचे अधिकृत केंद्र',
    step6: 'पावती व ट्रॅकर',
    back: 'मागे जा',

    trustTitle: 'थेट सरकारी सेवा - पूर्णपणे सुरक्षित',
    trustSubtitle: 'सामाजिक न्याय आणि सक्षमीकरण मंत्रालयाची अधिकृत सेवा. कोणताही दलाल नाही.',
    ministryBadge: 'भारत सरकार मान्यताप्राप्त',
    noFeeBadge: '१००% मोफत सेवा',

    tapToSpeak: 'माइक दाबा आणि तुमची गरज बोला',
    tapToStop: 'बोलणे संपल्यावर येथे दाबा',
    typeInstead: 'टाइप करायचे आहे का? येथे क्लिक करा',
    listeningNow: 'ऐकत आहोत... कृपया स्पष्ट बोला',
    speakPrompt: 'व्यवसायासाठी किती रक्कम हवी आहे ते सांगा.',
    audioPlayback: 'मोठ्याने ऐका',
    playingAudio: 'वाचत आहोत...',
    examplePromptsTitle: 'किंवा यातील एक उदाहरण निवडा:',
    promptTailor: 'शिंपीकाम वाढवण्यासाठी ₹८०,००० हवे आहेत',
    promptDairy: 'डेअरीसाठी २ म्हशी/गाई घ्यायला ₹१.५ लाख हवे आहेत',
    promptGrocery: 'किराणा दुकानासाठी माल भरायला ₹५०,००० हवे आहेत',
    promptWelding: 'वेल्डिंग मशीन व अवजारे घ्यायला ₹७०,००० हवे आहेत',
    searchingSchemes: 'तुमच्यासाठी योग्य सरकारी योजना शोधत आहोत...',
    submitNeed: 'योजना शोधा',
    voiceUnavailableNotice: 'या ब्राउझरवर आवाज उपलब्ध नाही, खाली लिहा किंवा उदाहरण निवडा',
    addPhoto: 'फोटो जोडा',
    addDocument: 'कागदपत्र / PDF जोडा',
    attachmentAdded: 'संलग्नक जोडले',
    removeAttachment: 'काढून टाका',

    schemeHeroTitle: 'तुम्हाला ₹१.४ लाखांपर्यंतच्या सरकारी योजनेचा थेट लाभ मिळू शकतो!',
    whyDoIQualify: 'ही योजना तुमच्यासाठी का योग्य आहे?',
    incomeMatch: 'वार्षिक कौटुंबिक उत्पन्न ₹५ लाखांपेक्षा कमी आहे',
    projectMatch: 'तुमचा व्यवसाय सरकारी प्राधान्य क्षेत्रात बसतो',
    locationMatch: 'तुमच्या जिल्ह्यासाठी विशेष व्याज सवलत लागू',
    communityMatch: 'मंत्रालयाद्वारे प्राधान्य मिळालेला वर्ग',
    nearMatchTitle: 'गट करून अर्ज केल्यास ₹२.५ लाखांपर्यंत मिळू शकतात',
    compareButton: '२ योजनांची तुलना करा',
    seeEMIButton: 'माझा मासिक हप्ता पहा',
    interestRateLabel: 'सरकारी व्याजदर',
    maxAmountLabel: 'कमाल रक्कम',
    govtBackedLabel: 'थेट सरकारी अनुदान',
    selectToCompare: 'तुलनेसाठी निवडा',
    selectedForComparison: 'तुलनेसाठी निवडले',

    emiHeroTitle: 'दरमहा किती भरावे लागतील?',
    monthlyPaymentLabel: 'तुमचा मासिक हप्ता',
    perMonth: 'दरमहा',
    gracePeriodTitle: 'पहिले ६ महिने एकही रुपया भरू नका!',
    gracePeriodDescription: 'व्यवसाय सुरू होऊन उत्पन्न मिळेपर्यंत ६ महिने पूर्ण सूट. त्यानंतरच सोपा हप्ता सुरू होईल.',
    loanAmountQuestion: 'तुम्हाला किती रकमेची गरज आहे?',
    tenureQuestion: 'किती महिन्यांत परतफेड करायची आहे?',
    months: 'महिने',
    years: 'वर्षे',
    findPartnerCTA: 'अर्ज कुठे जमा करायचा ते पहा',
    comparisonHeader: 'योजनांची सोपी तुलना',
    schemeA: 'योजना १',
    schemeB: 'योजना २',
    firstZeroMonths: 'सुरुवातीची सूट (₹०)',
    totalRepaymentLabel: 'एकूण परतफेड',

    partnerTitle: 'तुमच्या जवळची अधिकृत बँक शाखा',
    partnerSubtitle: 'कागदपत्रे घेऊन जा आणि थेट अर्ज जमा करा',
    activeStatusBadge: '🟢 आज अर्ज स्वीकारत आहेत',
    nextNearestBadge: 'जवळचा दुसरा पर्याय',
    callBranchCTA: 'थेट फोन करा',
    docsToCarryTitle: 'सोबत आणायची कागदपत्रे',
    aadhaarDoc: 'आधार कार्ड प्रत',
    incomeDoc: 'उत्पन्न दाखला किंवा रेशन कार्ड',
    passbookDoc: 'बँक पासबुक पहिल्या पानाची प्रत',
    businessPhotoDoc: 'कामाची किंवा दुकानाची छायाचित्र',
    viewMap: 'नकाशा पहा',
    viewList: 'यादी पहा',
    applyHereCTA: 'या शाखेत अर्ज निश्चित करा',

    confirmedTitle: 'अभिनंदन! तुमचा अर्ज यशस्वीपणे नोंदवला गेला आहे',
    confirmedSubtitle: 'बँकेत रांगेत उभे राहण्याची गरज नाही. सरकारी अधिकारी थेट संपर्क करतील.',
    receiptNumberLabel: 'अर्ज संदर्भ क्रमांक (UPI प्रमाणे)',
    timelineTitle: 'अर्जाची सद्यस्थिती',
    stageSubmitted: 'अर्ज जमा झाला',
    stageReview: 'अधिकारी पडताळणी करत आहेत',
    stageApproved: 'मंजूर व खात्यात जमा',
    submittedDesc: 'माहिती थेट स्थानिक नोडल अधिकाऱ्यांकडे पाठवली आहे.',
    reviewDesc: 'कागदपत्रांची पडताळणी सुरू आहे (अंदाजे २ दिवस)',
    approvedDesc: 'मंजूरीनंतर रक्कम थेट बँक खात्यात जमा केली जाईल.',
    smsWhatsappNotice: 'प्रत्येक अपडेट तुम्हाला SMS आणि WhatsApp वर पाठवले जाईल.',
    phoneLabel: 'नोंदणीकृत मोबाईल नंबर',
    saveReceiptButton: 'पावती डाउनलोड / शेअर करा',
    startNewButton: 'नवीन अर्ज सुरू करा',
  },

  ta: {
    appTagline: "Government financial schemes for small craft, shop & trade owners.",
    welcomeTitle: "Welcome to Sahay AI",
    welcomeSubtitle: "Find the right government schemes easily",
    getStarted: "Get Started",
    securePortal: "Secure Citizen Portal",
    stepOf: 'படி',
    step1: 'மொழி & நம்பிக்கை',
    step2: 'தேவையை பேசவும்',
    step3: 'பொருத்தமான திட்டங்கள்',
    step4: 'மாதத் தவணை (EMI)',
    step5: 'அருகிலுள்ள வங்கி மையம்',
    step6: 'விண்ணப்ப ரசீது & ட்ராக்கர்',
    back: 'பின்செல்ல',

    trustTitle: 'நேரடி அரசு சேவை - பாதுகாப்பானது',
    trustSubtitle: 'சமூக நீதி மற்றும் அதிகாரமளித்தல் அமைச்சகத்தின் நேரடி சேவை. தரகர்கள் இல்லை.',
    ministryBadge: 'இந்திய அரசு அங்கீகாரம்',
    noFeeBadge: '100% இலவச சேவை',

    tapToSpeak: 'மைக்கை அழுத்தி உங்கள் தேவையை பேசுங்கள்',
    tapToStop: 'பேசி முடித்ததும் அழுத்தவும்',
    typeInstead: 'டைப் செய்ய விரும்புகிறீர்களா? இங்கே கிளிக் செய்யவும்',
    listeningNow: 'கேட்கிறது... தெளிவாக பேசவும்',
    speakPrompt: 'உங்கள் தொழில் அல்லது கடைக்கு எவ்வளவு பணம் தேவை என்று சொல்லுங்கள்.',
    audioPlayback: 'ஒலிவடிவில் கேட்க',
    playingAudio: 'படிக்கிறது...',
    examplePromptsTitle: 'அல்லது இவற்றில் ஒன்றை தேர்வு செய்யவும்:',
    promptTailor: 'தையல் கடையை விரிவாக்க ₹80,000 தேவை',
    promptDairy: 'பால் பண்ணைக்கு 2 பசு/எருமை வாங்க ₹1.5 லட்சம் தேவை',
    promptGrocery: 'மளிகைக் கடைக்கு பொருட்கள் வாங்க ₹50,000 தேவை',
    promptWelding: 'வெல்டிங் இயந்திரம் மற்றும் கருவிகள் வாங்க ₹70,000 தேவை',
    searchingSchemes: 'உங்களுக்கான அரசு திட்டங்களை தேடுகிறோம்...',
    submitNeed: 'திட்டங்களை கண்டறிக',
    voiceUnavailableNotice: 'குரல் உள்ளீடு கிடைக்கவில்லை. கீழே தட்டச்சு செய்யவும்.',
    addPhoto: 'புகைப்படம் சேர்க்க',
    addDocument: 'ஆவணம் / PDF சேர்க்க',
    attachmentAdded: 'இணைப்பு சேர்க்கப்பட்டது',
    removeAttachment: 'நீக்கு',

    schemeHeroTitle: 'நீங்கள் ₹1.4 லட்சம் வரை நேரடி அரசு நிதியுதவி பெற தகுதி பெற்றுள்ளீர்கள்!',
    whyDoIQualify: 'இந்த திட்டம் உங்களுக்கு எவ்வாறு பொருந்துகிறது?',
    incomeMatch: 'ஆண்டு குடும்ப வருமானம் ₹5 லட்சத்திற்குள் உள்ளது',
    projectMatch: 'உங்கள் தொழில் அரசு முன்னுரிமை பட்டியலில் உள்ளது',
    locationMatch: 'உங்கள் மாவட்டத்தில் சிறப்பு வட்டி மானியம் கிடைக்கிறது',
    communityMatch: 'அமைச்சகத்தால் முன்னுரிமை அளிக்கப்பட்ட பிரிவு',
    nearMatchTitle: 'குழுவாக விண்ணப்பித்தால் ₹2.5 லட்சம் வரை பெறலாம்',
    compareButton: '2 திட்டங்களை ஒப்பிடுங்கள்',
    seeEMIButton: 'என் மாதத் தவணையை பார்க்க',
    interestRateLabel: 'அரசு வட்டி விகிதம்',
    maxAmountLabel: 'அதிகபட்ச தொகை',
    govtBackedLabel: 'நேரடி அரசு மானியம்',
    selectToCompare: 'ஒப்பிட தேர்வு செய்க',
    selectedForComparison: 'ஒப்பிடப்பட்டது',

    emiHeroTitle: 'மாதம் எவ்வளவு செலுத்த வேண்டும்?',
    monthlyPaymentLabel: 'உங்கள் மாதத் தவணை',
    perMonth: 'மாதந்தோறும்',
    gracePeriodTitle: 'முதல் 6 மாதங்களுக்கு ₹0 (முழு சலுகை)',
    gracePeriodDescription: 'தொழில் ஆரம்பித்து வருமானம் வரும் வரை முதல் 6 மாதங்களுக்கு எதுவும் செலுத்த வேண்டியதில்லை.',
    loanAmountQuestion: 'எவ்வளவு நிதி உதவி தேவை?',
    tenureQuestion: 'எத்தனை மாதங்களில் திருப்பி செலுத்த விரும்புகிறீர்கள்?',
    months: 'மாதங்கள்',
    years: 'ஆண்டுகள்',
    findPartnerCTA: 'எங்கு விண்ணப்பிப்பது என காண்க',
    comparisonHeader: 'திட்டங்களின் எளிய ஒப்பீடு',
    schemeA: 'திட்டம் 1',
    schemeB: 'திட்டம் 2',
    firstZeroMonths: 'தொடக்க சலுகை (₹0)',
    totalRepaymentLabel: 'மொத்த திருப்பி செலுத்தும் தொகை',

    partnerTitle: 'உங்கள் அருகிலுள்ள அதிகாரப்பூர்வ கிளை',
    partnerSubtitle: 'ஆவணங்களுடன் நேரடியாக சென்று விண்ணப்பிக்கலாம்',
    activeStatusBadge: '🟢 இன்று விண்ணப்பங்கள் ஏற்கப்படுகின்றன',
    nextNearestBadge: 'அடுத்த அருகிலுள்ள மையம்',
    callBranchCTA: 'நேரடியாக அழைக்கவும்',
    docsToCarryTitle: 'கொண்டு செல்ல வேண்டிய ஆவணங்கள்',
    aadhaarDoc: 'ஆதார் அட்டை நகல்',
    incomeDoc: 'வருமான சான்றிதழ் அல்லது ரேஷன் அட்டை',
    passbookDoc: 'வங்கி பாஸ்புக் முதல் பக்க நகல்',
    businessPhotoDoc: 'தொழில் அல்லது கடையின் புகைப்படம்',
    viewMap: 'வரைபடத்தில் பார்க்க',
    viewList: 'பட்டியல் பார்க்க',
    applyHereCTA: 'இந்த கிளையில் விண்ணப்பத்தை உறுதி செய்க',

    confirmedTitle: 'வாழ்த்துகள்! உங்கள் விண்ணப்பம் பதிவாகிவிட்டது',
    confirmedSubtitle: 'வங்கிகளில் வரிசையில் நிற்க தேவையில்லை. அதிகாரிகள் உங்களை தொடர்புகொள்வார்கள்.',
    receiptNumberLabel: 'விண்ணப்ப குறிப்பு எண் (UPI போன்றது)',
    timelineTitle: 'விண்ணப்ப நிலை',
    stageSubmitted: 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது',
    stageReview: 'அதிகாரிகளின் சரிபார்ப்பு',
    stageApproved: 'அங்கீகரிக்கப்பட்டு பணம் விடுவிக்கப்பட்டது',
    submittedDesc: 'உங்கள் விவரங்கள் உள்ளூர் அதிகாரிகளுக்கு அனுப்பப்பட்டுள்ளன.',
    reviewDesc: 'ஆவணங்கள் சரிபார்க்கப்படுகின்றன (சுமார் 2 நாட்கள்)',
    approvedDesc: 'அங்கீகரிக்கப்பட்ட தொகை நேரடியாக வங்கிக் கணக்கில் வரவு வைக்கப்படும்.',
    smsWhatsappNotice: 'அனைத்து விவரங்களும் உங்கள் SMS மற்றும் WhatsApp-க்கு வரும்.',
    phoneLabel: 'பதிவு செய்யப்பட்ட கைபேசி எண்',
    saveReceiptButton: 'ரசீதை பதிவிறக்கம் / பகிரவும்',
    startNewButton: 'புதிய விண்ணப்பம் தொடங்கவும்',
  },

  bn,
  te,
  gu,
  ur,
  kn,
  od,
  ml,
};
