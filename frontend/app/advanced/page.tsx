'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { advancedAiApi } from '@/lib/advancedAi';
import toast from 'react-hot-toast';

export default function AdvancedAIPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'skills' | 'ats' | 'rewrite' | 'gap' | 'interview'>('skills');

  // Skill Extraction State
  const [skillText, setSkillText] = useState('');
  const [skillResult, setSkillResult] = useState<any>(null);

  // Resume Rewriter State
  const [bullets, setBullets] = useState(['']);
  const [rewriteResult, setRewriteResult] = useState<any>(null);

  // Gap Analyzer State
  const [resumeText, setResumeText] = useState('');
  const [targetJob, setTargetJob] = useState('');
  const [gapResult, setGapResult] = useState<any>(null);

  // Interview Questions State
  const [interviewText, setInterviewText] = useState('');
  const [interviewResult, setInterviewResult] = useState<any>(null);

  const handleExtractSkills = async () => {
    if (!skillText.trim()) return toast.error('Please enter resume text');
    setLoading(true);
    try {
      const data = await advancedAiApi.extractSkills(skillText);
      setSkillResult(data);
      toast.success('Skills extracted successfully!');
    } catch (error) {
      toast.error('Failed to extract skills. Check backend/AI service logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = async () => {
    const validBullets = bullets.filter((b) => b.trim() !== '');
    if (validBullets.length === 0) return toast.error('Please enter at least one bullet point');
    setLoading(true);
    try {
      const data = await advancedAiApi.rewriteResume(validBullets);
      setRewriteResult(data);
      toast.success('Bullets rewritten successfully!');
    } catch (error) {
      toast.error('Failed to rewrite bullets.');
    } finally {
      setLoading(false);
    }
  };

  const handleGapAnalysis = async () => {
    if (!resumeText.trim() || !targetJob.trim()) return toast.error('Please enter both resume and target job text');
    setLoading(true);
    try {
      const data = await advancedAiApi.analyzeCareerGap(resumeText, targetJob);
      setGapResult(data);
      toast.success('Gap analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze career gap.');
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewQuestions = async () => {
    if (!interviewText.trim()) return toast.error('Please enter resume text');
    setLoading(true);
    try {
      const data = await advancedAiApi.generateInterviewQuestions(interviewText);
      setInterviewResult(data);
      toast.success('Questions generated!');
    } catch (error) {
      toast.error('Failed to generate questions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-bg min-h-screen text-foreground pb-32">
      <Navbar />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <h1 className="text-4xl font-bold mb-4 text-glow text-center">Advanced AI Features</h1>
        <p className="text-muted text-center mb-8 max-w-2xl mx-auto">
          Test out the newly integrated ML models and advanced AI modules to see JobSense AI's full capabilities in action.
        </p>

        {/* Tabs */}
        <div className="flex justify-center space-x-2 mb-8 flex-wrap gap-y-2">
          {[
            { id: 'skills', label: 'Skill Extractor' },
            { id: 'rewrite', label: 'Resume Rewriter' },
            { id: 'gap', label: 'Career Gap Analyzer' },
            { id: 'interview', label: 'Interview Prep' },
          ].map((tab) => (
             <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'glass-strong text-foreground border border-primary/50'
                  : 'glass text-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          
          {/* SKILLS EXTRACTOR */}
          {activeTab === 'skills' && (
            <div className="premium-card spotlight-card p-8 rounded-3xl">
              <h2 className="text-2xl font-semibold mb-4">Semantic Skill Extraction</h2>
              <textarea
                value={skillText}
                onChange={(e) => setSkillText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full h-40 px-4 py-3 glass rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-4"
              />
              <button
                onClick={handleExtractSkills}
                disabled={loading}
                className="btn-primary w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                {loading ? 'Extracting...' : 'Extract Semantic Skills'}
              </button>

              {skillResult && (
                <div className="mt-8 p-6 glass rounded-2xl border border-primary/20 bg-primary/5">
                  <h3 className="text-lg font-bold mb-4 text-primary">Extracted Skills:</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {skillResult.skills_detected?.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-primary/20 text-primary font-medium text-sm rounded-full">
                        {skill} (Conf: {(skillResult.confidence_scores?.[skill] * 100)?.toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RESUME REWRITER */}
          {activeTab === 'rewrite' && (
            <div className="premium-card spotlight-card p-8 rounded-3xl">
              <h2 className="text-2xl font-semibold mb-4">AI Bullet Rewriter</h2>
              <div className="space-y-4 mb-4">
                {bullets.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={b}
                      onChange={(e) => {
                        const newBullets = [...bullets];
                        newBullets[i] = e.target.value;
                        setBullets(newBullets);
                      }}
                      placeholder="e.g., Worked on website development"
                      className="w-full px-4 py-3 glass rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    {i === bullets.length - 1 && (
                      <button onClick={() => setBullets([...bullets, ''])} className="px-4 glass rounded-xl text-primary font-bold">+</button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleRewrite}
                disabled={loading}
                className="btn-primary w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                {loading ? 'Rewriting...' : 'Rewrite Bullets'}
              </button>

              {rewriteResult && (
                <div className="mt-8 p-6 glass rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                  <h3 className="text-lg font-bold mb-4 text-emerald-400">Improved Bullets:</h3>
                  <ul className="space-y-4">
                    {rewriteResult.improved_bullets?.map((bullet: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-emerald-400 mt-1">✨</span>
                        <span className="text-foreground/90">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <h4 className="mt-6 mb-2 font-semibold text-muted">Suggested Action Verbs:</h4>
                  <div className="flex flex-wrap gap-2">
                    {rewriteResult.suggested_action_verbs?.map((verb: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white/10 text-muted-foreground text-sm rounded-full border border-white/10">{verb}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CAREER GAP ANALYZER */}
          {activeTab === 'gap' && (
             <div className="premium-card spotlight-card p-8 rounded-3xl">
              <h2 className="text-2xl font-semibold mb-4">Career Gap Analyzer</h2>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Current Resume or Skills..."
                className="w-full h-32 px-4 py-3 glass rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-4"
              />
               <textarea
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder="Target Job Description or Role Details..."
                className="w-full h-32 px-4 py-3 glass rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-4"
              />
              <button
                onClick={handleGapAnalysis}
                disabled={loading}
                className="btn-primary w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Analyze Gaps'}
              </button>

               {gapResult && (
                <div className="mt-8 space-y-6">
                  <div className="p-6 glass rounded-2xl border border-rose-500/20 bg-rose-500/5">
                    <h3 className="text-lg font-bold mb-4 text-rose-400">Missing Critical Skills:</h3>
                    <div className="flex flex-wrap gap-2">
                      {gapResult.missing_skills?.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-rose-500/20 text-rose-300 text-sm font-medium rounded-full">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 glass rounded-2xl border border-blue-500/20 bg-blue-500/5">
                    <h3 className="text-lg font-bold mb-4 text-blue-400">Learning Roadmap (Estimated: {gapResult.estimated_learning_time}):</h3>
                    <ul className="space-y-4">
                      {gapResult.learning_roadmap?.map((step: string, i: number) => (
                        <li key={i} className="flex gap-3 text-foreground/90">
                          <span className="font-bold text-blue-400">{i + 1}.</span> {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INTERVIEW GENERATOR */}
          {activeTab === 'interview' && (
             <div className="premium-card spotlight-card p-8 rounded-3xl">
              <h2 className="text-2xl font-semibold mb-4">Interview Question Generator</h2>
               <textarea
                value={interviewText}
                onChange={(e) => setInterviewText(e.target.value)}
                placeholder="Paste Resume Text to generate custom questions..."
                className="w-full h-40 px-4 py-3 glass rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-4"
              />
              <button
                onClick={handleInterviewQuestions}
                disabled={loading}
                className="btn-primary w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Questions'}
              </button>

               {interviewResult && (
                <div className="mt-8 space-y-6">
                   <div className="p-6 glass rounded-2xl border border-indigo-500/20 bg-indigo-500/5">
                    <h3 className="text-lg font-bold mb-4 text-indigo-400">Technical Questions:</h3>
                     <ul className="space-y-3 list-disc pl-5">
                      {interviewResult.technical_questions?.map((q: string, i: number) => (
                        <li key={i} className="text-foreground/90">{q}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 glass rounded-2xl border border-purple-500/20 bg-purple-500/5">
                    <h3 className="text-lg font-bold mb-4 text-purple-400">Behavioral Questions:</h3>
                     <ul className="space-y-3 list-disc pl-5">
                      {interviewResult.behavioral_questions?.map((q: string, i: number) => (
                        <li key={i} className="text-foreground/90">{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
