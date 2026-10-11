"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Drawer,
  Typography,
  Button,
  TextField,
  AppBar,
  Toolbar,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Switch,
  Divider,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Save,
  UploadFile,
  PictureAsPdf,
  MenuBook,
  Assignment,
  RateReview,
  Quiz,
  Casino,
  AutoStories,
  ViewColumn,
  EditNote,
  HistoryEdu,
  Timer,
} from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PdfDocument from './PdfDocument';
import { EuclidEngine } from './EuclidEngine';
import type { ClassicalGroup } from './EuclidEngine';
import { CURRICULUM_REGISTRY } from '../modules/CurriculumRegistry';
import type { CurriculumEntry, DifficultyLevel } from '../modules/CurriculumRegistry';
import { DocumentType, problemToQuestion } from '../core/types';
import type { OutputMode, MathProblem } from '@/lib/ProblemFactory';

const drawerWidth = 320;

// ── Map DocumentType → EuclidEngine OutputMode ───────────────────────────────

export function toOutputMode(docType: DocumentType): OutputMode {
  if (docType === 'guided-notes') return 'GuidedNote';
  if (docType === 'review') return 'Review';
  if (docType === 'test') return 'Test';
  if (docType === 'classical-notes') return 'Classical';
  // proof-fill-reasons / proof-elements / sat-practice generate the clean
  // student version; presentation is threaded separately (proofDocMode) or
  // handled by the card itself. proof-two-column shows the complete proof
  // (Review), so it renders differently from proof-fill-reasons (Test).
  if (docType === 'proof-two-column') return 'Review';
  if (docType === 'proof-fill-reasons') return 'Test';
  if (docType === 'proof-elements') return 'Test';
  if (docType === 'sat-practice') return 'Test';
  return 'Review'; // 'worksheet' → Review style (no step hints)
}

function modeWord(docType: DocumentType): string {
  if (docType === 'guided-notes') return 'Notes';
  if (docType === 'test') return 'Assessment';
  if (docType === 'review') return 'Review';
  if (docType === 'classical-notes') return 'Classical Notes';
  if (docType === 'proof-two-column') return 'Two-Column Proofs';
  if (docType === 'proof-fill-reasons') return 'Proof Practice';
  if (docType === 'proof-elements') return "Elements";
  if (docType === 'sat-practice') return 'SAT Practice';
  return 'Practice';
}

// ── Error boundary around the live preview ────────────────────────────────────

class PreviewErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Worksheet preview failed:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <Box
          sx={{
            width: '8.5in',
            maxWidth: '100%',
            p: 4,
            bgcolor: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: 2,
            color: '#7f1d1d',
            mb: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Preview failed to render
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {this.state.error.message || 'Something went wrong while building the preview.'}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

// ── Draft file shape ──────────────────────────────────────────────────────────

interface DraftFile {
  app: 'euclid-engine-worksheet';
  version: 1;
  savedAt: string;
  docType: DocumentType;
  title: string;
  topicIds: string[];
  seed: number;
  count: number;
  difficulty: DifficultyLevel;
  includeAnswerKey: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WorksheetGenerator() {
  const [docType, setDocType] = useState<DocumentType>('guided-notes');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(['trig-1-ratios']);

  const [customTitle, setCustomTitle] = useState('');
  const [seed, setSeed] = useState(42);
  const [count, setCount] = useState(3);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(2);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Defer setMounted so PDFDownloadLink only renders on the client
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // ── Topic groups (registry order) ──
  const topicGroups = useMemo(() => {
    const map = new Map<string, CurriculumEntry[]>();
    for (const entry of CURRICULUM_REGISTRY) {
      const arr = map.get(entry.topicTitle);
      if (arr) arr.push(entry);
      else map.set(entry.topicTitle, [entry]);
    }
    return [...map.entries()];
  }, []);

  const selectedModules = useMemo(
    () =>
      selectedTopicIds
        .map((id) => CURRICULUM_REGISTRY.find((t) => t.id === id))
        .filter((m): m is CurriculumEntry => !!m),
    [selectedTopicIds]
  );

  const toggleTopic = (id: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // ── Generation ──
  // Per-module problem sets (seed offset per topic so different topics don't
  // draw identical sequences). Kept per-module so Classical Notes mode can
  // chunk them back into per-entry groups for its section renderer.
  const moduleProblemSets = useMemo<MathProblem[][]>(() => {
    return selectedModules.map((mod, i) =>
      mod.generate(toOutputMode(docType), seed + i * 7919, { count, difficulty })
    );
  }, [selectedModules, docType, seed, count, difficulty]);

  const advancedProblems = useMemo<MathProblem[]>((
  ) => moduleProblemSets.flat(), [moduleProblemSets]);

  // Classical Notes groups: one definitions block + narration per entry.
  const classicalGroups = useMemo<ClassicalGroup[] | undefined>(() => {
    if (docType !== 'classical-notes') return undefined;
    let start = 0;
    return selectedModules.map((mod, i) => {
      const problems = moduleProblemSets[i] ?? [];
      const group: ClassicalGroup = {
        entryId: mod.id,
        title: mod.title,
        teks: mod.teks.split(' · ')[0],
        problems,
        startIndex: start,
      };
      start += problems.length;
      return group;
    });
  }, [docType, selectedModules, moduleProblemSets]);

  // Proof document flavor, threaded to EuclidEngine → ProofProblemCard.
  const proofDocMode = useMemo(
    () =>
      docType === 'proof-two-column' ||
      docType === 'proof-fill-reasons' ||
      docType === 'proof-elements'
        ? docType
        : undefined,
    [docType]
  );

  // Questions for the PDF (paired with problems inside PdfDocument)
  const questions = useMemo(() => {
    return advancedProblems.map((p, i) => problemToQuestion(p, i));
  }, [advancedProblems]);

  // ── Title & standards ──
  const defaultTitle = useMemo(() => {
    if (selectedModules.length === 0) return 'Geometry Practice';
    const word = modeWord(docType);
    if (selectedModules.length === 1) return `${selectedModules[0].title} — ${word}`;
    return `${selectedModules[0].title} + ${selectedModules.length - 1} more — ${word}`;
  }, [selectedModules, docType]);
  const title = customTitle || defaultTitle;

  const standards = useMemo(() => {
    const teks = [...new Set(selectedModules.map((m) => m.teks))];
    return teks.length > 0 ? teks.join(' · ') : 'Texas TEKS Geometry';
  }, [selectedModules]);

  // ── Draft save / load ──
  const saveDraft = () => {
    const draft: DraftFile = {
      app: 'euclid-engine-worksheet',
      version: 1,
      savedAt: new Date().toISOString(),
      docType,
      title: customTitle,
      topicIds: selectedTopicIds,
      seed,
      count,
      difficulty,
      includeAnswerKey,
    };
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `euclid-draft-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const loadDraftFile = (file: File) => {
    setDraftError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(String(reader.result)) as Partial<DraftFile>;
        if (d.app !== 'euclid-engine-worksheet') {
          throw new Error('That file is not a Euclid Engine draft.');
        }
        if (d.docType === 'worksheet' || d.docType === 'guided-notes' || d.docType === 'review' || d.docType === 'test' || d.docType === 'classical-notes' || d.docType === 'proof-two-column' || d.docType === 'proof-fill-reasons' || d.docType === 'proof-elements' || d.docType === 'sat-practice') {
          setDocType(d.docType);
        }
        if (typeof d.title === 'string') setCustomTitle(d.title);
        if (Array.isArray(d.topicIds)) {
          const valid = d.topicIds.filter(
            (id): id is string =>
              typeof id === 'string' &&
              CURRICULUM_REGISTRY.some((t) => t.id === id && !t.underConstruction)
          );
          setSelectedTopicIds(valid);
        }
        if (typeof d.seed === 'number' && Number.isFinite(d.seed)) setSeed(Math.floor(d.seed));
        if (typeof d.count === 'number' && Number.isFinite(d.count)) {
          setCount(Math.min(25, Math.max(1, Math.floor(d.count))));
        }
        if (d.difficulty === 1 || d.difficulty === 2 || d.difficulty === 3) {
          setDifficulty(d.difficulty);
        }
        if (typeof d.includeAnswerKey === 'boolean') setIncludeAnswerKey(d.includeAnswerKey);
      } catch (e) {
        setDraftError(e instanceof Error ? e.message : 'Could not read that draft file.');
      }
    };
    reader.onerror = () => setDraftError('Could not read that draft file.');
    reader.readAsText(file);
  };

  const randomizeSeed = () => setSeed(Math.floor(Math.random() * 100000));

  const errorBoundaryKey = `${docType}-${seed}-${count}-${difficulty}-${selectedTopicIds.join(',')}`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: '#121416',
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          color: 'var(--gold)',
          borderBottom: '1px solid var(--glass-border)',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <Box
              component="img"
              src="/logo_dark.png"
              alt="Euclid Engine Logo"
              className="logo-blend"
              sx={{ height: 40, width: 40 }}
            />
            <Typography
              variant="h6"
              noWrap
              className="scholarly-title"
              sx={{
                fontWeight: 700,
                color: 'var(--gold)',
                fontSize: '1.2rem'
              }}
            >
              Euclid Engine
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1, pt: '64px' }}>
        {/* ── Control Panel Drawer ── */}
        <Drawer
          variant="permanent"
          className="geometric-grid"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              pt: '80px',
              backgroundColor: 'var(--glass-bg)',
              backdropFilter: 'blur(16px)',
              borderRight: '1px solid var(--glass-border)',
            },
          }}
        >
          <Box sx={{ p: 3, overflowY: 'auto' }}>
            <Box mb={4}>
              <Typography variant="h6" fontWeight="bold" color="primary">
                Control Panel
              </Typography>
            </Box>

            {/* ── Document Mode ── */}
            <Box mb={4}>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: 'text.secondary',
                  fontWeight: 'bold',
                }}
                gutterBottom
              >
                Document Mode
              </Typography>
              <ToggleButtonGroup
                value={docType}
                exclusive
                onChange={(_, val) => val && setDocType(val as DocumentType)}
                fullWidth
                size="small"
                sx={{ mt: 1, mb: 2, flexWrap: 'wrap', gap: 0.5 }}
              >
                <Tooltip title="Fill-in-the-blank scaffolding">
                  <ToggleButton
                    value="guided-notes"
                    sx={{
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: 'primary.main',
                        bgcolor: 'rgba(102, 217, 204, 0.1)',
                      },
                    }}
                  >
                    <MenuBook fontSize="small" sx={{ mr: 0.5 }} /> Guided
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="High-density practice with answers shown">
                  <ToggleButton
                    value="review"
                    sx={{
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: 'primary.main',
                        bgcolor: 'rgba(102, 217, 204, 0.1)',
                      },
                    }}
                  >
                    <RateReview fontSize="small" sx={{ mr: 0.5 }} /> Review
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Formal assessment, no hints">
                  <ToggleButton
                    value="test"
                    sx={{
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: 'primary.main',
                        bgcolor: 'rgba(102, 217, 204, 0.1)',
                      },
                    }}
                  >
                    <Quiz fontSize="small" sx={{ mr: 0.5 }} /> Test
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Standard worksheet">
                  <ToggleButton
                    value="worksheet"
                    sx={{
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: 'primary.main',
                        bgcolor: 'rgba(102, 217, 204, 0.1)',
                      },
                    }}
                  >
                    <Assignment fontSize="small" sx={{ mr: 0.5 }} /> Sheet
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Structure given, reasoning yours — definitions printed in full, reasons blanked">
                  <ToggleButton
                    value="classical-notes"
                    sx={{
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: 'primary.main',
                        bgcolor: 'rgba(102, 217, 204, 0.1)',
                      },
                    }}
                  >
                    <AutoStories fontSize="small" sx={{ mr: 0.5 }} /> Classical
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Full two-column proofs">
                  <ToggleButton
                    value="proof-two-column"
                    sx={{
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: 'primary.main',
                        bgcolor: 'rgba(102, 217, 204, 0.1)',
                      },
                    }}
                  >
                    <ViewColumn fontSize="small" sx={{ mr: 0.5 }} /> Proofs
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Statements given, reasons blanked for the student">
                  <ToggleButton
                    value="proof-fill-reasons"
                    sx={{
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: 'primary.main',
                        bgcolor: 'rgba(102, 217, 204, 0.1)',
                      },
                    }}
                  >
                    <EditNote fontSize="small" sx={{ mr: 0.5 }} /> Fill Reasons
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Euclid's Elements exposition — enunciation to Q.E.D.">
                  <ToggleButton
                    value="proof-elements"
                    sx={{
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: 'primary.main',
                        bgcolor: 'rgba(102, 217, 204, 0.1)',
                      },
                    }}
                  >
                    <HistoryEdu fontSize="small" sx={{ mr: 0.5 }} /> Elements
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Timed SAT-style practice module">
                  <ToggleButton
                    value="sat-practice"
                    sx={{
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: 'primary.main',
                        bgcolor: 'rgba(102, 217, 204, 0.1)',
                      },
                    }}
                  >
                    <Timer fontSize="small" sx={{ mr: 0.5 }} /> SAT
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>

            {/* ── Curriculum Selection (multi-topic) ── */}
            <Box mb={4}>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: 'text.secondary',
                  fontWeight: 'bold',
                }}
                gutterBottom
              >
                Topics ({selectedTopicIds.length} selected)
              </Typography>

              <Box sx={{ mt: 1 }}>
                {topicGroups.map(([groupTitle, entries]) => (
                  <Box key={groupTitle} sx={{ mb: 1.5 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '0.7rem' }}
                    >
                      {groupTitle}
                    </Typography>
                    {entries.map((entry) => (
                      <FormControlLabel
                        key={entry.id}
                        control={
                          <Checkbox
                            size="small"
                            checked={selectedTopicIds.includes(entry.id)}
                            onChange={() => toggleTopic(entry.id)}
                            disabled={entry.underConstruction}
                            sx={{
                              color: 'rgba(255,255,255,0.4)',
                              '&.Mui-checked': { color: 'var(--gold)' },
                              py: 0.25,
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '0.8rem',
                                color: entry.underConstruction
                                  ? 'rgba(255,255,255,0.3)'
                                  : 'rgba(255,255,255,0.85)',
                                lineHeight: 1.25,
                              }}
                            >
                              {entry.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}
                            >
                              {entry.underConstruction ? 'Coming soon' : entry.teks}
                            </Typography>
                          </Box>
                        }
                        sx={{ ml: 0.5, mr: 0, alignItems: 'flex-start' }}
                        title={entry.underConstruction ? 'Not available yet' : entry.description}
                      />
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* ── Parameters ── */}
            <Box mb={4}>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: 'text.secondary',
                  fontWeight: 'bold',
                }}
                gutterBottom
              >
                Parameters
              </Typography>

              <Typography
                variant="caption"
                display="block"
                sx={{ mt: 1, mb: 0.5, color: 'text.secondary' }}
              >
                Document Title
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={title}
                onChange={(e) => setCustomTitle(e.target.value)}
                sx={{ mb: 2, backgroundColor: '#282a2c', borderRadius: 2 }}
              />

              <Typography
                variant="caption"
                display="block"
                sx={{ mb: 0.5, color: 'text.secondary' }}
              >
                Problems per topic
              </Typography>
              <TextField
                type="number"
                size="small"
                fullWidth
                value={count}
                inputProps={{ min: 1, max: 25 }}
                onChange={(e) => {
                  const v = Math.floor(Number(e.target.value));
                  if (Number.isFinite(v)) setCount(Math.min(25, Math.max(1, v)));
                }}
                sx={{ mb: 2, backgroundColor: '#282a2c', borderRadius: 2 }}
              />

              <Typography
                variant="caption"
                display="block"
                sx={{ mb: 0.5, color: 'text.secondary' }}
              >
                Difficulty
              </Typography>
              <ToggleButtonGroup
                value={difficulty}
                exclusive
                onChange={(_, val) => val && setDifficulty(val as DifficultyLevel)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              >
                <ToggleButton value={1} sx={{ color: 'text.secondary', '&.Mui-selected': { color: 'primary.main', bgcolor: 'rgba(102, 217, 204, 0.1)' } }}>
                  Easy
                </ToggleButton>
                <ToggleButton value={2} sx={{ color: 'text.secondary', '&.Mui-selected': { color: 'primary.main', bgcolor: 'rgba(102, 217, 204, 0.1)' } }}>
                  Medium
                </ToggleButton>
                <ToggleButton value={3} sx={{ color: 'text.secondary', '&.Mui-selected': { color: 'primary.main', bgcolor: 'rgba(102, 217, 204, 0.1)' } }}>
                  Hard
                </ToggleButton>
              </ToggleButtonGroup>

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={includeAnswerKey}
                    onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--gold)' } }}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Include answer key in PDF
                  </Typography>
                }
                sx={{ mb: 1 }}
              />

              <Typography
                variant="caption"
                display="block"
                sx={{ mb: 0.5, color: 'text.secondary' }}
              >
                Problem Set Seed (reproducibility)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  value={seed}
                  onChange={(e) => setSeed(Math.floor(Number(e.target.value)) || 0)}
                  sx={{ backgroundColor: '#282a2c', borderRadius: 2 }}
                />
                <Tooltip title="Generate a fresh set of problems">
                  <IconButton
                    size="small"
                    onClick={randomizeSeed}
                    sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#d9a720' } }}
                  >
                    <Casino fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', display: 'block', mb: 1 }}>
              {advancedProblems.length} problem{advancedProblems.length === 1 ? '' : 's'} in this set
            </Typography>
          </Box>
        </Drawer>

        {/* ── Main Preview Area ── */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: '#1a1c1e',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowY: 'auto',
          }}
        >
          {/* Action buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              width: '100%',
              maxWidth: '8.5in',
              px: 4,
              pt: 3,
              pb: 2,
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={saveDraft}
              sx={{
                borderRadius: 8,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(4px)',
                '&:hover': {
                  borderColor: '#d9a720',
                  color: '#d9a720',
                  backgroundColor: 'rgba(217, 167, 32, 0.05)',
                }
              }}
            >
              Save Draft
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadFile />}
              onClick={() => fileRef.current?.click()}
              sx={{
                borderRadius: 8,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  borderColor: '#d9a720',
                  color: '#d9a720',
                  backgroundColor: 'rgba(217, 167, 32, 0.05)',
                }
              }}
            >
              Load Draft
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) loadDraftFile(f);
                e.target.value = '';
              }}
            />
            {mounted && selectedModules.length > 0 && (
              <PDFDownloadLink
                document={
                  <PdfDocument
                    title={title}
                    questions={questions}
                    advancedProblems={advancedProblems}
                    docType={docType}
                    standard={standards}
                    includeAnswerKey={includeAnswerKey}
                    logoSrc="/logo_light.png"
                    classicalGroups={classicalGroups}
                    seed={seed}
                  />
                }
                fileName={`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PictureAsPdf />}
                  sx={{ borderRadius: 8 }}
                >
                  Export to PDF
                </Button>
              </PDFDownloadLink>
            )}
          </Box>

          {draftError && (
            <Alert severity="error" sx={{ mb: 2, maxWidth: '8.5in', width: '100%' }}>
              {draftError}
            </Alert>
          )}

          {/* Preview */}
          {selectedModules.length === 0 ? (
            <Alert severity="info" sx={{ maxWidth: '8.5in', width: '100%', mt: 2 }}>
              Select at least one topic from the control panel to build a worksheet.
            </Alert>
          ) : (
            <PreviewErrorBoundary key={errorBoundaryKey}>
              <EuclidEngine
                problems={advancedProblems}
                mode={toOutputMode(docType)}
                title={title}
                classicalGroups={classicalGroups}
                seed={seed}
                proofDocMode={proofDocMode}
                standard={standards}
              />
            </PreviewErrorBoundary>
          )}
        </Box>
      </Box>
    </Box>
  );
}
