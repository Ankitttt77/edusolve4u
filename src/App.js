import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// ─── FIREBASE INIT ──────────────────────────────────────────────────────────
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

// ─── SEED QUESTIONS ─────────────────────────────────────────────────────────
const SEED_QUESTIONS = [
  { subject: "Mathematics", chapter: "Real Numbers", class: "10", type: "mcq", difficulty: "easy", text: "The HCF of 96 and 404 by prime factorisation is:", options: ["2","4","8","12"], answer: 1, source: "admin", explanation: "96 = 2⁵×3, 404 = 2²×101. HCF = 2² = 4" },
  { subject: "Mathematics", chapter: "Real Numbers", class: "10", type: "mcq", difficulty: "medium", text: "If LCM = 180, HCF = 6, one number = 18, the other number is:", options: ["45","54","60","90"], answer: 2, source: "admin", explanation: "Other = LCM×HCF/first = 180×6/18 = 60" },
  { subject: "Physics", chapter: "Motion", class: "9", type: "mcq", difficulty: "easy", text: "Which of the following is a scalar quantity?", options: ["Velocity","Force","Speed","Displacement"], answer: 2, source: "admin", explanation: "Speed has only magnitude, no direction — making it scalar." },
  { subject: "Physics", chapter: "Motion", class: "9", type: "mcq", difficulty: "hard", text: "A car accelerates from 0 to 60 m/s in 10s. Its acceleration is:", options: ["3 m/s²","6 m/s²","10 m/s²","60 m/s²"], answer: 1, source: "admin", explanation: "a = (v-u)/t = (60-0)/10 = 6 m/s²" },
  { subject: "Chemistry", chapter: "Acids & Bases", class: "10", type: "mcq", difficulty: "easy", text: "pH of pure water is:", options: ["5","7","9","11"], answer: 1, source: "admin", explanation: "Pure water is neutral with pH = 7." },
  { subject: "Chemistry", chapter: "Acids & Bases", class: "10", type: "mcq", difficulty: "medium", text: "Which indicator turns red in acidic solution?", options: ["Phenolphthalein","Litmus","Methyl orange","All of these"], answer: 1, source: "admin", explanation: "Litmus turns red in acid and blue in base." },
  { subject: "Biology", chapter: "Cell", class: "9", type: "mcq", difficulty: "easy", text: "Powerhouse of the cell is:", options: ["Nucleus","Ribosome","Mitochondria","Golgi body"], answer: 2, source: "admin", explanation: "Mitochondria produces ATP energy, hence called the powerhouse." },
  { subject: "Biology", chapter: "Cell", class: "9", type: "mcq", difficulty: "medium", text: "Cell wall is absent in:", options: ["Bacteria","Plant cell","Animal cell","Fungi"], answer: 2, source: "admin", explanation: "Animal cells lack a cell wall; they only have a cell membrane." },
  { subject: "Mathematics", chapter: "Quadratic Equations", class: "10", type: "mcq", difficulty: "medium", text: "The discriminant of 2x² - 4x + 3 = 0 is:", options: ["-8","8","-24","24"], answer: 0, source: "admin", explanation: "D = b²-4ac = 16-24 = -8" },
  { subject: "Physics", chapter: "Electricity", class: "10", type: "mcq", difficulty: "hard", text: "Resistance of a wire doubles when its length is:", options: ["Halved","Doubled","Quadrupled","Unchanged"], answer: 1, source: "admin", explanation: "R ∝ L, so doubling length doubles resistance." },
];

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#6c63ff","#ff6584","#43e97b","#f7971e","#4facfe","#c471f5","#38f9d7"];
const avatarColor = (id) => { let h = 0; for (let c of (id||"x")) h += c.charCodeAt(0); return AVATAR_COLORS[h % AVATAR_COLORS.length]; };
const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","English","Social Science","Computer Science","History","Geography","Economics"];
const CLASSES = ["6","7","8","9","10","11","12"];
const CHAPTERS = {
  Mathematics: ["Real Numbers","Polynomials","Quadratic Equations","Triangles","Circles","Statistics"],
  Physics: ["Motion","Laws of Motion","Electricity","Light","Sound","Magnetism"],
  Chemistry: ["Acids & Bases","Metals & Non-metals","Carbon Compounds","Chemical Reactions","Periodic Table"],
  Biology: ["Cell","Tissues","Life Processes","Heredity","Evolution","Ecosystems"],
  English: ["Grammar","Comprehension","Writing","Literature"],
  "Social Science": ["History","Geography","Civics","Economics"],
  "Computer Science": ["Algorithms","Databases","Networks","Programming"],
  History: ["Ancient India","Medieval India","Modern India","World History"],
  Geography: ["Physical Geography","Climate","Resources","Agriculture"],
  Economics: ["Development","Money & Banking","Consumer Rights","Globalisation"],
};
const calcPoints = (score, timeTaken, totalQ) => Math.round((score / 100) * totalQ * 10 + Math.max(0, 100 - Math.floor(timeTaken / 10)) * 0.3);

// ─── FIRESTORE HELPERS ───────────────────────────────────────────────────────
const fsGetAll = async (col) => {
  const snap = await getDocs(collection(db, col));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
const fsAdd = async (col, data) => addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() });
const fsSet = async (col, id, data) => setDoc(doc(db, col, id), data, { merge: true });
const fsDel = async (col, id) => deleteDoc(doc(db, col, id));
const fsGet = async (col, id) => { const d = await getDoc(doc(db, col, id)); return d.exists() ? { id: d.id, ...d.data() } : null; };

// ─── SEED DB ─────────────────────────────────────────────────────────────────
const seedIfEmpty = async () => {
  const snap = await getDocs(collection(db, "questions"));
  if (snap.empty) {
    for (const q of SEED_QUESTIONS) await fsAdd("questions", q);
  }
};

// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [page, setPage] = useState("home");
  const [examConfig, setExamConfig] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    seedIfEmpty();
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await fsGet("users", user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setAppLoading(false);
    });
    return unsub;
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const navigate = (p, extra = {}) => {
    setPage(p);
    if (extra.config) setExamConfig(extra.config);
    if (extra.result) setExamResult(extra.result);
    window.scrollTo(0, 0);
  };

  const handleLogin = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fsGet("users", cred.user.uid);
      setUserProfile(profile);
      navigate("dashboard");
      showToast(`Welcome back, ${profile?.name?.split(" ")[0]}! 👋`);
    } catch (e) {
      showToast("Invalid email or password", "error");
    }
  };

  const handleRegister = async (data) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const profile = {
        uid: cred.user.uid,
        name: data.name,
        email: data.email,
        class: data.class,
        role: "student",
        avatar: data.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase(),
      };
      await fsSet("users", cred.user.uid, profile);
      setUserProfile(profile);
      navigate("dashboard");
      showToast(`Account created! Welcome, ${data.name.split(" ")[0]}! 🎉`);
    } catch (e) {
      showToast(e.message?.includes("email-already-in-use") ? "Email already registered" : "Registration failed", "error");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUserProfile(null);
    navigate("home");
  };

  const handleExamFinish = async (result) => {
    await fsAdd("results", { userId: currentUser.uid, ...result, date: Date.now() });
    navigate("result", { result });
  };

  const handleAddQuestion = async (q) => {
    await fsAdd("questions", { ...q, source: userProfile?.role || "teacher" });
    showToast("Question added! ✅");
    navigate("admin");
  };

  const handleDeleteQuestion = async (id) => {
    await fsDel("questions", id);
    showToast("Question deleted");
  };

  const handleAIQuestion = async (subject, chapter, difficulty) => {
    showToast("AI generating question… ✨");
    try {
const GEMINI_KEY = process.env.REACT_APP_GEMINI_KEY;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Generate one MCQ for class 10 ${subject} - ${chapter} at ${difficulty} difficulty. Return ONLY a raw JSON object, no markdown, no backticks, no explanation. Format: {"text":"question","options":["A","B","C","D"],"answer":0,"explanation":"why"}` }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
          }),
        }
      );
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!raw) { showToast("Gemini returned empty response", "error"); return; }
      const clean = raw.replace(/```json|```|`/g, "").trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (!jsonMatch) { showToast("Could not find JSON in response", "error"); return; }
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.text || !parsed.options || parsed.answer === undefined) {
        showToast("Invalid question format from AI", "error"); return;
      }
      await fsAdd("questions", { subject, chapter, class: "10", type: "mcq", difficulty, source: "ai", ...parsed });
      showToast("AI question generated & saved! 🤖");
    } catch (e) {
      showToast("Error: " + e.message, "error");
    }
  };

  if (appLoading) return <Loader />;

  const props = { currentUser, userProfile, navigate, showToast, handleLogin, handleRegister, handleLogout, handleExamFinish, handleAddQuestion, handleDeleteQuestion, handleAIQuestion, examConfig, examResult };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", fontFamily: "'DM Sans',sans-serif", overflowX: "hidden" }}>
      <style>{GLOBAL_CSS}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {page === "home" && <HomePage {...props} />}
      {page === "login" && <LoginPage {...props} />}
      {page === "register" && <RegisterPage {...props} />}
      {page === "dashboard" && <DashboardPage {...props} />}
      {page === "exam" && <ExamPage {...props} />}
      {page === "result" && <ResultPage {...props} />}
      {page === "leaderboard" && <LeaderboardPage {...props} />}
      {page === "admin" && <AdminPage {...props} />}
      {page === "addQuestion" && <AddQuestionPage {...props} />}
    </div>
  );
}

// ─── LOADER ──────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <div className="spin" style={{ width:48, height:48, border:"3px solid #2a2a3e", borderTop:"3px solid #6c63ff", borderRadius:"50%" }} />
      <div style={{ color:"#7878a0" }}>Loading EduSolve4U…</div>
    </div>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, background:type==="error"?"#ff6584":"#43e97b", color:"#0a0a0f", padding:"12px 20px", borderRadius:12, fontWeight:600, fontSize:14, boxShadow:"0 8px 24px rgba(0,0,0,0.4)", animation:"slideUp 0.3s ease" }}>{msg}</div>;
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ userProfile, navigate, handleLogout }) {
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, padding:"0 5%", height:68, display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(10,10,15,0.9)", backdropFilter:"blur(20px)", borderBottom:"1px solid #2a2a3e" }}>
      <div onClick={() => navigate("home")} style={{ cursor:"pointer", fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"1.4rem", background:"linear-gradient(135deg,#6c63ff,#ff6584)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
        EduSolve<span style={{ WebkitTextFillColor:"#43e97b" }}>4U</span>
      </div>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <NavBtn onClick={() => navigate("leaderboard")} label="🏆 Leaderboard" />
        {userProfile ? (
          <>
            <NavBtn onClick={() => navigate("dashboard")} label="Dashboard" />
            {(userProfile.role==="admin"||userProfile.role==="teacher") && <NavBtn onClick={() => navigate("admin")} label="⚙️ Admin" />}
            <div style={{ width:34, height:34, borderRadius:"50%", background:avatarColor(userProfile.uid||"x"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff" }}>{userProfile.avatar}</div>
            <button onClick={handleLogout} className="btn-ghost">Logout</button>
          </>
        ) : (
          <>
            <NavBtn onClick={() => navigate("login")} label="Login" />
            <button onClick={() => navigate("register")} className="btn-primary-sm">Sign Up Free</button>
          </>
        )}
      </div>
    </nav>
  );
}
const NavBtn = ({ onClick, label }) => <button onClick={onClick} style={{ background:"none", border:"none", color:"#7878a0", cursor:"pointer", fontSize:14, fontWeight:500, padding:"6px 10px", borderRadius:8 }} onMouseEnter={e=>e.target.style.color="#e8e8f0"} onMouseLeave={e=>e.target.style.color="#7878a0"}>{label}</button>;

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomePage({ navigate, userProfile, handleLogout }) {
  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout} />
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"8rem 5% 4rem", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 0%,rgba(108,99,255,0.2) 0%,transparent 70%),radial-gradient(ellipse 40% 40% at 80% 60%,rgba(255,101,132,0.12) 0%,transparent 60%)" }} />
        <div style={{ position:"relative", zIndex:1, maxWidth:820 }}>
          <div className="badge-pill">✦ Smart Test Platform for Indian Students</div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"clamp(2.6rem,6vw,4.8rem)", fontWeight:800, lineHeight:1.05, letterSpacing:"-2px", margin:"1.5rem 0" }}>
            Ace Every Exam with<br /><span style={{ background:"linear-gradient(135deg,#6c63ff,#ff6584,#f7971e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>EduSolve4U</span>
          </h1>
          <p style={{ fontSize:"1.1rem", color:"#7878a0", maxWidth:540, margin:"0 auto 2.5rem", lineHeight:1.7 }}>Practice exams, instant solutions, real-time leaderboards. Class 6–12, all boards, all subjects.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => navigate(userProfile?"dashboard":"register")} className="btn-primary">🎯 Start Practising Free</button>
            <button onClick={() => navigate("leaderboard")} className="btn-secondary">🏆 View Leaderboard</button>
          </div>
          <div style={{ display:"flex", gap:40, justifyContent:"center", marginTop:48, flexWrap:"wrap" }}>
            {[["10,000+","Students"],["50,000+","Questions"],["15+","Subjects"],["100%","Free"]].map(([n,l]) => (
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"2rem", fontWeight:800, background:"linear-gradient(135deg,#6c63ff,#ff6584)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{n}</div>
                <div style={{ fontSize:13, color:"#7878a0" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding:"5rem 5%", background:"#12121a" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <div className="section-label">Why EduSolve4U</div>
          <h2 className="section-title">Everything You Need to <span style={{ color:"#6c63ff" }}>Top Your Class</span></h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16, maxWidth:1100, margin:"0 auto" }}>
          {[["🎯","Custom Test Builder","Pick subject, chapter, difficulty and question count.","rgba(108,99,255,0.1)"],["⚡","Instant Solutions","Detailed solutions for every question after submission.","rgba(247,151,30,0.1)"],["🏆","Live Leaderboard","Ranked by score + speed. Compete with real students.","rgba(255,215,0,0.1)"],["🤖","AI Questions","Fresh curriculum-aligned questions generated by AI.","rgba(67,233,123,0.1)"],["📊","Analytics","Track performance by subject and chapter.","rgba(255,101,132,0.1)"],["👩‍🏫","Teacher Upload","Teachers add questions for CBSE, ICSE, State boards.","rgba(79,172,254,0.1)"]].map(([icon,title,desc,bg]) => (
            <div key={title} className="feature-card" style={{ background:bg }}>
              <div style={{ fontSize:"2rem", marginBottom:12 }}>{icon}</div>
              <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, marginBottom:8 }}>{title}</h3>
              <p style={{ color:"#7878a0", fontSize:14, lineHeight:1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding:"5rem 5%", textAlign:"center" }}>
        <h2 className="section-title">Ready to <span style={{ color:"#43e97b" }}>Crack Your Exams?</span></h2>
        <p style={{ color:"#7878a0", marginBottom:24 }}>Join thousands of students already using EduSolve4U.</p>
        <button onClick={() => navigate(userProfile?"dashboard":"register")} className="btn-primary" style={{ fontSize:"1.05rem", padding:"14px 32px" }}>Get Started — It's Free 🚀</button>
      </section>
      <footer style={{ borderTop:"1px solid #2a2a3e", padding:"2rem 5%", textAlign:"center", color:"#7878a0", fontSize:13 }}>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"1.2rem", marginBottom:8, background:"linear-gradient(135deg,#6c63ff,#ff6584)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", display:"inline-block" }}>EduSolve4U</div>
        <p>Made with ❤️ for every student in India · Class 6–12 · All Boards</p>
      </footer>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({ navigate, handleLogin, userProfile, handleLogout }) {
  const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout} />
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"6rem 1rem" }}>
        <div style={{ background:"#12121a", border:"1px solid #2a2a3e", borderRadius:24, padding:"2.5rem", width:"100%", maxWidth:420 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"1.8rem", marginBottom:6 }}>Welcome Back</h2>
          <p style={{ color:"#7878a0", fontSize:14, marginBottom:28 }}>Login to continue your journey</p>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={{ marginBottom:14 }} />
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} style={{ marginBottom:20 }} onKeyDown={e=>e.key==="Enter"&&handleLogin(email,pass)} />
          <button className="btn-primary" style={{ width:"100%" }} onClick={()=>handleLogin(email,pass)}>Login →</button>
          <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:"#7878a0" }}>No account? <span style={{ color:"#6c63ff", cursor:"pointer" }} onClick={()=>navigate("register")}>Sign up free</span></p>
        </div>
      </div>
    </div>
  );
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────
function RegisterPage({ navigate, handleRegister, userProfile, handleLogout }) {
  const [form, setForm] = useState({ name:"", email:"", password:"", class:"10" });
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout} />
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"6rem 1rem" }}>
        <div style={{ background:"#12121a", border:"1px solid #2a2a3e", borderRadius:24, padding:"2.5rem", width:"100%", maxWidth:420 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"1.8rem", marginBottom:6 }}>Create Account</h2>
          <p style={{ color:"#7878a0", fontSize:14, marginBottom:28 }}>Free forever for students</p>
          {[["Full Name","name","text","Aarav Sharma"],["Email","email","email","you@email.com"],["Password","password","password","Min 6 characters"]].map(([lbl,key,type,ph])=>(
            <div key={key}>
              <label className="form-label">{lbl}</label>
              <input className="form-input" type={type} placeholder={ph} value={form[key]} onChange={e=>upd(key,e.target.value)} style={{ marginBottom:14 }} />
            </div>
          ))}
          <label className="form-label">Class</label>
          <select className="form-input" value={form.class} onChange={e=>upd("class",e.target.value)} style={{ marginBottom:20 }}>
            {CLASSES.map(c=><option key={c} value={c}>Class {c}</option>)}
          </select>
          <button className="btn-primary" style={{ width:"100%" }} onClick={()=>handleRegister(form)}>Create Account →</button>
          <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:"#7878a0" }}>Already have an account? <span style={{ color:"#6c63ff", cursor:"pointer" }} onClick={()=>navigate("login")}>Login</span></p>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ userProfile, navigate, handleLogout }) {
  const [subject, setSubject] = useState("Mathematics");
  const [chapter, setChapter] = useState(CHAPTERS["Mathematics"][0]);
  const [numQ, setNumQ] = useState(5);
  const [difficulty, setDifficulty] = useState("mixed");
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all = await fsGetAll("results");
      setMyResults(all.filter(r => r.userId === (userProfile?.uid || userProfile?.id)));
      setLoading(false);
    })();
  }, [userProfile]);

  const avgScore = myResults.length ? Math.round(myResults.reduce((a,r)=>a+r.score,0)/myResults.length) : 0;
  const bestScore = myResults.length ? Math.max(...myResults.map(r=>r.score)) : 0;

  const startExam = async () => {
    const all = await fsGetAll("questions");
    const pool = all.filter(q =>
      q.subject===subject &&
      (chapter==="all"||q.chapter===chapter) &&
      (difficulty==="mixed"||q.difficulty===difficulty)
    );
    if (!pool.length) { alert("No questions found. Try different filters."); return; }
    const selected = pool.sort(()=>Math.random()-0.5).slice(0, Math.min(numQ, pool.length));
    navigate("exam", { config:{ questions:selected, subject, chapter, difficulty, examTitle:`${subject} — ${chapter}` } });
  };

  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout} />
      <div style={{ padding:"6rem 5% 3rem", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"2rem" }}>Hey, {userProfile?.name?.split(" ")[0]} 👋</h1>
          <p style={{ color:"#7878a0" }}>Class {userProfile?.class} · {userProfile?.role}</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:12, marginBottom:28 }}>
          {[["📝","Tests Taken",myResults.length],["📊","Avg Score",`${avgScore}%`],["🏆","Best Score",`${bestScore}%`]].map(([icon,label,val])=>(
            <div key={label} style={{ background:"#12121a", border:"1px solid #2a2a3e", borderRadius:16, padding:"1.25rem", textAlign:"center" }}>
              <div style={{ fontSize:"1.5rem", marginBottom:6 }}>{icon}</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"1.5rem", color:"#6c63ff" }}>{val}</div>
              <div style={{ fontSize:12, color:"#7878a0" }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, alignItems:"start" }}>
          <div style={{ background:"#12121a", border:"1px solid #2a2a3e", borderRadius:20, padding:"1.75rem" }}>
            <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, marginBottom:20 }}>⚡ Build a Test</h3>
            <label className="form-label">Subject</label>
            <select className="form-input" value={subject} onChange={e=>{setSubject(e.target.value);setChapter(CHAPTERS[e.target.value][0]);}} style={{ marginBottom:12 }}>
              {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <label className="form-label">Chapter</label>
            <select className="form-input" value={chapter} onChange={e=>setChapter(e.target.value)} style={{ marginBottom:12 }}>
              <option value="all">All Chapters</option>
              {(CHAPTERS[subject]||[]).map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
              <div>
                <label className="form-label">Questions</label>
                <select className="form-input" value={numQ} onChange={e=>setNumQ(+e.target.value)}>
                  {[5,10,15,20,25,30].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Difficulty</label>
                <select className="form-input" value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
                  <option value="mixed">Mixed</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <button className="btn-primary" style={{ width:"100%", marginTop:8 }} onClick={startExam}>🎯 Generate & Start Test</button>
          </div>
          <div style={{ background:"#12121a", border:"1px solid #2a2a3e", borderRadius:20, padding:"1.75rem" }}>
            <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, marginBottom:20 }}>📈 Recent Tests</h3>
            {loading ? <div style={{ color:"#7878a0", textAlign:"center", padding:"1rem" }}>Loading…</div> :
             myResults.length===0 ? <p style={{ color:"#7878a0", textAlign:"center", padding:"2rem 0" }}>No tests yet. Start one! →</p> : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {myResults.slice().sort((a,b)=>(b.date||0)-(a.date||0)).slice(0,5).map(r=>(
                  <div key={r.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"#1a1a26", borderRadius:12 }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14 }}>{r.examTitle}</div>
                      <div style={{ fontSize:12, color:"#7878a0" }}>{r.correct}/{r.totalQ} correct · {Math.round(r.timeTaken/60)}m {r.timeTaken%60}s</div>
                    </div>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"1.2rem", color:r.score>=80?"#43e97b":r.score>=60?"#f7971e":"#ff6584" }}>{r.score}%</div>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-secondary" style={{ width:"100%", marginTop:14 }} onClick={()=>navigate("leaderboard")}>🏆 View Leaderboard</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXAM ─────────────────────────────────────────────────────────────────────
function ExamPage({ examConfig, handleExamFinish, userProfile, navigate, handleLogout }) {
  const { questions, examTitle } = examConfig;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [started] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(()=>setTimeElapsed(Math.floor((Date.now()-started)/1000)),1000);
    return ()=>clearInterval(t);
  }, [started]);

  const q = questions[current];

  const submit = () => {
    let correct = 0;
    questions.forEach(q=>{ if(answers[q.id]===q.answer) correct++; });
    const score = Math.round((correct/questions.length)*100);
    handleExamFinish({ examTitle, subject:examConfig.subject, score, totalQ:questions.length, correct, timeTaken:timeElapsed, answers });
  };

  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout} />
      <div style={{ padding:"6rem 5% 3rem", maxWidth:800, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:12, color:"#7878a0", marginBottom:2 }}>{examTitle}</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700 }}>Q{current+1} of {questions.length}</div>
          </div>
          <div style={{ display:"flex", gap:16, alignItems:"center" }}>
            <div style={{ background:"#12121a", border:"1px solid #2a2a3e", borderRadius:10, padding:"6px 14px", fontSize:14, fontWeight:600 }}>⏱ {Math.floor(timeElapsed/60)}:{String(timeElapsed%60).padStart(2,"0")}</div>
            <div style={{ fontSize:13, color:"#7878a0" }}>{Object.keys(answers).length}/{questions.length} answered</div>
          </div>
        </div>
        <div style={{ height:4, background:"#2a2a3e", borderRadius:4, marginBottom:28, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${((current+1)/questions.length)*100}%`, background:"linear-gradient(90deg,#6c63ff,#ff6584)", transition:"width 0.3s" }} />
        </div>
        <div style={{ background:"#12121a", border:"1px solid #2a2a3e", borderRadius:20, padding:"2rem", marginBottom:20 }}>
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            <Tag label={q.subject} color="#6c63ff" />
            <Tag label={q.difficulty} color={q.difficulty==="hard"?"#ff6584":q.difficulty==="medium"?"#f7971e":"#43e97b"} />
          </div>
          <p style={{ fontSize:"1.05rem", lineHeight:1.65, marginBottom:24 }}>{q.text}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {q.options.map((opt,i)=>{
              const sel = answers[q.id]===i;
              return (
                <button key={i} onClick={()=>setAnswers(a=>({...a,[q.id]:i}))} style={{ display:"flex", alignItems:"center", gap:12, background:sel?"rgba(108,99,255,0.2)":"#1a1a26", border:`1.5px solid ${sel?"#6c63ff":"#2a2a3e"}`, borderRadius:12, padding:"12px 16px", cursor:"pointer", textAlign:"left", color:"#e8e8f0", fontSize:15 }}>
                  <span style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${sel?"#6c63ff":"#2a2a3e"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, background:sel?"#6c63ff":"transparent", color:sel?"#fff":"#7878a0", flexShrink:0 }}>{["A","B","C","D"][i]}</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"space-between" }}>
          <button className="btn-secondary" onClick={()=>setCurrent(c=>Math.max(0,c-1))} disabled={current===0}>← Prev</button>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center" }}>
            {questions.map((_,i)=>(
              <button key={i} onClick={()=>setCurrent(i)} style={{ width:32, height:32, borderRadius:8, border:`1.5px solid ${i===current?"#6c63ff":answers[questions[i].id]!==undefined?"#43e97b":"#2a2a3e"}`, background:i===current?"rgba(108,99,255,0.3)":answers[questions[i].id]!==undefined?"rgba(67,233,123,0.15)":"transparent", color:"#e8e8f0", cursor:"pointer", fontSize:12, fontWeight:600 }}>{i+1}</button>
            ))}
          </div>
          {current<questions.length-1
            ? <button className="btn-primary" onClick={()=>setCurrent(c=>c+1)}>Next →</button>
            : <button className="btn-primary" style={{ background:"linear-gradient(135deg,#43e97b,#38f9d7)", boxShadow:"0 4px 20px rgba(67,233,123,0.4)" }} onClick={submit}>✅ Submit</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── RESULT ───────────────────────────────────────────────────────────────────
function ResultPage({ examResult, examConfig, userProfile, navigate, handleLogout }) {
  const { score, correct, totalQ, timeTaken, answers } = examResult;
  const questions = examConfig?.questions || [];
  const points = calcPoints(score, timeTaken, totalQ);
  const [showSolutions, setShowSolutions] = useState(false);
  const grade = score>=90?["🏆","Excellent!","#ffd700"]:score>=75?["🎉","Great Work!","#43e97b"]:score>=60?["👍","Good Job!","#f7971e"]:["📚","Keep Practising","#ff6584"];

  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout} />
      <div style={{ padding:"6rem 5% 3rem", maxWidth:800, margin:"0 auto" }}>
        <div style={{ background:"#12121a", border:"1px solid #2a2a3e", borderRadius:24, padding:"2.5rem", textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:"3rem", marginBottom:12 }}>{grade[0]}</div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"4rem", color:grade[2], lineHeight:1 }}>{score}%</div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:"1.4rem", marginTop:8 }}>{grade[1]}</div>
          <div style={{ color:"#7878a0", marginTop:6 }}>{examResult.examTitle}</div>
          <div style={{ display:"flex", gap:24, justifyContent:"center", marginTop:24, flexWrap:"wrap" }}>
            {[["✅","Correct",`${correct}/${totalQ}`],["⏱","Time",`${Math.floor(timeTaken/60)}m ${timeTaken%60}s`],["⚡","Points",`+${points}`]].map(([icon,lbl,val])=>(
              <div key={lbl} style={{ background:"#1a1a26", borderRadius:14, padding:"14px 24px" }}>
                <div style={{ fontSize:"1.3rem" }}>{icon}</div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"1.3rem", color:"#6c63ff" }}>{val}</div>
                <div style={{ fontSize:12, color:"#7878a0" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginBottom:24 }}>
          <button className="btn-primary" onClick={()=>navigate("dashboard")} style={{ flex:1 }}>📝 New Test</button>
          <button className="btn-secondary" onClick={()=>navigate("leaderboard")} style={{ flex:1 }}>🏆 Leaderboard</button>
          <button className="btn-secondary" onClick={()=>setShowSolutions(!showSolutions)} style={{ flex:1 }}>{showSolutions?"Hide":"📖"} Solutions</button>
        </div>
        {showSolutions && questions.map((q,idx)=>{
          const ua = answers?.[q.id]; const ok = ua===q.answer;
          return (
            <div key={q.id} style={{ background:"#12121a", border:`1px solid ${ok?"rgba(67,233,123,0.3)":"rgba(255,101,132,0.3)"}`, borderRadius:16, padding:"1.25rem", marginBottom:12 }}>
              <div style={{ display:"flex", gap:10, marginBottom:8 }}>
                <span style={{ fontSize:"1.1rem", flexShrink:0 }}>{ok?"✅":"❌"}</span>
                <p style={{ fontWeight:500, lineHeight:1.5 }}><strong>Q{idx+1}.</strong> {q.text}</p>
              </div>
              <div style={{ paddingLeft:28, fontSize:14 }}>
                {ua!==undefined&&<div style={{ color:ok?"#43e97b":"#ff6584" }}>Your answer: ({["A","B","C","D"][ua]}) {q.options[ua]}</div>}
                {!ok&&<div style={{ color:"#43e97b" }}>Correct: ({["A","B","C","D"][q.answer]}) {q.options[q.answer]}</div>}
                {q.explanation&&<div style={{ marginTop:6, color:"#7878a0" }}>💡 {q.explanation}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
function LeaderboardPage({ userProfile, navigate, handleLogout }) {
  const [filter, setFilter] = useState("all");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [users, results] = await Promise.all([fsGetAll("users"), fsGetAll("results")]);
      const userMap = Object.fromEntries(users.map(u => [u.uid||u.id, u]));
      const agg = {};
      results.forEach(r => {
        const uid = r.userId;
        if (!agg[uid]) agg[uid] = { tests:[] };
        agg[uid].tests.push(r);
      });
      const lb = Object.entries(agg).map(([uid,d])=>{
        const user = userMap[uid];
        if (!user || user.role!=="student") return null;
        const avgScore = Math.round(d.tests.reduce((a,r)=>a+r.score,0)/d.tests.length);
        const avgTime = Math.round(d.tests.reduce((a,r)=>a+r.timeTaken,0)/d.tests.length);
        const points = d.tests.reduce((acc,r)=>acc+calcPoints(r.score,r.timeTaken,r.totalQ),0);
        return { uid, user, avgScore, avgTime, points, count:d.tests.length };
      }).filter(Boolean).sort((a,b)=>b.points-a.points||a.avgTime-b.avgTime);
      setLeaderboard(lb);
      setLoading(false);
    })();
  }, []);

  const filtered = filter==="all" ? leaderboard : leaderboard.filter(e=>e.user?.class===filter);
  const myRank = leaderboard.findIndex(e=>e.uid===(userProfile?.uid||userProfile?.id))+1;

  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout} />
      <div style={{ padding:"6rem 5% 3rem", maxWidth:900, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div className="section-label">Live Rankings</div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"2.5rem" }}>🏆 Leaderboard</h1>
          <p style={{ color:"#7878a0", marginTop:8 }}>Ranked by score + speed. Answer correctly and quickly to earn more points.</p>
          {userProfile && myRank>0 && <div style={{ display:"inline-block", marginTop:12, background:"rgba(108,99,255,0.2)", border:"1px solid rgba(108,99,255,0.4)", borderRadius:20, padding:"6px 18px", fontSize:14, color:"#a89cff" }}>Your rank: #{myRank}</div>}
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap", justifyContent:"center" }}>
          {["all",...CLASSES].map(c=>(
            <button key={c} onClick={()=>setFilter(c)} style={{ background:filter===c?"rgba(108,99,255,0.3)":"#12121a", border:`1px solid ${filter===c?"#6c63ff":"#2a2a3e"}`, borderRadius:20, padding:"6px 16px", color:filter===c?"#a89cff":"#7878a0", cursor:"pointer", fontSize:13, fontWeight:600 }}>
              {c==="all"?"All Classes":`Class ${c}`}
            </button>
          ))}
        </div>
        {loading ? <div style={{ textAlign:"center", color:"#7878a0", padding:"3rem" }}>Loading rankings…</div> : (
          <>
            {filtered.length>=3 && (
              <div style={{ display:"flex", justifyContent:"center", alignItems:"flex-end", gap:12, marginBottom:28 }}>
                {[filtered[1],filtered[0],filtered[2]].map((entry,i)=>{
                  const podiumRank=[2,1,3][i]; const heights=["140px","180px","120px"]; const colors=["#c0c0c0","#ffd700","#cd7f32"];
                  return (
                    <div key={entry.uid} style={{ textAlign:"center", flex:1, maxWidth:200 }}>
                      <div style={{ width:52, height:52, borderRadius:"50%", background:avatarColor(entry.uid), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#fff", margin:"0 auto 8px", border:`3px solid ${colors[i]}` }}>{entry.user?.avatar}</div>
                      <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{entry.user?.name}</div>
                      <div style={{ fontSize:12, color:"#7878a0", marginBottom:6 }}>{entry.points} pts</div>
                      <div style={{ height:heights[i], background:`linear-gradient(to top,${colors[i]}40,${colors[i]}20)`, border:`1px solid ${colors[i]}60`, borderRadius:"10px 10px 0 0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"1.8rem", color:colors[i] }}>#{podiumRank}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ background:"#12121a", border:"1px solid #2a2a3e", borderRadius:20, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"60px 1fr 80px 80px 80px 80px", padding:"12px 20px", borderBottom:"1px solid #2a2a3e", fontSize:11, color:"#7878a0", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase" }}>
                <div>Rank</div><div>Student</div><div style={{ textAlign:"center" }}>Avg Score</div><div style={{ textAlign:"center" }}>Avg Time</div><div style={{ textAlign:"center" }}>Tests</div><div style={{ textAlign:"right" }}>Points</div>
              </div>
              {filtered.length===0 && <div style={{ padding:"2rem", textAlign:"center", color:"#7878a0" }}>No students yet. Be the first! 🚀</div>}
              {filtered.map((entry,idx)=>{
                const rank=idx+1; const rankColors={1:"#ffd700",2:"#c0c0c0",3:"#cd7f32"};
                const isMe=(userProfile?.uid||userProfile?.id)===entry.uid;
                return (
                  <div key={entry.uid} style={{ display:"grid", gridTemplateColumns:"60px 1fr 80px 80px 80px 80px", padding:"14px 20px", borderBottom:"1px solid #2a2a3e", alignItems:"center", background:isMe?"rgba(108,99,255,0.08)":"transparent" }}>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"1.1rem", color:rankColors[rank]||"#7878a0" }}>{rank<=3?["🥇","🥈","🥉"][rank-1]:`#${rank}`}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", background:avatarColor(entry.uid), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#fff", fontSize:12, flexShrink:0 }}>{entry.user?.avatar}</div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14 }}>{entry.user?.name}{isMe&&<span style={{ marginLeft:6, fontSize:11, color:"#6c63ff", fontWeight:700 }}>(you)</span>}</div>
                        <div style={{ fontSize:12, color:"#7878a0" }}>Class {entry.user?.class}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:"center", fontWeight:700, color:entry.avgScore>=80?"#43e97b":entry.avgScore>=60?"#f7971e":"#ff6584" }}>{entry.avgScore}%</div>
                    <div style={{ textAlign:"center", fontSize:13, color:"#7878a0" }}>{Math.floor(entry.avgTime/60)}m {entry.avgTime%60}s</div>
                    <div style={{ textAlign:"center", fontSize:13, color:"#7878a0" }}>{entry.count}</div>
                    <div style={{ textAlign:"right", fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"1rem", color:"#6c63ff" }}>{entry.points}</div>
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

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function AdminPage({ userProfile, navigate, handleLogout, handleDeleteQuestion, handleAIQuestion }) {
  const [tab, setTab] = useState("questions");
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [aiSubject, setAiSubject] = useState("Mathematics");
  const [aiChapter, setAiChapter] = useState("Real Numbers");
  const [aiDiff, setAiDiff] = useState("medium");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [q,u,r] = await Promise.all([fsGetAll("questions"),fsGetAll("users"),fsGetAll("results")]);
      setQuestions(q); setUsers(u); setResults(r);
    })();
  }, [tab]);

  if (!userProfile||(userProfile.role!=="admin"&&userProfile.role!=="teacher")) return <div style={{ padding:"8rem 5%", textAlign:"center", color:"#7878a0" }}>Access denied.</div>;

  const filtered = questions.filter(q=>q.text?.toLowerCase().includes(search.toLowerCase())||q.subject?.toLowerCase().includes(search.toLowerCase()));

  const aiGen = async () => {
    setAiLoading(true);
    await handleAIQuestion(aiSubject, aiChapter, aiDiff);
    const q = await fsGetAll("questions"); setQuestions(q);
    setAiLoading(false);
  };

  const delQ = async (id) => { await handleDeleteQuestion(id); setQuestions(q=>q.filter(x=>x.id!==id)); };

  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout} />
      <div style={{ padding:"6rem 5% 3rem", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div><div className="section-label">Management Panel</div><h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"2rem" }}>⚙️ Admin Dashboard</h1></div>
          <button className="btn-primary" onClick={()=>navigate("addQuestion")}>+ Add Question</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:12, marginBottom:28 }}>
          {[["Questions",questions.length,"#6c63ff"],["Students",users.filter(u=>u.role==="student").length,"#43e97b"],["Exams Taken",results.length,"#f7971e"],["Teachers",users.filter(u=>u.role==="teacher").length,"#ff6584"]].map(([l,v,c])=>(
            <div key={l} style={{ background:"#12121a", border:"1px solid #2a2a3e", borderRadius:14, padding:"1.25rem", textAlign:"center" }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"1.8rem", color:c }}>{v}</div>
              <div style={{ fontSize:12, color:"#7878a0" }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:4, marginBottom:20, background:"#12121a", border:"1px solid #2a2a3e", borderRadius:14, padding:4, width:"fit-content" }}>
          {["questions","ai","students","results"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:"8px 18px", borderRadius:10, border:"none", cursor:"pointer", background:tab===t?"#6c63ff":"transparent", color:tab===t?"#fff":"#7878a0", fontWeight:600, fontSize:13 }}>
              {t==="ai"?"🤖 AI Generator":t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {tab==="questions" && (
          <div>
            <input className="form-input" placeholder="🔍 Search questions..." value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:400, marginBottom:16 }} />
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {filtered.map(q=>(
                <div key={q.id} style={{ display:"flex", alignItems:"center", gap:12, background:"#12121a", border:"1px solid #2a2a3e", borderRadius:14, padding:"14px 18px" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, lineHeight:1.4 }}>{q.text}</div>
                    <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                      <Tag label={q.subject} color="#6c63ff" />
                      <Tag label={q.chapter} color="#7878a0" />
                      <Tag label={`Class ${q.class}`} color="#7878a0" />
                      <Tag label={q.difficulty} color={q.difficulty==="hard"?"#ff6584":q.difficulty==="medium"?"#f7971e":"#43e97b"} />
                      <Tag label={q.source==="ai"?"🤖 AI":q.source==="teacher"?"👩‍🏫 Teacher":"👤 Admin"} color="#7878a0" />
                    </div>
                  </div>
                  <button onClick={()=>delQ(q.id)} style={{ background:"rgba(255,101,132,0.15)", border:"1px solid rgba(255,101,132,0.3)", borderRadius:8, padding:"6px 12px", color:"#ff6584", cursor:"pointer", fontSize:13, fontWeight:600 }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="ai" && (
          <div style={{ background:"#12121a", border:"1px solid #2a2a3e", borderRadius:20, padding:"2rem", maxWidth:520 }}>
            <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, marginBottom:6 }}>🤖 AI Question Generator</h3>
            <p style={{ color:"#7878a0", fontSize:14, marginBottom:20 }}>Generate curriculum-aligned MCQs using AI. Saved automatically to your question bank.</p>
            <label className="form-label">Subject</label>
            <select className="form-input" value={aiSubject} onChange={e=>{setAiSubject(e.target.value);setAiChapter(CHAPTERS[e.target.value]?.[0]||"");}} style={{ marginBottom:12 }}>
              {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <label className="form-label">Chapter</label>
            <select className="form-input" value={aiChapter} onChange={e=>setAiChapter(e.target.value)} style={{ marginBottom:12 }}>
              {(CHAPTERS[aiSubject]||[]).map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <label className="form-label">Difficulty</label>
            <select className="form-input" value={aiDiff} onChange={e=>setAiDiff(e.target.value)} style={{ marginBottom:20 }}>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
            <button className="btn-primary" style={{ width:"100%", opacity:aiLoading?0.7:1 }} onClick={aiGen} disabled={aiLoading}>
              {aiLoading?"⏳ Generating...":"🤖 Generate with AI"}
            </button>
          </div>
        )}

        {tab==="students" && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {users.filter(u=>u.role==="student").map(u=>{
              const uRes = results.filter(r=>r.userId===(u.uid||u.id));
              const avg = uRes.length?Math.round(uRes.reduce((a,r)=>a+r.score,0)/uRes.length):0;
              return (
                <div key={u.uid||u.id} style={{ display:"flex", alignItems:"center", gap:14, background:"#12121a", border:"1px solid #2a2a3e", borderRadius:14, padding:"14px 18px" }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:avatarColor(u.uid||u.id), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#fff", fontSize:13 }}>{u.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600 }}>{u.name}</div>
                    <div style={{ fontSize:12, color:"#7878a0" }}>{u.email} · Class {u.class}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:700, color:"#6c63ff" }}>{uRes.length} tests</div>
                    <div style={{ fontSize:12, color:"#7878a0" }}>Avg {avg}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="results" && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {results.slice().sort((a,b)=>(b.date||0)-(a.date||0)).map(r=>{
              const user = users.find(u=>(u.uid||u.id)===r.userId);
              return (
                <div key={r.id} style={{ display:"flex", alignItems:"center", gap:14, background:"#12121a", border:"1px solid #2a2a3e", borderRadius:14, padding:"14px 18px" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{user?.name||"Unknown"} — {r.examTitle}</div>
                    <div style={{ fontSize:12, color:"#7878a0" }}>{r.correct}/{r.totalQ} correct · {Math.round(r.timeTaken/60)}m {r.timeTaken%60}s</div>
                  </div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"1.2rem", color:r.score>=80?"#43e97b":r.score>=60?"#f7971e":"#ff6584" }}>{r.score}%</div>
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
function AddQuestionPage({ userProfile, navigate, handleLogout, handleAddQuestion }) {
  const [form, setForm] = useState({ subject:"Mathematics", chapter:"Real Numbers", class:"10", difficulty:"medium", type:"mcq", text:"", options:["","","",""], answer:0, explanation:"" });
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const updOpt = (i,v) => setForm(f=>{ const opts=[...f.options]; opts[i]=v; return {...f,options:opts}; });
  const submit = () => {
    if (!form.text.trim()||form.options.some(o=>!o.trim())) { alert("Please fill in the question and all options."); return; }
    handleAddQuestion(form);
  };
  return (
    <div>
      <Nav userProfile={userProfile} navigate={navigate} handleLogout={handleLogout} />
      <div style={{ padding:"6rem 5% 3rem", maxWidth:640, margin:"0 auto" }}>
        <button onClick={()=>navigate("admin")} style={{ background:"none", border:"none", color:"#7878a0", cursor:"pointer", fontSize:14, padding:0, marginBottom:12 }}>← Back to Admin</button>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:"2rem", marginBottom:24 }}>Add Question</h1>
        <div style={{ background:"#12121a", border:"1px solid #2a2a3e", borderRadius:20, padding:"2rem" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <div>
              <label className="form-label">Subject</label>
              <select className="form-input" value={form.subject} onChange={e=>{upd("subject",e.target.value);upd("chapter",CHAPTERS[e.target.value]?.[0]||"");}}>
                {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
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
          </div>
          <label className="form-label">Question Text</label>
          <textarea className="form-input" rows={3} placeholder="Enter your question..." value={form.text} onChange={e=>upd("text",e.target.value)} style={{ resize:"vertical", marginBottom:14 }} />
          <label className="form-label">Options (click the circle to mark correct answer)</label>
          {form.options.map((opt,i)=>(
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
              <button onClick={()=>upd("answer",i)} style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${form.answer===i?"#43e97b":"#2a2a3e"}`, background:form.answer===i?"#43e97b":"transparent", cursor:"pointer", fontSize:12, fontWeight:700, color:form.answer===i?"#0a0a0f":"#7878a0", flexShrink:0 }}>{["A","B","C","D"][i]}</button>
              <input className="form-input" placeholder={`Option ${["A","B","C","D"][i]}`} value={opt} onChange={e=>updOpt(i,e.target.value)} style={{ margin:0 }} />
            </div>
          ))}
          <label className="form-label" style={{ marginTop:8 }}>Explanation (optional)</label>
          <textarea className="form-input" rows={2} placeholder="Brief explanation..." value={form.explanation} onChange={e=>upd("explanation",e.target.value)} style={{ resize:"vertical", marginBottom:20 }} />
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn-primary" style={{ flex:1 }} onClick={submit}>✅ Add Question</button>
            <button className="btn-secondary" onClick={()=>navigate("admin")}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const Tag = ({ label, color }) => <span style={{ background:`${color}22`, color, border:`1px solid ${color}44`, borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{label}</span>;

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;}
.badge-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(108,99,255,0.15);border:1px solid rgba(108,99,255,0.3);color:#a89cff;padding:6px 16px;border-radius:50px;font-size:12px;font-weight:600;letter-spacing:.05em;}
.section-label{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#6c63ff;margin-bottom:8px;}
.section-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;line-height:1.1;letter-spacing:-1px;margin-bottom:12px;}
.feature-card{border:1px solid #2a2a3e;border-radius:20px;padding:1.75rem;transition:transform .25s,border-color .25s,box-shadow .25s;}
.feature-card:hover{transform:translateY(-4px);border-color:#6c63ff;box-shadow:0 12px 40px rgba(108,99,255,.15);}
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
@keyframes spin{to{transform:rotate(360deg);}}
.spin{animation:spin .8s linear infinite;}
@keyframes slideUp{from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;}}
`;

