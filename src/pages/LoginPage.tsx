import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  UserCheck, 
  Calendar, 
  ShieldAlert, 
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { MyCampusLogo } from '../components/common/MyCampusLogo';
import { useAuth } from '../context/AuthContext';

interface DemoProfile {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  badge: string;
  year: string;
  department: string;
  description: string;
  highlights: string[];
}

const DEMO_PROFILES: DemoProfile[] = [
  {
    id: 'demo1',
    email: 'demo1@mycampus.demo',
    password: 'demo123',
    name: 'Jordan Lee',
    role: 'Campus Explorer',
    badge: 'Demo Account 1',
    year: '2nd Year (Sophomore)',
    department: 'Computer Science & Interactive Media',
    description: 'Active student exploring national collegiate hackathons, faculty keynotes, and student organization mixers.',
    highlights: ['Upcoming HackNova 2026', 'Personal Timeline Sync', 'Pre-Event Checklist Tasks'],
  },
  {
    id: 'demo2',
    email: 'demo2@mycampus.demo',
    password: 'demo123',
    name: 'Maya Patel',
    role: 'Event Organizer',
    badge: 'Demo Account 2',
    year: '3rd Year (Junior • ACM Vice Chair)',
    department: 'Software Systems & Management',
    description: 'Student leader coordinating collegiate DevSprints, auditorium AV logistics, catering contracts, and volunteer schedules.',
    highlights: ['Sample Organized Events', 'AV & Catering Checklists', 'Volunteer Roster Management'],
  },
  {
    id: 'demo3',
    email: 'demo3@mycampus.demo',
    password: 'demo123',
    name: 'Devon Brooks',
    role: 'AI Feature Tester',
    badge: 'Demo Account 3',
    year: '4th Year (Senior)',
    department: 'Artificial Intelligence & Data Systems',
    description: 'Focused on testing multimodal poster OCR, announcement text parsing, confidence scoring, and zero-hallucination validation.',
    highlights: ['Gemini Multimodal Vision OCR', 'Missing Field Honest Alerts', 'Automated Agenda Extraction'],
  },
];

export const LoginPage: React.FC = () => {
  const { login, navigate } = useAuth();
  const [email, setEmail] = useState<string>('demo1@mycampus.demo');
  const [password, setPassword] = useState<string>('demo123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('demo1');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autofillToast, setAutofillToast] = useState<string | null>(null);

  const handleSelectProfile = (profile: DemoProfile) => {
    setSelectedProfileId(profile.id);
    setEmail(profile.email);
    setPassword(profile.password);
    setErrorMessage(null);
    setAutofillToast(`Autofilled credentials for ${profile.role}`);
    setTimeout(() => setAutofillToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both demo email and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login(email.trim(), password.trim());
      // Successful login navigates to /dashboard via AuthContext
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid demo credentials. Please choose one of the three demo accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111311] text-[#F3F0E8] font-sans selection:bg-[#C6FF3D] selection:text-[#111311] flex flex-col justify-between bg-tech-grid">
      {/* Top Header */}
      <header className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex items-center justify-between">
        <div 
          onClick={() => navigate('/')}
          className="flex items-center cursor-pointer group"
        >
          <MyCampusLogo size="xs" showSubtitle={true} subtitle="Judge Evaluation" />
        </div>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#A5A89F] hover:text-[#F3F0E8] hover:bg-[#1A1D19] border border-transparent hover:border-[#353830] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        {/* Visible Demo Environment Notice */}
        <div className="mb-8 p-3 sm:p-4 rounded-2xl bg-[#1A1D19] border border-[#353830] flex items-center justify-between gap-3 shadow-card">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C6FF3D] animate-ping" />
            <div>
              <span className="text-xs font-bold text-[#F3F0E8]">
                Judge Evaluation Mode Active
              </span>
              <p className="text-[11px] text-[#A5A89F]">
                This is a demonstration environment. Select a demo card below to test isolated user perspectives.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#22251F] text-[#C6FF3D] border border-[#353830] whitespace-nowrap hidden sm:inline-block">
            Shared Password: demo123
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Selectable Demo Profile Cards (Autofill UX) */}
          <div className="lg:col-span-7 space-y-3.5">
            <div>
              <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-[#C6FF3D] flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                Select Demo Account
              </h2>
              <p className="text-xs text-[#777C72] mt-0.5">
                Click any profile card below to autofill credentials into the form. (Does not auto-submit).
              </p>
            </div>

            <div className="space-y-3">
              {DEMO_PROFILES.map((profile) => {
                const isSelected = selectedProfileId === profile.id;

                return (
                  <div
                    key={profile.id}
                    onClick={() => handleSelectProfile(profile)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#1A1D19] border-[#C6FF3D] shadow-[0_0_15px_rgba(198,255,61,0.12)]'
                        : 'bg-[#151713] border-[#353830] hover:border-[#777C72] hover:bg-[#1A1D19]/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            isSelected
                              ? 'bg-[#C6FF3D] text-[#111311] font-bold'
                              : 'bg-[#22251F] text-[#A5A89F] border border-[#353830]'
                          }`}>
                            {profile.badge}
                          </span>
                          <span className="text-xs font-bold text-[#F3F0E8]">
                            {profile.role}
                          </span>
                        </div>

                        <div className="text-xs text-[#A5A89F] font-medium">
                          {profile.name} • <span className="text-[#777C72]">{profile.year}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectProfile(profile);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#C6FF3D] text-[#111311]'
                            : 'bg-[#22251F] text-[#C6FF3D] border border-[#353830] hover:bg-[#C6FF3D] hover:text-[#111311]'
                        }`}
                      >
                        {isSelected ? 'Selected ✓' : 'Autofill'}
                      </button>
                    </div>

                    <p className="text-xs text-[#777C72] mt-2 leading-relaxed">
                      {profile.description}
                    </p>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {profile.highlights.map((h) => (
                        <span
                          key={h}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111311] text-[#A5A89F] border border-[#22251F]"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Sign In Form */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-2xl bg-[#151713] border border-[#353830] shadow-modal">
              <div className="mb-5">
                <h3 className="text-lg font-bold font-heading text-[#F3F0E8]">
                  Sign In to Demo
                </h3>
                <p className="text-xs text-[#777C72] mt-1">
                  Authenticate with the backend demo endpoint using signing secrets.
                </p>
              </div>

              {/* Autofill Feedback Toast */}
              {autofillToast && (
                <div className="mb-4 p-2.5 rounded-xl bg-[#22251F] border border-[#C6FF3D]/40 text-xs text-[#C6FF3D] flex items-center gap-2 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{autofillToast}</span>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-[#A5A89F] mb-1.5">
                    Demo Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#777C72] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. demo1@mycampus.demo"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#1A1D19] text-[#F3F0E8] border border-[#353830] rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-[#C6FF3D] focus:ring-1 focus:ring-[#C6FF3D] transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#A5A89F]">
                      Demo Password
                    </label>
                    <span className="text-[11px] font-mono text-[#777C72]">
                      (demo123)
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#777C72] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#1A1D19] text-[#F3F0E8] border border-[#353830] rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-[#C6FF3D] focus:ring-1 focus:ring-[#C6FF3D] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-[#777C72] hover:text-[#F3F0E8] absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-[#C6FF3D] text-[#111311] font-bold text-xs sm:text-sm hover:bg-[#C6FF3D]/90 active:scale-[0.98] transition-all shadow-card flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-[#111311] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Demo</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-[#22251F] text-[11px] text-[#777C72] text-center">
                Strict isolated HMAC-SHA256 session token issued for judging.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-xs text-[#777C72] border-t border-[#22251F]">
        MyCampus — Your Event Journey • Demo Authentication System
      </footer>
    </div>
  );
};
