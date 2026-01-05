
import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, ActivityItem } from '../types';
import { 
  Briefcase, Zap, Star, X, CheckCircle, ArrowRight, 
  BookOpen, Rocket, Building2, Search, 
  ShieldCheck, AlertTriangle, Sparkles, Globe, Clock,
  Award, TrendingUp, HelpCircle, Wallet, LayoutList, Target, LineChart,
  Lock, ShieldAlert, CreditCard
} from 'lucide-react';

interface AnalysisResultProps {
  data: AnalysisResult;
  onApplyRequest: (job: any) => void;
  onApplyFinish: (item: ActivityItem) => void;
}

const SECTIONS = [
  { id: 'summary', label: 'Tóm tắt CV', icon: <LayoutList className="w-4 h-4" /> },
  { id: 'strengths-weaknesses', label: 'Điểm mạnh & yếu', icon: <Target className="w-4 h-4" /> },
  { id: 'detailed', label: 'Phân tích chi tiết', icon: <Search className="w-4 h-4" /> },
  { id: 'jobs', label: 'Việc làm gợi ý', icon: <Building2 className="w-4 h-4" /> },
  { id: 'roadmap', label: 'Lộ trình phát triển', icon: <LineChart className="w-4 h-4" /> },
  { id: 'premium', label: 'Voltria HRM Premium', icon: <Award className="w-4 h-4" /> },
];

const AnalysisResultView: React.FC<AnalysisResultProps> = ({ data, onApplyRequest, onApplyFinish }) => {
  const [activeSection, setActiveSection] = useState('summary');
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const handlePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsPremiumUnlocked(true);
      setShowPaymentModal(false);
    }, 2000);
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleExecuteApply = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { job, cv, username, name } = customEvent.detail;
      if (job) {
        startApplyProcess(job, cv, username, name);
      }
    };
    window.addEventListener('execute-apply', handleExecuteApply);
    return () => window.removeEventListener('execute-apply', handleExecuteApply);
  }, []);

  const startApplyProcess = (job: any, cv: any, username: string, name: string) => {
    setIsApplying(job.title);
    const newActivity: ActivityItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: job.title,
      provider: job.provider,
      type: 'job',
      appliedDate: new Date().toLocaleDateString('vi-VN'),
      status: 'reviewing',
      description: job.description,
      candidateName: name || "Ứng viên Test",
      cvFileContent: cv?.fileData,
      cvMimeType: cv?.mimeType,
      ownerUsername: username
    };
    onApplyFinish(newActivity);
    setTimeout(() => {
      const statusOptions: ('approved' | 'rejected')[] = ['approved', 'rejected'];
      const finalStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      window.dispatchEvent(new CustomEvent('update-app-status', { detail: { id: newActivity.id, status: finalStatus } }));
      setIsApplying(null);
      setShowSuccessPopup({ show: true, msg: `HR Agent | Phạm Tuyết Nhi đã hoàn tất xem xét hồ sơ của bạn.` });
    }, 10000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const renderHighlightedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="text-purple-700 font-black px-1.5 py-0.5 bg-purple-50 rounded-md border border-purple-100 mx-0.5">{part.slice(2, -2)}</span>;
      }
      return part;
    });
  };

  return (
    <div className="w-full relative font-['Be_Vietnam_Pro'] pb-32 flex">
      
      {/* LEFT NAVIGATION - THE RAIL */}
      <aside className="hidden lg:flex flex-col w-80 fixed left-0 top-32 bottom-0 px-8 z-40 pointer-events-none">
        <div className="relative h-full flex flex-col pointer-events-auto">
          <div className="absolute left-[19px] top-4 bottom-4 w-1 bg-slate-200 rounded-full"></div>
          <div 
            className="absolute left-[19px] top-4 w-1 bg-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ 
              height: `${(SECTIONS.findIndex(s => s.id === activeSection) / (SECTIONS.length - 1)) * 100}%`,
              maxHeight: 'calc(100% - 32px)'
            }}
          ></div>

          <div className="flex flex-col justify-between h-full py-4">
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex items-center gap-6 group text-left transition-all duration-300 ${isActive ? 'translate-x-2' : 'hover:translate-x-1'}`}
                >
                  <div className={`relative z-10 w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                    isActive ? 'bg-purple-600 border-purple-100 text-white scale-125 shadow-lg shadow-purple-200' : 'bg-white border-slate-200 text-slate-400 group-hover:border-purple-300'
                  }`}>
                    {section.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-black uppercase tracking-widest transition-colors ${isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {section.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA - Increased max-width for more breathing room */}
      <main className="flex-1 lg:ml-80 max-w-7xl mx-auto px-4 lg:px-12 space-y-24">
        
        {/* Section: Summary */}
        <section id="summary" className="scroll-mt-32">
          <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Sparkles className="w-40 h-40 text-purple-600" />
            </div>
            <div className="relative z-10">
              <div className="inline-block px-6 py-2 bg-purple-50 text-purple-600 rounded-full text-xs font-black uppercase tracking-widest mb-8">Executive Summary</div>
              <h2 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter uppercase leading-none">Tóm tắt đánh giá</h2>
              <div className="flex flex-wrap gap-4 mb-10">
                 <div className="px-6 py-4 bg-slate-900 text-white rounded-[1.5rem] flex items-center gap-3">
                   <ShieldCheck className="w-5 h-5 text-purple-400" />
                   <span className="font-bold uppercase text-xs tracking-widest">Level: {data.candidateLevel}</span>
                 </div>
                 <div className="px-6 py-4 bg-purple-600 text-white rounded-[1.5rem] flex items-center gap-3">
                   <Zap className="w-5 h-5 text-yellow-300" />
                   <span className="font-bold uppercase text-xs tracking-widest">Match: {data.matchScore}%</span>
                 </div>
              </div>
              <p className="text-xl text-gray-600 leading-relaxed font-medium italic">"{data.summary}"</p>
            </div>
          </div>
        </section>

        {/* Section: Strengths & Weaknesses */}
        <section id="strengths-weaknesses" className="scroll-mt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#f0fdf4] rounded-[3rem] p-12 border border-green-100 shadow-sm">
              <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-green-200">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-[#166534] mb-8 uppercase tracking-tighter">Điểm Mạnh Nổi Bật</h3>
              <ul className="space-y-5">
                {data.strengths.map((s,i)=>(
                  <li key={i} className="flex gap-4 text-base font-bold text-[#15803d] bg-white/40 p-4 rounded-2xl border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2.5 shrink-0"></div>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#fffaf5] rounded-[3rem] p-12 border border-orange-100 shadow-sm">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-orange-200">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-[#9a3412] mb-8 uppercase tracking-tighter">Điểm Cần Khắc Phục</h3>
              <ul className="space-y-5">
                {data.weaknesses.map((w,i)=>(
                  <li key={i} className="flex gap-4 text-base font-bold text-[#c2410c] bg-white/40 p-4 rounded-2xl border border-orange-200">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2.5 shrink-0"></div>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section: Detailed Analysis */}
        <section id="detailed" className="scroll-mt-32">
          <div className="bg-white rounded-[3.5rem] p-10 md:p-16 shadow-xl border border-gray-100">
             <div className="flex items-center gap-6 mb-16">
                <div className="p-5 bg-slate-900 rounded-[2rem] text-white shadow-xl">
                  <Briefcase className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Phân tích chuyên sâu</h2>
             </div>
             <div className="grid grid-cols-1 gap-12">
               <InfoBlock title="KINH NGHIỆM PHÙ HỢP" content={renderHighlightedText(data.detailedAnalysis.experienceMatch)} />
               <InfoBlock title="KỸ NĂNG CHUYÊN MÔN" content={renderHighlightedText(data.detailedAnalysis.skillsAssessment)} />
               <InfoBlock title="SỰ ỔN ĐỊNH SỰ NGHIỆP" content={renderHighlightedText(data.detailedAnalysis.jobStability)} />
               <InfoBlock title="SOFT SKILLS & TEAMWORK" content={renderHighlightedText(data.detailedAnalysis.teamworkAndSoftSkills)} />
             </div>
          </div>
        </section>

        {/* Section: Suggested Jobs */}
        <section id="jobs" className="scroll-mt-32">
          <div className="bg-[#43238e] rounded-[4rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <h3 className="text-4xl font-black tracking-tight uppercase mb-16 flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md">
                 <Building2 className="w-8 h-8 text-yellow-300" />
              </div>
              Việc làm tiềm năng
            </h3>
            <div className="grid grid-cols-1 gap-6 relative z-10">
              {data.suggestedJobs.map((job, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/20 transition-all group/card border-b-8 border-white/5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <h4 className="font-black text-2xl text-white group-hover/card:text-yellow-300 transition-colors">{job.title}</h4>
                      <p className="text-purple-200 font-bold uppercase text-[10px] tracking-[0.3em] mt-1 italic">Company: {job.provider}</p>
                    </div>
                    <button 
                      disabled={!!isApplying}
                      onClick={() => onApplyRequest(job)}
                      className={`px-10 py-4 rounded-full text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                        isApplying === job.title ? 'bg-yellow-400 text-purple-900 animate-pulse' : 'bg-white text-purple-900 hover:bg-yellow-400 hover:text-purple-900'
                      }`}
                    >
                      {isApplying === job.title ? 'Submitting...' : 'Apply Now'}
                    </button>
                  </div>
                  <p className="text-purple-50 text-lg italic leading-relaxed font-medium">"{job.description}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Roadmap */}
        <section id="roadmap" className="scroll-mt-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">Lộ trình nâng cấp</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-4 italic">Actionable Steps to Your Next Milestone</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-10">
              <h3 className="text-2xl font-black flex items-center gap-4 px-6">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner"><BookOpen className="w-7 h-7" /></div>
                Khóa học cốt lõi
              </h3>
              {data.developmentRoadmap.courses.map((c, i) => <RoadmapCard key={i} item={c} color="blue" icon={<Search className="w-5 h-5" />} />)}
            </div>
            <div className="space-y-10">
              <h3 className="text-2xl font-black flex items-center gap-4 px-6">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center shadow-inner"><Rocket className="w-7 h-7" /></div>
                Dự án thực tế
              </h3>
              {data.developmentRoadmap.projects.map((p, i) => <RoadmapCard key={i} item={p} color="purple" icon={<Zap className="w-5 h-5" />} />)}
            </div>
          </div>
        </section>

        {/* Section: Premium HRM - RESTRUCTURED TO 3 COLUMNS */}
        <section id="premium" className="scroll-mt-32">
           <div className="relative rounded-[4rem] overflow-hidden bg-[#0f172a] text-white p-12 md:p-16 shadow-2xl border border-white/5">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20 relative z-10">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-black tracking-tighter uppercase">Voltria HRM Premium</h2>
                  <p className="text-yellow-400 font-bold uppercase tracking-[0.3em] text-[11px] mt-1 italic">Đánh giá cấp cao bởi AI Agent</p>
                </div>
              </div>
              {!isPremiumUnlocked && (
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="px-12 py-5 bg-white text-slate-900 font-black text-lg rounded-2xl hover:bg-yellow-400 transition-all shadow-2xl active:scale-95 flex items-center gap-3"
                >
                  <Lock className="w-5 h-5" /> Mở Khóa Chuyên Sâu
                </button>
              )}
            </div>

            <div className="relative min-h-[500px]">
              {!isPremiumUnlocked ? (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-12 bg-[#0f172a]/40 backdrop-blur-3xl rounded-[4rem] border border-white/5">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 animate-pulse">
                      <ShieldAlert className="w-10 h-10 text-yellow-500" />
                   </div>
                   <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter">Nội dung Premium</h3>
                   <p className="text-gray-400 max-w-xl text-lg mb-12 italic leading-relaxed font-medium">Khám phá phân tích hành vi, chỉ số phù hợp văn hóa và tư vấn lương dành riêng cho bạn.</p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                     {/* Column 1: Personality Analysis (WIDER) */}
                     <div className="lg:col-span-5 bg-[#1e293b]/50 p-10 rounded-[3rem] border border-white/5 shadow-inner">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                           <Sparkles className="w-5 h-5 text-yellow-400" /> PHÂN TÍCH TÂM LÝ & HÀNH VI
                        </h4>
                        <div className="relative">
                          <span className="absolute -left-6 top-0 text-6xl text-white/10 font-serif leading-none">“</span>
                          <p className="text-gray-200 text-xl leading-[1.8] font-medium italic pl-2">
                             {data.hrmPremiumAssessment.personalityTraits}
                          </p>
                          <span className="absolute -right-2 bottom-0 text-6xl text-white/10 font-serif leading-none">”</span>
                        </div>
                        
                        {/* Interview Prep below inside the same column */}
                        <div className="mt-12 pt-12 border-t border-white/5">
                           <h4 className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3"><HelpCircle className="w-4 h-4" /> Phỏng vấn thực chiến</h4>
                           <div className="space-y-4">
                              {data.hrmPremiumAssessment.interviewQuestions.slice(0, 2).map((q, i) => (
                                <p key={i} className="text-sm text-gray-400 font-medium italic border-l-2 border-yellow-500/50 pl-4">{q}</p>
                              ))}
                           </div>
                        </div>
                     </div>

                     {/* Column 2: Culture Fit (Vertical Bar Style) */}
                     <div className="lg:col-span-3 bg-gradient-to-b from-purple-600 to-indigo-800 rounded-[3.5rem] flex flex-col items-center justify-center p-12 text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <p className="text-[11px] font-black text-purple-200 uppercase tracking-[0.5em] mb-6 relative z-10">CULTURE FIT</p>
                        <div className="relative z-10">
                           <p className="text-8xl font-black tracking-tighter text-white drop-shadow-2xl">{data.hrmPremiumAssessment.culturalFitScore}%</p>
                        </div>
                        <div className="mt-8 relative z-10">
                           <div className="w-16 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
                           <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest leading-relaxed">Phù hợp môi trường<br/>năng động</p>
                        </div>
                     </div>

                     {/* Column 3: Salary Advice */}
                     <div className="lg:col-span-4 bg-[#1e293b]/80 p-10 rounded-[3rem] border border-white/5 flex flex-col justify-between hover:bg-[#1e293b] transition-colors group">
                        <div>
                           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-12 text-center">SALARY ADVICE</h4>
                           <div className="text-center">
                              <p className="text-2xl md:text-3xl font-black text-[#10b981] leading-[1.3] uppercase tracking-tight mb-8">
                                 {data.hrmPremiumAssessment.salaryExpectationAdvice.split('.').map((part, i) => (
                                    <span key={i} className="block">{part.trim()}{i < data.hrmPremiumAssessment.salaryExpectationAdvice.split('.').length - 1 ? '.' : ''}</span>
                                 ))}
                              </p>
                           </div>
                        </div>
                        <div className="mt-auto">
                           <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> POTENTIAL</p>
                              <p className="text-xs text-gray-400 leading-relaxed font-medium italic">
                                 {data.hrmPremiumAssessment.longTermPotential.split('.')[0]}...
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* MODALS */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[4rem] p-12 md:p-16 max-w-md w-full shadow-2xl relative overflow-hidden">
              <button onClick={() => setShowPaymentModal(false)} className="absolute top-10 right-10 p-3 text-gray-400 hover:bg-gray-100 rounded-full transition-all"><X className="w-7 h-7" /></button>
              
              <div className="text-center mb-12">
                 <div className="w-24 h-24 bg-purple-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-200 rotate-3"><Wallet className="w-12 h-12" /></div>
                 <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">Thanh toán dịch vụ</h3>
                 <p className="text-slate-400 font-bold text-sm italic uppercase tracking-widest">Voltria Gateway</p>
              </div>

              <div className="bg-slate-50 rounded-[2.5rem] p-10 mb-12 border border-slate-100">
                 <div className="flex justify-between items-center mb-8">
                    <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Gói dịch vụ</span>
                    <span className="text-gray-900 font-black">HRM Premium</span>
                 </div>
                 <div className="flex justify-between items-center py-8 border-y border-slate-200">
                    <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Giá mở khóa</span>
                    <span className="text-3xl font-black text-purple-600">50,000 VNĐ</span>
                 </div>
                 <div className="mt-8 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Bạn sẽ nhận được:</p>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700"><CheckCircle className="w-5 h-5 text-green-500" /> Báo cáo hành vi cá nhân</div>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700"><CheckCircle className="w-5 h-5 text-green-500" /> 5 câu hỏi phỏng vấn hóc búa</div>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700"><CheckCircle className="w-5 h-5 text-green-500" /> Tư vấn mức lương phù hợp</div>
                 </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className="w-full bg-slate-900 text-white font-black py-7 rounded-[2rem] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-6 text-2xl active:scale-95 disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <Clock className="w-8 h-8 animate-spin" /> 
                    Processing...
                  </>
                ) : (
                  <>
                    Xác nhận mua
                    <ArrowRight className="w-8 h-8" />
                  </>
                )}
              </button>
           </div>
        </div>
      )}

      {showSuccessPopup.show && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
           <div className="bg-white rounded-[4rem] p-16 max-w-md w-full shadow-2xl text-center relative overflow-hidden animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner"><CheckCircle className="w-14 h-14 text-green-600" /></div>
              <h3 className="text-3xl font-black text-gray-900 mb-6 tracking-tighter uppercase">HOÀN TẤT</h3>
              <p className="text-gray-500 mb-14 font-medium italic text-lg leading-relaxed">{showSuccessPopup.msg}</p>
              <button onClick={() => setShowSuccessPopup({show: false, msg: ''})} className="w-full bg-purple-600 text-white font-black py-6 rounded-[2rem] shadow-lg text-xl hover:bg-purple-700 transition-all">Quay lại</button>
           </div>
        </div>
      )}
    </div>
  );
};

const InfoBlock = ({ title, content }: any) => (
  <div className="group border-l-[8px] border-slate-100 pl-16 relative hover:border-purple-600 transition-all duration-700">
    <div className="absolute -left-2 top-0 w-2 h-0 bg-purple-600 group-hover:h-full transition-all duration-700"></div>
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-8 group-hover:text-purple-600 transition-colors flex items-center gap-4"><Sparkles className="w-5 h-5" /> {title}</h4>
    <div className="text-gray-800 text-2xl font-medium leading-[1.6]">{content}</div>
  </div>
);

const RoadmapCard = ({ item, icon, color }: any) => (
  <div className={`group flex flex-col p-12 rounded-[3.5rem] border-2 border-slate-50 bg-white hover:border-${color}-500 hover:shadow-2xl transition-all duration-500 cursor-pointer`}>
    <div className="flex items-center gap-8 mb-8">
      <div className={`p-6 rounded-[2rem] bg-${color}-50 text-${color}-600 group-hover:bg-${color}-600 group-hover:text-white transition-all shadow-md`}>{icon}</div>
      <div>
        <h4 className="font-black text-2xl text-gray-900 group-hover:text-purple-800 transition-colors">{item.name}</h4>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2 italic">{item.provider || 'Voltria Research'}</p>
      </div>
    </div>
    <p className="text-slate-500 text-lg italic leading-relaxed border-t border-slate-50 pt-8 group-hover:text-gray-700 transition-colors">"{item.description}"</p>
  </div>
);

export default AnalysisResultView;
