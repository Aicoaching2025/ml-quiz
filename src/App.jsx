import { useState, useEffect, useRef } from "react";

const QUESTIONS = [
  // WHICH TEST TO USE
  {
    id: 1, category: "Which Test?", categoryColor: "#00D4FF", icon: "🧪",
    question: "You ran two different versions of a marketing email (A/B test). You want to know if Version A's average click rate is significantly higher than Version B's. What test do you use?",
    options: ["Chi-Square Test", "Independent t-test", "ANOVA", "Pearson Correlation"],
    correct: 1,
    explanation: "Independent t-test — you're comparing the MEANS of two unrelated groups (Group A vs Group B). Both groups are separate people (independent), and click rate is a continuous number. Chi-square is for categorical data. ANOVA is for 3+ groups. Correlation measures relationships, not differences.",
    llmLink: "In ML/LLM evaluation: this is how you compare Model A vs Model B benchmark scores. Did fine-tuning significantly improve performance, or is it just noise?"
  },
  {
    id: 2, category: "Which Test?", categoryColor: "#00D4FF", icon: "🧪",
    question: "You want to know if there's a relationship between a customer's industry (Tech, Finance, Healthcare, Retail) and which pricing tier they choose (Basic, Pro, Enterprise). What test?",
    options: ["ANOVA", "Paired t-test", "Chi-Square Test of Independence", "Linear Regression"],
    correct: 2,
    explanation: "Chi-Square Test of Independence — BOTH variables are categorical (industry = 4 categories, tier = 3 categories). You'd build a contingency table of observed counts and test if the distributions are independent. If p < 0.05, the industry a customer is in IS related to which tier they pick.",
    llmLink: "LLM use case: Is there a relationship between the type of prompt (question, instruction, creative) and the model's output quality rating (good, neutral, poor)? Chi-square answers this."
  },
  {
    id: 3, category: "Which Test?", categoryColor: "#00D4FF", icon: "🧪",
    question: "You give 30 employees a training program. You measure their productivity BEFORE and AFTER. Did the training make a significant difference?",
    options: ["Independent t-test", "Paired t-test", "ANOVA", "Mann-Whitney U"],
    correct: 1,
    explanation: "Paired t-test — the SAME people are measured twice (before and after). The measurements are 'paired' per individual. This is more powerful than an independent t-test because it controls for individual differences. If you used independent t-test here, you'd be ignoring that each 'before' and 'after' belongs to the same person.",
    llmLink: "Fine-tuning evaluation: measure model accuracy on the same benchmark before and after fine-tuning. Paired t-test tells you if the improvement is statistically significant."
  },
  {
    id: 4, category: "Which Test?", categoryColor: "#00D4FF", icon: "🧪",
    question: "You have 4 different ML models and want to know if their accuracy scores are significantly different from each other. What do you use?",
    options: ["Run 6 separate t-tests", "One-way ANOVA", "Chi-Square", "Pearson Correlation"],
    correct: 1,
    explanation: "One-way ANOVA — when comparing 3+ group means, ANOVA is the right tool. Running 6 separate t-tests would inflate your false positive rate (each test has 5% error chance; 6 tests compounds that). ANOVA controls this. If ANOVA says significant, THEN run post-hoc tests (Tukey) to find WHICH models differ.",
    llmLink: "Comparing GPT-4, Claude, Gemini, and Llama on benchmark scores? ANOVA. Then Tukey's post-hoc test to identify which specific pairs are significantly different."
  },
  // INTERPRETING METRICS
  {
    id: 5, category: "Interpret Metrics", categoryColor: "#FF6B6B", icon: "📊",
    question: "Your fraud detection model reports: Accuracy = 99%, Precision = 0.45, Recall = 0.12. Is this a good model? What's happening?",
    options: [
      "Great model — 99% accuracy means it works perfectly",
      "Bad model — it's missing 88% of actual fraud cases (low recall is catastrophic here)",
      "Average model — precision and recall just need tuning",
      "Good model but needs more training data"
    ],
    correct: 1,
    explanation: "This is a TERRIBLE model for fraud detection! Here's why: 99% accuracy is deceptive — if only 1% of transactions are fraud, a model that predicts 'not fraud' every single time gets 99% accuracy. Recall = 0.12 means the model MISSES 88% of actual fraud. In fraud detection, False Negatives (missing real fraud) are catastrophic. You want HIGH RECALL even if precision drops.",
    llmLink: "In LLMs: Recall matters for RAG retrieval — did the system find all the relevant documents? Missing a critical document (false negative) can cause the model to give wrong answers."
  },
  {
    id: 6, category: "Interpret Metrics", categoryColor: "#FF6B6B", icon: "📊",
    question: "Regression model results: R² = 0.91, RMSE = 2,340, p-value for feature 'Years Experience' = 0.003, β = 4,200. What does this tell you?",
    options: [
      "The model explains 91% of salary variance; each year of experience adds ~$4,200; this feature is statistically significant",
      "The model is 91% accurate and makes errors of $2,340",
      "The R² is too high — the model is overfitting",
      "p = 0.003 means there's only a 0.3% chance the model is correct"
    ],
    correct: 0,
    explanation: "R² = 0.91 → the model explains 91% of the variance in your target (e.g., salary). RMSE = 2,340 → predictions are off by ~$2,340 on average (in same units as target). β = 4,200 → for each 1-year increase in experience, salary increases by $4,200 (holding all else constant). p = 0.003 < 0.05 → 'Years Experience' is a statistically significant predictor — it's not just noise.",
    llmLink: "In LLM training: R² equivalent is how much variance in quality scores your features (model size, training data, fine-tuning steps) explain. Coefficient interpretation = how much each factor moves the needle."
  },
  {
    id: 7, category: "Interpret Metrics", categoryColor: "#FF6B6B", icon: "📊",
    question: "Your classification model's confusion matrix shows: TP=850, TN=920, FP=80, FN=150. Calculate Precision and Recall. Which is more important if you're building a cancer screening tool?",
    options: [
      "Precision=91%, Recall=85%. Precision matters more — avoid false alarms",
      "Precision=91%, Recall=85%. Recall matters more — missing real cancer is catastrophic",
      "Precision=85%, Recall=91%. They're equally important",
      "Accuracy=88% is what matters most here"
    ],
    correct: 1,
    explanation: "Precision = TP/(TP+FP) = 850/(850+80) = 91.4%. Recall = TP/(TP+FN) = 850/(850+150) = 85%. For cancer screening, RECALL IS CRITICAL. A False Negative (FN=150 missed cancer cases) means a patient walks away thinking they're healthy when they have cancer. That's far worse than a False Positive (extra biopsy). You'd tune the model to maximize recall, even if precision drops to 70%.",
    llmLink: "Hallucination detection in LLMs: Recall matters — you want to CATCH all hallucinations (false negatives = missed hallucinations are dangerous). Same logic as medical screening."
  },
  {
    id: 8, category: "Interpret Metrics", categoryColor: "#FF6B6B", icon: "📊",
    question: "Two models: Model A has AUC = 0.97. Model B has AUC = 0.61. What does AUC tell you and which model wins?",
    options: [
      "Model A is 97% accurate. Model A wins obviously.",
      "AUC = 0.61 means Model B is 61% accurate, both are mediocre",
      "AUC measures class separation at ALL thresholds. Model A (0.97) is excellent; Model B (0.61) barely beats random guessing (0.50)",
      "AUC only matters for regression, not classification"
    ],
    correct: 2,
    explanation: "AUC (Area Under ROC Curve) measures how well your model SEPARATES classes across ALL possible decision thresholds — it's threshold-agnostic. AUC = 0.5 = random coin flip. AUC = 1.0 = perfect separation. Model A (0.97) is excellent — it correctly ranks a random positive above a random negative 97% of the time. Model B (0.61) barely beats random guessing. AUC > 0.85 is generally considered good for production.",
    llmLink: "Used in LLM-based classifiers (spam, toxicity, sentiment). A high AUC means the model's confidence scores are well-calibrated — high score reliably means positive class."
  },
  // LLM CONNECTIONS
  {
    id: 9, category: "LLM Connection", categoryColor: "#A855F7", icon: "🤖",
    question: "An LLM has 'perplexity = 15' on a test set. Another has perplexity = 85. Which is better and what does perplexity actually measure?",
    options: [
      "Perplexity = 85 is better — higher means more confident",
      "Perplexity = 15 is better — it measures how surprised the model is by real text. Lower = model predicts language better",
      "They're equivalent — perplexity just measures vocabulary size",
      "Perplexity = 15 is overfitting — too low means memorization"
    ],
    correct: 1,
    explanation: "Lower perplexity = better. Perplexity is essentially e^(cross-entropy loss) — it measures how surprised the model is when it sees real text. Perplexity = 15 means the model acts as if it's choosing between ~15 equally likely words at each step. Perplexity = 85 means it's much more uncertain. GPT-4 class models achieve perplexity around 10-20 on standard benchmarks. It's the LLM equivalent of validation loss.",
    llmLink: "Perplexity IS a statistical metric — it's directly derived from probability theory. Lower perplexity = the model has learned a better statistical model of language."
  },
  {
    id: 10, category: "LLM Connection", categoryColor: "#A855F7", icon: "🤖",
    question: "You're fine-tuning an LLM on your company's private data. After training, accuracy on training data = 98% but on new company documents it's only 61%. What's happening and how do you fix it?",
    options: [
      "The model needs more layers — it's underfitting",
      "This is overfitting — the model memorized training documents instead of learning patterns. Fix: more diverse data, dropout, early stopping, smaller learning rate",
      "61% is actually good for LLMs — they're not meant to be accurate",
      "The validation set is wrong — retrain from scratch"
    ],
    correct: 1,
    explanation: "Classic overfitting. The model memorized your training documents rather than generalizing. Signs: huge gap between train (98%) and test (61%) performance. Fixes: (1) More diverse training data, (2) Dropout layers, (3) Early stopping — stop training when validation loss stops improving, (4) Reduce learning rate, (5) Data augmentation, (6) LoRA fine-tuning instead of full fine-tuning. For private LLMs, this is a real risk when company data is limited.",
    llmLink: "This is the #1 practical problem when building private LLMs. Your training corpus is small (company docs) so overfitting risk is HIGH. LoRA and QLoRA were invented specifically to reduce this."
  },
  {
    id: 11, category: "LLM Connection", categoryColor: "#A855F7", icon: "🤖",
    question: "You set temperature = 0.1 vs temperature = 1.8 when generating LLM output. A statistician would say these affect what property of the output distribution?",
    options: [
      "Temperature changes the mean of the output distribution",
      "Temperature controls variance — low temp = low variance (deterministic, always picks highest prob token); high temp = high variance (spreads probability, more random/creative)",
      "Temperature changes the model's perplexity score",
      "Temperature affects training speed, not output"
    ],
    correct: 1,
    explanation: "Temperature directly controls the VARIANCE of the probability distribution over tokens. At temp=0.1, the distribution becomes very peaked (low variance) — the model almost always picks the most probable token. At temp=1.8, probability spreads across many tokens (high variance) — outputs become more creative, surprising, sometimes incoherent. Temp=1.0 is the 'natural' distribution the model learned. This is pure applied statistics on probability distributions.",
    llmLink: "For a private company LLM answering factual questions about internal docs, you'd use low temperature (0.1-0.3). For a creative writing assistant, higher temperature (0.8-1.2). This is a deployment decision, not a training decision."
  },
  {
    id: 12, category: "LLM Connection", categoryColor: "#A855F7", icon: "🤖",
    question: "Before deploying an LLM for a company, what are the 3 MOST CRITICAL questions you must answer about its performance?",
    options: [
      "How fast is it? How much does it cost? How big is it?",
      "What is its hallucination rate? What is its accuracy on domain-specific evals? Does it leak training data when prompted?",
      "What's its perplexity? What's its BLEU score? What's its parameter count?",
      "Did it pass the Turing test? Can it write code? Does it speak multiple languages?"
    ],
    correct: 1,
    explanation: "For a PRIVATE company LLM, these three are non-negotiable: (1) Hallucination rate — how often does it confidently state wrong facts? Catastrophic for business. (2) Domain accuracy — does it correctly answer questions about YOUR specific company data, products, processes? General benchmark scores don't tell you this. (3) Data leakage — can an adversarial prompt extract private training data? This is the core value prop of a private LLM — you MUST test this.",
    llmLink: "This is your core pitch: 'I can build a model where we measure and minimize hallucination rate, maximize domain accuracy, and verify zero data leakage — all metrics I can quantify and report on.'"
  },
  // PRE-MODEL QUESTIONS
  {
    id: 13, category: "Before You Model", categoryColor: "#10B981", icon: "🎯",
    question: "A stakeholder says: 'Build a model to predict which customers will churn.' Before writing a line of code, what is the MOST IMPORTANT question you must ask?",
    options: [
      "What algorithm should I use?",
      "How much training data do we have?",
      "How will we define 'churn'? What's the prediction window? What action will be taken on model output?",
      "What programming language should I use?"
    ],
    correct: 2,
    explanation: "You must define the problem before touching data. 'Churn' is ambiguous: Is it 30 days inactive? Cancelled subscription? No purchase in 90 days? Then: prediction window matters (predict churn in 7 days vs 180 days = completely different models). Most importantly: what happens when the model flags someone as churning? If no action follows, the model has zero business value regardless of accuracy. This is called the 'model-to-action' gap.",
    llmLink: "Same principle for LLMs: before building a private LLM, define exactly what tasks it must do, how you'll measure success, and what happens when it's wrong. 'Build an LLM' is not a spec."
  },
  {
    id: 14, category: "Before You Model", categoryColor: "#10B981", icon: "🎯",
    question: "Your dataset has 95% 'Not Fraud' and 5% 'Fraud' labels. What critical issue does this create, and what's your first move?",
    options: [
      "No issue — just train on all the data as-is",
      "Class imbalance — a model predicting 'not fraud' always gets 95% accuracy but is useless. Fix: use SMOTE/oversampling, class weights, and use F1/AUC not accuracy as your metric",
      "Delete the majority class to balance it 50/50",
      "Use accuracy as your metric — 95% is already great"
    ],
    correct: 1,
    explanation: "Class imbalance is one of the most common real-world ML problems. The naive model just predicts 'not fraud' always and scores 95% accuracy — completely useless. Solutions: (1) SMOTE (Synthetic Minority Over-sampling Technique) — generate synthetic fraud examples, (2) Set class_weight='balanced' in sklearn, (3) Use stratified k-fold cross validation, (4) Change your success metric to F1-score, Recall, or AUC-ROC — these expose the imbalance problem that accuracy hides.",
    llmLink: "In LLM fine-tuning: if your training data has 90% English and 10% Spanish, the model will perform poorly on Spanish. Same imbalance problem. Solution: oversample Spanish examples or use weighted loss."
  },
  {
    id: 15, category: "Before You Model", categoryColor: "#10B981", icon: "🎯",
    question: "You trained a model and got 96% accuracy. Your colleague says 'ship it.' What should you check BEFORE agreeing?",
    options: [
      "Nothing — 96% is excellent, ship it",
      "Check: was the test set truly held-out? Is there data leakage? What's precision/recall breakdown? What's the baseline accuracy? Does performance hold across subgroups?",
      "Just check the confusion matrix quickly",
      "Re-run the model 3 times to confirm the 96%"
    ],
    correct: 1,
    explanation: "96% sounds great but could be completely wrong: (1) Data leakage — did training data accidentally include test data? If so, 96% is meaningless. (2) Baseline — if 94% of records are class A, a dummy model is 94%. You only beat it by 2%. (3) Precision/Recall — 96% accuracy with 10% recall on the minority class = terrible. (4) Subgroup performance — does it work well for all user segments or is it great on majority group and terrible on others? Always interrogate before shipping.",
    llmLink: "For LLMs: 'model passes evals' doesn't mean 'ready to deploy.' You must check: domain-specific test set, adversarial prompts, edge cases, performance on your actual user queries — not just benchmark datasets."
  },
];

const CATEGORIES = ["All", "Which Test?", "Interpret Metrics", "LLM Connection", "Before You Model"];
const CAT_COLORS = {
  "Which Test?": "#00D4FF",
  "Interpret Metrics": "#FF6B6B",
  "LLM Connection": "#A855F7",
  "Before You Model": "#10B981",
};

export default function App() {
  const [screen, setScreen] = useState("home"); // home | quiz | result | review
  const [category, setCategory] = useState("All");
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showLLM, setShowLLM] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const streakRef = useRef(0);

  const startQuiz = (cat) => {
    const filtered = cat === "All" ? [...QUESTIONS] : QUESTIONS.filter(q => q.category === cat);
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setIdx(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setResults([]);
    setStreak(0);
    streakRef.current = 0;
    setMaxStreak(0);
    setShowLLM(false);
    setAnimKey(k => k + 1);
    setScreen("quiz");
  };

  const handleAnswer = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    const correct = i === queue[idx].correct;
    if (correct) {
      setScore(s => s + 1);
      const newStreak = streakRef.current + 1;
      streakRef.current = newStreak;
      setStreak(newStreak);
      setMaxStreak(m => Math.max(m, newStreak));
    } else {
      streakRef.current = 0;
      setStreak(0);
    }
    setResults(r => [...r, { ...queue[idx], userAnswer: i, correct }]);
  };

  const next = () => {
    if (idx + 1 >= queue.length) {
      setScreen("result");
    } else {
      setIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
      setShowLLM(false);
      setAnimKey(k => k + 1);
    }
  };

  const q = queue[idx] || {};
  const pct = queue.length ? Math.round((idx / queue.length) * 100) : 0;

  return (
    <div style={{
      minHeight: "100vh", background: "#070B14",
      fontFamily: "'Syne', 'Space Grotesk', sans-serif",
      color: "#E8EEFF", overflowX: "hidden",
      backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.06) 0%, transparent 50%)"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Grotesk:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0D1117; }
        ::-webkit-scrollbar-thumb { background: #2A3A5C; border-radius: 2px; }
        .opt-btn { transition: all 0.18s cubic-bezier(.4,0,.2,1); cursor: pointer; border: none; text-align: left; width: 100%; }
        .opt-btn:hover:not(:disabled) { transform: translateX(6px); }
        .cat-btn { transition: all 0.2s; cursor: pointer; border: none; }
        .cat-btn:hover { transform: translateY(-3px); }
        .pulse { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .slide-in { animation: slideIn 0.4s cubic-bezier(.4,0,.2,1) both; }
        @keyframes slideIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .pop { animation: pop 0.35s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes pop { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
        .glow { box-shadow: 0 0 24px rgba(0,212,255,0.25); }
        .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; }
      `}</style>

      {/* HOME */}
      {screen === "home" && (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }} className="slide-in">
            <div style={{ fontSize: 13, letterSpacing: 4, color: "#00D4FF", fontWeight: 700, marginBottom: 16, textTransform: "uppercase" }}>
              ◆ ML / DS MASTERY SYSTEM ◆
            </div>
            <h1 style={{ fontSize: "clamp(36px,8vw,64px)", fontWeight: 800, lineHeight: 1.05, marginBottom: 16 }}>
              <span style={{ color: "#E8EEFF" }}>TRAIN YOUR</span><br />
              <span style={{ background: "linear-gradient(90deg,#00D4FF,#A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MACHINE BRAIN</span>
            </h1>
            <p style={{ color: "#8A9BC4", fontSize: 16, lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
              Master the concepts you need — from statistical tests to LLM metrics — through active recall. Built for your interview prep and your private LLM journey.
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 40, justifyContent: "center" }}>
            {[["15", "Questions"], ["4", "Categories"], ["Active", "Recall"]].map(([v, l]) => (
              <div key={l} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 24px", textAlign: "center", flex: 1, maxWidth: 160 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#00D4FF" }}>{v}</div>
                <div style={{ fontSize: 12, color: "#5A6B8A", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Category cards */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#5A6B8A", fontWeight: 700, textTransform: "uppercase", marginBottom: 16, paddingLeft: 4 }}>
              Choose a Focus Area
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {CATEGORIES.map((cat, i) => {
                const count = cat === "All" ? QUESTIONS.length : QUESTIONS.filter(q => q.category === cat).length;
                const color = cat === "All" ? "#E8EEFF" : CAT_COLORS[cat];
                const icons = { "All": "⚡", "Which Test?": "🧪", "Interpret Metrics": "📊", "LLM Connection": "🤖", "Before You Model": "🎯" };
                return (
                  <button key={cat} className="cat-btn" onClick={() => startQuiz(cat)}
                    style={{
                      background: cat === "All" ? "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(168,85,247,0.15))" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${cat === "All" ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 14, padding: "18px 20px",
                      display: "flex", alignItems: "center", gap: 16,
                    }}>
                    <div style={{ fontSize: 28, width: 40, textAlign: "center" }}>{icons[cat]}</div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: color, marginBottom: 3 }}>{cat}</div>
                      <div style={{ fontSize: 13, color: "#5A6B8A" }}>{count} questions</div>
                    </div>
                    <div style={{ fontSize: 20, color: "#2A3A5C" }}>›</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* QUIZ */}
      {screen === "quiz" && queue.length > 0 && (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px" }}>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <button onClick={() => setScreen("home")}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 14px", color: "#8A9BC4", cursor: "pointer", fontSize: 13 }}>
              ← Back
            </button>
            <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#00D4FF,#A855F7)", borderRadius: 3, transition: "width 0.4s" }} />
            </div>
            <div style={{ fontSize: 13, color: "#5A6B8A", fontWeight: 600, whiteSpace: "nowrap" }}>
              {idx + 1} / {queue.length}
            </div>
            {streak >= 2 && (
              <div style={{ background: "rgba(255,165,0,0.2)", border: "1px solid rgba(255,165,0,0.4)", borderRadius: 8, padding: "4px 10px", fontSize: 13, color: "#FFB347", fontWeight: 700 }}>
                🔥 {streak}
              </div>
            )}
          </div>

          {/* Question card */}
          <div key={animKey} className="slide-in"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "28px 24px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 22 }}>{q.icon}</span>
              <span className="badge" style={{ background: `${q.categoryColor}22`, color: q.categoryColor, border: `1px solid ${q.categoryColor}44` }}>
                {q.category}
              </span>
            </div>
            <p style={{ fontSize: "clamp(15px,2.5vw,18px)", lineHeight: 1.65, fontWeight: 500, color: "#D0D8EE" }}>
              {q.question}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
            {q.options?.map((opt, i) => {
              const isCorrect = i === q.correct;
              const isSelected = i === selected;
              let bg = "rgba(255,255,255,0.03)";
              let border = "rgba(255,255,255,0.08)";
              let color = "#C0CBE0";
              if (answered) {
                if (isCorrect) { bg = "rgba(16,185,129,0.15)"; border = "rgba(16,185,129,0.6)"; color = "#6EE7B7"; }
                else if (isSelected) { bg = "rgba(239,68,68,0.15)"; border = "rgba(239,68,68,0.6)"; color = "#FCA5A5"; }
              } else if (isSelected) {
                bg = "rgba(0,212,255,0.1)"; border = "rgba(0,212,255,0.5)"; color = "#00D4FF";
              }
              return (
                <button key={i} className="opt-btn" disabled={answered} onClick={() => handleAnswer(i)}
                  style={{
                    background: bg, border: `1px solid ${border}`, borderRadius: 14,
                    padding: "16px 18px", color, fontSize: 14, lineHeight: 1.55,
                    display: "flex", alignItems: "flex-start", gap: 12,
                  }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                    {answered && isCorrect ? "✓" : answered && isSelected ? "✗" : String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div className="pop">
              <div style={{
                background: selected === q.correct ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${selected === q.correct ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                borderRadius: 16, padding: "20px 20px", marginBottom: 12
              }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: selected === q.correct ? "#10B981" : "#EF4444" }}>
                  {selected === q.correct ? "✓ Correct! " : "✗ Not quite — "}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#A0AEC4" }}>{q.explanation}</p>
              </div>
              <div style={{
                background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)",
                borderRadius: 16, padding: "16px 20px", marginBottom: 16
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#A855F7", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>🤖 LLM / Interview Connection</div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: "#9A8AC4" }}>{q.llmLink}</p>
              </div>
              <button onClick={next}
                style={{
                  width: "100%", padding: "16px", borderRadius: 14, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg,#00D4FF,#A855F7)", color: "#070B14",
                  fontWeight: 800, fontSize: 15, fontFamily: "inherit", letterSpacing: 0.5
                }}>
                {idx + 1 >= queue.length ? "See Results →" : "Next Question →"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* RESULT */}
      {screen === "result" && (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px" }} className="slide-in">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {score / queue.length >= 0.8 ? "🏆" : score / queue.length >= 0.6 ? "📈" : "💪"}
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>
              <span style={{ background: "linear-gradient(90deg,#00D4FF,#A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {score} / {queue.length}
              </span>
            </h2>
            <p style={{ color: "#8A9BC4", fontSize: 16, marginBottom: 4 }}>
              {Math.round((score / queue.length) * 100)}% correct
            </p>
            {maxStreak >= 3 && <p style={{ color: "#FFB347" }}>🔥 Max streak: {maxStreak}</p>}
            <p style={{ color: "#6A7B9A", fontSize: 14, marginTop: 12 }}>
              {score / queue.length >= 0.8 ? "You're ready to talk about this in an interview. 🚀" : score / queue.length >= 0.6 ? "Solid foundation. Review the missed ones and go again." : "Keep drilling — this knowledge compounds fast. You've got this."}
            </p>
          </div>

          {/* Breakdown */}
          <div style={{ marginBottom: 24 }}>
            {results.map((r, i) => (
              <div key={i} style={{
                background: r.correct ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)",
                border: `1px solid ${r.correct ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                borderRadius: 12, padding: "14px 16px", marginBottom: 8,
                display: "flex", alignItems: "flex-start", gap: 12
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{r.correct ? "✓" : "✗"}</span>
                <div>
                  <div style={{ fontSize: 13, color: "#9AA8C4", lineHeight: 1.5 }}>{r.question.slice(0, 90)}...</div>
                  {!r.correct && (
                    <div style={{ fontSize: 12, color: "#10B981", marginTop: 6 }}>
                      Correct: {r.options[r.correct]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={() => startQuiz(category)} style={{
              padding: 16, borderRadius: 14, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg,#00D4FF,#A855F7)", color: "#070B14",
              fontWeight: 800, fontSize: 14, fontFamily: "inherit"
            }}>↺ Retry</button>
            <button onClick={() => setScreen("home")} style={{
              padding: 16, borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
              background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
              color: "#8A9BC4", fontWeight: 600, fontSize: 14
            }}>⌂ Home</button>
          </div>
        </div>
      )}
    </div>
  );
}
