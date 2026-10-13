import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  Clock, 
  MapPin, 
  Check, 
  ListTodo, 
  RefreshCw, 
  Terminal, 
  AlertCircle, 
  FileCode, 
  ShieldCheck, 
  Zap, 
  UploadCloud, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Link as LinkIcon,
  HelpCircle,
  Info
} from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { api } from '../lib/api';
import { AIParseResult, AIStatusResponse, EventCategory } from '../types';
import { sampleAnnouncementsForAI, sampleFlyersForAI } from '../data/mockData';

export const AIImporter: React.FC = () => {
  const { addNewEvent, addTask, showToast, setActivePage } = useEvents();

  // AI Provider Status from backend
  const [aiStatus, setAiStatus] = useState<AIStatusResponse | null>(null);

  // Mode: Upload flyer image or paste text
  const [inputMode, setInputMode] = useState<'image' | 'text'>('image');

  // Text announcement state
  const [rawText, setRawText] = useState('');

  // Image upload state
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [imageSize, setImageSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Analysis & extraction state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<AIParseResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Editable fields after extraction
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<EventCategory>('Hackathon');
  const [editOrganizer, setEditOrganizer] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editRegistrationDeadline, setEditRegistrationDeadline] = useState('');
  const [editRegistrationLink, setEditRegistrationLink] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Fetch AI provider status on mount
  useEffect(() => {
    let mounted = true;
    api.ai.getStatus()
      .then((status) => {
        if (mounted) setAiStatus(status);
      })
      .catch((err) => {
        console.warn('Failed to fetch AI status:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Process selected image file with strict size and format validation
  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, WEBP, GIF)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File exceeds 10MB limit. Please upload an image under 10MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviewUrl(e.target?.result as string);
      setImageName(file.name);
      setImageSize(`${(file.size / 1024).toFixed(1)} KB`);
      setExtractedData(null);
      setExtractionError(null);
      setIsSaved(false);
      showToast(`Loaded "${file.name}" ready for extraction`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const loadSampleFlyer = (sample: typeof sampleFlyersForAI[0]) => {
    setImagePreviewUrl(sample.imageUrl);
    setImageName(sample.label);
    setImageSize('1.2 MB');
    setExtractedData(null);
    setExtractionError(null);
    setIsSaved(false);
    showToast(`Loaded sample poster: ${sample.label}`, 'info');
  };

  const clearImage = () => {
    setImagePreviewUrl(null);
    setImageName('');
    setImageSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setExtractedData(null);
    setExtractionError(null);
  };

  const loadTextSample = (sampleText: string) => {
    setRawText(sampleText);
    setExtractedData(null);
    setExtractionError(null);
    setIsSaved(false);
  };

  const handleExtract = async () => {
    if (inputMode === 'image' && !imagePreviewUrl) {
      showToast('Please upload a poster or select a sample flyer', 'info');
      return;
    }
    if (inputMode === 'text' && !rawText.trim()) {
      showToast('Please paste announcement text or select a sample', 'info');
      return;
    }

    try {
      setIsAnalyzing(true);
      setExtractionError(null);
      setIsSaved(false);
      setAnalysisStep(1);

      const timer1 = setTimeout(() => setAnalysisStep(2), 350);
      const timer2 = setTimeout(() => setAnalysisStep(3), 700);

      const result = inputMode === 'image'
        ? await api.ai.parseImage(imagePreviewUrl!, imageName)
        : await api.ai.parseAnnouncement(rawText);

      clearTimeout(timer1);
      clearTimeout(timer2);

      setExtractedData(result);
      setEditTitle(result.title || '');
      setEditCategory((result.category as EventCategory) || 'Workshop');
      setEditOrganizer(result.organizer || '');
      setEditStartDate(result.startDate || '');
      setEditStartTime(result.startTime || '');
      setEditEndDate(result.endDate || result.startDate || '');
      setEditEndTime(result.endTime || '');
      setEditVenue(result.venue || '');
      setEditRoom(result.room || '');
      setEditRegistrationDeadline(result.registrationDeadline || '');
      setEditRegistrationLink(result.registrationLink || '');
      setEditDescription(result.description || '');

      if (result.isAiPowered) {
        showToast(`AI extracted event details using ${result.provider?.toUpperCase()}!`, 'success');
      } else {
        showToast('Extracted with rule-based fallback. Please review missing fields.', 'info');
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Failed to extract event details. Please try again.';
      setExtractionError(msg);
      showToast(msg, 'error');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  const handleSaveToEvents = async () => {
    if (!extractedData) return;

    if (!editTitle.trim()) {
      showToast('Event title is required.', 'error');
      return;
    }
    if (!editStartDate) {
      showToast('Start date is required.', 'error');
      return;
    }
    if (!editVenue.trim()) {
      showToast('Venue is required.', 'error');
      return;
    }

    try {
      const banner = extractedData.bannerImage || imagePreviewUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000';

      const created = await addNewEvent({
        title: editTitle.trim(),
        category: editCategory,
        organizer: editOrganizer.trim() || 'Campus Organization',
        startDate: editStartDate,
        startTime: editStartTime || '09:00 AM',
        endDate: editEndDate || editStartDate,
        endTime: editEndTime || '05:00 PM',
        venue: editVenue.trim(),
        room: editRoom.trim() || undefined,
        shortDescription: editDescription.slice(0, 140) || editTitle.trim(),
        fullDescription: editDescription || editTitle.trim(),
        bannerImage: banner,
        registrationStatus: 'registered',
        registrationDeadline: editRegistrationDeadline || editStartDate,
        registrationFee: extractedData.registrationFee || 'Free',
        attendeesCount: 1,
        capacity: 150,
        tags: extractedData.tags && extractedData.tags.length > 0 ? extractedData.tags : [editCategory],
        checklistTasks: extractedData.suggestedTasks,
        externalUrl: editRegistrationLink.trim() || undefined,
      });

      // Populate suggested prep tasks in database
      if (extractedData.suggestedTasks && extractedData.suggestedTasks.length > 0) {
        for (const tskStr of extractedData.suggestedTasks) {
          await addTask({
            eventId: created.id,
            eventTitle: created.title,
            title: tskStr,
            dueDate: created.startDate,
            isCompleted: false,
            priority: 'medium',
            category: 'prep',
          });
        }
      }

      setIsSaved(true);
      showToast(`Added "${created.title}" to your campus journey!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save event to database.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header with Provider Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#F3F0E8] tracking-tight">
            AI Event Importer
          </h1>
          <p className="text-xs text-[#A5A89F] mt-1 max-w-2xl leading-relaxed">
            Extract event titles, dates, locations, schedules, and preparation checklists from posters or text announcements.
          </p>
        </div>

        {/* AI Provider Status Badge */}
        <div className="flex items-center gap-2">
          {aiStatus?.configured ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#22251F] border border-[#C6FF3D]/40 text-[#C6FF3D] text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-pulse" />
              <span>AI Provider: {aiStatus.provider.toUpperCase()}</span>
              {aiStatus.model && <span className="text-[10px] text-[#A5A89F] font-mono">({aiStatus.model})</span>}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A1D19] border border-[#353830] text-[#A5A89F] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#777C72]" />
              <span>AI Status: Manual / Unconfigured Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Unconfigured Provider Helper Notice */}
      {aiStatus && !aiStatus.configured && (
        <div className="p-4 rounded-2xl bg-[#1A1D19] border border-[#353830] flex items-start gap-3 text-xs">
          <Info className="w-4 h-4 text-[#A5A89F] flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-[#A5A89F]">
            <p className="font-semibold text-[#F3F0E8]">
              Automated AI extraction requires an API key
            </p>
            <p className="leading-relaxed">
              To enable Google Gemini or OpenAI vision extraction, add <code className="bg-[#111311] px-1.5 py-0.5 rounded text-[#C6FF3D] font-mono">GEMINI_API_KEY</code> or <code className="bg-[#111311] px-1.5 py-0.5 rounded text-[#C6FF3D] font-mono">OPENAI_API_KEY</code> to your <code className="text-[#F3F0E8]">backend/.env</code> file and restart the server. In the meantime, you can test with sample templates or review and correct extracted fields manually.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Input on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Card: Input Mode & Upload / Text Box */}
        <div className="bg-[#151713] rounded-3xl p-5 sm:p-6 border border-[#353830] shadow-card space-y-5 relative overflow-hidden">
          
          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-[#1A1D19] rounded-2xl border border-[#353830]">
            <button
              type="button"
              onClick={() => {
                setInputMode('image');
                setExtractionError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                inputMode === 'image'
                  ? 'bg-[#C6FF3D] text-[#111311] shadow-card'
                  : 'text-[#A5A89F] hover:text-[#F3F0E8]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Upload Flyer / Image</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInputMode('text');
                setExtractionError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                inputMode === 'text'
                  ? 'bg-[#C6FF3D] text-[#111311] shadow-card'
                  : 'text-[#A5A89F] hover:text-[#F3F0E8]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Text Announcement</span>
            </button>
          </div>

          {/* ============================================================== */}
          {/* TAB 1: IMAGE UPLOAD MODE */}
          {/* ============================================================== */}
          {inputMode === 'image' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              {!imagePreviewUrl ? (
                /* Drag & Drop Zone */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#C6FF3D] bg-[#22251F]'
                      : 'border-[#353830] hover:border-[#C6FF3D] bg-[#151713] hover:bg-[#22251F]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#22251F] border border-[#353830] flex items-center justify-center mx-auto text-[#C6FF3D] mb-3">
                    <UploadCloud className="w-6 h-6 stroke-[2]" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#F3F0E8]">
                    Drop event poster or flyer here
                  </p>
                  <p className="text-xs text-[#777C72] mt-1">
                    or click to browse from device (PNG, JPG, WEBP, GIF up to 10MB)
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#22251F] border border-[#353830] text-[11px] text-[#A5A89F]">
                    <Sparkles className="w-3 h-3 text-[#C6FF3D]" />
                    <span>Scans title, date, location & schedule from poster</span>
                  </div>
                </div>
              ) : (
                /* Loaded Image Preview Card */
                <div className="relative rounded-2xl border border-[#353830] bg-[#1A1D19] overflow-hidden">
                  <div className="relative h-56 w-full bg-[#111311] overflow-hidden flex items-center justify-center group">
                    <img
                      src={imagePreviewUrl}
                      alt={imageName || 'Event flyer'}
                      className="w-full h-full object-cover"
                    />
                    
                    {isAnalyzing && (
                      <div className="animate-scanline z-20" />
                    )}

                    <div className="absolute inset-0 bg-[#111311]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-[#151713] text-[#F3F0E8] border border-[#353830] text-xs font-medium hover:border-[#C6FF3D] transition-colors"
                      >
                        Replace Image
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#111311]/80 hover:bg-[#111311] text-[#F3F0E8] border border-[#353830] transition-colors z-10"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3.5 flex items-center justify-between border-t border-[#353830]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#22251F] border border-[#353830] flex items-center justify-center text-[#C6FF3D] flex-shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#F3F0E8] truncate max-w-[220px]">
                          {imageName}
                        </p>
                        <p className="text-[11px] text-[#777C72]">
                          {imageSize || 'Ready for extraction'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs bg-[#22251F] hover:bg-[#151713] text-[#F3F0E8] border border-[#353830] transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              {/* Sample Posters Quick Select */}
              <div>
                <span className="text-xs text-[#777C72] font-medium block mb-2">
                  Or test with a sample poster:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleFlyersForAI.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => loadSampleFlyer(sample)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-[#1A1D19] text-[#A5A89F] hover:text-[#C6FF3D] hover:bg-[#22251F] border border-[#353830] transition-all text-left flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-[#C6FF3D]" />
                      <span>{sample.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: TEXT ANNOUNCEMENT MODE */}
          {/* ============================================================== */}
          {inputMode === 'text' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#A5A89F] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#C6FF3D]" />
                  Event Announcement Text
                </label>
                <span className="text-xs text-[#777C72]">
                  {rawText.length} characters
                </span>
              </div>

              <div className="relative">
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste campus email, Discord announcement, or newsletter text here..."
                  className="w-full p-4 bg-[#1A1D19] border border-[#353830] text-[#F3F0E8] placeholder:text-[#777C72] rounded-2xl text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-[#C6FF3D] focus:ring-1 focus:ring-[#C6FF3D] transition-all font-sans"
                />
              </div>

              <div>
                <span className="text-xs text-[#777C72] font-medium block mb-2">
                  Try a sample announcement:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleAnnouncementsForAI.map((sample: { label: string; text: string }, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => loadTextSample(sample.text)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-[#1A1D19] text-[#A5A89F] hover:text-[#C6FF3D] hover:bg-[#22251F] border border-[#353830] transition-all text-left"
                    >
                      ⚡ {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleExtract}
              disabled={isAnalyzing || (inputMode === 'image' ? !imagePreviewUrl : !rawText.trim())}
              className="w-full py-3 px-4 rounded-xl bg-[#C6FF3D] hover:bg-[#C6FF3D]/90 active:scale-[0.99] disabled:opacity-40 text-[#111311] text-xs font-semibold transition-all shadow-card flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    {inputMode === 'image' 
                      ? 'Scanning poster details...' 
                      : 'Extracting event details...'}
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-[#111311]" />
                  <span>
                    {inputMode === 'image' 
                      ? 'Extract from Poster' 
                      : 'Extract Event Details'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT CARD: EXTRACTED DETAILS & EDIT FORM */}
        {/* ============================================================== */}
        <div className="bg-[#151713] rounded-3xl p-5 sm:p-6 border border-[#353830] shadow-card space-y-5 relative overflow-hidden">
          
          {isAnalyzing && <div className="animate-scanline z-20" />}

          <div className="flex items-center justify-between pb-3 border-b border-[#353830]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C6FF3D]" />
              <h3 className="font-heading font-semibold text-xs text-[#F3F0E8]">
                Extracted Event Details
              </h3>
            </div>
            {extractedData && (
              <div className="flex items-center gap-2">
                {extractedData.isAiPowered ? (
                  <span className="text-[10px] text-[#C6FF3D] bg-[#22251F] px-2 py-0.5 rounded border border-[#C6FF3D]/40 font-mono">
                    AI: {extractedData.provider?.toUpperCase()}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#A5A89F] bg-[#1A1D19] px-2 py-0.5 rounded border border-[#353830] font-mono">
                    Manual Review Mode
                  </span>
                )}
                {extractedData.confidenceScore != null && extractedData.confidenceScore > 0 && (
                  <span className="text-xs text-[#C6FF3D] bg-[#22251F] px-2 py-0.5 rounded border border-[#353830]">
                    Confidence: {Math.round(extractedData.confidenceScore * 100)}%
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Empty Prompt State */}
          {!extractedData && !isAnalyzing && !extractionError && (
            <div className="py-16 text-center text-[#777C72] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#1A1D19] border border-[#353830] flex items-center justify-center mx-auto text-[#777C72]">
                <FileCode className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-xs font-semibold text-[#F3F0E8]">No event extracted yet</p>
              <p className="text-xs max-w-xs mx-auto text-[#777C72] leading-relaxed">
                {inputMode === 'image' 
                  ? 'Upload an event flyer on the left and click "Extract from Poster".'
                  : 'Paste an announcement on the left and click "Extract Event Details".'}
              </p>
            </div>
          )}

          {/* Loading Animation */}
          {isAnalyzing && (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#22251F] border border-[#353830] flex items-center justify-center mx-auto text-[#C6FF3D]">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-[#C6FF3D]">
                  {inputMode === 'image' ? (
                    <>
                      {analysisStep === 1 && 'Scanning flyer content...'}
                      {analysisStep === 2 && 'Detecting dates, times, venue & organizers...'}
                      {analysisStep === 3 && 'Generating preparation checklist...'}
                      {analysisStep === 0 && 'Processing image...'}
                    </>
                  ) : (
                    <>
                      {analysisStep === 1 && 'Extracting event details...'}
                      {analysisStep === 2 && 'Finding date and location...'}
                      {analysisStep === 3 && 'Validating schedule & checklist...'}
                      {analysisStep === 0 && 'Processing announcement...'}
                    </>
                  )}
                </h4>
                <p className="text-xs text-[#777C72]">Validating and formatting fields...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {extractionError && !isAnalyzing && (
            <div className="py-12 text-center space-y-3 bg-[#1A1D19] p-6 rounded-2xl border border-[#FF7138]">
              <AlertCircle className="w-8 h-8 text-[#FF7138] mx-auto" />
              <h4 className="text-xs font-semibold text-[#FF7138]">Extraction Failed</h4>
              <p className="text-xs text-[#A5A89F] max-w-sm mx-auto leading-relaxed">{extractionError}</p>
              <button
                type="button"
                onClick={handleExtract}
                className="px-4 py-2 rounded-xl bg-[#22251F] text-[#F3F0E8] hover:text-[#C6FF3D] border border-[#353830] text-xs font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Extracted Form & Preview */}
          {extractedData && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Unconfigured Provider Notice on Result */}
              {extractedData.errorMessage && (
                <div className="p-3 rounded-xl bg-[#1A1D19] border border-[#E5A93C]/40 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-[#E5A93C]">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Review Needed</span>
                  </div>
                  <p className="text-[#A5A89F] leading-relaxed text-[11px]">
                    {extractedData.errorMessage}
                  </p>
                </div>
              )}

              {/* Uncertain / Missing Fields Badges */}
              {extractedData.missingFields && extractedData.missingFields.length > 0 && (
                <div className="p-3 rounded-xl bg-[#1A1D19] border border-[#353830] space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#E5A93C] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Fields requiring manual confirmation:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {extractedData.missingFields.map((field) => (
                      <span key={field} className="text-[10px] px-2 py-0.5 rounded bg-[#22251F] text-[#A5A89F] border border-[#353830]">
                        {field.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Title */}
              <div>
                <label className="block text-xs font-medium text-[#A5A89F] mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. HackNova 2026 Hackathon"
                  className="w-full px-3.5 py-2 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs sm:text-sm font-semibold font-heading text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              {/* Category & Host */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A5A89F] mb-1">
                    Category *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Tech Talk">Tech Talk</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Career">Career</option>
                    <option value="Sports">Sports</option>
                    <option value="Academic">Academic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A5A89F] mb-1">
                    Organizer
                  </label>
                  <input
                    type="text"
                    value={editOrganizer}
                    onChange={(e) => setEditOrganizer(e.target.value)}
                    placeholder="e.g. Campus ACM Club"
                    className="w-full px-3 py-2 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A5A89F] mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A5A89F] mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full px-3 py-2 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A5A89F] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A5A89F] mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    placeholder="e.g. 05:00 PM"
                    className="w-full px-3 py-2 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>
              </div>

              {/* Venue & Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A5A89F] mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    placeholder="e.g. Student Innovation Center"
                    className="w-full px-3 py-2 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A5A89F] mb-1">
                    Room / Hall
                  </label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    placeholder="e.g. Auditorium Hall B"
                    className="w-full px-3 py-2 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>
              </div>

              {/* Registration Deadline & Registration Link */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A5A89F] mb-1">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={editRegistrationDeadline}
                    onChange={(e) => setEditRegistrationDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A5A89F] mb-1">
                    Registration Link
                  </label>
                  <input
                    type="url"
                    value={editRegistrationLink}
                    onChange={(e) => setEditRegistrationLink(e.target.value)}
                    placeholder="https://campus.edu/register"
                    className="w-full px-3 py-2 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-[#A5A89F] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Event overview, prerequisites, or prize info..."
                  className="w-full px-3 py-2 bg-[#1A1D19] border border-[#353830] rounded-xl text-xs text-[#F3F0E8] focus:outline-none focus:border-[#C6FF3D]"
                />
              </div>

              {/* Suggested Tasks */}
              {extractedData.suggestedTasks && extractedData.suggestedTasks.length > 0 && (
                <div className="bg-[#1A1D19] p-3.5 rounded-2xl border border-[#353830] space-y-2">
                  <span className="text-xs font-semibold text-[#C6FF3D] flex items-center gap-1.5">
                    <ListTodo className="w-3.5 h-3.5" />
                    Preparation Tasks to be Added
                  </span>
                  <div className="space-y-1.5">
                    {extractedData.suggestedTasks.map((tsk: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#F3F0E8] bg-[#151713] p-2 rounded-lg border border-[#292D27]">
                        <Check className="w-3.5 h-3.5 text-[#C6FF3D] flex-shrink-0" />
                        <span className="truncate">{tsk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Actions */}
              <div className="pt-2 flex items-center gap-3">
                {!isSaved ? (
                  <button
                    onClick={handleSaveToEvents}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#C6FF3D] hover:bg-[#C6FF3D]/90 text-[#111311] text-xs font-semibold transition-all shadow-card flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>Confirm & Save to My Events</span>
                  </button>
                ) : (
                  <div className="flex-1 flex items-center gap-2">
                    <span className="flex-1 py-2.5 px-3 rounded-xl bg-[#22251F] text-[#C6FF3D] border border-[#353830] text-xs text-center flex items-center justify-center gap-1.5 font-semibold">
                      <Check className="w-4 h-4 text-[#C6FF3D]" />
                      Event Persisted to Database
                    </span>
                    <button
                      onClick={() => setActivePage('my-events')}
                      className="py-2.5 px-4 rounded-xl bg-[#1A1D19] hover:bg-[#22251F] text-[#F3F0E8] border border-[#353830] text-xs font-medium transition-colors"
                    >
                      View in My Events →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
