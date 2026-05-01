import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, getDocs, addDoc, deleteDoc, collection, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDE5oBy6O0U6i08BtsFGidDKJV7EGaw6ws",
  authDomain: "edusolve4u-386bf.firebaseapp.com",
  projectId: "edusolve4u-386bf",
  storageBucket: "edusolve4u-386bf.firebasestorage.app",
  messagingSenderId: "758675759598",
  appId: "1:758675759598:web:c223ac22ff72b7cabaeeff",
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// ─── DATA ────────────────────────────────────────────────────────────────────
const SUBJECTS = [
  { name: "Physics", icon: "⚛️", color: "#4facfe" },
  { name: "Chemistry", icon: "🧪", color: "#43e97b" },
  { name: "Mathematics", icon: "📐", color: "#6c63ff" },
  { name: "Biology", icon: "🧬", color: "#f7971e" },
  { name: "Social Science", icon: "🌍", color: "#ff6584" },
  { name: "English", icon: "📖", color: "#c471f5" },
  { name: "Computer Science", icon: "💻", color: "#38f9d7" },
  { name: "History", icon: "🏛️", color: "#ffd700" },
  { name: "Geography", icon: "🗺️", color: "#43e97b" },
  { name: "Economics", icon: "📊", color: "#ff6584" },
];

const CHAPTERS = {
  Physics: ["Motion", "Laws of Motion", "Electricity", "Light", "Sound", "Magnetism", "Thermodynamics", "Optics"],
  Chemistry: ["Acids & Bases", "Metals & Non-metals", "Carbon Compounds", "Chemical Reactions", "Periodic Table", "Electrochemistry"],
  Mathematics: ["Real Numbers", "Polynomials", "Quadratic Equations", "Triangles", "Circles", "Statistics", "Trigonometry", "Coordinate Geometry"],
  Biology: ["Cell", "Tissues", "Life Processes", "Heredity", "Evolution", "Ecosystems", "Reproduction"],
  "Social Science": ["History", "Geography", "Civics", "Economics"],
  English: ["Grammar", "Comprehension", "Writing", "Literature"],
  "Computer Science": ["Algorithms", "Databases", "Networks", "Programming"],
  History: ["Ancient India", "Medieval India", "Modern India", "World History"],
  Geography: ["Physical Geography", "Climate", "Resources", "Agriculture"],
  Economics: ["Development", "Money & Banking", "Consumer Rights", "Globalisation"],
};

const CLASSES = ["6","7","8","9","10","11","12"];
const DIFFICULTIES = ["easy","medium","hard"];
const YEARS = ["2024","2023","2022","2021","2020","2019","2018"];

const EXAM_HUBS = [
  {
    id: "jee", name: "JEE", full: "Joint Entrance Exam", icon: "⚡", color: "#4facfe",
    desc: "Engineering entrance for IITs, NITs and top engineering colleges",
    subjects: ["Physics","Chemistry","Mathematics"],
    books: [
      { title: "HC Verma - Concepts of Physics Vol 1", subject: "Physics", url: "https://archive.org/search?query=HC+Verma+Physics" },
      { title: "HC Verma - Concepts of Physics Vol 2", subject: "Physics", url: "https://archive.org/search?query=HC+Verma+Physics+2" },
      { title: "NCERT Chemistry Class 11", subject: "Chemistry", url: "https://ncert.nic.in/textbook.php?kech1=0-16" },
      { title: "NCERT Chemistry Class 12", subject: "Chemistry", url: "https://ncert.nic.in/textbook.php?lech1=0-16" },
      { title: "RD Sharma Mathematics", subject: "Mathematics", url: "https://archive.org/search?query=RD+Sharma+Mathematics" },
      { title: "Arihant 40 Years JEE Papers", subject: "Mixed", url: "https://archive.org/search?query=JEE+previous+papers" },
    ],
    papers: [
      { title: "JEE Main 2024 — January Session", type: "pyq", year: "2024", url: "https://jeemain.nta.ac.in/webinfo2024/Page/Page?PageId=1&LangId=P" },
      { title: "JEE Main 2023 — All Shifts", type: "pyq", year: "2023", url: "https://jeemain.nta.ac.in/webinfo2023/Page/Page?PageId=1&LangId=P" },
      { title: "JEE Main 2022 Question Paper", type: "pyq", year: "2022", url: "https://jeemain.nta.ac.in/webinfo2022/Page/Page?PageId=1&LangId=P" },
      { title: "JEE Advanced 2024 Paper 1 & 2", type: "pyq", year: "2024", url: "https://jeeadv.ac.in/past_qps.html" },
      { title: "JEE Advanced 2023 Paper 1 & 2", type: "pyq", year: "2023", url: "https://jeeadv.ac.in/past_qps.html" },
      { title: "JEE Main Sample Paper — Physics", type: "sample", year: "2024", url: "https://jeemain.nta.ac.in/webinfo2024/Page/Page?PageId=1&LangId=P" },
      { title: "JEE Main Sample Paper — Chemistry", type: "sample", year: "2024", url: "https://jeemain.nta.ac.in/webinfo2024/Page/Page?PageId=1&LangId=P" },
      { title: "JEE Main Sample Paper — Maths", type: "sample", year: "2024", url: "https://jeemain.nta.ac.in/webinfo2024/Page/Page?PageId=1&LangId=P" },
    ]
  },
  {
    id: "neet", name: "NEET", full: "National Eligibility cum Entrance Test", icon: "🧬", color: "#43e97b",
    desc: "Medical entrance for MBBS, BDS and other medical courses",
    subjects: ["Physics","Chemistry","Biology"],
    books: [
      { title: "NCERT Biology Class 11", subject: "Biology", url: "https://ncert.nic.in/textbook.php?kebo1=0-22" },
      { title: "NCERT Biology Class 12", subject: "Biology", url: "https://ncert.nic.in/textbook.php?lebo1=0-16" },
      { title: "DC Pandey Physics for NEET", subject: "Physics", url: "https://archive.org/search?query=DC+Pandey+Physics+NEET" },
      { title: "MS Chauhan Organic Chemistry", subject: "Chemistry", url: "https://archive.org/search?query=MS+Chauhan+Organic+Chemistry" },
      { title: "MTG 33 Years NEET Papers", subject: "Mixed", url: "https://archive.org/search?query=NEET+previous+papers" },
    ],
    papers: [
      { title: "NEET 2024 Official Question Paper", type: "pyq", year: "2024", url: "https://neet.nta.nic.in/" },
      { title: "NEET 2023 Question Paper with Solutions", type: "pyq", year: "2023", url: "https://neet.nta.nic.in/" },
      { title: "NEET 2022 Question Paper", type: "pyq", year: "2022", url: "https://neet.nta.nic.in/" },
      { title: "NEET 2021 Question Paper", type: "pyq", year: "2021", url: "https://neet.nta.nic.in/" },
      { title: "NEET Sample Paper — Biology", type: "sample", year: "2024", url: "https://neet.nta.nic.in/" },
      { title: "NEET Sample Paper — Physics & Chemistry", type: "sample", year: "2024", url: "https://neet.nta.nic.in/" },
      { title: "NEET Mock Test — Full Syllabus", type: "sample", year: "2024", url: "https://neet.nta.nic.in/" },
    ]
  },
  {
    id: "upsc", name: "UPSC", full: "Union Public Service Commission", icon: "🏛️", color: "#f7971e",
    desc: "Civil services exam for IAS, IPS, IFS and other central services",
    subjects: ["History","Geography","Economics","Social Science"],
    books: [
      { title: "NCERT Ancient India - RS Sharma", subject: "History", url: "https://archive.org/search?query=NCERT+Ancient+India" },
      { title: "Indian Polity - M Laxmikanth", subject: "Social Science", url: "https://archive.org/search?query=Laxmikanth+Indian+Polity" },
      { title: "Indian Economy - Ramesh Singh", subject: "Economics", url: "https://archive.org/search?query=Ramesh+Singh+Indian+Economy" },
      { title: "Certificate Physical Geography - GC Leong", subject: "Geography", url: "https://archive.org/search?query=GC+Leong+Geography" },
      { title: "UPSC Previous Year Papers", subject: "Mixed", url: "https://upsc.gov.in/examinations/previous-question-papers" },
    ],
    papers: [
      { title: "UPSC Civil Services Prelims 2024 — GS Paper 1", type: "pyq", year: "2024", url: "https://upsc.gov.in/examinations/previous-question-papers" },
      { title: "UPSC Civil Services Prelims 2023 — GS Paper 1", type: "pyq", year: "2023", url: "https://upsc.gov.in/examinations/previous-question-papers" },
      { title: "UPSC Civil Services Prelims 2022", type: "pyq", year: "2022", url: "https://upsc.gov.in/examinations/previous-question-papers" },
      { title: "UPSC Mains 2024 — GS Papers 1-4", type: "pyq", year: "2024", url: "https://upsc.gov.in/examinations/previous-question-papers" },
      { title: "UPSC Mains 2023 — GS Papers 1-4", type: "pyq", year: "2023", url: "https://upsc.gov.in/examinations/previous-question-papers" },
      { title: "UPSC CSAT Sample Paper 2024", type: "sample", year: "2024", url: "https://upsc.gov.in/examinations/previous-question-papers" },
      { title: "UPSC Mock Test — Indian History & Polity", type: "sample", year: "2024", url: "https://upsc.gov.in/examinations/previous-question-papers" },
    ]
  },
  {
    id: "boards", name: "Boards", full: "CBSE / ICSE / State Boards", icon: "📚", color: "#c471f5",
    desc: "Class 10 and Class 12 board exam preparation for all boards",
    subjects: ["Physics","Chemistry","Mathematics","Biology","English","Social Science"],
    books: [
      { title: "NCERT Mathematics Class 10", subject: "Mathematics", url: "https://ncert.nic.in/textbook.php?jemh1=0-15" },
      { title: "NCERT Science Class 10", subject: "Science", url: "https://ncert.nic.in/textbook.php?jesc1=0-16" },
      { title: "NCERT Mathematics Class 12", subject: "Mathematics", url: "https://ncert.nic.in/textbook.php?lemh1=0-13" },
      { title: "NCERT Physics Class 12", subject: "Physics", url: "https://ncert.nic.in/textbook.php?leph1=0-15" },
      { title: "Together With Science Class 10", subject: "Science", url: "https://archive.org/search?query=Together+With+Science+Class+10" },
    ],
    papers: [
      { title: "CBSE Class 10 Maths Board Paper 2024", type: "pyq", year: "2024", url: "https://cbseacademic.nic.in/SQP_CLASSX_2023-24.html" },
      { title: "CBSE Class 10 Science Board Paper 2024", type: "pyq", year: "2024", url: "https://cbseacademic.nic.in/SQP_CLASSX_2023-24.html" },
      { title: "CBSE Class 12 Physics Board Paper 2024", type: "pyq", year: "2024", url: "https://cbseacademic.nic.in/SQP_CLASSXII_2023-24.html" },
      { title: "CBSE Class 12 Chemistry Board Paper 2024", type: "pyq", year: "2024", url: "https://cbseacademic.nic.in/SQP_CLASSXII_2023-24.html" },
      { title: "CBSE Class 12 Maths Board Paper 2024", type: "pyq", year: "2024", url: "https://cbseacademic.nic.in/SQP_CLASSXII_2023-24.html" },
      { title: "CBSE Class 10 Sample Paper 2024-25", type: "sample", year: "2025", url: "https://cbseacademic.nic.in/SQP_CLASSX_2024-25.html" },
      { title: "CBSE Class 12 Sample Paper 2024-25", type: "sample", year: "2025", url: "https://cbseacademic.nic.in/SQP_CLASSXII_2024-25.html" },
      { title: "CBSE Class 10 Science Sample Paper 2025", type: "sample", year: "2025", url: "https://cbseacademic.nic.in/SQP_CLASSX_2024-25.html" },
    ]
  },
];

const SEED_QUESTIONS = [
  { subject: "Physics", chapter: "Motion", class: "9", type: "mcq", difficulty: "easy", text: "Which is a scalar quantity?", options: ["Velocity","Force","Speed","Displacement"], answer: 2, source: "admin", exam: "boards", year: "2023", explanation: "Speed has only magnitude, no direction." },
  { subject: "Mathematics", chapter: "Real Numbers", class: "10", type: "mcq", difficulty: "medium", text: "HCF of 96 and 404 is:", options: ["2","4","8","12"], answer: 1, source: "admin", exam: "boards", year: "2022", explanation: "96=2⁵×3, 404=2²×101, HCF=4" },
  { subject: "Chemistry", chapter: "Acids & Bases", class: "10", type: "mcq", difficulty: "easy", text: "pH of pure water is:", options: ["5","7","9","11"], answer: 1, source: "admin", exam: "boards", year: "2023", explanation: "Pure water is neutral, pH=7" },
  { subject: "Biology", chapter: "Cell", class: "9", type: "mcq", difficulty: "easy", text: "Powerhouse of the cell is:", options: ["Nucleus","Ribosome","Mitochondria","Golgi body"], answer: 2, source: "admin", exam: "neet", year: "2022", explanation: "Mitochondria produces ATP." },
  { subject: "Physics", chapter: "Electricity", class: "10", type: "mcq", difficulty: "hard", text: "Resistance doubles when length is:", options: ["Halved","Doubled","Quadrupled","Unchanged"], answer: 1, source: "admin", exam: "jee", year: "2021", explanation: "R∝L, doubling L doubles R." },
  { subject: "Chemistry", chapter: "Periodic Table", class: "11", type: "mcq", difficulty: "medium", text: "Most electronegative element is:", options: ["Oxygen","Chlorine","Fluorine","Nitrogen"], answer: 2, source: "admin", exam: "jee", year: "2023", explanation: "Fluorine has highest electronegativity." },
  { subject: "History", chapter: "Modern India", class: "12", type: "mcq", difficulty: "medium", text: "Salt March was in which year?", options: ["1928","1930","1932","1935"], answer: 1, source: "admin", exam: "upsc", year: "2020", explanation: "Dandi March was in 1930." },
];

const calcPoints = (score, timeTaken, totalQ) => Math.round((score/100)*totalQ*10 + Math.max(0,100-Math.floor(timeTaken/10))*0.3);
const AVATAR_COLORS = ["#6c63ff","#ff6584","#43e97b","#f7971e","#4facfe","#c471f5","#38f9d7"];
const avatarColor = (id) => { let h=0; for(let c of (id||"x")) h+=c.charCodeAt(0); return AVATAR_COLORS[h%AVATAR_COLORS.length]; };
const fsGetAll = async (col) => { const snap = await getDocs(collection(db,col)); return snap.docs.map(d=>({id:d.id,...d.data()})); };
const fsAdd = async (col,data) => addDoc(collection(db,col),{...data,createdAt:serverTimestamp()});
const fsSet = async (col,id,data) => setDoc(doc(db,col,id),data,{merge:true});
const fsDel = async (col,id) => deleteDoc(doc(db,col,id));
const fsGet = async (col,id) => { const d=await getDoc(doc(db,col,id)); return d.exists()?{id:d.id,...d.data()}:null; };

const seedIfEmpty = async () => {
  const snap = await getDocs(collection(db,"questions"));
  if(snap.empty) for(const q of SEED_QUESTIONS) await fsAdd("questions",q);
};

// ════════════════════════════════════════════════════════════════════════════
// ─── AI PROMPT GENERATOR ─────────────────────────────────────────────────────
function getAIPrompt(subject, chapter, difficulty, type) {
  const base = `class 10 ${subject} topic: ${chapter}, difficulty: ${difficulty}`;
  const json = (fields) => JSON.stringify(fields);
  if (type === "mcq") return `Create one MCQ for ${base}. Respond with ONLY raw JSON, no markdown, no backticks: ${json({text:"question?",options:["A","B","C","D"],answer:1,explanation:"reason",type:"mcq",marks:1,hotspot:false})}`;
  if (type === "short2") return `Create one 2-mark short answer question for ${base}. Respond with ONLY raw JSON: ${json({text:"question?",answer:"model answer in 2-3 lines",explanation:"key points",type:"short",marks:2,hotspot:false})}`;
  if (type === "short3") return `Create one 3-mark short answer question for ${base}. Respond with ONLY raw JSON: ${json({text:"question?",answer:"model answer in 3-4 lines",explanation:"examiner tips",type:"short",marks:3,hotspot:false})}`;
  if (type === "long4") return `Create one 4-mark long answer question for ${base}. Respond with ONLY raw JSON: ${json({text:"question?",answer:"detailed model answer",explanation:"marks breakdown",type:"long",marks:4,hotspot:false})}`;
  if (type === "long5") return `Create one 5-mark long answer question for ${base}. Respond with ONLY raw JSON: ${json({text:"question?",answer:"comprehensive model answer",explanation:"full marks tips",type:"long",marks:5,hotspot:false})}`;
  if (type === "case") return `Create one case study question for ${base}. Respond with ONLY raw JSON: ${json({text:"[scenario]. Based on above: (i) q1 (ii) q2 (iii) q3",answer:"(i) a1 (ii) a2 (iii) a3",explanation:"concepts tested",type:"case",marks:4,hotspot:false})}`;
  if (type === "hotspot") return `Create one HIGH PROBABILITY CBSE board MCQ for ${base}. Respond with ONLY raw JSON: ${json({text:"question?",options:["A","B","C","D"],answer:1,explanation:"reason + why frequently asked",type:"mcq",marks:1,hotspot:true})}`;
  return `Create one MCQ for ${base}. Respond with ONLY raw JSON: ${json({text:"question?",options:["A","B","C","D"],answer:1,explanation:"reason",type:"mcq",marks:1,hotspot:false})}`;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [page, setPage] = useState("home");
  const [examConfig, setExamConfig] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const [examHub, setExamHub] = useState(null);

  useEffect(() => {
    seedIfEmpty();
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if(user) { const p=await fsGet("users",user.uid); setUserProfile(p); }
      else setUserProfile(null);
      setAppLoading(false);
    });
    return unsub;
  }, []);

  const showToast = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };
  const navigate = (p,extra={}) => { setPage(p); if(extra.config) setExamConfig(extra.config); if(extra.result) setExamResult(extra.result); if(extra.hub) setExamHub(extra.hub); window.scrollTo(0,0); };

  const handleLogin = async (email,password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth,email,password);
      const profile = await fsGet("users",cred.user.uid);
      setUserProfile(profile);
      navigate("dashboard");
      showToast(`Welcome back, ${profile?.name?.split(" ")[0]}! 👋`);
    } catch { showToast("Invalid email or password","error"); }
  };

  const handleRegister = async (data) => {
    // Validate inputs
    if (!data.name || data.name.trim().length < 2) { showToast("Please enter your full name","error"); return; }
    if (!data.email || !data.email.includes("@") || !data.email.includes(".")) { showToast("Please enter a valid email address","error"); return; }
    if (!data.password || data.password.length < 6) { showToast("Password must be at least 6 characters","error"); return; }
    try {
      const cred = await createUserWithEmailAndPassword(auth,data.email,data.password);
      const profile = { uid:cred.user.uid, name:data.name.trim(), email:data.email, class:data.class, role:"student", avatar:data.name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() };
      await fsSet("users",cred.user.uid,profile);
      setUserProfile(profile);
      navigate("dashboard");
      showToast(`Welcome, ${data.name.split(" ")[0]}! 🎉`);
    } catch(e) {
      if(e.message?.includes("email-already-in-use")) showToast("This email is already registered. Please login.","error");
      else if(e.message?.includes("invalid-email")) showToast("Invalid email address","error");
      else if(e.message?.includes("weak-password")) showToast("Password is too weak. Use at least 6 characters","error");
      else showToast("Registration failed. Please try again.","error");
    }
  };

  const handleLogout = async () => { await signOut(auth); setUserProfile(null); navigate("home"); };

  const handleExamFinish = async (result) => {
    await fsAdd("results",{userId:currentUser.uid,...result,date:Date.now()});
    navigate("result",{result});
  };

  const handleAddQuestion = async (q) => {
    await fsAdd("questions",{...q,source:userProfile?.role||"teacher"});
    showToast("Question added! ✅");
    navigate("admin");
  };

  const handleDeleteQuestion = async (id) => { await fsDel("questions",id); showToast("Question deleted"); };

  const handleAIQuestion = async (subject,chapter,difficulty,aiType="mcq") => {
    showToast("AI generating question… ✨");
    try {
      const GEMINI_KEY = process.env.REACT_APP_GEMINI_KEY;
      if(!GEMINI_KEY) { showToast("Add REACT_APP_GEMINI_KEY in Vercel settings","error"); return; }
      
      const promptMap = {
        mcq: `Create one MCQ for class 10 ${subject} - ${chapter} at ${difficulty} difficulty. Respond with ONLY this JSON: {"text":"question?","options":["A","B","C","D"],"answer":1,"explanation":"reason","type":"mcq","marks":1,"hotspot":false}`,
        short2: `Create one 2-mark short answer question for class 10 ${subject} - ${chapter} at ${difficulty} difficulty. Respond with ONLY this JSON: {"text":"question?","answer":"model answer in 2-3 lines","explanation":"key points","type":"short","marks":2,"hotspot":false}`,
        short3: `Create one 3-mark short answer question for class 10 ${subject} - ${chapter} at ${difficulty} difficulty. Respond with ONLY this JSON: {"text":"question?","answer":"model answer in 3-4 lines","explanation":"key points","type":"short","marks":3,"hotspot":false}`,
        long4: `Create one 4-mark long answer question for class 10 ${subject} - ${chapter} at ${difficulty} difficulty. Respond with ONLY this JSON: {"text":"question?","answer":"detailed model answer","explanation":"marks breakdown","type":"long","marks":4,"hotspot":false}`,
        long5: `Create one 5-mark long answer question for class 10 ${subject} - ${chapter} at ${difficulty} difficulty. Respond with ONLY this JSON: {"text":"question?","answer":"comprehensive model answer","explanation":"full marks tips","type":"long","marks":5,"hotspot":false}`,
        case: `Create one case study question for class 10 ${subject} - ${chapter}. Respond with ONLY this JSON: {"text":"[Short scenario]. Based on the above: (i) sub-question1 (ii) sub-question2 (iii) sub-question3","answer":"(i) answer1 (ii) answer2 (iii) answer3","explanation":"concepts tested","type":"case","marks":4,"hotspot":false}`,
        hotspot: `Create one HIGH PROBABILITY CBSE board exam MCQ for class 10 ${subject} - ${chapter}. Respond with ONLY this JSON: {"text":"question?","options":["A","B","C","D"],"answer":1,"explanation":"reason + why frequently asked","type":"mcq","marks":1,"hotspot":true}`,
      };
      const prompt = promptMap[aiType] || promptMap.mcq;
      
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
        {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            contents:[{parts:[{text: prompt}]}],
            generationConfig:{temperature:0.3, maxOutputTokens:1024},
          }),
        }
      );
      
      const data = await res.json();
      
      // Check for API errors
      if(data.error) { showToast("API Error: "+data.error.message,"error"); return; }
      
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text||"";
      if(!raw) { showToast("AI returned empty. Check your API key in Vercel settings.","error"); return; }
      
      // Extract JSON from response
      let parsed = null;
      const cleaned = raw.replace(/```json|```/g,"").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if(jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } 
        catch { showToast("Could not parse response. Try again.","error"); return; }
      } else {
        showToast("No JSON found in response. Try again.","error"); return;
      }
      
      if(!parsed||!parsed.text) { showToast("Invalid format. Try again.","error"); return; }
      
      // Save with correct type info
      const isSubjective = aiType==="short2"||aiType==="short3"||aiType==="long4"||aiType==="long5"||aiType==="case";
      const qType = aiType==="short2"||aiType==="short3"?"short":aiType==="long4"||aiType==="long5"?"long":aiType==="case"?"case":"mcq";
      const marks = aiType==="short2"?2:aiType==="short3"?3:aiType==="long4"?4:aiType==="long5"?5:aiType==="case"?4:1;
      
      // Determine class from subject context
      const subjectClassMap = {
        "Physics":"11","Chemistry":"11","Biology":"11","History":"11",
        "Geography":"11","Economics":"11","Computer Science":"11",
        "Mathematics":"10","Science":"10","Social Science":"10","English":"10",
      };
      const questionClass = subjectClassMap[subject] || "10";
      await fsAdd("questions",{
        subject, chapter, class:questionClass, difficulty, source:"ai",
        exam:"boards", year:new Date().getFullYear().toString(),
        type: qType, marks, hotspot: aiType==="hotspot",
        ...parsed,
        options: isSubjective ? [] : (parsed.options||[]),
      });
      showToast("Question generated & saved! 🤖");
    } catch(e) { showToast("Error: "+e.message,"error"); }
  };

  if(appLoading) return <Loader/>;

  const props = {currentUser,userProfile,navigate,showToast,handleLogin,handleRegister,handleLogout,handleExamFinish,handleAddQuestion,handleDeleteQuestion,handleAIQuestion,examConfig,examResult,examHub};

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",color:"#e8e8f0",fontFamily:"'DM Sans',sans-serif",overflowX:"hidden"}}>
      <style>{GLOBAL_CSS}</style>
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      {page==="home"&&<HomePage {...props}/>}
      {page==="login"&&<LoginPage {...props}/>}
      {page==="register"&&<RegisterPage {...props}/>}
      {page==="dashboard"&&<DashboardPage {...props}/>}
      {page==="buildtest"&&<BuildTestPage {...props}/>}
      {page==="exam"&&<ExamPage {...props}/>}
      {page==="result"&&<ResultPage {...props}/>}
      {page==="leaderboard"&&<LeaderboardPage {...props}/>}
      {currentUser&&<StudyChatBot userProfile={userProfile}/>}
      {page==="admin"&&<AdminPage {...props}/>}
      {page==="addQuestion"&&<AddQuestionPage {...props}/>}
      {page==="papergen"&&<PaperGeneratorPage {...props}/>}
      {page==="search"&&<SearchPage {...props}/>}
      {page==="examhub"&&<ExamHubPage {...props}/>}
      {page==="books"&&<BooksPage {...props}/>}
    </div>
  );
}

// ─── LOADER ───────────────────────────────────────────────────────────────────
function Loader() {
  return <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
    <div className="spin" style={{width:48,height:48,border:"3px solid #2a2a3e",borderTop:"3px solid #6c63ff",borderRadius:"50%"}}/>
    <div style={{color:"#7878a0",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>Loading EduSolve4U…</div>
  </div>;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({msg,type}) {
  return <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,background:type==="error"?"#ff6584":"#43e97b",color:"#0a0a0f",padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.4)",animation:"slideUp 0.3s ease"}}>{msg}</div>;
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({userProfile,navigate,handleLogout}) {
  const [menuOpen,setMenuOpen] = useState(false);
  return (
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"0 5%",height:68,display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(10,10,15,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid #2a2a3e"}}>
      <div onClick={()=>navigate("home")} style={{cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1.4rem",letterSpacing:"-0.5px"}}>
        <span style={{background:"linear-gradient(135deg,#6c63ff,#ff6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>EduSolve</span><span style={{color:"#43e97b"}}>4U</span>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <NavBtn onClick={()=>navigate("examhub")} label="🎯 Exam Hubs"/>
        <NavBtn onClick={()=>navigate("search")} label="🔍 Search"/>
        <NavBtn onClick={()=>navigate("leaderboard")} label="🏆 Leaderboard"/>
        {userProfile?(
          <>
            <NavBtn onClick={()=>navigate("dashboard")} label="Dashboard"/>
            {(userProfile.role==="admin"||userProfile.role==="teacher")&&<NavBtn onClick={()=>navigate("admin")} label="⚙️ Admin"/>}
            <div style={{width:34,height:34,borderRadius:"50%",background:avatarColor(userProfile.uid||"x"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>{userProfile.avatar}</div>
            <button onClick={handleLogout} className="btn-ghost">Logout</button>
          </>
        ):(
          <>
            <NavBtn onClick={()=>navigate("login")} label="Login"/>
            <button onClick={()=>navigate("register")} className="btn-primary-sm">Sign Up Free</button>
          </>
        )}
      </div>
    </nav>
  );
}
const NavBtn = ({onClick,label}) => <button onClick={onClick} style={{background:"none",border:"none",color:"#7878a0",cursor:"pointer",fontSize:13,fontWeight:500,padding:"6px 10px",borderRadius:8,transition:"color 0.2s",fontFamily:"'DM Sans',sans-serif"}} onMouseEnter={e=>e.target.style.color="#e8e8f0"} onMouseLeave={e=>e.target.style.color="#7878a0"}>{label}</button>;

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomePage({navigate,userProfile,handleLogout}) {
  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"8rem 5% 4rem",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 70% 60% at 50% 0%,rgba(108,99,255,0.25) 0%,transparent 70%),radial-gradient(ellipse 40% 40% at 80% 70%,rgba(255,101,132,0.12) 0%,transparent 60%),radial-gradient(ellipse 30% 30% at 20% 80%,rgba(67,233,123,0.08) 0%,transparent 60%)"}}/>
        <div style={{position:"relative",zIndex:1,maxWidth:860}}>
          <div className="badge-pill">✦ India's Smartest Exam Platform</div>
          <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:"clamp(2.8rem,6vw,5rem)",fontWeight:800,lineHeight:1.0,letterSpacing:"-3px",margin:"1.5rem 0"}}>
            Crack JEE, NEET,<br/>UPSC &amp; Boards with<br/><span style={{background:"linear-gradient(135deg,#6c63ff,#ff6584,#f7971e)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>EduSolve4U</span>
          </h1>
          <p style={{fontSize:"1.15rem",color:"#7878a0",maxWidth:560,margin:"0 auto 2.5rem",lineHeight:1.7}}>Smart practice tests, AI-generated questions, real-time leaderboards and curated books — all in one place.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:"3.5rem"}}>
            <button onClick={()=>navigate(userProfile?"dashboard":"register")} className="btn-primary" style={{fontSize:"1rem",padding:"13px 28px"}}>🎯 Start Practising Free</button>
            <button onClick={()=>navigate("examhub")} className="btn-secondary" style={{fontSize:"1rem",padding:"13px 28px"}}>🏛️ Explore Exam Hubs</button>
          </div>
          <div style={{display:"flex",gap:40,justifyContent:"center",flexWrap:"wrap"}}>
            {[["50K+","Questions"],["4","Exam Hubs"],["Real-time","Leaderboard"],["100%","Free"]].map(([n,l])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:"2rem",fontWeight:800,background:"linear-gradient(135deg,#6c63ff,#ff6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{n}</div>
                <div style={{fontSize:13,color:"#7878a0"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeChatSection userProfile={userProfile}/>

      {/* Exam Hubs Preview */}
      <section style={{padding:"5rem 5%",background:"#0d0d14"}}>
        <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
          <div className="section-label">Exam Hubs</div>
          <h2 className="section-title">Prepare for <span style={{color:"#6c63ff"}}>Your Target Exam</span></h2>
          <p style={{color:"#7878a0",marginTop:8}}>Dedicated practice zones, books and questions for each exam</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16,maxWidth:1100,margin:"0 auto"}}>
          {EXAM_HUBS.map(hub=>(
            <div key={hub.id} onClick={()=>navigate("examhub",{hub})} style={{background:"#12121a",border:`1px solid ${hub.color}33`,borderRadius:20,padding:"1.75rem",cursor:"pointer",transition:"all 0.25s"}} className="hub-card">
              <div style={{fontSize:"2.5rem",marginBottom:12}}>{hub.icon}</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1.4rem",color:hub.color,marginBottom:4}}>{hub.name}</div>
              <div style={{fontWeight:600,fontSize:13,marginBottom:8,color:"#e8e8f0"}}>{hub.full}</div>
              <p style={{color:"#7878a0",fontSize:13,lineHeight:1.6}}>{hub.desc}</p>
              <div style={{marginTop:14,display:"flex",gap:6,flexWrap:"wrap"}}>
                {hub.subjects.slice(0,3).map(s=><span key={s} style={{background:`${hub.color}22`,color:hub.color,border:`1px solid ${hub.color}44`,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:600}}>{s}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{padding:"5rem 5%"}}>
        <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything You Need to <span style={{color:"#43e97b"}}>Top Your Exam</span></h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16,maxWidth:1100,margin:"0 auto"}}>
          {[["🎯","Smart Test Builder","Card-based subject & chapter picker with difficulty control","rgba(108,99,255,0.1)"],["🔍","Question Search","Search by subject, chapter, exam, difficulty and year","rgba(67,233,123,0.1)"],["🏆","Live Leaderboard","Ranked by score + speed. Compete with real students nationwide","rgba(255,215,0,0.1)"],["🤖","AI Questions","Gemini AI generates fresh curriculum-aligned MCQs instantly","rgba(79,172,254,0.1)"],["📚","Curated Books","Free PDFs and study materials for JEE, NEET, UPSC and Boards","rgba(247,151,30,0.1)"],["📊","Performance Analytics","Track your weak areas and improve chapter by chapter","rgba(255,101,132,0.1)"]].map(([icon,title,desc,bg])=>(
            <div key={title} className="feature-card" style={{background:bg}}>
              <div style={{fontSize:"2rem",marginBottom:12}}>{icon}</div>
              <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:8}}>{title}</h3>
              <p style={{color:"#7878a0",fontSize:14,lineHeight:1.6}}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{borderTop:"1px solid #2a2a3e",padding:"2rem 5%",textAlign:"center",color:"#7878a0",fontSize:13}}>
        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1.3rem",marginBottom:8,display:"inline-block"}}>
          <span style={{background:"linear-gradient(135deg,#6c63ff,#ff6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>EduSolve</span><span style={{color:"#43e97b"}}>4U</span>
        </div>
        <p>Made with ❤️ for every student in India · JEE · NEET · UPSC · Boards</p>
      </footer>
    </div>
  );
}

// ─── EXAM HUB PAGE ────────────────────────────────────────────────────────────
function ExamHubPage({userProfile,navigate,handleLogout,examHub,showToast}) {
  const [activeHub,setActiveHub] = useState(examHub||EXAM_HUBS[0]);
  const [tab,setTab] = useState("practice");
  const [questions,setQuestions] = useState([]);
  const [loading,setLoading] = useState(false);

  const loadQuestions = async (hub) => {
    setLoading(true);
    const all = await fsGetAll("questions");
    setQuestions(all.filter(q=>q.exam===hub.id||hub.subjects.includes(q.subject)));
    setLoading(false);
  };

  useEffect(()=>{ loadQuestions(activeHub); },[activeHub]);

  const startHubExam = async (subject) => {
    const pool = questions.filter(q=>q.subject===subject).sort(()=>Math.random()-0.5).slice(0,10);
    if(!pool.length) { showToast("No questions yet for this subject","error"); return; }
    navigate("exam",{config:{questions:pool,subject,chapter:"Mixed",difficulty:"mixed",examTitle:`${activeHub.name} — ${subject}`}});
  };

  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      <div style={{padding:"6rem 5% 3rem",maxWidth:1200,margin:"0 auto"}}>
        {/* Hub Selector */}
        <div style={{display:"flex",gap:10,marginBottom:32,flexWrap:"wrap"}}>
          {EXAM_HUBS.map(hub=>(
            <button key={hub.id} onClick={()=>{setActiveHub(hub);setTab("practice");}} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:50,border:`1.5px solid ${activeHub.id===hub.id?hub.color:"#2a2a3e"}`,background:activeHub.id===hub.id?`${hub.color}22`:"transparent",color:activeHub.id===hub.id?hub.color:"#7878a0",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,transition:"all 0.2s"}}>
              {hub.icon} {hub.name}
            </button>
          ))}
        </div>

        {/* Hub Header */}
        <div style={{background:`linear-gradient(135deg,${activeHub.color}22,${activeHub.color}08)`,border:`1px solid ${activeHub.color}33`,borderRadius:24,padding:"2rem",marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:12}}>
            <div style={{fontSize:"3rem"}}>{activeHub.icon}</div>
            <div>
              <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"2rem",color:activeHub.color}}>{activeHub.name}</h1>
              <div style={{color:"#e8e8f0",fontWeight:600}}>{activeHub.full}</div>
            </div>
          </div>
          <p style={{color:"#7878a0",marginBottom:16}}>{activeHub.desc}</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {activeHub.subjects.map(s=><span key={s} style={{background:`${activeHub.color}22`,color:activeHub.color,border:`1px solid ${activeHub.color}44`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600}}>{s}</span>)}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:24,background:"#12121a",border:"1px solid #2a2a3e",borderRadius:14,padding:4,width:"fit-content"}}>
          {["practice","books","papers"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 20px",borderRadius:10,border:"none",cursor:"pointer",background:tab===t?"#6c63ff":"transparent",color:tab===t?"#fff":"#7878a0",fontWeight:600,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>
              {t==="practice"?"🎯 Practice":t==="books"?"📚 Books":"📝 Papers & PYQs"}
            </button>
          ))}
        </div>

        {tab==="practice" && (
          <div>
            <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:16}}>Practice by Subject</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
              {activeHub.subjects.map(subject=>{
                const subj = SUBJECTS.find(s=>s.name===subject)||{icon:"📚",color:"#6c63ff"};
                const count = questions.filter(q=>q.subject===subject).length;
                return (
                  <div key={subject} onClick={()=>startHubExam(subject)} style={{background:"#12121a",border:`1px solid ${subj.color}33`,borderRadius:18,padding:"1.5rem",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}} className="hub-card">
                    <div style={{fontSize:"2.2rem",marginBottom:10}}>{subj.icon}</div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:4}}>{subject}</div>
                    <div style={{fontSize:12,color:"#7878a0"}}>{count} questions</div>
                    <button style={{marginTop:12,background:`${subj.color}22`,border:`1px solid ${subj.color}44`,borderRadius:20,padding:"5px 14px",color:subj.color,cursor:"pointer",fontSize:12,fontWeight:600}}>Start Practice →</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="books" && (
          <div>
            <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:16}}>📚 Recommended Books & Resources</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
              {activeHub.books.map((book,i)=>(
                <div key={i} style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:18,padding:"1.5rem",display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{fontSize:"2rem"}}>📖</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,lineHeight:1.4}}>{book.title}</div>
                  <div style={{fontSize:12,color:"#7878a0"}}>{book.subject}</div>
                  <a href={book.url} target="_blank" rel="noreferrer" style={{marginTop:"auto",background:"linear-gradient(135deg,#6c63ff,#8b7fff)",color:"#fff",border:"none",borderRadius:10,padding:"8px 16px",textAlign:"center",textDecoration:"none",fontSize:13,fontWeight:600,display:"block"}}>📥 Download / View</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="papers" && (
          <div>
            <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
              <div style={{background:"rgba(108,99,255,0.15)",border:"1px solid rgba(108,99,255,0.3)",borderRadius:20,padding:"4px 14px",fontSize:12,color:"#a89cff",fontWeight:600}}>📝 Sample Papers</div>
              <div style={{background:"rgba(247,151,30,0.15)",border:"1px solid rgba(247,151,30,0.3)",borderRadius:20,padding:"4px 14px",fontSize:12,color:"#f7971e",fontWeight:600}}>🏆 Previous Year Questions</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
              {(activeHub.papers||[]).map((paper,i)=>(
                <div key={i} style={{background:"#12121a",border:`1px solid ${paper.type==="pyq"?"rgba(247,151,30,0.3)":"rgba(108,99,255,0.3)"}`,borderRadius:18,padding:"1.5rem",display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:"1.8rem"}}>{paper.type==="pyq"?"🏆":"📝"}</span>
                    <div style={{display:"flex",gap:6}}>
                      <span style={{background:paper.type==="pyq"?"rgba(247,151,30,0.2)":"rgba(108,99,255,0.2)",color:paper.type==="pyq"?"#f7971e":"#a89cff",border:`1px solid ${paper.type==="pyq"?"rgba(247,151,30,0.4)":"rgba(108,99,255,0.4)"}`,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700}}>
                        {paper.type==="pyq"?"PYQ":"Sample"}
                      </span>
                      <span style={{background:"rgba(67,233,123,0.15)",color:"#43e97b",border:"1px solid rgba(67,233,123,0.3)",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700}}>{paper.year}</span>
                    </div>
                  </div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,lineHeight:1.4}}>{paper.title}</div>
                  <a href={paper.url} target="_blank" rel="noreferrer" style={{marginTop:"auto",background:paper.type==="pyq"?"linear-gradient(135deg,#f7971e,#ffd700)":"linear-gradient(135deg,#6c63ff,#8b7fff)",color:paper.type==="pyq"?"#0a0a0f":"#fff",border:"none",borderRadius:10,padding:"8px 16px",textAlign:"center",textDecoration:"none",fontSize:13,fontWeight:600,display:"block"}}>
                    {paper.type==="pyq"?"📥 Download PYQ":"📥 Download Sample Paper"}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SEARCH PAGE ──────────────────────────────────────────────────────────────
function SearchPage({userProfile,navigate,handleLogout}) {
  const [filters,setFilters] = useState({subject:"",chapter:"",exam:"",difficulty:"",year:"",keyword:""});
  const [results,setResults] = useState([]);
  const [searched,setSearched] = useState(false);
  const [loading,setLoading] = useState(false);
  const upd = (k,v) => setFilters(f=>({...f,[k]:v}));

  const search = async () => {
    setLoading(true); setSearched(true);
    const all = await fsGetAll("questions");
    const filtered = all.filter(q=>{
      if(filters.subject && q.subject!==filters.subject) return false;
      if(filters.chapter && q.chapter!==filters.chapter) return false;
      if(filters.exam && q.exam!==filters.exam) return false;
      if(filters.difficulty && q.difficulty!==filters.difficulty) return false;
      if(filters.year && q.year!==filters.year) return false;
      if(filters.keyword && !q.text?.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
      return true;
    });
    setResults(filtered);
    setLoading(false);
  };

  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      <div style={{padding:"6rem 5% 3rem",maxWidth:1000,margin:"0 auto"}}>
        <div style={{marginBottom:28}}>
          <div className="section-label">Question Bank</div>
          <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"2.2rem"}}>🔍 Search Questions</h1>
          <p style={{color:"#7878a0",marginTop:6}}>Find questions by subject, chapter, exam, difficulty and year</p>
        </div>

        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"1.75rem",marginBottom:24}}>
          <div style={{marginBottom:14}}>
            <label className="form-label">Keyword</label>
            <input className="form-input" placeholder="Search by keyword..." value={filters.keyword} onChange={e=>upd("keyword",e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:16}}>
            <div>
              <label className="form-label">Subject</label>
              <select className="form-input" value={filters.subject} onChange={e=>upd("subject",e.target.value)}>
                <option value="">All Subjects</option>
                {SUBJECTS.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Chapter</label>
              <select className="form-input" value={filters.chapter} onChange={e=>upd("chapter",e.target.value)}>
                <option value="">All Chapters</option>
                {(CHAPTERS[filters.subject]||Object.values(CHAPTERS).flat()).map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Exam</label>
              <select className="form-input" value={filters.exam} onChange={e=>upd("exam",e.target.value)}>
                <option value="">All Exams</option>
                {EXAM_HUBS.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Difficulty</label>
              <select className="form-input" value={filters.difficulty} onChange={e=>upd("difficulty",e.target.value)}>
                <option value="">All</option>
                {DIFFICULTIES.map(d=><option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Year</label>
              <select className="form-input" value={filters.year} onChange={e=>upd("year",e.target.value)}>
                <option value="">All Years</option>
                {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <button className="btn-primary" onClick={search} style={{minWidth:140}}>🔍 Search Questions</button>
        </div>

        {loading&&<div style={{textAlign:"center",color:"#7878a0",padding:"2rem"}}>Searching…</div>}
        {searched&&!loading&&(
          <div>
            <div style={{marginBottom:12,color:"#7878a0",fontSize:14}}>{results.length} question{results.length!==1?"s":""} found</div>
            {results.length===0?<div style={{textAlign:"center",padding:"3rem",color:"#7878a0"}}>No questions found. Try different filters.</div>:(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {results.map((q,i)=>(
                  <div key={q.id} style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:16,padding:"1.25rem"}}>
                    <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                      <Tag label={q.subject} color="#6c63ff"/>
                      <Tag label={q.chapter} color="#7878a0"/>
                      {q.exam&&<Tag label={q.exam.toUpperCase()} color="#f7971e"/>}
                      {q.year&&<Tag label={q.year} color="#7878a0"/>}
                      <Tag label={q.difficulty} color={q.difficulty==="hard"?"#ff6584":q.difficulty==="medium"?"#f7971e":"#43e97b"}/>
                      {q.marks&&<Tag label={`${q.marks} Mark${q.marks>1?"s":""}`} color="#4facfe"/>}
                      {q.type&&q.type!=="mcq"&&<Tag label={q.type==="short"?"Short Answer":q.type==="long"?"Long Answer":q.type==="case"?"Case Study":q.type} color="#c471f5"/>}
                      {q.hotspot&&<span style={{background:"rgba(255,215,0,0.2)",color:"#ffd700",border:"1px solid rgba(255,215,0,0.4)",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700}}>🔥 Hot Topic</span>}
                    </div>
                    <p style={{fontWeight:500,lineHeight:1.55,marginBottom:12}}>{i+1}. {q.text}</p>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      {q.options?.map((opt,idx)=>(
                        <div key={idx} style={{background:idx===q.answer?"rgba(67,233,123,0.1)":"#1a1a26",border:`1px solid ${idx===q.answer?"rgba(67,233,123,0.4)":"#2a2a3e"}`,borderRadius:8,padding:"6px 12px",fontSize:13,display:"flex",gap:8}}>
                          <span style={{color:idx===q.answer?"#43e97b":"#7878a0",fontWeight:700}}>{["A","B","C","D"][idx]}.</span>{opt}
                        </div>
                      ))}
                    </div>
                    {q.explanation&&<div style={{marginTop:10,fontSize:13,color:"#7878a0",padding:"8px 12px",background:"rgba(108,99,255,0.08)",borderRadius:8}}>💡 {q.explanation}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({navigate,handleLogin,userProfile,handleLogout}) {
  const [email,setEmail]=useState(""); const [pass,setPass]=useState("");
  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"6rem 1rem"}}>
        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:24,padding:"2.5rem",width:"100%",maxWidth:420}}>
          <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1.8rem",marginBottom:6}}>Welcome Back</h2>
          <p style={{color:"#7878a0",fontSize:14,marginBottom:28}}>Login to continue your journey</p>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={{marginBottom:14}}/>
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} style={{marginBottom:20}} onKeyDown={e=>e.key==="Enter"&&handleLogin(email,pass)}/>
          <button className="btn-primary" style={{width:"100%"}} onClick={()=>handleLogin(email,pass)}>Login →</button>
          <p style={{textAlign:"center",marginTop:16,fontSize:13,color:"#7878a0"}}>No account? <span style={{color:"#6c63ff",cursor:"pointer"}} onClick={()=>navigate("register")}>Sign up free</span></p>
        </div>
      </div>
    </div>
  );
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────
function RegisterPage({navigate,handleRegister,userProfile,handleLogout}) {
  const [form,setForm]=useState({name:"",email:"",password:"",class:"10"});
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"6rem 1rem"}}>
        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:24,padding:"2.5rem",width:"100%",maxWidth:420}}>
          <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1.8rem",marginBottom:6}}>Create Account</h2>
          <p style={{color:"#7878a0",fontSize:14,marginBottom:28}}>Free forever for students</p>
          {[["Full Name","name","text","Aarav Sharma"],["Email","email","email","you@email.com"],["Password","password","password","Min 6 characters"]].map(([lbl,key,type,ph])=>(
            <div key={key}><label className="form-label">{lbl}</label><input className="form-input" type={type} placeholder={ph} value={form[key]} onChange={e=>upd(key,e.target.value)} style={{marginBottom:14}}/></div>
          ))}
          <label className="form-label">Class</label>
          <select className="form-input" value={form.class} onChange={e=>upd("class",e.target.value)} style={{marginBottom:20}}>
            {CLASSES.map(c=><option key={c} value={c}>Class {c}</option>)}
          </select>
          <button className="btn-primary" style={{width:"100%"}} onClick={()=>handleRegister(form)}>Create Account →</button>
          <p style={{textAlign:"center",marginTop:16,fontSize:13,color:"#7878a0"}}>Already have an account? <span style={{color:"#6c63ff",cursor:"pointer"}} onClick={()=>navigate("login")}>Login</span></p>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({userProfile,navigate,handleLogout}) {
  const [myResults,setMyResults]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      const all=await fsGetAll("results");
      setMyResults(all.filter(r=>r.userId===(userProfile?.uid)));
      setLoading(false);
    })();
  },[userProfile]);

  const avgScore=myResults.length?Math.round(myResults.reduce((a,r)=>a+r.score,0)/myResults.length):0;
  const bestScore=myResults.length?Math.max(...myResults.map(r=>r.score)):0;

  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      <div style={{padding:"6rem 5% 3rem",maxWidth:1200,margin:"0 auto"}}>
        <div style={{marginBottom:28}}>
          <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"2.2rem"}}>Hey, {userProfile?.name?.split(" ")[0]} 👋</h1>
          <p style={{color:"#7878a0"}}>Class {userProfile?.class} · {userProfile?.role}</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12,marginBottom:28}}>
          {[["📝","Tests Taken",myResults.length],["📊","Avg Score",`${avgScore}%`],["🏆","Best Score",`${bestScore}%`]].map(([icon,label,val])=>(
            <div key={label} style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:16,padding:"1.25rem",textAlign:"center"}}>
              <div style={{fontSize:"1.5rem",marginBottom:6}}>{icon}</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1.5rem",color:"#6c63ff"}}>{val}</div>
              <div style={{fontSize:12,color:"#7878a0"}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:28}}>
          {[["🎯","Build a Test","Create a custom practice test","buildtest","#6c63ff"],["🔍","Search Questions","Find questions by any filter","search","#43e97b"],["🏛️","Exam Hubs","JEE, NEET, UPSC & Boards","examhub","#f7971e"],["🏆","Leaderboard","See your rank","leaderboard","#ffd700"]].map(([icon,title,desc,page,color])=>(
            <div key={title} onClick={()=>navigate(page)} style={{background:"#12121a",border:`1px solid ${color}33`,borderRadius:16,padding:"1.25rem",cursor:"pointer",transition:"all 0.2s"}} className="hub-card">
              <div style={{fontSize:"1.8rem",marginBottom:8}}>{icon}</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,color,marginBottom:4}}>{title}</div>
              <div style={{fontSize:13,color:"#7878a0"}}>{desc}</div>
            </div>
          ))}
        </div>

        {/* Recent Tests */}
        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"1.75rem"}}>
          <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:16}}>📈 Recent Tests</h3>
          {loading?<div style={{color:"#7878a0",textAlign:"center",padding:"1rem"}}>Loading…</div>:
           myResults.length===0?<p style={{color:"#7878a0",textAlign:"center",padding:"2rem 0"}}>No tests yet. Start one! →</p>:(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {myResults.slice().sort((a,b)=>(b.date||0)-(a.date||0)).slice(0,5).map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"#1a1a26",borderRadius:12}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>{r.examTitle}</div>
                    <div style={{fontSize:12,color:"#7878a0"}}>{r.correct}/{r.totalQ} correct · {Math.round(r.timeTaken/60)}m {r.timeTaken%60}s</div>
                  </div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1.2rem",color:r.score>=80?"#43e97b":r.score>=60?"#f7971e":"#ff6584"}}>{r.score}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BUILD TEST PAGE (Card UI) ────────────────────────────────────────────────
function BuildTestPage({userProfile,navigate,handleLogout,showToast}) {
  const [mode,setMode]=useState("practice"); // practice | paper
  const [step,setStep]=useState(1);
  const [selectedSubject,setSelectedSubject]=useState(null);
  const [selectedChapter,setSelectedChapter]=useState(null);
  const [numQ,setNumQ]=useState(10);
  const [difficulty,setDifficulty]=useState("mixed");

  const startExam = async () => {
    const all = await fsGetAll("questions");
    const pool = all.filter(q=>
      q.subject===selectedSubject.name&&
      (selectedChapter==="all"||q.chapter===selectedChapter)&&
      (difficulty==="mixed"||q.difficulty===difficulty)
    );
    if(!pool.length){showToast("No questions found. Try different filters.","error");return;}
    const selected = pool.sort(()=>Math.random()-0.5).slice(0,Math.min(numQ,pool.length));
    navigate("exam",{config:{questions:selected,subject:selectedSubject.name,chapter:selectedChapter,difficulty,examTitle:`${selectedSubject.name} — ${selectedChapter}`}});
  };

  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      <div style={{padding:"6rem 5% 3rem",maxWidth:900,margin:"0 auto"}}>
        <div style={{marginBottom:28}}>
          <div className="section-label">Test Builder</div>
          <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"2.2rem"}}>⚡ Build Your Test</h1>
        </div>

        {/* Mode Toggle */}
        <div style={{display:"flex",gap:12,marginBottom:28,flexWrap:"wrap"}}>
          <div onClick={()=>setMode("practice")} style={{flex:1,minWidth:220,background:mode==="practice"?"rgba(108,99,255,0.15)":"#12121a",border:`2px solid ${mode==="practice"?"#6c63ff":"#2a2a3e"}`,borderRadius:18,padding:"1.25rem",cursor:"pointer",transition:"all 0.2s"}}>
            <div style={{fontSize:"1.8rem",marginBottom:8}}>📝</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,color:mode==="practice"?"#a89cff":"#e8e8f0",marginBottom:4}}>Practice Test</div>
            <div style={{fontSize:13,color:"#7878a0",lineHeight:1.5}}>Custom MCQ, short & long answer tests. Pick subject, chapter and difficulty.</div>
            {mode==="practice"&&<div style={{marginTop:8,fontSize:12,color:"#6c63ff",fontWeight:600}}>● Selected</div>}
          </div>
          <div onClick={()=>navigate("papergen")} style={{flex:1,minWidth:220,background:"#12121a",border:"2px solid #2a2a3e",borderRadius:18,padding:"1.25rem",cursor:"pointer",transition:"all 0.2s"}} className="hub-card">
            <div style={{fontSize:"1.8rem",marginBottom:8}}>🏛️</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,color:"#e8e8f0",marginBottom:4}}>CBSE Exam Paper</div>
            <div style={{fontSize:13,color:"#7878a0",lineHeight:1.5}}>Generate real CBSE-format papers with Section A/B/C/D/E. Print or download as PDF.</div>
            <div style={{marginTop:8,fontSize:12,color:"#f7971e",fontWeight:600}}>→ Open Paper Generator</div>
          </div>
        </div>

        {/* Step Indicator */}
        <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:32}}>
          {[["1","Subject"],["2","Chapter"],["3","Settings"]].map(([num,label],i)=>(
            <div key={num} style={{display:"flex",alignItems:"center"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:step>i+1?"#43e97b":step===i+1?"#6c63ff":"#2a2a3e",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,color:step>=i+1?"#fff":"#7878a0",transition:"all 0.3s"}}>{step>i+1?"✓":num}</div>
                <div style={{fontSize:11,color:step===i+1?"#6c63ff":"#7878a0",fontWeight:600}}>{label}</div>
              </div>
              {i<2&&<div style={{width:80,height:2,background:step>i+1?"#43e97b":"#2a2a3e",margin:"0 8px 20px",transition:"all 0.3s"}}/>}
            </div>
          ))}
        </div>

        {/* Step 1 — Subject */}
        {step===1&&(
          <div className="fade-in">
            <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:16}}>Choose Subject</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
              {SUBJECTS.map(s=>(
                <div key={s.name} onClick={()=>{setSelectedSubject(s);setStep(2);}} style={{background:"#12121a",border:`1.5px solid ${selectedSubject?.name===s.name?s.color:"#2a2a3e"}`,borderRadius:18,padding:"1.5rem",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}} className="hub-card">
                  <div style={{fontSize:"2.2rem",marginBottom:8}}>{s.icon}</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,color:s.color}}>{s.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Chapter */}
        {step===2&&selectedSubject&&(
          <div className="fade-in">
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:"#7878a0",cursor:"pointer",fontSize:14}}>← Back</button>
              <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>{selectedSubject.icon} {selectedSubject.name} — Choose Chapter</h3>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
              <div onClick={()=>{setSelectedChapter("all");setStep(3);}} style={{background:"#12121a",border:`1.5px solid ${selectedSubject.color}`,borderRadius:14,padding:"1rem 1.25rem",cursor:"pointer",transition:"all 0.2s"}} className="hub-card">
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,color:selectedSubject.color}}>📚 All Chapters</div>
                <div style={{fontSize:12,color:"#7878a0",marginTop:4}}>Mix of everything</div>
              </div>
              {(CHAPTERS[selectedSubject.name]||[]).map(ch=>(
                <div key={ch} onClick={()=>{setSelectedChapter(ch);setStep(3);}} style={{background:"#12121a",border:"1.5px solid #2a2a3e",borderRadius:14,padding:"1rem 1.25rem",cursor:"pointer",transition:"all 0.2s"}} className="hub-card">
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:14}}>{ch}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Settings */}
        {step===3&&(
          <div className="fade-in">
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <button onClick={()=>setStep(2)} style={{background:"none",border:"none",color:"#7878a0",cursor:"pointer",fontSize:14}}>← Back</button>
              <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>⚙️ Test Settings</h3>
            </div>
            <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"2rem",maxWidth:500}}>
              <div style={{marginBottom:16,padding:"12px 16px",background:"rgba(108,99,255,0.1)",borderRadius:12,fontSize:14}}>
                <strong style={{color:"#6c63ff"}}>{selectedSubject?.icon} {selectedSubject?.name}</strong> · {selectedChapter==="all"?"All Chapters":selectedChapter}
              </div>
              <label className="form-label">Number of Questions</label>
              <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                {[5,10,15,20,25,30].map(n=>(
                  <button key={n} onClick={()=>setNumQ(n)} style={{padding:"8px 16px",borderRadius:10,border:`1.5px solid ${numQ===n?"#6c63ff":"#2a2a3e"}`,background:numQ===n?"rgba(108,99,255,0.2)":"transparent",color:numQ===n?"#a89cff":"#7878a0",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>{n}</button>
                ))}
              </div>
              <label className="form-label">Difficulty</label>
              <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
                {[["mixed","🎲 Mixed","#6c63ff"],["easy","✅ Easy","#43e97b"],["medium","⚡ Medium","#f7971e"],["hard","🔥 Hard","#ff6584"]].map(([val,label,color])=>(
                  <button key={val} onClick={()=>setDifficulty(val)} style={{padding:"8px 16px",borderRadius:10,border:`1.5px solid ${difficulty===val?color:"#2a2a3e"}`,background:difficulty===val?`${color}22`:"transparent",color:difficulty===val?color:"#7878a0",cursor:"pointer",fontWeight:600,fontSize:13}}>{label}</button>
                ))}
              </div>
              <button className="btn-primary" style={{width:"100%",fontSize:"1rem",padding:"13px"}} onClick={startExam}>🎯 Generate & Start Test</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EXAM PAGE ────────────────────────────────────────────────────────────────
function ExamPage({examConfig,handleExamFinish,userProfile,navigate,handleLogout}) {
  const {questions,examTitle}=examConfig;
  const [current,setCurrent]=useState(0);
  const [answers,setAnswers]=useState({});
  const [started]=useState(Date.now());
  const [timeElapsed,setTimeElapsed]=useState(0);

  useEffect(()=>{
    const t=setInterval(()=>setTimeElapsed(Math.floor((Date.now()-started)/1000)),1000);
    return()=>clearInterval(t);
  },[started]);

  const q=questions[current];

  const submit=()=>{
    let correct=0;
    questions.forEach(q=>{if(answers[q.id]===q.answer)correct++;});
    const score=Math.round((correct/questions.length)*100);
    handleExamFinish({examTitle,subject:examConfig.subject,score,totalQ:questions.length,correct,timeTaken:timeElapsed,answers});
  };

  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      <div style={{padding:"6rem 5% 3rem",maxWidth:800,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontSize:12,color:"#7878a0",marginBottom:2}}>{examTitle}</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>Q{current+1} of {questions.length}</div>
          </div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:10,padding:"6px 14px",fontSize:14,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif"}}>⏱ {Math.floor(timeElapsed/60)}:{String(timeElapsed%60).padStart(2,"0")}</div>
            <div style={{fontSize:13,color:"#7878a0"}}>{Object.keys(answers).length}/{questions.length}</div>
          </div>
        </div>
        <div style={{height:4,background:"#2a2a3e",borderRadius:4,marginBottom:24,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${((current+1)/questions.length)*100}%`,background:"linear-gradient(90deg,#6c63ff,#ff6584)",transition:"width 0.3s"}}/>
        </div>
        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"2rem",marginBottom:20}}>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            <Tag label={q.subject} color="#6c63ff"/>
            <Tag label={q.chapter} color="#7878a0"/>
            <Tag label={q.difficulty} color={q.difficulty==="hard"?"#ff6584":q.difficulty==="medium"?"#f7971e":"#43e97b"}/>
            {q.marks&&<Tag label={`${q.marks} Mark${q.marks>1?"s":""}`} color="#4facfe"/>}
            {q.type&&q.type!=="mcq"&&<Tag label={q.type==="short"?"Short Answer":q.type==="long"?"Long Answer":q.type==="case"?"Case Study":q.type} color="#c471f5"/>}
            {q.hotspot&&<span style={{background:"rgba(255,215,0,0.2)",color:"#ffd700",border:"1px solid rgba(255,215,0,0.4)",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>🔥 Hot Topic</span>}
          </div>
          <p style={{fontSize:"1.05rem",lineHeight:1.65,marginBottom:24,fontWeight:500}}>{q.text}</p>
          {q.type==="short"||q.type==="long"||q.type==="case" ? (
            <div>
              <div style={{background:"rgba(108,99,255,0.08)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:12,padding:"12px 16px",marginBottom:12,fontSize:13,color:"#a89cff"}}>
                📝 This is a <strong>{q.type==="short"?"Short Answer":q.type==="long"?"Long Answer":"Case Study"}</strong> question worth <strong>{q.marks||3} marks</strong>. Write your answer below.
              </div>
              <textarea
                placeholder="Write your answer here..."
                value={answers[q.id]||""}
                onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))}
                rows={6}
                style={{width:"100%",background:"#1a1a26",border:"1px solid #2a2a3e",borderRadius:12,padding:"12px 16px",color:"#e8e8f0",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",resize:"vertical"}}
              />
            </div>
          ) : (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {q.options?.map((opt,i)=>{
              const sel=answers[q.id]===i;
              return(
                <button key={i} onClick={()=>setAnswers(a=>({...a,[q.id]:i}))} style={{display:"flex",alignItems:"center",gap:12,background:sel?"rgba(108,99,255,0.2)":"#1a1a26",border:`1.5px solid ${sel?"#6c63ff":"#2a2a3e"}`,borderRadius:12,padding:"12px 16px",cursor:"pointer",textAlign:"left",color:"#e8e8f0",fontSize:15,transition:"all 0.15s"}}>
                  <span style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${sel?"#6c63ff":"#2a2a3e"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,background:sel?"#6c63ff":"transparent",color:sel?"#fff":"#7878a0",flexShrink:0}}>{["A","B","C","D"][i]}</span>
                  {opt}
                </button>
              );
            })}
          </div>
          )}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"space-between"}}>
          <button className="btn-secondary" onClick={()=>setCurrent(c=>Math.max(0,c-1))} disabled={current===0}>← Prev</button>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
            {questions.map((_,i)=>(
              <button key={i} onClick={()=>setCurrent(i)} style={{width:32,height:32,borderRadius:8,border:`1.5px solid ${i===current?"#6c63ff":answers[questions[i].id]!==undefined?"#43e97b":"#2a2a3e"}`,background:i===current?"rgba(108,99,255,0.3)":answers[questions[i].id]!==undefined?"rgba(67,233,123,0.15)":"transparent",color:"#e8e8f0",cursor:"pointer",fontSize:12,fontWeight:600}}>{i+1}</button>
            ))}
          </div>
          {current<questions.length-1
            ?<button className="btn-primary" onClick={()=>setCurrent(c=>c+1)}>Next →</button>
            :<button className="btn-primary" style={{background:"linear-gradient(135deg,#43e97b,#38f9d7)",boxShadow:"0 4px 20px rgba(67,233,123,0.4)"}} onClick={submit}>✅ Submit</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── RESULT PAGE ──────────────────────────────────────────────────────────────
function ResultPage({examResult,examConfig,userProfile,navigate,handleLogout}) {
  const {score,correct,totalQ,timeTaken,answers}=examResult;
  const questions=examConfig?.questions||[];
  const points=calcPoints(score,timeTaken,totalQ);
  const [showSolutions,setShowSolutions]=useState(false);
  const grade=score>=90?["🏆","Excellent!","#ffd700"]:score>=75?["🎉","Great Work!","#43e97b"]:score>=60?["👍","Good Job!","#f7971e"]:["📚","Keep Practising","#ff6584"];

  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      <div style={{padding:"6rem 5% 3rem",maxWidth:800,margin:"0 auto"}}>
        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:24,padding:"2.5rem",textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:"3rem",marginBottom:12}}>{grade[0]}</div>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"4rem",color:grade[2],lineHeight:1}}>{score}%</div>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"1.4rem",marginTop:8}}>{grade[1]}</div>
          <div style={{color:"#7878a0",marginTop:6}}>{examResult.examTitle}</div>
          <div style={{display:"flex",gap:24,justifyContent:"center",marginTop:24,flexWrap:"wrap"}}>
            {[["✅","Correct",`${correct}/${totalQ}`],["⏱","Time",`${Math.floor(timeTaken/60)}m ${timeTaken%60}s`],["⚡","Points",`+${points}`]].map(([icon,lbl,val])=>(
              <div key={lbl} style={{background:"#1a1a26",borderRadius:14,padding:"14px 24px"}}>
                <div style={{fontSize:"1.3rem"}}>{icon}</div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1.3rem",color:"#6c63ff"}}>{val}</div>
                <div style={{fontSize:12,color:"#7878a0"}}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:24}}>
          <button className="btn-primary" onClick={()=>navigate("buildtest")} style={{flex:1}}>📝 New Test</button>
          <button className="btn-secondary" onClick={()=>navigate("leaderboard")} style={{flex:1}}>🏆 Leaderboard</button>
          <button className="btn-secondary" onClick={()=>setShowSolutions(!showSolutions)} style={{flex:1}}>{showSolutions?"Hide":"📖"} Solutions</button>
        </div>
        {showSolutions&&questions.map((q,idx)=>{
          const ua=answers?.[q.id]; const ok=ua===q.answer;
          return(
            <div key={q.id} style={{background:"#12121a",border:`1px solid ${ok?"rgba(67,233,123,0.3)":"rgba(255,101,132,0.3)"}`,borderRadius:16,padding:"1.25rem",marginBottom:12}}>
              <div style={{display:"flex",gap:10,marginBottom:8}}>
                <span style={{fontSize:"1.1rem",flexShrink:0}}>{ok?"✅":"❌"}</span>
                <p style={{fontWeight:500,lineHeight:1.5}}><strong>Q{idx+1}.</strong> {q.text}</p>
              </div>
              <div style={{paddingLeft:28,fontSize:14}}>
                {ua!==undefined&&<div style={{color:ok?"#43e97b":"#ff6584"}}>Your answer: ({["A","B","C","D"][ua]}) {q.options[ua]}</div>}
                {!ok&&<div style={{color:"#43e97b"}}>Correct: ({["A","B","C","D"][q.answer]}) {q.options[q.answer]}</div>}
                {q.explanation&&<div style={{marginTop:6,color:"#7878a0"}}>💡 {q.explanation}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
function LeaderboardPage({userProfile,navigate,handleLogout}) {
  const [filter,setFilter]=useState("all");
  const [leaderboard,setLeaderboard]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      const [users,results]=await Promise.all([fsGetAll("users"),fsGetAll("results")]);
      const userMap=Object.fromEntries(users.map(u=>[u.uid,u]));
      const agg={};
      results.forEach(r=>{
        if(!agg[r.userId])agg[r.userId]={tests:[]};
        agg[r.userId].tests.push(r);
      });
      const lb=Object.entries(agg).map(([uid,d])=>{
        const user=userMap[uid];
        if(!user||user.role!=="student")return null;
        const avgScore=Math.round(d.tests.reduce((a,r)=>a+r.score,0)/d.tests.length);
        const avgTime=Math.round(d.tests.reduce((a,r)=>a+r.timeTaken,0)/d.tests.length);
        const points=d.tests.reduce((acc,r)=>acc+calcPoints(r.score,r.timeTaken,r.totalQ),0);
        return{uid,user,avgScore,avgTime,points,count:d.tests.length};
      }).filter(Boolean).sort((a,b)=>b.points-a.points||a.avgTime-b.avgTime);
      setLeaderboard(lb);
      setLoading(false);
    })();
  },[]);

  const filtered=filter==="all"?leaderboard:leaderboard.filter(e=>e.user?.class===filter);
  const myRank=leaderboard.findIndex(e=>e.uid===(userProfile?.uid))+1;

  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      <div style={{padding:"6rem 5% 3rem",maxWidth:900,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div className="section-label">Live Rankings</div>
          <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"2.5rem"}}>🏆 Leaderboard</h1>
          <p style={{color:"#7878a0",marginTop:8}}>Ranked by score + speed. Answer correctly and quickly to earn more points.</p>
          {userProfile&&myRank>0&&<div style={{display:"inline-block",marginTop:12,background:"rgba(108,99,255,0.2)",border:"1px solid rgba(108,99,255,0.4)",borderRadius:20,padding:"6px 18px",fontSize:14,color:"#a89cff"}}>Your rank: #{myRank}</div>}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap",justifyContent:"center"}}>
          {["all",...CLASSES].map(c=>(
            <button key={c} onClick={()=>setFilter(c)} style={{background:filter===c?"rgba(108,99,255,0.3)":"#12121a",border:`1px solid ${filter===c?"#6c63ff":"#2a2a3e"}`,borderRadius:20,padding:"6px 16px",color:filter===c?"#a89cff":"#7878a0",cursor:"pointer",fontSize:13,fontWeight:600}}>
              {c==="all"?"All Classes":`Class ${c}`}
            </button>
          ))}
        </div>
        {loading?<div style={{textAlign:"center",color:"#7878a0",padding:"3rem"}}>Loading…</div>:(
          <>
            {filtered.length>=3&&(
              <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:12,marginBottom:28}}>
                {[filtered[1],filtered[0],filtered[2]].map((entry,i)=>{
                  const podiumRank=[2,1,3][i];const heights=["140px","180px","120px"];const colors=["#c0c0c0","#ffd700","#cd7f32"];
                  return(
                    <div key={entry.uid} style={{textAlign:"center",flex:1,maxWidth:200}}>
                      <div style={{width:52,height:52,borderRadius:"50%",background:avatarColor(entry.uid),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#fff",margin:"0 auto 8px",border:`3px solid ${colors[i]}`}}>{entry.user?.avatar}</div>
                      <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{entry.user?.name}</div>
                      <div style={{fontSize:12,color:"#7878a0",marginBottom:6}}>{entry.points} pts</div>
                      <div style={{height:heights[i],background:`linear-gradient(to top,${colors[i]}40,${colors[i]}20)`,border:`1px solid ${colors[i]}60`,borderRadius:"10px 10px 0 0",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1.8rem",color:colors[i]}}>#{podiumRank}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"60px 1fr 80px 80px 80px 80px",padding:"12px 20px",borderBottom:"1px solid #2a2a3e",fontSize:11,color:"#7878a0",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase"}}>
                <div>Rank</div><div>Student</div><div style={{textAlign:"center"}}>Avg Score</div><div style={{textAlign:"center"}}>Avg Time</div><div style={{textAlign:"center"}}>Tests</div><div style={{textAlign:"right"}}>Points</div>
              </div>
              {filtered.length===0&&<div style={{padding:"2rem",textAlign:"center",color:"#7878a0"}}>No students yet. Be the first! 🚀</div>}
              {filtered.map((entry,idx)=>{
                const rank=idx+1;const rankColors={1:"#ffd700",2:"#c0c0c0",3:"#cd7f32"};
                const isMe=(userProfile?.uid)===entry.uid;
                return(
                  <div key={entry.uid} style={{display:"grid",gridTemplateColumns:"60px 1fr 80px 80px 80px 80px",padding:"14px 20px",borderBottom:"1px solid #2a2a3e",alignItems:"center",background:isMe?"rgba(108,99,255,0.08)":"transparent"}}>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1.1rem",color:rankColors[rank]||"#7878a0"}}>{rank<=3?["🥇","🥈","🥉"][rank-1]:`#${rank}`}</div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:36,height:36,borderRadius:"50%",background:avatarColor(entry.uid),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#fff",fontSize:12,flexShrink:0}}>{entry.user?.avatar}</div>
                      <div>
                        <div style={{fontWeight:600,fontSize:14}}>{entry.user?.name}{isMe&&<span style={{marginLeft:6,fontSize:11,color:"#6c63ff",fontWeight:700}}>(you)</span>}</div>
                        <div style={{fontSize:12,color:"#7878a0"}}>Class {entry.user?.class}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"center",fontWeight:700,color:entry.avgScore>=80?"#43e97b":entry.avgScore>=60?"#f7971e":"#ff6584"}}>{entry.avgScore}%</div>
                    <div style={{textAlign:"center",fontSize:13,color:"#7878a0"}}>{Math.floor(entry.avgTime/60)}m {entry.avgTime%60}s</div>
                    <div style={{textAlign:"center",fontSize:13,color:"#7878a0"}}>{entry.count}</div>
                    <div style={{textAlign:"right",fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1rem",color:"#6c63ff"}}>{entry.points}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({userProfile,navigate,handleLogout,handleDeleteQuestion,handleAIQuestion}) {
  const [tab,setTab]=useState("questions");
  const [questions,setQuestions]=useState([]);
  const [users,setUsers]=useState([]);
  const [results,setResults]=useState([]);
  const [search,setSearch]=useState("");
  const [aiSubject,setAiSubject]=useState("Mathematics");
  const [aiChapter,setAiChapter]=useState("Real Numbers");
  const [aiDiff,setAiDiff]=useState("medium");
  const [aiLoading,setAiLoading]=useState(false);
  const [aiType,setAiType]=useState("mcq");

  useEffect(()=>{
    (async()=>{
      const [q,u,r]=await Promise.all([fsGetAll("questions"),fsGetAll("users"),fsGetAll("results")]);
      setQuestions(q);setUsers(u);setResults(r);
    })();
  },[tab]);

  if(!userProfile||(userProfile.role!=="admin"&&userProfile.role!=="teacher")) return <div style={{padding:"8rem 5%",textAlign:"center",color:"#7878a0"}}>Access denied.</div>;

  const filtered=questions.filter(q=>q.text?.toLowerCase().includes(search.toLowerCase())||q.subject?.toLowerCase().includes(search.toLowerCase()));
  const aiGen=async()=>{setAiLoading(true);await handleAIQuestion(aiSubject,aiChapter,aiDiff,aiType);const q=await fsGetAll("questions");setQuestions(q);setAiLoading(false);};
  const delQ=async(id)=>{await handleDeleteQuestion(id);setQuestions(q=>q.filter(x=>x.id!==id));};

  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      <div style={{padding:"6rem 5% 3rem",maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
          <div><div className="section-label">Management Panel</div><h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"2rem"}}>⚙️ Admin Dashboard</h1></div>
          <button className="btn-primary" onClick={()=>navigate("addQuestion")}>+ Add Question</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12,marginBottom:28}}>
          {[["Questions",questions.length,"#6c63ff"],["Students",users.filter(u=>u.role==="student").length,"#43e97b"],["Exams Taken",results.length,"#f7971e"],["Teachers",users.filter(u=>u.role==="teacher").length,"#ff6584"]].map(([l,v,c])=>(
            <div key={l} style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:14,padding:"1.25rem",textAlign:"center"}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1.8rem",color:c}}>{v}</div>
              <div style={{fontSize:12,color:"#7878a0"}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:4,marginBottom:20,background:"#12121a",border:"1px solid #2a2a3e",borderRadius:14,padding:4,width:"fit-content"}}>
          {["questions","ai","students","results"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",background:tab===t?"#6c63ff":"transparent",color:tab===t?"#fff":"#7878a0",fontWeight:600,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>
              {t==="ai"?"🤖 AI Generator":t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {tab==="questions"&&(
          <div>
            <input className="form-input" placeholder="🔍 Search questions..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:400,marginBottom:16}}/>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {filtered.map(q=>(
                <div key={q.id} style={{display:"flex",alignItems:"center",gap:12,background:"#12121a",border:"1px solid #2a2a3e",borderRadius:14,padding:"14px 18px"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:500,lineHeight:1.4}}>{q.text}</div>
                    <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                      <Tag label={q.subject} color="#6c63ff"/>
                      <Tag label={q.chapter||""} color="#7878a0"/>
                      <Tag label={q.difficulty} color={q.difficulty==="hard"?"#ff6584":q.difficulty==="medium"?"#f7971e":"#43e97b"}/>
                      {q.exam&&<Tag label={q.exam.toUpperCase()} color="#f7971e"/>}
                      {q.year&&<Tag label={q.year} color="#7878a0"/>}
                      {q.marks&&<Tag label={`${q.marks}M`} color="#4facfe"/>}
                      {q.type&&q.type!=="mcq"&&<Tag label={q.type==="short"?"Short":q.type==="long"?"Long":q.type==="case"?"Case Study":q.type} color="#c471f5"/>}
                      {q.hotspot&&<span style={{fontSize:12}}>🔥</span>}
                    </div>
                  </div>
                  <button onClick={()=>delQ(q.id)} style={{background:"rgba(255,101,132,0.15)",border:"1px solid rgba(255,101,132,0.3)",borderRadius:8,padding:"6px 12px",color:"#ff6584",cursor:"pointer",fontSize:13,fontWeight:600}}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="ai"&&(
          <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"2rem",maxWidth:520}}>
            <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:6}}>🤖 AI Question Generator</h3>
            <p style={{color:"#7878a0",fontSize:14,marginBottom:20}}>Generate any type of exam question using Gemini AI.</p>
            <label className="form-label">Question Type</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              {[["mcq","MCQ","#6c63ff"],["short2","2 Mark","#43e97b"],["short3","3 Mark","#4facfe"],["long4","4 Mark","#f7971e"],["long5","5 Mark","#ff6584"],["case","Case Study","#c471f5"],["hotspot","🔥 Hot Topic","#ffd700"]].map(([val,label,color])=>(
                <button key={val} onClick={()=>setAiType(val)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${aiType===val?color:"#2a2a3e"}`,background:aiType===val?`${color}22`:"transparent",color:aiType===val?color:"#7878a0",cursor:"pointer",fontWeight:600,fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>{label}</button>
              ))}
            </div>
            <label className="form-label">Subject</label>
            <select className="form-input" value={aiSubject} onChange={e=>{setAiSubject(e.target.value);setAiChapter(CHAPTERS[e.target.value]?.[0]||"");}} style={{marginBottom:12}}>
              {SUBJECTS.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
            <label className="form-label">Chapter</label>
            <select className="form-input" value={aiChapter} onChange={e=>setAiChapter(e.target.value)} style={{marginBottom:12}}>
              {(CHAPTERS[aiSubject]||[]).map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <label className="form-label">Difficulty</label>
            <select className="form-input" value={aiDiff} onChange={e=>setAiDiff(e.target.value)} style={{marginBottom:20}}>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
            <button className="btn-primary" style={{width:"100%",opacity:aiLoading?0.7:1}} onClick={aiGen} disabled={aiLoading}>
              {aiLoading?"⏳ Generating...":"🤖 Generate Question"}
            </button>
          </div>
        )}

        {tab==="students"&&(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {users.filter(u=>u.role==="student").map(u=>{
              const uRes=results.filter(r=>r.userId===(u.uid));
              const avg=uRes.length?Math.round(uRes.reduce((a,r)=>a+r.score,0)/uRes.length):0;
              return(
                <div key={u.uid} style={{display:"flex",alignItems:"center",gap:14,background:"#12121a",border:"1px solid #2a2a3e",borderRadius:14,padding:"14px 18px"}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:avatarColor(u.uid),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#fff",fontSize:13}}>{u.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600}}>{u.name}</div>
                    <div style={{fontSize:12,color:"#7878a0"}}>{u.email} · Class {u.class}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:700,color:"#6c63ff"}}>{uRes.length} tests</div>
                    <div style={{fontSize:12,color:"#7878a0"}}>Avg {avg}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="results"&&(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {results.slice().sort((a,b)=>(b.date||0)-(a.date||0)).map(r=>{
              const user=users.find(u=>(u.uid)===r.userId);
              return(
                <div key={r.id} style={{display:"flex",alignItems:"center",gap:14,background:"#12121a",border:"1px solid #2a2a3e",borderRadius:14,padding:"14px 18px"}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14}}>{user?.name||"Unknown"} — {r.examTitle}</div>
                    <div style={{fontSize:12,color:"#7878a0"}}>{r.correct}/{r.totalQ} correct · {Math.round(r.timeTaken/60)}m {r.timeTaken%60}s</div>
                  </div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1.2rem",color:r.score>=80?"#43e97b":r.score>=60?"#f7971e":"#ff6584"}}>{r.score}%</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADD QUESTION ─────────────────────────────────────────────────────────────
function AddQuestionPage({userProfile,navigate,handleLogout,handleAddQuestion}) {
  const [form,setForm]=useState({subject:"Mathematics",chapter:"Real Numbers",class:"10",difficulty:"medium",type:"mcq",text:"",options:["","","",""],answer:0,explanation:"",exam:"boards",year:new Date().getFullYear().toString()});
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const updOpt=(i,v)=>setForm(f=>{const opts=[...f.options];opts[i]=v;return{...f,options:opts};});
  const submit=()=>{
    if(!form.text.trim()||form.options.some(o=>!o.trim())){alert("Please fill in the question and all options.");return;}
    handleAddQuestion(form);
  };
  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      <div style={{padding:"6rem 5% 3rem",maxWidth:640,margin:"0 auto"}}>
        <button onClick={()=>navigate("admin")} style={{background:"none",border:"none",color:"#7878a0",cursor:"pointer",fontSize:14,padding:0,marginBottom:12}}>← Back to Admin</button>
        <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"2rem",marginBottom:24}}>Add Question</h1>
        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"2rem"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label className="form-label">Subject</label>
              <select className="form-input" value={form.subject} onChange={e=>{upd("subject",e.target.value);upd("chapter",CHAPTERS[e.target.value]?.[0]||"");}}>
                {SUBJECTS.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Chapter</label>
              <select className="form-input" value={form.chapter} onChange={e=>upd("chapter",e.target.value)}>
                {(CHAPTERS[form.subject]||[]).map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Class</label>
              <select className="form-input" value={form.class} onChange={e=>upd("class",e.target.value)}>
                {CLASSES.map(c=><option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Difficulty</label>
              <select className="form-input" value={form.difficulty} onChange={e=>upd("difficulty",e.target.value)}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="form-label">Exam</label>
              <select className="form-input" value={form.exam} onChange={e=>upd("exam",e.target.value)}>
                {EXAM_HUBS.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Year</label>
              <select className="form-input" value={form.year} onChange={e=>upd("year",e.target.value)}>
                {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <label className="form-label">Question Text</label>
          <textarea className="form-input" rows={3} placeholder="Enter your question..." value={form.text} onChange={e=>upd("text",e.target.value)} style={{resize:"vertical",marginBottom:14}}/>
          <label className="form-label">Options (click circle to mark correct answer)</label>
          {form.options.map((opt,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <button onClick={()=>upd("answer",i)} style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${form.answer===i?"#43e97b":"#2a2a3e"}`,background:form.answer===i?"#43e97b":"transparent",cursor:"pointer",fontSize:12,fontWeight:700,color:form.answer===i?"#0a0a0f":"#7878a0",flexShrink:0}}>{["A","B","C","D"][i]}</button>
              <input className="form-input" placeholder={`Option ${["A","B","C","D"][i]}`} value={opt} onChange={e=>updOpt(i,e.target.value)} style={{margin:0}}/>
            </div>
          ))}
          <label className="form-label" style={{marginTop:8}}>Explanation (optional)</label>
          <textarea className="form-input" rows={2} placeholder="Brief explanation..." value={form.explanation} onChange={e=>upd("explanation",e.target.value)} style={{resize:"vertical",marginBottom:20}}/>
          <div style={{display:"flex",gap:10}}>
            <button className="btn-primary" style={{flex:1}} onClick={submit}>✅ Add Question</button>
            <button className="btn-secondary" onClick={()=>navigate("admin")}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKS PAGE ───────────────────────────────────────────────────────────────
function BooksPage({userProfile,navigate,handleLogout}) {
  const [activeExam,setActiveExam]=useState("jee");
  const hub=EXAM_HUBS.find(h=>h.id===activeExam);
  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      <div style={{padding:"6rem 5% 3rem",maxWidth:1100,margin:"0 auto"}}>
        <div className="section-label">Resources</div>
        <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"2.2rem",marginBottom:24}}>📚 Books & Study Materials</h1>
        <div style={{display:"flex",gap:10,marginBottom:28,flexWrap:"wrap"}}>
          {EXAM_HUBS.map(h=>(
            <button key={h.id} onClick={()=>setActiveExam(h.id)} style={{padding:"8px 20px",borderRadius:50,border:`1.5px solid ${activeExam===h.id?h.color:"#2a2a3e"}`,background:activeExam===h.id?`${h.color}22`:"transparent",color:activeExam===h.id?h.color:"#7878a0",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14}}>
              {h.icon} {h.name}
            </button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
          {hub?.books.map((book,i)=>(
            <div key={i} style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"1.75rem",display:"flex",flexDirection:"column",gap:12,transition:"all 0.2s"}} className="hub-card">
              <div style={{fontSize:"2.5rem"}}>📖</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,lineHeight:1.4}}>{book.title}</div>
              <div><Tag label={book.subject} color={hub.color}/></div>
              <a href={book.url} target="_blank" rel="noreferrer" style={{marginTop:"auto",background:"linear-gradient(135deg,#6c63ff,#8b7fff)",color:"#fff",border:"none",borderRadius:12,padding:"10px 16px",textAlign:"center",textDecoration:"none",fontSize:14,fontWeight:600,display:"block",boxShadow:"0 4px 16px rgba(108,99,255,0.3)"}}>📥 Download / View Free</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const Tag=({label,color})=><span style={{background:`${color}22`,color,border:`1px solid ${color}44`,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:600}}>{label}</span>;


// ─── STUDY CHATBOT COMPONENT ──────────────────────────────────────────────────
function StudyChatBot({ userProfile }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm your AI study assistant 🎓 Ask me anything about your subjects — Maths, Physics, Chemistry, Biology, History and more!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = React.useRef(null);

  const SUGGESTIONS = [
    "Explain Pythagoras theorem",
    "What is Newton's second law?",
    "How do acids and bases differ?",
    "What is photosynthesis?",
    "Solve x² - 5x + 6 = 0",
    "Explain the French Revolution",
  ];

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const GEMINI_KEY = process.env.REACT_APP_GEMINI_KEY;
      if (!GEMINI_KEY) {
        setMessages(m => [...m, { role: "ai", text: "⚠️ Gemini API key not configured. Add REACT_APP_GEMINI_KEY in Vercel settings." }]);
        setLoading(false);
        return;
      }
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are EduBot, a friendly and expert study assistant for Indian students (Class 6-12, JEE, NEET, UPSC). 
Student${userProfile ? " " + userProfile.name : ""} asks: ${msg}
Give a clear, concise answer with examples where helpful. Use simple language. If it's a math problem, show step-by-step solution. Give a complete, detailed answer in 3-5 sentences with examples. Never cut off mid-sentence.`
              }]
            }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't get an answer. Please try again!";
      setMessages(m => [...m, { role: "ai", text: reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: "ai", text: "Something went wrong. Please try again!" }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 999,
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg,#6c63ff,#ff6584)",
          border: "none", cursor: "pointer", fontSize: "1.5rem",
          boxShadow: "0 4px 24px rgba(108,99,255,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {isOpen ? "✕" : "🎓"}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: 90, right: 24, zIndex: 998,
          width: 360, height: 520, background: "#12121a",
          border: "1px solid #2a2a3e", borderRadius: 20,
          display: "flex", flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          animation: "slideUp 0.3s ease",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 18px", borderBottom: "1px solid #2a2a3e",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#6c63ff,#ff6584)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem",
            }}>🎓</div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14 }}>EduBot</div>
              <div style={{ fontSize: 11, color: "#43e97b" }}>● Online — AI Study Assistant</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "80%",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg,#6c63ff,#8b7fff)"
                    : "#1a1a26",
                  border: msg.role === "ai" ? "1px solid #2a2a3e" : "none",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  padding: "10px 14px",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "#e8e8f0",
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "#1a1a26", border: "1px solid #2a2a3e", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", fontSize: 13, color: "#7878a0" }}>
                  EduBot is thinking<span className="dots">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: "0 14px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SUGGESTIONS.slice(0, 3).map(s => (
                <button key={s} onClick={() => sendMessage(s)} style={{
                  background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)",
                  borderRadius: 20, padding: "4px 10px", color: "#a89cff",
                  fontSize: 11, cursor: "pointer", fontWeight: 600,
                }}>{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid #2a2a3e", display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
              placeholder="Ask any doubt..."
              style={{
                flex: 1, background: "#1a1a26", border: "1px solid #2a2a3e",
                borderRadius: 10, padding: "8px 12px", color: "#e8e8f0",
                fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                background: "linear-gradient(135deg,#6c63ff,#8b7fff)",
                border: "none", borderRadius: 10, padding: "8px 14px",
                color: "#fff", cursor: "pointer", fontSize: 14,
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >→</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── HOME CHATBOT SECTION ────────────────────────────────────────────────────
function HomeChatSection({ userProfile }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);

  const SUGGESTIONS = [
    "📐 Explain Pythagoras theorem",
    "⚛️ What is Newton's second law?",
    "🧪 How do acids and bases differ?",
    "🧬 What is photosynthesis?",
    "📊 Solve x² - 5x + 6 = 0",
    "🏛️ Explain the French Revolution",
  ];

  const ask = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput(msg);
    setLoading(true);
    setAsked(true);
    setResponse("");

    try {
      const GEMINI_KEY = process.env.REACT_APP_GEMINI_KEY;
      if (!GEMINI_KEY) { setResponse("⚠️ API key not configured."); setLoading(false); return; }
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are EduBot, a friendly expert study assistant for Indian students (Class 6-12, JEE, NEET, UPSC).
Student asks: ${msg}
Give a clear, helpful answer with examples. If math, show steps. Give a complete answer in 3-5 sentences. Never leave the answer incomplete.`
              }]
            }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, couldn't get an answer!";
      setResponse(reply);
    } catch { setResponse("Something went wrong. Please try again!"); }
    setLoading(false);
  };

  return (
    <section style={{ padding: "5rem 5%", background: "#0a0a0f" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <div className="section-label">AI Study Assistant</div>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: "clamp(2rem,4vw,3rem)", letterSpacing: "-1.5px", marginBottom: 8 }}>
          Hi {userProfile ? userProfile.name.split(" ")[0] : "there"} 👋<br />
          <span style={{ background: "linear-gradient(135deg,#6c63ff,#ff6584)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Where should we start?</span>
        </h2>
        <p style={{ color: "#7878a0", marginBottom: 32, fontSize: "1rem" }}>Ask any doubt — Maths, Science, History, anything!</p>

        {/* Input box */}
        <div style={{
          background: "#12121a", border: "1px solid #2a2a3e", borderRadius: 20,
          padding: "18px 20px", marginBottom: 20, textAlign: "left",
          boxShadow: "0 8px 40px rgba(108,99,255,0.1)",
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && ask()}
            placeholder="Ask EduBot anything..."
            style={{
              width: "100%", background: "transparent", border: "none",
              color: "#e8e8f0", fontSize: "1rem", outline: "none",
              fontFamily: "'DM Sans',sans-serif", marginBottom: 14,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "#7878a0" }}>Powered by Gemini AI</div>
            <button
              onClick={() => ask()}
              disabled={loading || !input.trim()}
              style={{
                background: "linear-gradient(135deg,#6c63ff,#8b7fff)",
                border: "none", borderRadius: 12, padding: "8px 20px",
                color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14,
                opacity: loading || !input.trim() ? 0.5 : 1,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >{loading ? "Thinking..." : "Ask →"}</button>
          </div>
        </div>

        {/* Response */}
        {asked && (
          <div style={{
            background: "#12121a", border: "1px solid #2a2a3e", borderRadius: 20,
            padding: "18px 20px", marginBottom: 20, textAlign: "left",
            animation: "fadeIn 0.3s ease",
          }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg,#6c63ff,#ff6584)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem",
              }}>🎓</div>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: "#6c63ff" }}>EduBot</span>
            </div>
            {loading
              ? <div style={{ color: "#7878a0", fontSize: 14 }}>EduBot is thinking...</div>
              : <div style={{ fontSize: 14, lineHeight: 1.7, color: "#e8e8f0", whiteSpace: "pre-wrap" }}>{response}</div>
            }
          </div>
        )}

        {/* Suggestion pills */}
        {!asked && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => ask(s.slice(2))} style={{
                background: "#12121a", border: "1px solid #2a2a3e",
                borderRadius: 50, padding: "8px 18px", color: "#7878a0",
                cursor: "pointer", fontSize: 13, fontWeight: 500,
                transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#6c63ff"; e.currentTarget.style.color="#e8e8f0"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#2a2a3e"; e.currentTarget.style.color="#7878a0"; }}
              >{s}</button>
            ))}
          </div>
        )}

        {asked && (
          <button onClick={() => { setAsked(false); setInput(""); setResponse(""); }} style={{
            background: "transparent", border: "1px solid #2a2a3e", borderRadius: 20,
            padding: "8px 20px", color: "#7878a0", cursor: "pointer",
            fontSize: 13, marginTop: 8, fontFamily: "'DM Sans',sans-serif",
          }}>Ask another question</button>
        )}
      </div>
    </section>
  );
}


// ─── PAPER GENERATOR PAGE ────────────────────────────────────────────────────
// ─── ALL EXAM FORMAT TEMPLATES ───────────────────────────────────────────────
const EXAM_FORMATS = {
  cbse10: {
    name: "CBSE Class X Board",
    board: "Central Board of Secondary Education",
    totalMarks: 80,
    time: "3 Hours",
    subjects: ["Mathematics","Science","Social Science","English"],
    instructions: [
      "This question paper contains 5 sections — A, B, C, D and E.",
      "Section A has 20 MCQs carrying 1 mark each.",
      "Section B has 6 questions carrying 2 marks each.",
      "Section C has 7 questions carrying 3 marks each.",
      "Section D has 3 questions carrying 5 marks each.",
      "Section E has 3 case study questions carrying 4 marks each.",
      "All questions are compulsory. However, internal choices are provided.",
      "Draw neat, labelled diagrams wherever necessary.",
    ],
    sections: [
      { name:"A", type:"mcq",   count:20, marksEach:1, note:"Multiple Choice Questions — 1 mark each. Choose the most appropriate option." },
      { name:"B", type:"short", count:6,  marksEach:2, note:"Very Short Answer Questions — 2 marks each. Answer in 30-50 words." },
      { name:"C", type:"short", count:7,  marksEach:3, note:"Short Answer Questions — 3 marks each. Answer in 50-80 words." },
      { name:"D", type:"long",  count:3,  marksEach:5, note:"Long Answer Questions — 5 marks each. Answer in 80-120 words." },
      { name:"E", type:"case",  count:3,  marksEach:4, note:"Case Study Based Questions — 4 marks each. Read passage carefully." },
    ],
  },
  cbse12: {
    name: "CBSE Class XII Board",
    board: "Central Board of Secondary Education",
    totalMarks: 80,
    time: "3 Hours",
    subjects: ["Physics","Chemistry","Mathematics","Biology","English","History","Geography","Economics"],
    instructions: [
      "This question paper contains 5 sections — A, B, C, D and E.",
      "Section A: 16 MCQs + 4 Assertion-Reason = 20 questions × 1 mark.",
      "Section B: 5 Very Short Answer questions × 2 marks.",
      "Section C: 7 Short Answer questions × 3 marks.",
      "Section D: 2 Long Answer questions × 5 marks.",
      "Section E: 3 Case Study/Source Based questions × 4 marks.",
      "Internal choices are given in some questions.",
      "Use of calculators is NOT permitted.",
    ],
    sections: [
      { name:"A", type:"mcq",   count:20, marksEach:1, note:"MCQs and Assertion-Reason questions — 1 mark each." },
      { name:"B", type:"short", count:5,  marksEach:2, note:"Very Short Answer — 2 marks each. Answer in 30-50 words." },
      { name:"C", type:"short", count:7,  marksEach:3, note:"Short Answer — 3 marks each. Answer in 50-80 words." },
      { name:"D", type:"long",  count:2,  marksEach:5, note:"Long Answer — 5 marks each. Detailed answer required." },
      { name:"E", type:"case",  count:3,  marksEach:4, note:"Case Study/Source Based — 4 marks each." },
    ],
  },
  jee_main: {
    name: "JEE Main",
    board: "National Testing Agency (NTA)",
    totalMarks: 300,
    time: "3 Hours",
    subjects: ["Physics","Chemistry","Mathematics"],
    instructions: [
      "This paper has 3 subjects — Physics, Chemistry and Mathematics.",
      "Each subject has 30 questions: 20 MCQs + 10 Numerical Value questions.",
      "MCQs: +4 marks for correct, -1 mark for wrong answer.",
      "Numerical Value Questions: +4 for correct, NO negative marking.",
      "Only one option is correct in MCQ section.",
      "Use of electronic devices is strictly prohibited.",
      "Rough work should be done in the space provided.",
    ],
    sections: [
      { name:"Physics MCQ",     type:"mcq",   count:20, marksEach:4,  note:"Physics — Multiple Choice. +4 correct, -1 wrong. Only ONE correct option." },
      { name:"Physics Numeric", type:"short", count:10, marksEach:4,  note:"Physics — Numerical Value. Enter integer/decimal answer. No negative marking." },
      { name:"Chemistry MCQ",   type:"mcq",   count:20, marksEach:4,  note:"Chemistry — Multiple Choice. +4 correct, -1 wrong." },
      { name:"Chemistry Num",   type:"short", count:10, marksEach:4,  note:"Chemistry — Numerical Value. No negative marking." },
      { name:"Maths MCQ",       type:"mcq",   count:20, marksEach:4,  note:"Mathematics — Multiple Choice. +4 correct, -1 wrong." },
      { name:"Maths Numeric",   type:"short", count:10, marksEach:4,  note:"Mathematics — Numerical Value. No negative marking." },
    ],
  },
  jee_advanced: {
    name: "JEE Advanced — Paper 1",
    board: "IIT Joint Admission Board",
    totalMarks: 180,
    time: "3 Hours",
    subjects: ["Physics","Chemistry","Mathematics"],
    instructions: [
      "This paper consists of 3 sections — Physics, Chemistry, Mathematics.",
      "Section 1: MCQ with ONE correct option (+3, -1).",
      "Section 2: MCQ with ONE OR MORE correct options (+4, partial +1, -2).",
      "Section 3: Numerical Answer Type — no negative marking (+4).",
      "Answers must be filled in the OMR sheet carefully.",
      "Calculators and electronic devices are NOT allowed.",
    ],
    sections: [
      { name:"Physics S1",    type:"mcq",   count:6,  marksEach:3, note:"Single Correct MCQ — Physics. +3 correct, -1 wrong." },
      { name:"Physics S2",    type:"mcq",   count:6,  marksEach:4, note:"One or More Correct MCQ — Physics. +4 all correct, partial marks, -2 wrong." },
      { name:"Physics S3",    type:"short", count:6,  marksEach:4, note:"Numerical Answer Type — Physics. No negative marking." },
      { name:"Chemistry S1",  type:"mcq",   count:6,  marksEach:3, note:"Single Correct MCQ — Chemistry." },
      { name:"Chemistry S2",  type:"mcq",   count:6,  marksEach:4, note:"One or More Correct — Chemistry." },
      { name:"Chemistry S3",  type:"short", count:6,  marksEach:4, note:"Numerical Answer Type — Chemistry." },
      { name:"Maths S1",      type:"mcq",   count:6,  marksEach:3, note:"Single Correct MCQ — Mathematics." },
      { name:"Maths S2",      type:"mcq",   count:6,  marksEach:4, note:"One or More Correct — Mathematics." },
      { name:"Maths S3",      type:"short", count:6,  marksEach:4, note:"Numerical Answer Type — Mathematics." },
    ],
  },
  neet: {
    name: "NEET-UG",
    board: "National Testing Agency (NTA)",
    totalMarks: 720,
    time: "3 Hours 20 Minutes",
    subjects: ["Physics","Chemistry","Biology"],
    instructions: [
      "This paper has 4 sections — Physics, Chemistry, Botany and Zoology.",
      "Each section has 50 questions: Section A (35 MCQs) + Section B (15 MCQs, attempt any 10).",
      "Correct answer: +4 marks. Wrong answer: -1 mark.",
      "Only ONE option is correct for each question.",
      "Use Black/Blue ballpoint pen to darken the circle in OMR sheet.",
      "Do not use pencil or whitener on OMR sheet.",
      "Rough work must be done only in the space provided in this booklet.",
    ],
    sections: [
      { name:"Physics A",   type:"mcq", count:35, marksEach:4, note:"Physics Section A — All 35 questions compulsory. +4 correct, -1 wrong." },
      { name:"Physics B",   type:"mcq", count:15, marksEach:4, note:"Physics Section B — Attempt any 10 out of 15. +4 correct, -1 wrong." },
      { name:"Chemistry A", type:"mcq", count:35, marksEach:4, note:"Chemistry Section A — All 35 questions compulsory." },
      { name:"Chemistry B", type:"mcq", count:15, marksEach:4, note:"Chemistry Section B — Attempt any 10 out of 15." },
      { name:"Botany A",    type:"mcq", count:35, marksEach:4, note:"Botany Section A — All 35 questions compulsory." },
      { name:"Botany B",    type:"mcq", count:15, marksEach:4, note:"Botany Section B — Attempt any 10 out of 15." },
      { name:"Zoology A",   type:"mcq", count:35, marksEach:4, note:"Zoology Section A — All 35 questions compulsory." },
      { name:"Zoology B",   type:"mcq", count:15, marksEach:4, note:"Zoology Section B — Attempt any 10 out of 15." },
    ],
  },
  upsc_prelims: {
    name: "UPSC Civil Services Prelims — GS Paper I",
    board: "Union Public Service Commission",
    totalMarks: 200,
    time: "2 Hours",
    subjects: ["History","Geography","Economics","Social Science"],
    instructions: [
      "This paper consists of 100 questions of 2 marks each.",
      "Correct answer: +2 marks. Wrong answer: -0.66 marks (1/3 negative marking).",
      "All questions are compulsory.",
      "Questions are in both English and Hindi.",
      "Use Black Ball Point Pen only to darken the circle in OMR.",
      "Do not make any stray marks on the OMR Answer Sheet.",
      "Rough work may be done in the Test Booklet only.",
    ],
    sections: [
      { name:"GS Paper I", type:"mcq", count:100, marksEach:2, note:"General Studies Paper I — 100 MCQs. +2 correct, -0.66 wrong. All questions compulsory." },
    ],
  },
  upsc_mains: {
    name: "UPSC Mains — General Studies Paper I",
    board: "Union Public Service Commission",
    totalMarks: 250,
    time: "3 Hours",
    subjects: ["History","Geography","Social Science"],
    instructions: [
      "This paper consists of 20 questions of 10 marks each and 10 questions of 15 marks each.",
      "Answers must be written in the medium authorized in the Admission Certificate.",
      "Word limit as specified in questions must be adhered to strictly.",
      "Attempts of questions shall be counted in chronological order.",
      "Questions relating to maps and diagrams must be answered with clear sketches.",
    ],
    sections: [
      { name:"Section A", type:"short", count:10, marksEach:10, note:"Short Essay Questions — 10 marks each. Answer in approximately 150 words." },
      { name:"Section B", type:"long",  count:10, marksEach:15, note:"Essay Questions — 15 marks each. Answer in approximately 250 words." },
    ],
  },
  half_yearly: {
    name: "Half Yearly Examination",
    board: "School Internal Examination",
    totalMarks: 40,
    time: "1½ Hours",
    subjects: ["Mathematics","Science","Social Science","English","Physics","Chemistry","Biology"],
    instructions: [
      "All questions are compulsory.",
      "Section A: MCQs — 1 mark each.",
      "Section B: Short Answer — 2 marks each.",
      "Section C: Long Answer — 3-4 marks each.",
      "Write answers neatly and clearly.",
    ],
    sections: [
      { name:"A", type:"mcq",   count:10, marksEach:1, note:"MCQ — 1 mark each. Choose the correct option." },
      { name:"B", type:"short", count:5,  marksEach:2, note:"Short Answer — 2 marks each. Answer in 2-3 sentences." },
      { name:"C", type:"long",  count:4,  marksEach:3, note:"Long Answer — 3 marks each. Answer in detail." },
      { name:"D", type:"case",  count:2,  marksEach:4, note:"Case Study — 4 marks each." },
    ],
  },
};

const CBSE_SECTIONS_MAP = {
  80: EXAM_FORMATS.cbse10.sections,
  100: [
    { name:"A", type:"mcq",   count:20, marksEach:1, note:"Each question carries 1 mark." },
    { name:"B", type:"short", count:10, marksEach:2, note:"Each question carries 2 marks." },
    { name:"C", type:"short", count:8,  marksEach:3, note:"Each question carries 3 marks." },
    { name:"D", type:"long",  count:4,  marksEach:5, note:"Each question carries 5 marks." },
    { name:"E", type:"case",  count:4,  marksEach:4, note:"Each question carries 4 marks." },
  ],
  40: EXAM_FORMATS.half_yearly.sections,
};

function PaperGeneratorPage({userProfile, navigate, handleLogout, showToast}) {
  const [step, setStep] = useState("config"); // config | preview
  const [paperType, setPaperType] = useState("cbse");
  const [examFormat, setExamFormat] = useState("cbse10");
  const [schoolName, setSchoolName] = useState("EduSolve4U Learning Centre");
  const [examTitle, setExamTitle] = useState("Annual Examination 2024-25");
  const [cls, setCls] = useState("10");
  const [subject, setSubject] = useState("Mathematics");
  const [totalMarks, setTotalMarks] = useState(80);
  const [timeAllowed, setTimeAllowed] = useState("3");
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [markHotspot, setMarkHotspot] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [sections, setSections] = useState(CBSE_SECTIONS_MAP[80]);
  const [sectionCounts, setSectionCounts] = useState({});
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const paperRef = React.useRef(null);

  const subjectsByClass = {
    "10": ["Mathematics","Science","Social Science","English"],
    "12": ["Physics","Chemistry","Mathematics","Biology","English","History","Geography","Economics"],
    "9": ["Mathematics","Science","Social Science","English"],
    "11": ["Physics","Chemistry","Mathematics","Biology","English"],
  };

  useEffect(() => {
    const newSections = CBSE_SECTIONS_MAP[totalMarks] || CBSE_SECTIONS_MAP[80];
    setSections(newSections);
    const counts = {};
    newSections.forEach((s,i) => { counts[i] = s.count; });
    setSectionCounts(counts);
  }, [totalMarks]);

  useEffect(() => {
    const chapters = CHAPTERS[subject] || [];
    setSelectedChapters(chapters);
  }, [subject]);

  useEffect(() => {
    const subjects = subjectsByClass[cls] || [];
    if (!subjects.includes(subject)) setSubject(subjects[0]);
  }, [cls]);

  const totalCalc = sections.reduce((a,s,i) => a + (sectionCounts[i]||s.count) * s.marksEach, 0);

  const toggleChapter = (ch) => {
    setSelectedChapters(prev => prev.includes(ch) ? prev.filter(c=>c!==ch) : [...prev, ch]);
  };

  const pickQ = (allQ, type, count, marksEach) => {
    const typeFilter = {
      mcq: q => (q.type||"mcq")==="mcq",
      short: q => q.type==="short" || (!q.type && marksEach<=3),
      long: q => q.type==="long" || (!q.type && marksEach>=4),
      case: q => q.type==="case",
    };
    let pool = allQ.filter(q =>
      q.subject===subject &&
      (selectedChapters.length===0 || selectedChapters.includes(q.chapter)) &&
      (typeFilter[type] ? typeFilter[type](q) : true)
    );
    if(pool.length < count) {
      pool = allQ.filter(q => q.subject===subject && (selectedChapters.length===0||selectedChapters.includes(q.chapter)));
    }
    return pool.sort(()=>Math.random()-0.5).slice(0, count);
  };

  const generatePaper = async () => {
    setLoading(true);
    try {
      const allQ = await fsGetAll("questions");
      const paperSections = sections.map((s,i) => ({
        ...s,
        count: sectionCounts[i] || s.count,
        questions: pickQ(allQ, s.type, sectionCounts[i]||s.count, s.marksEach),
      }));
      setGeneratedPaper(paperSections);
      setStep("preview");
    } catch(e) { showToast("Error generating paper: "+e.message, "error"); }
    setLoading(false);
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    showToast("Opening print dialog — select 'Save as PDF' to download 📄");
    setTimeout(() => window.print(), 500);
  };

  if (step === "preview" && generatedPaper) {
    return (
      <div>
        {/* Action Bar */}
        <div className="no-print" style={{position:"fixed",top:0,left:0,right:0,zIndex:200,background:"rgba(10,10,15,0.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid #2a2a3e",padding:"12px 5%",display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={()=>setStep("config")} style={{background:"none",border:"1px solid #2a2a3e",color:"#7878a0",cursor:"pointer",padding:"7px 14px",borderRadius:8,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>← Back</button>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"1rem",marginRight:"auto"}}>📄 Question Paper Preview</div>
          <button onClick={handlePrint} style={{background:"transparent",border:"1px solid #2a2a3e",color:"#e8e8f0",cursor:"pointer",padding:"8px 18px",borderRadius:10,fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>🖨️ Print</button>
          <button onClick={handleDownloadPDF} className="btn-primary" style={{padding:"8px 18px",fontSize:13}}>📥 Save as PDF</button>
          <button onClick={generatePaper} style={{background:"transparent",border:"1px solid #2a2a3e",color:"#e8e8f0",cursor:"pointer",padding:"8px 18px",borderRadius:10,fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>🔄 Regenerate</button>
        </div>

        {/* Paper */}
        <div style={{background:"#e8e8e0",minHeight:"100vh",paddingTop:80,paddingBottom:40}} className="paper-bg">
          <style>{PAPER_CSS}</style>
          <div ref={paperRef} className="exam-paper" id="examPaper">
            {/* Header */}
            <div className="ep-header">
              <div className="ep-board">{EXAM_FORMATS[examFormat]?.board||"Central Board of Secondary Education"}</div>
              <div className="ep-exam">{examTitle}</div>
              <div className="ep-subject">{subject} — Class {cls==="10"?"X":cls==="12"?"XII":cls==="9"?"IX":"XI"}</div>
              <div className="ep-school">{schoolName}</div>
            </div>

            {/* Meta */}
            <div className="ep-meta">
              <div>
                <div><b>Time Allowed:</b> {timeAllowed} {parseFloat(timeAllowed)===1?"Hour":"Hours"}</div>
                <div style={{marginTop:6}}><b>Roll No.:</b> ___________________</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div><b>Maximum Marks:</b> {totalCalc}</div>
                <div style={{marginTop:6}}><b>Date:</b> ___________________</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="ep-instructions">
              <div className="ep-instr-title">General Instructions:</div>
              <ol>
                {(EXAM_FORMATS[examFormat]?.instructions||[
                  "This question paper contains "+generatedPaper.reduce((a,s)=>a+s.count,0)+" questions.",
                  "All questions are compulsory unless internal choice is given.",
                  "Draw neat, labelled diagrams wherever necessary.",
                ]).map((instr,i)=><li key={i}>{instr}</li>)}
                {specialInstructions&&<li>{specialInstructions}</li>}
              </ol>
            </div>

            {/* Sections */}
            {(() => {
              let qNum = 1;
              return generatedPaper.map((section, si) => (
                <div key={si}>
                  <div className="ep-section-header">
                    Section {section.name} [{section.count} × {section.marksEach} = {section.count*section.marksEach} Marks]
                  </div>
                  <div className="ep-section-note">{section.note}</div>
                  {Array.from({length: section.count}).map((_,qi) => {
                    const q = section.questions[qi];
                    const num = qNum++;
                    return (
                      <div key={qi} className="ep-question">
                        <div className="ep-q-row">
                          <span className="ep-q-num">{num}.</span>
                          <div className="ep-q-body">
                            {markHotspot && q?.hotspot && <span className="ep-hotspot">★ Frequently Asked &nbsp;</span>}
                            <span>{q?.text || `[${section.type.toUpperCase()} question — add more ${section.type} questions to your bank]`}</span>
                            {section.type==="mcq" && q?.options?.length>0 && (
                              <div className="ep-options">
                                {q.options.map((opt,oi)=>(
                                  <div key={oi} className="ep-option">
                                    <span className="ep-opt-label">({["a","b","c","d"][oi]})</span> {opt}
                                  </div>
                                ))}
                              </div>
                            )}
                            {includeAnswers && q && (
                              <div className="ep-answer">
                                ✓ {section.type==="mcq"
                                  ? `Answer: (${["a","b","c","d"][q.answer]}) ${q.options?.[q.answer]||""}`
                                  : `Model Answer: ${q.answer||q.explanation||""}`}
                              </div>
                            )}
                            {!includeAnswers && section.type!=="mcq" && (
                              <div className="ep-lines">
                                {Array.from({length: section.marksEach<=2?3:section.marksEach<=3?5:8}).map((_,li)=>(
                                  <div key={li} className="ep-line"/>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="ep-marks">[{section.marksEach} {section.marksEach===1?"mark":"marks"}]</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ));
            })()}

            {/* Footer */}
            <div className="ep-footer">
              <div className="ep-sign-row">
                <div className="ep-sign-box"><div className="ep-sign-line"/><div>Examiner's Signature</div></div>
                <div className="ep-sign-box"><div className="ep-sign-line"/><div>Checked By</div></div>
                <div className="ep-sign-box"><div className="ep-sign-line"/><div>Head of Department</div></div>
              </div>
              <div className="ep-end">--- End of Question Paper --- | Generated by EduSolve4U</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      <div style={{padding:"6rem 5% 3rem",maxWidth:900,margin:"0 auto"}}>
        <button onClick={()=>navigate("buildtest")} style={{background:"none",border:"none",color:"#7878a0",cursor:"pointer",fontSize:14,padding:0,marginBottom:16}}>← Back to Test Builder</button>
        <div className="section-label">Paper Generator</div>
        <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"2.2rem",marginBottom:24}}>🏛️ CBSE Exam Paper Generator</h1>

        {/* Exam Format Selector */}
        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"1.5rem",marginBottom:16}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:14}}>🎯 Select Exam Format</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {Object.entries(EXAM_FORMATS).map(([key,fmt])=>{
              const icons = {cbse10:"📚",cbse12:"🎓",jee_main:"⚡",jee_advanced:"🔬",neet:"🧬",upsc_prelims:"🏛️",upsc_mains:"📜",half_yearly:"📝"};
              const colors = {cbse10:"#6c63ff",cbse12:"#4facfe",jee_main:"#f7971e",jee_advanced:"#ff6584",neet:"#43e97b",upsc_prelims:"#ffd700",upsc_mains:"#c471f5",half_yearly:"#38f9d7"};
              const color = colors[key]||"#6c63ff";
              const isSelected = examFormat===key;
              return (
                <div key={key} onClick={()=>{
                  setExamFormat(key);
                  setSections(fmt.sections);
                  const counts={};
                  fmt.sections.forEach((s,i)=>{counts[i]=s.count;});
                  setSectionCounts(counts);
                  setTotalMarks(fmt.totalMarks);
                  setTimeAllowed(fmt.time.split(" ")[0]);
                }} style={{background:isSelected?`${color}18`:"#1a1a26",border:`2px solid ${isSelected?color:"#2a2a3e"}`,borderRadius:14,padding:"1rem",cursor:"pointer",transition:"all 0.2s"}}>
                  <div style={{fontSize:"1.5rem",marginBottom:6}}>{icons[key]}</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:13,color:isSelected?color:"#e8e8f0",marginBottom:2}}>{fmt.name}</div>
                  <div style={{fontSize:11,color:"#7878a0"}}>{fmt.totalMarks} Marks · {fmt.time}</div>
                  {isSelected&&<div style={{marginTop:6,fontSize:11,color,fontWeight:700}}>● Selected</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Paper Details */}
        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"1.5rem",marginBottom:16}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:14}}>📋 Paper Details</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label className="form-label">School / Institute Name</label>
              <input className="form-input" value={schoolName} onChange={e=>setSchoolName(e.target.value)} placeholder="School name"/>
            </div>
            <div>
              <label className="form-label">Exam Title</label>
              <input className="form-input" value={examTitle} onChange={e=>setExamTitle(e.target.value)} placeholder="Annual Examination 2024-25"/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
            <div>
              <label className="form-label">Class</label>
              <select className="form-input" value={cls} onChange={e=>setCls(e.target.value)}>
                <option value="9">Class IX</option>
                <option value="10">Class X</option>
                <option value="11">Class XI</option>
                <option value="12">Class XII</option>
              </select>
            </div>
            <div>
              <label className="form-label">Subject</label>
              <select className="form-input" value={subject} onChange={e=>setSubject(e.target.value)}>
                {(subjectsByClass[cls]||[]).map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Total Marks</label>
              <select className="form-input" value={totalMarks} onChange={e=>setTotalMarks(+e.target.value)}>
                <option value={40}>40 Marks (Half Yearly)</option>
                <option value={80}>80 Marks (Board)</option>
                <option value={100}>100 Marks</option>
              </select>
            </div>
            <div>
              <label className="form-label">Time Allowed</label>
              <select className="form-input" value={timeAllowed} onChange={e=>setTimeAllowed(e.target.value)}>
                <option value="1">1 Hour</option>
                <option value="1.5">1½ Hours</option>
                <option value="2">2 Hours</option>
                <option value="3">3 Hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section Distribution */}
        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"1.5rem",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>📊 Section Distribution</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1.1rem",color:totalCalc===totalMarks?"#43e97b":"#ff6584"}}>{totalCalc} / {totalMarks} Marks</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 80px 80px 80px",gap:8,padding:"8px 12px",fontSize:11,fontWeight:700,color:"#7878a0",textTransform:"uppercase",letterSpacing:"0.05em"}}>
            <div>Section</div><div>Type</div><div style={{textAlign:"center"}}>Count</div><div style={{textAlign:"center"}}>Marks</div><div style={{textAlign:"right"}}>Total</div>
          </div>
          {sections.map((s,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 80px 80px 80px",gap:8,padding:"10px 12px",background:"#1a1a26",borderRadius:10,marginBottom:6,alignItems:"center"}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14}}>Section {s.name}</div>
              <div>
                <span style={{background:s.type==="mcq"?"rgba(108,99,255,.2)":s.type==="short"?"rgba(67,233,123,.2)":s.type==="long"?"rgba(247,151,30,.2)":"rgba(196,113,245,.2)",color:s.type==="mcq"?"#a89cff":s.type==="short"?"#43e97b":s.type==="long"?"#f7971e":"#c471f5",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700}}>
                  {s.type==="mcq"?"MCQ":s.type==="short"?"Short":s.type==="long"?"Long":"Case Study"}
                </span>
              </div>
              <div>
                <input type="number" min={0} max={40} value={sectionCounts[i]??s.count} onChange={e=>setSectionCounts(prev=>({...prev,[i]:+e.target.value}))} style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:8,padding:"6px",color:"#e8e8f0",fontSize:13,textAlign:"center",width:"100%",fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
              </div>
              <div style={{textAlign:"center",fontWeight:600,fontSize:14}}>{s.marksEach}</div>
              <div style={{textAlign:"right",fontWeight:700,color:"#6c63ff",fontSize:14}}>{(sectionCounts[i]??s.count)*s.marksEach}</div>
            </div>
          ))}
        </div>

        {/* Chapters */}
        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"1.5rem",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>📚 Chapters</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setSelectedChapters(CHAPTERS[subject]||[])} style={{background:"rgba(108,99,255,.15)",border:"1px solid rgba(108,99,255,.3)",color:"#a89cff",padding:"4px 12px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600}}>All</button>
              <button onClick={()=>setSelectedChapters([])} style={{background:"rgba(255,101,132,.15)",border:"1px solid rgba(255,101,132,.3)",color:"#ff6584",padding:"4px 12px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600}}>None</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
            {(CHAPTERS[subject]||[]).map(ch=>(
              <div key={ch} onClick={()=>toggleChapter(ch)} style={{display:"flex",alignItems:"center",gap:8,background:selectedChapters.includes(ch)?"rgba(108,99,255,.15)":"#1a1a26",border:`1px solid ${selectedChapters.includes(ch)?"#6c63ff":"#2a2a3e"}`,borderRadius:10,padding:"8px 12px",cursor:"pointer",fontSize:13,transition:"all 0.15s"}}>
                <span style={{color:selectedChapters.includes(ch)?"#6c63ff":"#7878a0",fontSize:16}}>{selectedChapters.includes(ch)?"☑":"☐"}</span>
                <span style={{fontWeight:500}}>{ch}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"1.5rem",marginBottom:24}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:14}}>⚙️ Options</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label className="form-label">Paper Copy Type</label>
              <select className="form-input" value={includeAnswers} onChange={e=>setIncludeAnswers(e.target.value==="true")}>
                <option value="false">Student Copy (No Answers)</option>
                <option value="true">Teacher Copy (With Answers)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Mark Hot Topics 🔥</label>
              <select className="form-input" value={markHotspot} onChange={e=>setMarkHotspot(e.target.value==="true")}>
                <option value="false">No</option>
                <option value="true">Yes — Mark Frequently Asked Questions</option>
              </select>
            </div>
          </div>
          <label className="form-label">Special Instructions (optional)</label>
          <textarea className="form-input" rows={2} value={specialInstructions} onChange={e=>setSpecialInstructions(e.target.value)} placeholder="Any extra instructions for students..."/>
        </div>

        <button className="btn-primary" style={{width:"100%",fontSize:"1.05rem",padding:"14px"}} onClick={generatePaper} disabled={loading}>
          {loading?"⏳ Generating Paper...":"🎯 Generate Question Paper"}
        </button>
      </div>
    </div>
  );
}

const PAPER_CSS = `
  @media print {
    .no-print { display: none !important; }
    .paper-bg { background: white !important; padding: 0 !important; }
    .exam-paper { box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; }
    body > div > div:first-child { display: none !important; }
  }
  .exam-paper {
    background: white; max-width: 820px; margin: 0 auto;
    padding: 40px 50px; font-family: 'Times New Roman', serif;
    color: #000; box-shadow: 0 4px 40px rgba(0,0,0,.2);
    border-radius: 4px;
  }
  .ep-header { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 14px; }
  .ep-board { font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
  .ep-exam { font-size: 18px; font-weight: bold; margin: 4px 0; text-transform: uppercase; letter-spacing: 1px; }
  .ep-subject { font-size: 15px; font-weight: bold; margin: 2px 0; }
  .ep-school { font-size: 13px; margin: 4px 0; }
  .ep-meta { display: grid; grid-template-columns: 1fr 1fr; font-size: 13px; margin-bottom: 12px; padding: 8px 12px; border: 1px solid #000; }
  .ep-instructions { border: 1px solid #000; padding: 8px 12px; margin-bottom: 14px; font-size: 12px; }
  .ep-instr-title { font-weight: bold; margin-bottom: 4px; font-size: 13px; }
  .ep-instructions ol { padding-left: 18px; }
  .ep-instructions li { margin-bottom: 2px; }
  .ep-section-header { background: #000; color: #fff; padding: 5px 12px; font-weight: bold; font-size: 13px; margin: 14px 0 8px; text-transform: uppercase; letter-spacing: 1px; }
  .ep-section-note { font-size: 11.5px; font-style: italic; margin-bottom: 8px; color: #444; }
  .ep-question { margin-bottom: 10px; }
  .ep-q-row { display: flex; gap: 8px; align-items: flex-start; font-size: 13px; line-height: 1.6; }
  .ep-q-num { font-weight: bold; min-width: 24px; flex-shrink: 0; }
  .ep-q-body { flex: 1; }
  .ep-marks { font-size: 12px; color: #444; margin-left: auto; padding-left: 10px; font-style: italic; white-space: nowrap; flex-shrink: 0; }
  .ep-options { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-top: 5px; font-size: 12.5px; }
  .ep-option { display: flex; gap: 4px; }
  .ep-opt-label { font-weight: bold; }
  .ep-answer { font-size: 11px; color: #006600; margin-top: 5px; padding: 5px 8px; background: #f0fff0; border-left: 3px solid #006600; font-style: italic; }
  .ep-lines { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
  .ep-line { border-bottom: 1px solid #bbb; height: 22px; }
  .ep-hotspot { font-size: 10px; color: #8B0000; font-weight: bold; }
  .ep-footer { margin-top: 24px; border-top: 2px solid #000; padding-top: 10px; }
  .ep-sign-row { display: grid; grid-template-columns: 1fr 1fr 1fr; text-align: center; font-size: 12px; gap: 10px; }
  .ep-sign-box { display: flex; flex-direction: column; gap: 4px; }
  .ep-sign-line { border-bottom: 1px solid #000; height: 30px; margin-bottom: 4px; }
  .ep-end { text-align: center; margin-top: 10px; font-size: 11px; color: #666; }
`;

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS=`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;}
.badge-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(108,99,255,0.15);border:1px solid rgba(108,99,255,0.3);color:#a89cff;padding:6px 16px;border-radius:50px;font-size:12px;font-weight:600;letter-spacing:.05em;}
.section-label{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#6c63ff;margin-bottom:8px;}
.section-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;line-height:1.1;letter-spacing:-1px;margin-bottom:12px;}
.feature-card{border:1px solid #2a2a3e;border-radius:20px;padding:1.75rem;transition:transform .25s,border-color .25s,box-shadow .25s;}
.feature-card:hover{transform:translateY(-4px);border-color:#6c63ff;box-shadow:0 12px 40px rgba(108,99,255,.15);}
.hub-card:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(0,0,0,0.3);}
.btn-primary{background:linear-gradient(135deg,#6c63ff,#8b7fff);color:white;border:none;padding:11px 24px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 4px 20px rgba(108,99,255,.4);font-family:'DM Sans',sans-serif;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(108,99,255,.5);}
.btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.btn-primary-sm{background:linear-gradient(135deg,#6c63ff,#8b7fff);color:white;border:none;padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;}
.btn-secondary{background:transparent;color:#e8e8f0;border:1px solid #2a2a3e;padding:11px 24px;border-radius:12px;font-size:15px;font-weight:500;cursor:pointer;transition:border-color .2s,background .2s;font-family:'DM Sans',sans-serif;}
.btn-secondary:hover{border-color:#6c63ff;background:rgba(108,99,255,.08);}
.btn-ghost{background:transparent;color:#7878a0;border:1px solid #2a2a3e;padding:6px 12px;border-radius:8px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;}
.btn-ghost:hover{color:#e8e8f0;}
.form-label{display:block;font-size:11px;font-weight:700;color:#7878a0;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;}
.form-input{width:100%;background:#1a1a26;border:1px solid #2a2a3e;border-radius:10px;padding:10px 14px;color:#e8e8f0;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s;}
.form-input:focus{border-color:#6c63ff;}
textarea.form-input{display:block;}
.fade-in{animation:fadeIn 0.3s ease;}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
.spin{animation:spin .8s linear infinite;}
@keyframes slideUp{from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;}}
`;
