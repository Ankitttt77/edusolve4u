import React, { useState, useEffect, useRef, useCallback } from "react";
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

// DATA
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

const calcPoints = (score, timeTaken, totalQ) => {
  const base = (score/100)*totalQ*10;
  const mins = timeTaken/60;
  const timeBonus = Math.max(0, 30 - Math.floor(mins)) * 2; // max 60 bonus points for fast answers
  return Math.round(base + timeBonus);
};
const AVATAR_COLORS = ["#6c63ff","#ff6584","#43e97b","#f7971e","#4facfe","#c471f5","#38f9d7"];
const avatarColor = (id) => { let h=0; for(let c of (id||"x")) h+=c.charCodeAt(0); return AVATAR_COLORS[h%AVATAR_COLORS.length]; };
const fsGetAll = async (col) => {
  try {
    const snap = await getDocs(collection(db,col));
    return snap.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e) {
    console.error(`fsGetAll(${col}) failed:`, e.message);
    return [];
  }
};
const fsAdd = async (col,data) => addDoc(collection(db,col),{...data,createdAt:serverTimestamp()});
const fsSet = async (col,id,data) => setDoc(doc(db,col,id),data,{merge:true});
const fsDel = async (col,id) => deleteDoc(doc(db,col,id));
const fsGet = async (col,id) => { const d=await getDoc(doc(db,col,id)); return d.exists()?{id:d.id,...d.data()}:null; };

const seedIfEmpty = async () => {
  const snap = await getDocs(collection(db,"questions"));
  if(snap.empty) for(const q of SEED_QUESTIONS) await fsAdd("questions",q);
};

// ════════════════════════════════════════════════════════════════════════════
// AIPROMPTGENERATOR
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


// HOME CHATBOT SECTION
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
    if(!msg) return;
    setInput(msg);
    setLoading(true);
    setAsked(true);
    setResponse("");
    try {
      const reply = await askGroq(msg);
      setResponse(reply || "Sorry, could not get an answer!");
    } catch(e) {
      if(e.message==="NO_KEY") setResponse("⚠️ Add REACT_APP_GROQ_KEY in Vercel settings. Get free key at console.groq.com");
      else setResponse("Something went wrong. Please try again!");
    }
    setLoading(false);
  };

  return (
    <section style={{padding:"5rem 5%",background:"#0a0a0f"}}>
      <div style={{maxWidth:800,margin:"0 auto",textAlign:"center"}}>
        <div className="section-label">AI Study Assistant</div>
        <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"clamp(2rem,4vw,3rem)",letterSpacing:"-1.5px",marginBottom:8}}>
          Hi {userProfile?userProfile.name.split(" ")[0]:"there"} 👋<br/>
          <span style={{background:"linear-gradient(135deg,#6c63ff,#ff6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Where should we start?</span>
        </h2>
        <p style={{color:"#7878a0",marginBottom:32,fontSize:"1rem"}}>Ask any doubt — Maths, Science, History, anything!</p>

        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"18px 20px",marginBottom:20,textAlign:"left",boxShadow:"0 8px 40px rgba(108,99,255,0.1)"}}>
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&!loading&&ask()}
            placeholder="Ask EduBot anything..."
            style={{width:"100%",background:"transparent",border:"none",color:"#e8e8f0",fontSize:"1rem",outline:"none",fontFamily:"'DM Sans',sans-serif",marginBottom:14}}
          />
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:12,color:"#7878a0"}}>Powered by Groq AI ⚡</div>
            <button onClick={()=>ask()} disabled={loading||!input.trim()} style={{background:"linear-gradient(135deg,#6c63ff,#8b7fff)",border:"none",borderRadius:12,padding:"8px 20px",color:"#fff",cursor:"pointer",fontWeight:600,fontSize:14,opacity:loading||!input.trim()?0.5:1,fontFamily:"'DM Sans',sans-serif"}}>
              {loading?"Thinking...":"Ask →"}
            </button>
          </div>
        </div>

        {asked&&(
          <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"18px 20px",marginBottom:20,textAlign:"left",animation:"fadeIn 0.3s ease"}}>
            <div style={{display:"flex",gap:10,marginBottom:10,alignItems:"center"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#6c63ff,#ff6584)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem"}}>🎓</div>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,color:"#6c63ff"}}>EduBot</span>
            </div>
            {loading
              ?<div style={{color:"#7878a0",fontSize:14}}>EduBot is thinking...</div>
              :<div style={{fontSize:14,lineHeight:1.7,color:"#e8e8f0",whiteSpace:"pre-wrap"}}>{response}</div>
            }
          </div>
        )}

        {!asked&&(
          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            {SUGGESTIONS.map(s=>(
              <button key={s} onClick={()=>ask(s.slice(2))} style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:50,padding:"8px 18px",color:"#7878a0",cursor:"pointer",fontSize:13,fontWeight:500,transition:"all 0.2s",fontFamily:"'DM Sans',sans-serif"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#6c63ff";e.currentTarget.style.color="#e8e8f0";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#2a2a3e";e.currentTarget.style.color="#7878a0";}}
              >{s}</button>
            ))}
          </div>
        )}

        {asked&&(
          <button onClick={()=>{setAsked(false);setInput("");setResponse("");}} style={{background:"transparent",border:"1px solid #2a2a3e",borderRadius:20,padding:"8px 20px",color:"#7878a0",cursor:"pointer",fontSize:13,marginTop:8,fontFamily:"'DM Sans',sans-serif"}}>
            Ask another question
          </button>
        )}
      </div>
    </section>
  );
}


// PAPER GENERATOR PAGE
function PaperGeneratorPage({userProfile, navigate, handleLogout, showToast}) {
  const [step, setStep] = useState("config");
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
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [sectionCounts, setSectionCounts] = useState({});
  const [sections, setSections] = useState(EXAM_FORMATS?.cbse10?.sections || []);
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const paperRef = React.useRef(null);

  const subjectsByClass = {
    "10":["Mathematics","Science","Social Science","English"],
    "12":["Physics","Chemistry","Mathematics","Biology","English","History","Geography","Economics"],
    "9":["Mathematics","Science","Social Science","English"],
    "11":["Physics","Chemistry","Mathematics","Biology","English"],
  };

  useEffect(()=>{
    const fmt = EXAM_FORMATS?.[examFormat];
    if(fmt) {
      setSections(fmt.sections);
      const counts={};
      fmt.sections.forEach((s,i)=>{counts[i]=s.count;});
      setSectionCounts(counts);
      setTotalMarks(fmt.totalMarks);
      setTimeAllowed(fmt.time?.split(" ")[0]||"3");
    }
  },[examFormat]);

  useEffect(()=>{
    setSelectedChapters(CHAPTERS[subject]||[]);
  },[subject]);

  useEffect(()=>{
    const subjects = subjectsByClass[cls]||[];
    if(!subjects.includes(subject)) setSubject(subjects[0]);
  },[cls]);

  const totalCalc = sections.reduce((a,s,i)=>a+(sectionCounts[i]||s.count)*s.marksEach,0);
  const toggleChapter = (ch) => setSelectedChapters(prev=>prev.includes(ch)?prev.filter(c=>c!==ch):[...prev,ch]);

  const pickQ = (allQ, type, count) => {
    const typeFilter = {
      mcq: q=>(q.type||"mcq")==="mcq",
      short: q=>q.type==="short",
      long: q=>q.type==="long",
      case: q=>q.type==="case",
    };
    let pool = allQ.filter(q=>q.subject===subject&&(selectedChapters.length===0||selectedChapters.includes(q.chapter))&&(typeFilter[type]?typeFilter[type](q):true));
    if(pool.length<count) pool = allQ.filter(q=>q.subject===subject&&(selectedChapters.length===0||selectedChapters.includes(q.chapter)));
    return pool.sort(()=>Math.random()-0.5).slice(0,count);
  };

  const generatePaper = async () => {
    setLoading(true);
    try {
      const allQ = await fsGetAll("questions");
      const paperSections = sections.map((s,i)=>({...s,count:sectionCounts[i]||s.count,questions:pickQ(allQ,s.type,sectionCounts[i]||s.count)}));
      setGeneratedPaper(paperSections);
      setStep("preview");
    } catch(e) { showToast("Error: "+e.message,"error"); }
    setLoading(false);
  };

  if(step==="preview"&&generatedPaper) {
    let qNum=1;
    return (
      <div>
        <div className="no-print" style={{position:"fixed",top:0,left:0,right:0,zIndex:200,background:"rgba(10,10,15,0.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid #2a2a3e",padding:"12px 5%",display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={()=>setStep("config")} style={{background:"none",border:"1px solid #2a2a3e",color:"#7878a0",cursor:"pointer",padding:"7px 14px",borderRadius:8,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>← Back</button>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"1rem",marginRight:"auto"}}>📄 Question Paper Preview</div>
          <button onClick={()=>window.print()} style={{background:"transparent",border:"1px solid #2a2a3e",color:"#e8e8f0",cursor:"pointer",padding:"8px 18px",borderRadius:10,fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>🖨️ Print</button>
          <button onClick={()=>{showToast("Opening print dialog — select Save as PDF");setTimeout(()=>window.print(),500);}} className="btn-primary" style={{padding:"8px 18px",fontSize:13}}>📥 Save as PDF</button>
          <button onClick={generatePaper} style={{background:"transparent",border:"1px solid #2a2a3e",color:"#e8e8f0",cursor:"pointer",padding:"8px 18px",borderRadius:10,fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>🔄 Regenerate</button>
        </div>
        <style>{PAPER_CSS}</style>
        <div style={{background:"#e8e8e0",minHeight:"100vh",paddingTop:80,paddingBottom:40}}>
          <div ref={paperRef} className="exam-paper">
            <div className="ep-header">
              <div className="ep-board">{EXAM_FORMATS?.[examFormat]?.board||"Central Board of Secondary Education"}</div>
              <div className="ep-exam">{examTitle}</div>
              <div className="ep-subject">{subject} — Class {cls==="10"?"X":cls==="12"?"XII":cls==="9"?"IX":"XI"}</div>
              <div className="ep-school">{schoolName}</div>
            </div>
            <div className="ep-meta">
              <div><div><b>Time Allowed:</b> {timeAllowed} {parseFloat(timeAllowed)===1?"Hour":"Hours"}</div><div style={{marginTop:6}}><b>Roll No.:</b> ___________________</div></div>
              <div style={{textAlign:"right"}}><div><b>Maximum Marks:</b> {totalCalc}</div><div style={{marginTop:6}}><b>Date:</b> ___________________</div></div>
            </div>
            <div className="ep-instructions">
              <div className="ep-instr-title">General Instructions:</div>
              <ol>
                {(EXAM_FORMATS?.[examFormat]?.instructions||["All questions are compulsory.","Draw neat labelled diagrams wherever necessary."]).map((instr,i)=><li key={i}>{instr}</li>)}
                {specialInstructions&&<li>{specialInstructions}</li>}
              </ol>
            </div>
            {generatedPaper.map((section,si)=>(
              <div key={si}>
                <div className="ep-section-header">Section {section.name} [{section.count} x {section.marksEach} = {section.count*section.marksEach} Marks]</div>
                <div className="ep-section-note">{section.note}</div>
                {Array.from({length:section.count}).map((_,qi)=>{
                  const q=section.questions[qi];
                  const num=qNum++;
                  return (
                    <div key={qi} className="ep-question">
                      <div className="ep-q-row">
                        <span className="ep-q-num">{num}.</span>
                        <div className="ep-q-body">
                          {markHotspot&&q?.hotspot&&<span className="ep-hotspot">★ Frequently Asked </span>}
                          <span>{q?.text||`[${section.type.toUpperCase()} — add more questions to your bank]`}</span>
                          {section.type==="mcq"&&q?.options?.length>0&&(
                            <div className="ep-options">
                              {q.options.map((opt,oi)=><div key={oi} className="ep-option"><span className="ep-opt-label">({["a","b","c","d"][oi]})</span> {opt}</div>)}
                            </div>
                          )}
                          {includeAnswers&&q&&(
                            <div className="ep-answer">✓ {section.type==="mcq"?`Answer: (${["a","b","c","d"][q.answer]}) ${q.options?.[q.answer]||""}`:q.answer||q.explanation||""}</div>
                          )}
                          {!includeAnswers&&section.type!=="mcq"&&(
                            <div className="ep-lines">{Array.from({length:section.marksEach<=2?3:section.marksEach<=3?5:8}).map((_,li)=><div key={li} className="ep-line"/>)}</div>
                          )}
                        </div>
                        <span className="ep-marks">[{section.marksEach} {section.marksEach===1?"mark":"marks"}]</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="ep-footer">
              <div className="ep-sign-row">
                <div className="ep-sign-box"><div className="ep-sign-line"/><div>Examiner Signature</div></div>
                <div className="ep-sign-box"><div className="ep-sign-line"/><div>Checked By</div></div>
                <div className="ep-sign-box"><div className="ep-sign-line"/><div>Head of Department</div></div>
              </div>
              <div className="ep-end">End of Question Paper | Generated by EduSolve4U</div>
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
        <button onClick={()=>navigate("buildtest")} style={{background:"none",border:"none",color:"#7878a0",cursor:"pointer",fontSize:14,padding:0,marginBottom:16}}>← Back</button>
        <div className="section-label">Paper Generator</div>
        <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"2.2rem",marginBottom:24}}>🏛️ CBSE Exam Paper Generator</h1>

        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"1.5rem",marginBottom:16}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:14}}>🎯 Select Exam Format</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
            {Object.entries(EXAM_FORMATS||{}).map(([key,fmt])=>{
              const icons={cbse10:"📚",cbse12:"🎓",jee_main:"⚡",jee_advanced:"🔬",neet:"🧬",upsc_prelims:"🏛️",upsc_mains:"📜",half_yearly:"📝"};
              const colors={cbse10:"#6c63ff",cbse12:"#4facfe",jee_main:"#f7971e",jee_advanced:"#ff6584",neet:"#43e97b",upsc_prelims:"#ffd700",upsc_mains:"#c471f5",half_yearly:"#38f9d7"};
              const color=colors[key]||"#6c63ff";
              const isSelected=examFormat===key;
              return (
                <div key={key} onClick={()=>setExamFormat(key)} style={{background:isSelected?`${color}18`:"#1a1a26",border:`2px solid ${isSelected?color:"#2a2a3e"}`,borderRadius:14,padding:"1rem",cursor:"pointer",transition:"all 0.2s"}}>
                  <div style={{fontSize:"1.3rem",marginBottom:4}}>{icons[key]||"📄"}</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:12,color:isSelected?color:"#e8e8f0",marginBottom:2}}>{fmt.name}</div>
                  <div style={{fontSize:10,color:"#7878a0"}}>{fmt.totalMarks} Marks</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"1.5rem",marginBottom:16}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:14}}>📋 Paper Details</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label className="form-label">School Name</label><input className="form-input" value={schoolName} onChange={e=>setSchoolName(e.target.value)}/></div>
            <div><label className="form-label">Exam Title</label><input className="form-input" value={examTitle} onChange={e=>setExamTitle(e.target.value)}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
            <div><label className="form-label">Class</label><select className="form-input" value={cls} onChange={e=>setCls(e.target.value)}><option value="9">IX</option><option value="10">X</option><option value="11">XI</option><option value="12">XII</option></select></div>
            <div><label className="form-label">Subject</label><select className="form-input" value={subject} onChange={e=>setSubject(e.target.value)}>{(subjectsByClass[cls]||[]).map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="form-label">Marks</label><div style={{padding:"10px 14px",background:"#1a1a26",borderRadius:10,color:totalCalc===totalMarks?"#43e97b":"#ff6584",fontWeight:700}}>{totalCalc}/{totalMarks}</div></div>
            <div><label className="form-label">Time</label><select className="form-input" value={timeAllowed} onChange={e=>setTimeAllowed(e.target.value)}><option value="1">1 Hr</option><option value="1.5">1.5 Hrs</option><option value="2">2 Hrs</option><option value="3">3 Hrs</option></select></div>
          </div>
        </div>

        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"1.5rem",marginBottom:16}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:12}}>📊 Sections</div>
          {sections.map((s,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 80px 60px 60px 70px",gap:8,padding:"10px 12px",background:"#1a1a26",borderRadius:10,marginBottom:6,alignItems:"center"}}>
              <div style={{fontWeight:600,fontSize:13}}>Section {s.name} <span style={{fontSize:11,color:"#7878a0",fontWeight:400}}>({s.type})</span></div>
              <div><input type="number" min={0} max={40} value={sectionCounts[i]??s.count} onChange={e=>setSectionCounts(prev=>({...prev,[i]:+e.target.value}))} style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:8,padding:"6px",color:"#e8e8f0",fontSize:13,textAlign:"center",width:"100%",fontFamily:"'DM Sans',sans-serif",outline:"none"}}/></div>
              <div style={{textAlign:"center",fontWeight:600,color:"#7878a0",fontSize:13}}>×{s.marksEach}</div>
              <div style={{textAlign:"center",fontWeight:700,color:"#6c63ff",fontSize:13}}>{(sectionCounts[i]??s.count)*s.marksEach}</div>
              <div style={{fontSize:10,color:"#7878a0"}}>{s.note?.slice(0,30)}...</div>
            </div>
          ))}
        </div>

        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"1.5rem",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>📚 Chapters</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setSelectedChapters(CHAPTERS[subject]||[])} style={{background:"rgba(108,99,255,.15)",border:"1px solid rgba(108,99,255,.3)",color:"#a89cff",padding:"4px 12px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600}}>All</button>
              <button onClick={()=>setSelectedChapters([])} style={{background:"rgba(255,101,132,.15)",border:"1px solid rgba(255,101,132,.3)",color:"#ff6584",padding:"4px 12px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600}}>None</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:6}}>
            {(CHAPTERS[subject]||[]).map(ch=>(
              <div key={ch} onClick={()=>toggleChapter(ch)} style={{display:"flex",alignItems:"center",gap:8,background:selectedChapters.includes(ch)?"rgba(108,99,255,.15)":"#1a1a26",border:`1px solid ${selectedChapters.includes(ch)?"#6c63ff":"#2a2a3e"}`,borderRadius:10,padding:"8px 12px",cursor:"pointer",fontSize:13,transition:"all 0.15s"}}>
                <span style={{color:selectedChapters.includes(ch)?"#6c63ff":"#7878a0"}}>{selectedChapters.includes(ch)?"☑":"☐"}</span>
                <span>{ch}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"1.5rem",marginBottom:24}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:14}}>⚙️ Options</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label className="form-label">Copy Type</label><select className="form-input" value={String(includeAnswers)} onChange={e=>setIncludeAnswers(e.target.value==="true")}><option value="false">Student Copy</option><option value="true">Teacher Copy (With Answers)</option></select></div>
            <div><label className="form-label">Hot Topics</label><select className="form-input" value={String(markHotspot)} onChange={e=>setMarkHotspot(e.target.value==="true")}><option value="false">No</option><option value="true">Mark Frequently Asked</option></select></div>
          </div>
          <label className="form-label">Special Instructions</label>
          <textarea className="form-input" rows={2} value={specialInstructions} onChange={e=>setSpecialInstructions(e.target.value)} placeholder="Any extra instructions..."/>
        </div>

        <button className="btn-primary" style={{width:"100%",fontSize:"1.05rem",padding:"14px"}} onClick={generatePaper} disabled={loading}>
          {loading?"⏳ Generating...":"🎯 Generate Question Paper"}
        </button>
      </div>
    </div>
  );
}

const PAPER_CSS = `
  @media print { .no-print{display:none!important;} body{background:white;} .exam-paper{box-shadow:none!important;max-width:100%!important;} }
  .exam-paper{background:white;max-width:820px;margin:0 auto;padding:40px 50px;font-family:'Times New Roman',serif;color:#000;box-shadow:0 4px 40px rgba(0,0,0,.2);border-radius:4px;}
  .ep-header{text-align:center;border-bottom:3px double #000;padding-bottom:12px;margin-bottom:14px;}
  .ep-board{font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;}
  .ep-exam{font-size:18px;font-weight:bold;margin:4px 0;text-transform:uppercase;letter-spacing:1px;}
  .ep-subject{font-size:15px;font-weight:bold;margin:2px 0;}
  .ep-school{font-size:13px;margin:4px 0;}
  .ep-meta{display:grid;grid-template-columns:1fr 1fr;font-size:13px;margin-bottom:12px;padding:8px 12px;border:1px solid #000;}
  .ep-instructions{border:1px solid #000;padding:8px 12px;margin-bottom:14px;font-size:12px;}
  .ep-instr-title{font-weight:bold;margin-bottom:4px;font-size:13px;}
  .ep-instructions ol{padding-left:18px;}
  .ep-instructions li{margin-bottom:2px;}
  .ep-section-header{background:#000;color:#fff;padding:5px 12px;font-weight:bold;font-size:13px;margin:14px 0 8px;text-transform:uppercase;letter-spacing:1px;}
  .ep-section-note{font-size:11.5px;font-style:italic;margin-bottom:8px;color:#444;}
  .ep-question{margin-bottom:10px;}
  .ep-q-row{display:flex;gap:8px;align-items:flex-start;font-size:13px;line-height:1.6;}
  .ep-q-num{font-weight:bold;min-width:24px;flex-shrink:0;}
  .ep-q-body{flex:1;}
  .ep-marks{font-size:12px;color:#444;margin-left:auto;padding-left:10px;font-style:italic;white-space:nowrap;flex-shrink:0;}
  .ep-options{display:grid;grid-template-columns:1fr 1fr;gap:2px;margin-top:5px;font-size:12.5px;}
  .ep-option{display:flex;gap:4px;}
  .ep-opt-label{font-weight:bold;}
  .ep-answer{font-size:11px;color:#006600;margin-top:5px;padding:5px 8px;background:#f0fff0;border-left:3px solid #006600;font-style:italic;}
  .ep-lines{display:flex;flex-direction:column;gap:10px;margin-top:8px;}
  .ep-line{border-bottom:1px solid #bbb;height:22px;}
  .ep-hotspot{font-size:10px;color:#8B0000;font-weight:bold;}
  .ep-footer{margin-top:24px;border-top:2px solid #000;padding-top:10px;}
  .ep-sign-row{display:grid;grid-template-columns:1fr 1fr 1fr;text-align:center;font-size:12px;gap:10px;}
  .ep-sign-box{display:flex;flex-direction:column;gap:4px;}
  .ep-sign-line{border-bottom:1px solid #000;height:30px;margin-bottom:4px;}
  .ep-end{text-align:center;margin-top:10px;font-size:11px;color:#666;}
`;


const GLOBAL_CSS=`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;cursor:none;}

/* ── CUSTOM CURSOR ── */
#es-cursor{position:fixed;width:12px;height:12px;background:#6c63ff;border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:transform .1s,background .2s;mix-blend-mode:screen;}
#es-cursor-ring{position:fixed;width:36px;height:36px;border:1.5px solid rgba(108,99,255,.5);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:all .12s ease-out;}
#es-cursor.hovered{transform:translate(-50%,-50%) scale(2.5);background:#ff6584;}
#es-cursor-ring.hovered{transform:translate(-50%,-50%) scale(1.6);border-color:rgba(255,101,132,.6);}

/* ── AURORA BG ── */
.es-aurora{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;}
.es-aurora-orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:.18;animation:es-drift 20s ease-in-out infinite;}
.es-aurora-orb:nth-child(1){width:700px;height:700px;background:#6c63ff;top:-15%;left:-10%;animation-duration:25s;}
.es-aurora-orb:nth-child(2){width:500px;height:500px;background:#ff6584;top:40%;right:-10%;animation-duration:20s;animation-delay:-8s;}
.es-aurora-orb:nth-child(3){width:400px;height:400px;background:#43e97b;bottom:-15%;left:30%;animation-duration:30s;animation-delay:-15s;}
.es-aurora-orb:nth-child(4){width:300px;height:300px;background:#4facfe;top:20%;left:50%;animation-duration:18s;animation-delay:-5s;}
@keyframes es-drift{0%,100%{transform:translate(0,0) scale(1);}25%{transform:translate(60px,-40px) scale(1.05);}50%{transform:translate(-40px,60px) scale(.95);}75%{transform:translate(80px,30px) scale(1.02);}}

/* ── GRAIN OVERLAY ── */
.es-grain{position:fixed;top:-50%;left:-50%;width:200%;height:200%;pointer-events:none;z-index:1;opacity:.04;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");animation:es-grain-shift 8s steps(10) infinite;}
@keyframes es-grain-shift{0%,100%{transform:translate(0,0);}10%{transform:translate(-2%,-3%);}20%{transform:translate(3%,2%);}30%{transform:translate(-4%,1%);}40%{transform:translate(1%,-4%);}50%{transform:translate(-3%,3%);}60%{transform:translate(4%,-2%);}70%{transform:translate(-1%,4%);}80%{transform:translate(2%,-1%);}90%{transform:translate(-3%,-2%);}}

/* ── PARTICLES CANVAS ── */
#es-particles{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;}

/* ── HERO BADGE ── */
.badge-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(108,99,255,.12);border:1px solid rgba(108,99,255,.3);color:#a89cff;padding:8px 20px;border-radius:50px;font-size:12px;font-weight:600;letter-spacing:.05em;animation:es-badge-pop .6s cubic-bezier(.34,1.56,.64,1) .2s both;}
@keyframes es-badge-pop{from{opacity:0;transform:scale(.7) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);}}
.es-badge-dot{width:6px;height:6px;border-radius:50%;background:#43e97b;animation:es-pulse-dot 2s ease-in-out infinite;display:inline-block;}
@keyframes es-pulse-dot{0%,100%{box-shadow:0 0 0 0 rgba(67,233,123,.4);}50%{box-shadow:0 0 0 6px rgba(67,233,123,0);}}

/* ── GLITCH TEXT ── */
.es-glitch{position:relative;display:inline-block;}
.es-glitch::before,.es-glitch::after{content:attr(data-text);position:absolute;top:0;left:0;width:100%;pointer-events:none;}
.es-glitch::before{color:#ff6584;animation:es-glitch-1 4s infinite;clip-path:polygon(0 0,100% 0,100% 33%,0 33%);}
.es-glitch::after{color:#4facfe;animation:es-glitch-2 4s infinite;clip-path:polygon(0 66%,100% 66%,100% 100%,0 100%);}
@keyframes es-glitch-1{0%,90%,100%{transform:translate(0);}92%{transform:translate(-3px,1px);}94%{transform:translate(3px,-1px);}96%{transform:translate(-1px,2px);}}
@keyframes es-glitch-2{0%,90%,100%{transform:translate(0);}93%{transform:translate(3px,-2px);}95%{transform:translate(-3px,1px);}97%{transform:translate(2px,2px);}}

/* ── GRADIENT TEXT ── */
.es-grad-text{background:linear-gradient(135deg,#6c63ff,#ff6584,#f7971e,#6c63ff);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:es-grad-shift 4s ease-in-out infinite;}
@keyframes es-grad-shift{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}

/* ── WORD RISE ── */
.es-hero-line{overflow:hidden;display:block;}
.es-word{display:inline-block;animation:es-word-rise 1s cubic-bezier(.22,1,.36,1) both;}
.es-line-1 .es-word{animation-delay:.3s;}
.es-line-2 .es-word{animation-delay:.45s;}
.es-line-3 .es-word{animation-delay:.6s;}
@keyframes es-word-rise{from{opacity:0;transform:translateY(110%) skewY(8deg);}to{opacity:1;transform:translateY(0) skewY(0);}}

/* ── FADE UP ── */
.es-fade-up-1{animation:es-fade-up .8s ease .8s both;}
.es-fade-up-2{animation:es-fade-up .8s ease 1s both;}
.es-fade-up-3{animation:es-fade-up .8s ease 1.2s both;}
@keyframes es-fade-up{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}

/* ── MARQUEE ── */
.es-marquee-wrap{overflow:hidden;padding:1.5rem 0;border-top:1px solid #2a2a3e;border-bottom:1px solid #2a2a3e;background:linear-gradient(90deg,#0a0a0f,transparent 5%,transparent 95%,#0a0a0f);position:relative;z-index:2;}
.es-marquee-track{display:flex;gap:0;animation:es-marquee 30s linear infinite;width:max-content;}
.es-marquee-track:hover{animation-play-state:paused;}
.es-marquee-item{display:flex;align-items:center;gap:12px;padding:0 32px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1rem;white-space:nowrap;color:#7878a0;}
.es-marquee-item span{color:#6c63ff;font-size:1.2rem;}
@keyframes es-marquee{from{transform:translateX(0);}to{transform:translateX(-50%);}}

/* ── SCROLL REVEAL ── */
.es-reveal{opacity:0;transform:translateY(40px);transition:opacity .7s ease,transform .7s cubic-bezier(.22,1,.36,1);}
.es-reveal.in-view{opacity:1;transform:translateY(0);}
.es-reveal-left{opacity:0;transform:translateX(-40px);transition:opacity .7s ease,transform .7s cubic-bezier(.22,1,.36,1);}
.es-reveal-left.in-view{opacity:1;transform:translateX(0);}
.es-reveal-right{opacity:0;transform:translateX(40px);transition:opacity .7s ease,transform .7s cubic-bezier(.22,1,.36,1);}
.es-reveal-right.in-view{opacity:1;transform:translateX(0);}
.es-reveal-scale{opacity:0;transform:scale(.85);transition:opacity .7s ease,transform .7s cubic-bezier(.34,1.56,.64,1);}
.es-reveal-scale.in-view{opacity:1;transform:scale(1);}
.es-stagger-1{transition-delay:.1s;}.es-stagger-2{transition-delay:.2s;}.es-stagger-3{transition-delay:.3s;}.es-stagger-4{transition-delay:.4s;}.es-stagger-5{transition-delay:.5s;}.es-stagger-6{transition-delay:.6s;}

/* ── FLOATING ── */
.es-float{animation:es-floating 6s ease-in-out infinite;}
.es-float-1{animation-delay:0s;}.es-float-2{animation-delay:-2s;}.es-float-3{animation-delay:-4s;}
@keyframes es-floating{0%,100%{transform:translateY(0);}50%{transform:translateY(-16px);}}

/* ── TYPEWRITER ── */
.es-typewriter{border-right:2px solid #6c63ff;animation:es-blink .7s step-end infinite;}
@keyframes es-blink{0%,100%{border-color:#6c63ff;}50%{border-color:transparent;}}

/* ── GLOW BUTTON ── */
.es-glow-btn{position:relative;background:linear-gradient(135deg,#6c63ff,#8b7fff);color:#fff;border:none;padding:14px 28px;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 0 20px rgba(108,99,255,.5),0 4px 24px rgba(108,99,255,.4);transition:all .3s;overflow:hidden;}
.es-glow-btn::before{content:'';position:absolute;top:50%;left:50%;width:0;height:0;background:rgba(255,255,255,.2);border-radius:50%;transform:translate(-50%,-50%);transition:width .6s,height .6s,opacity .6s;opacity:1;}
.es-glow-btn:hover::before{width:400px;height:400px;opacity:0;}
.es-glow-btn:hover{transform:translateY(-3px);box-shadow:0 0 40px rgba(108,99,255,.7),0 12px 36px rgba(108,99,255,.55);}

/* ── FEATURE CARD (enhanced) ── */
.feature-card{border:1px solid #2a2a3e;border-radius:20px;padding:1.75rem;transition:transform .3s cubic-bezier(.22,1,.36,1),border-color .3s,box-shadow .3s;position:relative;overflow:hidden;cursor:pointer;}
.feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(108,99,255,.8),transparent);transform:scaleX(0);transition:transform .4s ease;}
.feature-card:hover::before{transform:scaleX(1);}
.feature-card:hover{transform:translateY(-6px);border-color:rgba(108,99,255,.4);box-shadow:0 20px 60px rgba(108,99,255,.12);}
.feature-card .f-icon{transition:transform .3s cubic-bezier(.34,1.56,.64,1);}
.feature-card:hover .f-icon{transform:scale(1.2) rotate(-5deg);}

/* ── HUB CARD (enhanced) ── */
.hub-card{transition:all .3s cubic-bezier(.22,1,.36,1);}
.hub-card:hover{transform:translateY(-5px) scale(1.02);box-shadow:0 20px 50px rgba(0,0,0,0.4);}

/* ── COUNTER ── */
.es-counter{font-family:'Space Grotesk',sans-serif;font-weight:800;}

/* ── SPOTLIGHT CARD ── */
.es-spotlight-card{background:#12121a;border:1px solid #2a2a3e;border-radius:24px;padding:2.5rem;position:relative;overflow:hidden;}
.es-spotlight-card::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--sx,50%) var(--sy,50%),rgba(108,99,255,.15) 0%,transparent 50%);opacity:0;transition:opacity .3s;pointer-events:none;}
.es-spotlight-card:hover::before{opacity:1;}

/* ── MAGNETIC ── */
.es-magnetic{display:inline-block;transition:transform .3s cubic-bezier(.22,1,.36,1);}

/* ── NAV SCROLL EFFECT is applied via JS ── */

.section-label{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#6c63ff;margin-bottom:8px;}
.section-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;line-height:1.1;letter-spacing:-1px;margin-bottom:12px;}
.btn-primary{background:linear-gradient(135deg,#6c63ff,#8b7fff);color:white;border:none;padding:11px 24px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;transition:transform .2s,box-shadow .2s;box-shadow:0 4px 20px rgba(108,99,255,.4);font-family:'DM Sans',sans-serif;position:relative;overflow:hidden;}
.btn-primary::after{content:'';position:absolute;top:50%;left:50%;width:0;height:0;background:rgba(255,255,255,.15);border-radius:50%;transform:translate(-50%,-50%);transition:width .6s,height .6s,opacity .6s;}
.btn-primary:hover::after{width:300px;height:300px;opacity:0;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(108,99,255,.5);}
.btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.btn-primary-sm{background:linear-gradient(135deg,#6c63ff,#8b7fff);color:white;border:none;padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;}
.btn-secondary{background:transparent;color:#e8e8f0;border:1px solid #2a2a3e;padding:11px 24px;border-radius:12px;font-size:15px;font-weight:500;cursor:pointer;transition:border-color .2s,background .2s,transform .2s;font-family:'DM Sans',sans-serif;}
.btn-secondary:hover{border-color:#6c63ff;background:rgba(108,99,255,.08);transform:translateY(-2px);}
.btn-ghost{background:transparent;color:#7878a0;border:1px solid #2a2a3e;padding:6px 12px;border-radius:8px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;}
.btn-ghost:hover{color:#e8e8f0;}
.form-label{display:block;font-size:11px;font-weight:700;color:#7878a0;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;}
.form-input{width:100%;background:#1a1a26;border:1px solid #2a2a3e;border-radius:10px;padding:10px 14px;color:#e8e8f0;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s;cursor:text;}
.form-input:focus{border-color:#6c63ff;}
textarea.form-input{display:block;}
.fade-in{animation:fadeIn 0.3s ease;}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
.spin{animation:spin .8s linear infinite;}
@keyframes slideUp{from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;}}
@keyframes es-toast-in{from{opacity:0;transform:translateY(20px) scale(.9);}to{opacity:1;transform:translateY(0) scale(1);}}
@media (max-width:768px){
  body{cursor:auto;}
  #es-cursor,#es-cursor-ring{display:none;}
  nav{padding:0 4% !important;height:58px !important;}
  nav>div:last-child{gap:4px !important;}
  [style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr !important;}
  [style*="grid-template-columns: repeat(auto-fill,minmax(260px"]{grid-template-columns:1fr !important;}
  [style*="grid-template-columns: repeat(auto-fill,minmax(280px"]{grid-template-columns:1fr !important;}
  [style*="grid-template-columns: 60px 1fr 80px 80px 80px 80px"]{grid-template-columns:40px 1fr 60px 60px !important;}
  .btn-primary,.btn-secondary{padding:10px 16px !important;font-size:14px !important;}
  [style*="width: 340px"]{width:calc(100vw - 32px) !important;}
}
@media (max-width:480px){
  h1{font-size:clamp(1.6rem,7vw,2.4rem) !important;}
  .section-title{font-size:clamp(1.4rem,6vw,2rem) !important;}
}
`;


// ═══════════════════════════════════════════════════════════════════════
// ANIMATION UTILITIES

// Custom cursor hook
function useCursor() {
  useEffect(() => {
    const cursor = document.getElementById("es-cursor");
    const ring = document.getElementById("es-cursor-ring");
    if (!cursor || !ring) return;
    const move = (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
      ring.style.left = e.clientX + "px";
      ring.style.top = e.clientY + "px";
    };
    const onOver = (e) => {
      if (e.target.closest("a,button")) {
        cursor.classList.add("hovered");
        ring.classList.add("hovered");
      } else {
        cursor.classList.remove("hovered");
        ring.classList.remove("hovered");
      }
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);
}

// Particles canvas hook
function useParticles() {
  useEffect(() => {
    const canvas = document.getElementById("es-particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const COLORS = ["#6c63ff","#ff6584","#43e97b","#4facfe","#f7971e","#38f9d7"];
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let particles = [];
    const NUM = 60;

    for (let i = 0; i < NUM; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: Math.random() * 0.5 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.02;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const op = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = op;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = "#6c63ff";
            ctx.globalAlpha = (1 - dist / 100) * 0.08;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);
}

// Scroll reveal hook — observes .es-reveal* elements
function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in-view"); }),
      { threshold: 0.12 }
    );
    const targets = document.querySelectorAll(".es-reveal,.es-reveal-left,.es-reveal-right,.es-reveal-scale");
    targets.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

// Counter animation — runs once when counter scrolls into view
function useCounters() {
  useEffect(() => {
    function animateCounter(el) {
      const target = +el.dataset.target;
      const start = performance.now();
      const dur = 2000;
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val = Math.floor(ease * target);
        el.textContent = val >= 1000 ? Math.floor(val / 1000) + "K+" : val + "+";
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target >= 1000 ? Math.floor(target / 1000) + "K+" : target + "+";
      }
      requestAnimationFrame(step);
    }

    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          document.querySelectorAll(".es-counter[data-target]").forEach(animateCounter);
          obs.disconnect();
        }
      }),
      { threshold: 0.3 }
    );
    const first = document.querySelector(".es-counter[data-target]");
    if (first) obs.observe(first.closest("section") || first);

    const counters = document.querySelectorAll(".es-counter[data-target]");
    counters.forEach((el) => {
      el.addEventListener("mouseenter", () => animateCounter(el));
    });

    return () => {
      obs.disconnect();
      counters.forEach((el) => {
        el.removeEventListener("mouseenter", () => animateCounter(el));
      });
    };
  }, []);
}

// Magnetic button effect
function useMagnetic() {
  useEffect(() => {
    const els = document.querySelectorAll(".es-magnetic");
    const handlers = [];
    els.forEach((el) => {
      const mm = (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      };
      const ml = () => { el.style.transform = ""; };
      el.addEventListener("mousemove", mm);
      el.addEventListener("mouseleave", ml);
      handlers.push({ el, mm, ml });
    });
    return () => handlers.forEach(({ el, mm, ml }) => {
      el.removeEventListener("mousemove", mm);
      el.removeEventListener("mouseleave", ml);
    });
  });
}

// Spotlight card effect
function useSpotlight() {
  useEffect(() => {
    const cards = document.querySelectorAll(".es-spotlight-card");
    const handlers = [];
    cards.forEach((card) => {
      const mm = (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--sx", ((e.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--sy", ((e.clientY - r.top) / r.height * 100) + "%");
      };
      card.addEventListener("mousemove", mm);
      handlers.push({ card, mm });
    });
    return () => handlers.forEach(({ card, mm }) => card.removeEventListener("mousemove", mm));
  });
}

// Typewriter effect hook
const TYPEWRITER_PHRASES = ["Crack JEE 2025","Top the Boards","Master NEET","Clear UPSC","Score 100%"];
function useTypewriter() {
  const [text, setText] = useState("");
  useEffect(() => {
    let pi = 0, ci = 0, typing = true;
    const id = setInterval(() => {
      if (typing) {
        ci++;
        setText(TYPEWRITER_PHRASES[pi].slice(0, ci));
        if (ci === TYPEWRITER_PHRASES[pi].length) { typing = false; }
      } else {
        ci--;
        setText(TYPEWRITER_PHRASES[pi].slice(0, ci));
        if (ci === 0) { typing = true; pi = (pi + 1) % TYPEWRITER_PHRASES.length; }
      }
    }, 80);
    return () => clearInterval(id);
  }, []);
  return text;
}

// Global animation layer — renders aurora, grain, particles, cursor
function AnimationLayer() {
  useCursor();
  useParticles();
  return (
    <>
      <div id="es-cursor"/>
      <div id="es-cursor-ring"/>
      <canvas id="es-particles"/>
      <div className="es-aurora">
        <div className="es-aurora-orb"/>
        <div className="es-aurora-orb"/>
        <div className="es-aurora-orb"/>
        <div className="es-aurora-orb"/>
      </div>
      <div className="es-grain"/>
    </>
  );
}

// Marquee data
const MARQUEE_ITEMS = [
  ["⚡","JEE Main 2024"],["🧬","NEET UG 2024"],["🏛️","UPSC CSE 2024"],["📚","CBSE Class 10"],
  ["🔬","JEE Advanced 2024"],["🎯","AI Questions"],["📊","Real-time Rankings"],["🤖","Groq AI Powered"],
  ["📐","Mathematics"],["⚛️","Physics"],["🧪","Chemistry"],["🌍","Social Science"],
];

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
    // Only seed if user is authenticated to respect Firestore rules
    const unsub = onAuthStateChanged(auth, async (user) => {
      if(user) seedIfEmpty();
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

  const handleAIQuestion = async (subject,chapter,difficulty,aiType="mcq",examType="boards") => {
    showToast("AI generating question… ✨");
    try {
      const GROQ_KEY = process.env.REACT_APP_GROQ_KEY;
      if(!GROQ_KEY) { showToast("Add REACT_APP_GROQ_KEY in Vercel settings","error"); return; }

      const promptMap = {
        mcq: `Create one MCQ for class 10 ${subject} - ${chapter} at ${difficulty} difficulty. Respond with ONLY this JSON, no extra text: {"text":"question?","options":["A","B","C","D"],"answer":1,"explanation":"reason","type":"mcq","marks":1,"hotspot":false}`,
        short2: `Create one 2-mark short answer question for class 10 ${subject} - ${chapter}. Respond with ONLY this JSON: {"text":"question?","answer":"model answer","explanation":"key points","type":"short","marks":2,"hotspot":false}`,
        short3: `Create one 3-mark short answer question for class 10 ${subject} - ${chapter}. Respond with ONLY this JSON: {"text":"question?","answer":"model answer","explanation":"key points","type":"short","marks":3,"hotspot":false}`,
        long4: `Create one 4-mark long answer question for class 10 ${subject} - ${chapter}. Respond with ONLY this JSON: {"text":"question?","answer":"detailed answer","explanation":"marks breakdown","type":"long","marks":4,"hotspot":false}`,
        long5: `Create one 5-mark long answer question for class 10 ${subject} - ${chapter}. Respond with ONLY this JSON: {"text":"question?","answer":"comprehensive answer","explanation":"full marks tips","type":"long","marks":5,"hotspot":false}`,
        case: `Create one case study question for class 10 ${subject} - ${chapter}. Respond with ONLY this JSON: {"text":"[scenario]. (i) q1 (ii) q2 (iii) q3","answer":"(i) a1 (ii) a2 (iii) a3","explanation":"concepts tested","type":"case","marks":4,"hotspot":false}`,
        hotspot: `Create one HIGH PROBABILITY CBSE board MCQ for class 10 ${subject} - ${chapter}. Respond with ONLY this JSON: {"text":"question?","options":["A","B","C","D"],"answer":1,"explanation":"reason + why frequently asked","type":"mcq","marks":1,"hotspot":true}`,
      };
      const prompt = promptMap[aiType] || promptMap.mcq;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "You are an expert Indian school teacher. Always respond with ONLY valid JSON, no markdown, no backticks, no extra text." },
            { role: "user", content: prompt }
          ],
          max_tokens: 512,
          temperature: 0.4,
        }),
      });

      const data = await res.json();
      if(data.error) { showToast("Error: "+data.error.message,"error"); return; }
      const raw = data.choices?.[0]?.message?.content || "";
      if(!raw) { showToast("AI returned empty response","error"); return; }

      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if(!jsonMatch) { showToast("Could not parse AI response","error"); return; }
      const parsed = JSON.parse(jsonMatch[0]);
      if(!parsed.text) { showToast("Invalid question format","error"); return; }

      const subjectClassMap = {"Physics":"11","Chemistry":"11","Biology":"11","History":"11","Geography":"11","Economics":"11","Computer Science":"11","Mathematics":"10","Science":"10","Social Science":"10","English":"10"};
      const questionClass = subjectClassMap[subject] || "10";
      const isSubjective = aiType==="short2"||aiType==="short3"||aiType==="long4"||aiType==="long5"||aiType==="case";
      const qType = aiType==="short2"||aiType==="short3"?"short":aiType==="long4"||aiType==="long5"?"long":aiType==="case"?"case":"mcq";
      const marks = aiType==="short2"?2:aiType==="short3"?3:aiType==="long4"?4:aiType==="long5"?5:aiType==="case"?4:1;

      const newQ = {
        subject, chapter, studentClass:questionClass, difficulty, source:"ai",
        exam:examType||"boards", year:new Date().getFullYear().toString(),
        type:qType, marks, hotspot:aiType==="hotspot",
        ...parsed,
        options: isSubjective ? [] : (parsed.options||[]),
      };
      await fsAdd("questions", newQ);
      showToast("AI question generated & saved! 🤖");
      return newQ;
    } catch(e) { showToast("Error: "+e.message,"error"); return null; }
  };

  if(appLoading) return <Loader/>;

  const props = {currentUser,userProfile,navigate,showToast,handleLogin,handleRegister,handleLogout,handleExamFinish,handleAddQuestion,handleDeleteQuestion,handleAIQuestion,examConfig,examResult,examHub};

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",color:"#e8e8f0",fontFamily:"'DM Sans',sans-serif",overflowX:"hidden"}}>
      <style>{GLOBAL_CSS}</style>
      <AnimationLayer/>
      <div style={{position:"relative",zIndex:2}}>
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      {page==="home"&&<HomePage {...props}/>}
      {page==="login"&&<LoginPage {...props}/>}
      {page==="register"&&<RegisterPage {...props}/>}
      {page==="dashboard"&&<DashboardPage {...props}/>}
      {page==="buildtest"&&<BuildTestPage {...props}/>}
      {page==="exam"&&<ExamPage {...props}/>}
      {page==="result"&&<ResultPage {...props}/>}
      {page==="leaderboard"&&<LeaderboardPage {...props}/>}
      
      {page==="admin"&&<AdminPage {...props}/>}
      {page==="addQuestion"&&<AddQuestionPage {...props}/>}
      {page==="papergen"&&<PaperGeneratorPage {...props}/>}
      {page==="search"&&<SearchPage {...props}/>}
      <StudyChatBot userProfile={userProfile}/>
      {page==="examhub"&&<ExamHubPage {...props}/>}
      {page==="books"&&<BooksPage {...props}/>}
      </div>
    </div>
  );
}

// LOADER
function Loader() {
  return <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
    <div className="spin" style={{width:48,height:48,border:"3px solid #2a2a3e",borderTop:"3px solid #6c63ff",borderRadius:"50%"}}/>
    <div style={{color:"#7878a0",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>Loading EduSolve4U…</div>
  </div>;
}

// TOAST
function Toast({msg,type}) {
  return <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,background:type==="error"?"#ff6584":"#43e97b",color:"#0a0a0f",padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.4)",animation:"slideUp 0.3s ease"}}>{msg}</div>;
}

// NAV
function Nav({userProfile,navigate,handleLogout}) {
  const [menuOpen,setMenuOpen] = useState(false);
  const navRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      if (!navRef.current) return;
      if (window.scrollY > 60) {
        navRef.current.style.background = "rgba(10,10,15,.95)";
        navRef.current.style.borderBottomColor = "rgba(42,42,62,.9)";
        navRef.current.style.boxShadow = "0 4px 24px rgba(0,0,0,.3)";
      } else {
        navRef.current.style.background = "rgba(10,10,15,.7)";
        navRef.current.style.borderBottomColor = "rgba(42,42,62,.6)";
        navRef.current.style.boxShadow = "none";
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav ref={navRef} style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"0 5%",height:68,display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(10,10,15,0.7)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(42,42,62,.6)",transition:"background .3s,border-color .3s,box-shadow .3s"}}>
      <div onClick={()=>navigate("home")} style={{cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:"1.4rem",letterSpacing:"-0.5px"}}>
        <span style={{background:"linear-gradient(135deg,#6c63ff,#ff6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>EduSolve</span><span style={{color:"#43e97b"}}>4U</span>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <NavBtn onClick={()=>navigate("examhub")} label="🎯 Hubs"/>
        <NavBtn onClick={()=>navigate("search")} label="🔍"/>
        <NavBtn onClick={()=>navigate("leaderboard")} label="🏆"/>
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

// HOME
function HomePage({navigate,userProfile,handleLogout}) {
  const twText = useTypewriter();
  useScrollReveal();
  useCounters();
  useMagnetic();
  useSpotlight();
  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout}/>
      {/* ── HERO ── */}
      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"8rem 4% 3rem",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1,maxWidth:860}}>
          <div className="badge-pill"><span className="es-badge-dot"/>&nbsp;✦ India's Smartest Exam Platform</div>

          <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:"clamp(2.8rem,6vw,5rem)",fontWeight:800,lineHeight:1.0,letterSpacing:"-3px",margin:"1.5rem 0"}}>
            <span className="es-hero-line es-line-1"><span className="es-word">Crack JEE, NEET,</span></span>
            <span className="es-hero-line es-line-2"><span className="es-word">UPSC &amp; Boards with</span></span>
            <span className="es-hero-line es-line-3">
              <span className="es-word es-grad-text es-glitch" data-text="EduSolve4U">EduSolve4U</span>
            </span>
          </h1>

          <p className="es-fade-up-1" style={{fontSize:"1.15rem",color:"#7878a0",maxWidth:560,margin:"0 auto 2.5rem",lineHeight:1.7}}>
            Smart practice tests, AI-generated questions, real-time leaderboards and curated books — all in one place.
          </p>
          <p style={{fontSize:"1rem",color:"#a89cff",marginBottom:"2rem",minHeight:"1.6rem"}}>
            <span className="es-typewriter">{twText}</span>
          </p>

          <div className="es-fade-up-2" style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:"3.5rem"}}>
            <button onClick={()=>navigate(userProfile?"dashboard":"register")} className="es-glow-btn es-magnetic">🎯 Start Practising Free</button>
            <button onClick={()=>navigate("examhub")} className="btn-secondary es-magnetic" style={{fontSize:"1rem",padding:"13px 28px"}}>🏛️ Explore Exam Hubs</button>
          </div>

          <div className="es-fade-up-3" style={{display:"flex",gap:40,justifyContent:"center",flexWrap:"wrap"}}>
            {[["50000","Questions","50K+"],["4","Exam Hubs","4"],["12000","Students","12K+"],["100","Free","100%"]].map(([target,label,fallback])=>(
              <div key={label} style={{textAlign:"center"}}>
                {target==="100"
                  ? <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:"2rem",fontWeight:800,background:"linear-gradient(135deg,#6c63ff,#ff6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{fallback}</div>
                  : <div className="es-counter" data-target={target} style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:"2rem",fontWeight:800,background:"linear-gradient(135deg,#6c63ff,#ff6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{fallback}</div>
                }
                <div style={{fontSize:13,color:"#7878a0"}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="es-marquee-wrap">
        <div className="es-marquee-track">
          {[...MARQUEE_ITEMS,...MARQUEE_ITEMS].map(([icon,label],i)=>(
            <div key={i} className="es-marquee-item"><span>{icon}</span>{label}</div>
          ))}
        </div>
      </div>

      <HomeChatSection userProfile={userProfile}/>

      {/* Exam Hubs Preview */}
      <section style={{padding:"5rem 5%",background:"#0d0d14"}}>
        <div style={{textAlign:"center",marginBottom:"2.5rem"}} className="es-reveal">
          <div className="section-label">Exam Hubs</div>
          <h2 className="section-title">Prepare for <span style={{color:"#6c63ff"}}>Your Target Exam</span></h2>
          <p style={{color:"#7878a0",marginTop:8}}>Dedicated practice zones, books and questions for each exam</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(240px,100%),1fr))",gap:16,maxWidth:1100,margin:"0 auto"}}>
          {EXAM_HUBS.map((hub,i)=>(
            <div key={hub.id} onClick={()=>navigate("examhub",{hub})} style={{background:"#12121a",border:`1px solid ${hub.color}33`,borderRadius:20,padding:"1.75rem",cursor:"pointer"}} className={`hub-card es-reveal es-stagger-${i+1}`}>
              <div style={{fontSize:"2.5rem",marginBottom:12}} className={`es-float es-float-${(i%3)+1}`}>{hub.icon}</div>
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
        <div style={{textAlign:"center",marginBottom:"2.5rem"}} className="es-reveal">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything You Need to <span style={{color:"#43e97b"}}>Top Your Exam</span></h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(260px,100%),1fr))",gap:16,maxWidth:1100,margin:"0 auto"}}>
          {[["🎯","Smart Test Builder","Card-based subject & chapter picker with difficulty control","rgba(108,99,255,0.1)"],["🔍","Question Search","Search by subject, chapter, exam, difficulty and year","rgba(67,233,123,0.1)"],["🏆","Live Leaderboard","Ranked by score + speed. Compete with real students nationwide","rgba(255,215,0,0.1)"],["🤖","AI Questions","Gemini AI generates fresh curriculum-aligned MCQs instantly","rgba(79,172,254,0.1)"],["📚","Curated Books","Free PDFs and study materials for JEE, NEET, UPSC and Boards","rgba(247,151,30,0.1)"],["📊","Performance Analytics","Track your weak areas and improve chapter by chapter","rgba(255,101,132,0.1)"]].map(([icon,title,desc,bg],i)=>(
            <div key={title} className={`feature-card es-reveal es-stagger-${i+1}`} style={{background:bg}}>
              <div className="f-icon" style={{fontSize:"2rem",marginBottom:12}}>{icon}</div>
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

// EXAMHUBPAGE
function ExamHubPage({userProfile,navigate,handleLogout,examHub,showToast}) {
  const [activeHub,setActiveHub] = useState(examHub||EXAM_HUBS[0]);
  const [tab,setTab] = useState("practice");
  useEffect(()=>{ if(examHub) setActiveHub(examHub); },[examHub]);
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

// SEARCHPAGE
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

// LOGIN
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

// REGISTER
function RegisterPage({navigate,handleRegister,userProfile,handleLogout}) {
  const [form,setForm]=useState({name:"",email:"",password:"",studentClass:"10"});
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

// DASHBOARD
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

// BUILDTESTPAGE(CardUI)
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
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginBottom:28}}>
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

// EXAMPAGE
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
        <div style={{display:"flex",gap:8,justifyContent:"space-between",flexWrap:"wrap"}}>
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

// RESULTPAGE
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
                {ua!==undefined&&(
                  q.type==="short"||q.type==="long"||q.type==="case"
                  ? <div style={{color:"#4facfe"}}>Your answer: {typeof ua==="string"?ua:"(not answered)"}</div>
                  : <div style={{color:ok?"#43e97b":"#ff6584"}}>Your answer: ({["A","B","C","D"][ua]}) {q.options?.[ua]||""}</div>
                )}
                {!ok&&q.type!=="short"&&q.type!=="long"&&q.type!=="case"&&<div style={{color:"#43e97b"}}>Correct: ({["A","B","C","D"][q.answer]}) {q.options?.[q.answer]||""}</div>}
                {(q.type==="short"||q.type==="long"||q.type==="case")&&q.answer&&<div style={{color:"#43e97b",marginTop:4}}>Model Answer: {q.answer}</div>}
                {q.explanation&&<div style={{marginTop:6,color:"#7878a0"}}>💡 {q.explanation}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// LEADERBOARD
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
              <div style={{display:"grid",gridTemplateColumns:"50px 1fr 70px 70px 60px 70px",padding:"12px 20px",borderBottom:"1px solid #2a2a3e",fontSize:11,color:"#7878a0",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase"}}>
                <div>Rank</div><div>Student</div><div style={{textAlign:"center"}}>Avg Score</div><div style={{textAlign:"center"}}>Avg Time</div><div style={{textAlign:"center"}}>Tests</div><div style={{textAlign:"right"}}>Points</div>
              </div>
              {filtered.length===0&&<div style={{padding:"2rem",textAlign:"center",color:"#7878a0"}}>No students yet. Be the first! 🚀</div>}
              {filtered.map((entry,idx)=>{
                const rank=idx+1;const rankColors={1:"#ffd700",2:"#c0c0c0",3:"#cd7f32"};
                const isMe=(userProfile?.uid)===entry.uid;
                return(
                  <div key={entry.uid} style={{display:"grid",gridTemplateColumns:"50px 1fr 70px 70px 60px 70px",padding:"12px 20px",borderBottom:"1px solid #2a2a3e",alignItems:"center",background:isMe?"rgba(108,99,255,0.08)":"transparent"}}>
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

// ADMINPAGE
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
  const [aiExam,setAiExam]=useState("boards");
  const [lastGeneratedQ,setLastGeneratedQ]=useState(null);

  useEffect(()=>{
    (async()=>{
      const [q,u,r]=await Promise.all([fsGetAll("questions"),fsGetAll("users"),fsGetAll("results")]);
      setQuestions(q);setUsers(u);setResults(r);
    })();
  },[tab]);

  if(!userProfile||(userProfile.role!=="admin"&&userProfile.role!=="teacher")) return <div style={{padding:"8rem 5%",textAlign:"center",color:"#7878a0"}}>Access denied.</div>;

  const filtered=questions.filter(q=>q.text?.toLowerCase().includes(search.toLowerCase())||q.subject?.toLowerCase().includes(search.toLowerCase()));
  const aiGen=async()=>{
    setAiLoading(true);
    setLastGeneratedQ(null);
    const q = await handleAIQuestion(aiSubject,aiChapter,aiDiff,aiType,aiExam);
    if(q) setLastGeneratedQ(q);
    const allQ=await fsGetAll("questions");
    setQuestions(allQ);
    setAiLoading(false);
  };
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
          <div style={{maxWidth:700}}>
            <div style={{background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,padding:"2rem",marginBottom:16}}>
              <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginBottom:4}}>🤖 AI Question Generator</h3>
              <p style={{color:"#7878a0",fontSize:14,marginBottom:20}}>Generate curriculum-aligned questions using Groq AI (Llama 3.1). Select type, subject, chapter and difficulty.</p>
              
              <label className="form-label">Question Type</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                {[["mcq","📝 MCQ","#6c63ff"],["short2","✏️ 2 Mark","#43e97b"],["short3","📄 3 Mark","#4facfe"],["long4","📃 4 Mark","#f7971e"],["long5","📋 5 Mark","#ff6584"],["case","📊 Case Study","#c471f5"],["hotspot","🔥 Hot Topic","#ffd700"]].map(([val,label,color])=>(
                  <button key={val} onClick={()=>setAiType(val)} style={{padding:"7px 14px",borderRadius:20,border:`1.5px solid ${aiType===val?color:"#2a2a3e"}`,background:aiType===val?`${color}22`:"transparent",color:aiType===val?color:"#7878a0",cursor:"pointer",fontWeight:600,fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>{label}</button>
                ))}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                <div>
                  <label className="form-label">Subject</label>
                  <select className="form-input" value={aiSubject} onChange={e=>{setAiSubject(e.target.value);setAiChapter(CHAPTERS[e.target.value]?.[0]||"");}}>
                    {SUBJECTS.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Chapter</label>
                  <select className="form-input" value={aiChapter} onChange={e=>setAiChapter(e.target.value)}>
                    {(CHAPTERS[aiSubject]||[]).map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Difficulty</label>
                  <select className="form-input" value={aiDiff} onChange={e=>setAiDiff(e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Exam Type</label>
                  <select className="form-input" value={aiExam} onChange={e=>setAiExam(e.target.value)}>
                    <option value="boards">📚 Boards (CBSE)</option>
                    <option value="jee">⚡ JEE</option>
                    <option value="neet">🧬 NEET</option>
                    <option value="upsc">🏛️ UPSC</option>
                  </select>
                </div>
              </div>

              {/* Context Preview */}
              <div style={{background:"rgba(108,99,255,0.08)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:12,padding:"12px 16px",marginBottom:16,fontSize:13}}>
                <div style={{color:"#a89cff",fontWeight:600,marginBottom:4}}>📋 Generating:</div>
                <div style={{color:"#e8e8f0"}}>
                  {aiType==="mcq"?"MCQ (1 mark)":aiType==="short2"?"Short Answer (2 marks)":aiType==="short3"?"Short Answer (3 marks)":aiType==="long4"?"Long Answer (4 marks)":aiType==="long5"?"Long Answer (5 marks)":aiType==="case"?"Case Study (4 marks)":"🔥 Hot Topic MCQ"} · {aiSubject} · {aiChapter} · {aiDiff.charAt(0).toUpperCase()+aiDiff.slice(1)} · {aiExam.toUpperCase()}
                </div>
              </div>

              <button className="btn-primary" style={{width:"100%",opacity:aiLoading?0.7:1}} onClick={aiGen} disabled={aiLoading}>
                {aiLoading?"⏳ Generating with Groq AI...":"🤖 Generate Question"}
              </button>
            </div>

            {/* Question Preview */}
            {lastGeneratedQ&&(
              <div style={{background:"#12121a",border:"1px solid #43e97b",borderRadius:20,padding:"1.5rem",animation:"fadeIn 0.3s ease"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,color:"#43e97b"}}>✅ Question Generated & Saved!</div>
                  <div style={{display:"flex",gap:6}}>
                    <span style={{background:"rgba(67,233,123,0.15)",color:"#43e97b",border:"1px solid rgba(67,233,123,0.3)",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:600}}>{lastGeneratedQ.type?.toUpperCase()||"MCQ"}</span>
                    <span style={{background:"rgba(79,172,254,0.15)",color:"#4facfe",border:"1px solid rgba(79,172,254,0.3)",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:600}}>{lastGeneratedQ.marks} Mark{lastGeneratedQ.marks>1?"s":""}</span>
                    {lastGeneratedQ.hotspot&&<span style={{background:"rgba(255,215,0,0.15)",color:"#ffd700",border:"1px solid rgba(255,215,0,0.3)",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:600}}>🔥 Hot</span>}
                  </div>
                </div>
                <p style={{fontWeight:600,fontSize:14,lineHeight:1.6,marginBottom:12}}>{lastGeneratedQ.text}</p>
                {lastGeneratedQ.options?.length>0&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
                    {lastGeneratedQ.options.map((opt,i)=>(
                      <div key={i} style={{background:i===lastGeneratedQ.answer?"rgba(67,233,123,0.1)":"#1a1a26",border:`1px solid ${i===lastGeneratedQ.answer?"rgba(67,233,123,0.4)":"#2a2a3e"}`,borderRadius:8,padding:"7px 12px",fontSize:13,display:"flex",gap:8}}>
                        <span style={{fontWeight:700,color:i===lastGeneratedQ.answer?"#43e97b":"#7878a0"}}>{["A","B","C","D"][i]}.</span>{opt}
                      </div>
                    ))}
                  </div>
                )}
                {lastGeneratedQ.answer&&typeof lastGeneratedQ.answer==="string"&&(
                  <div style={{background:"rgba(67,233,123,0.08)",border:"1px solid rgba(67,233,123,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:8,fontSize:13}}>
                    <span style={{fontWeight:600,color:"#43e97b"}}>Model Answer: </span>{lastGeneratedQ.answer}
                  </div>
                )}
                {lastGeneratedQ.explanation&&(
                  <div style={{fontSize:13,color:"#7878a0",padding:"8px 12px",background:"rgba(108,99,255,0.08)",borderRadius:10}}>💡 {lastGeneratedQ.explanation}</div>
                )}
                <button className="btn-primary" style={{marginTop:12,width:"100%"}} onClick={aiGen} disabled={aiLoading}>
                  🔄 Generate Another
                </button>
              </div>
            )}
          </div>        )}

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

// ADDQUESTION
function AddQuestionPage({userProfile,navigate,handleLogout,handleAddQuestion}) {
  const [form,setForm]=useState({subject:"Mathematics",chapter:"Real Numbers",studentClass:"10",difficulty:"medium",type:"mcq",text:"",options:["","","",""],answer:0,explanation:"",exam:"boards",year:new Date().getFullYear().toString()});
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

// BOOKSPAGE
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

// HELPERS
const Tag=({label,color})=><span style={{background:`${color}22`,color,border:`1px solid ${color}44`,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:600}}>{label}</span>;


// STUDYCHATBOTCOMPONENT
// Uses Groq API - Free, fast, no credit card needed
// Get your free key at console.groq.com

async function askGroq(prompt) {
  const key = process.env.REACT_APP_GROQ_KEY;
  if(!key) throw new Error("NO_KEY");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are EduBot, a friendly expert study assistant for Indian students (Class 6-12, JEE, NEET, UPSC). Give clear helpful answers with examples. For maths show step-by-step. Keep under 150 words. Be encouraging!" },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });
  const data = await res.json();
  if(data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || "";
}

function StudyChatBot({ userProfile }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: `Hi${userProfile?" "+userProfile.name.split(" ")[0]:""}! 👋 I'm EduBot — your AI study assistant! Ask me anything about Maths, Science, History or any subject!` }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = React.useRef(null);
  const QUICK = ["📐 Maths tips","⚛️ Physics tips","🧪 Chemistry tips","⚡ JEE tips","🧬 NEET tips","📝 Exam tips"];
  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if(!msg) return;
    setInput("");
    setMessages(m=>[...m,{role:"user",text:msg}]);
    setIsTyping(true);
    try {
      const reply = await askGroq(msg);
      setMessages(m=>[...m,{role:"ai",text:reply||"Sorry, could not get an answer!"}]);
    } catch(e) {
      if(e.message==="NO_KEY") setMessages(m=>[...m,{role:"ai",text:"⚠️ Add REACT_APP_GROQ_KEY in Vercel settings. Get free key at console.groq.com"}]);
      else setMessages(m=>[...m,{role:"ai",text:"Something went wrong. Please try again!"}]);
    }
    setIsTyping(false);
  };

  return (
    <>
      <button onClick={()=>setIsOpen(!isOpen)} style={{position:"fixed",bottom:24,right:24,zIndex:999,width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#6c63ff,#ff6584)",border:"none",cursor:"pointer",fontSize:"1.5rem",boxShadow:"0 4px 24px rgba(108,99,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.2s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
        {isOpen?"✕":"🎓"}
      </button>
      {isOpen&&(
        <div style={{position:"fixed",bottom:90,right:24,zIndex:998,width:340,height:500,background:"#12121a",border:"1px solid #2a2a3e",borderRadius:20,display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,0.5)",animation:"slideUp 0.3s ease"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid #2a2a3e",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#6c63ff,#ff6584)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem"}}>🎓</div>
            <div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14}}>EduBot</div>
              <div style={{fontSize:11,color:"#43e97b"}}>● AI Study Assistant (Powered by Groq)</div>
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"12px",display:"flex",flexDirection:"column",gap:10}}>
            {messages.map((msg,i)=>(
              <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"82%",background:msg.role==="user"?"linear-gradient(135deg,#6c63ff,#8b7fff)":"#1a1a26",border:msg.role==="ai"?"1px solid #2a2a3e":"none",borderRadius:msg.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px",fontSize:13,lineHeight:1.6,color:"#e8e8f0",whiteSpace:"pre-wrap"}}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{background:"#1a1a26",border:"1px solid #2a2a3e",borderRadius:"16px 16px 16px 4px",padding:"10px 14px",fontSize:13,color:"#7878a0"}}>EduBot is thinking...</div></div>}
            <div ref={messagesEndRef}/>
          </div>
          {messages.length<=1&&(
            <div style={{padding:"0 12px 8px",display:"flex",gap:6,flexWrap:"wrap"}}>
              {QUICK.map(q=><button key={q} onClick={()=>sendMessage(q)} style={{background:"rgba(108,99,255,0.15)",border:"1px solid rgba(108,99,255,0.3)",borderRadius:20,padding:"4px 10px",color:"#a89cff",fontSize:11,cursor:"pointer",fontWeight:600}}>{q}</button>)}
            </div>
          )}
          <div style={{padding:"10px 12px",borderTop:"1px solid #2a2a3e",display:"flex",gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!isTyping&&sendMessage()} placeholder="Ask any doubt..." style={{flex:1,background:"#1a1a26",border:"1px solid #2a2a3e",borderRadius:10,padding:"8px 12px",color:"#e8e8f0",fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
            <button onClick={()=>sendMessage()} disabled={isTyping||!input.trim()} style={{background:"linear-gradient(135deg,#6c63ff,#8b7fff)",border:"none",borderRadius:10,padding:"8px 14px",color:"#fff",cursor:"pointer",fontSize:14,opacity:isTyping||!input.trim()?0.5:1}}>→</button>
          </div>
        </div>
      )}
    </>
  );
}

