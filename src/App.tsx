/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  SlidersHorizontal, 
  Type, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Hand, 
  MousePointer, 
  Share2,
  X,
  Sparkles,
  Pencil, 
  Eraser,
  Brain,
  ListTodo,
  Clock,
  Eye,
  EyeOff,
  Image as ImageIcon
} from 'lucide-react';
import { 
  TaskItem, 
  FreeChalkText, 
  ChalkSticker,
  ChalkStroke,
  ChalkLink, 
  ChalkColor, 
  BoardThemeId, 
  FilterType, 
  FontChoice, 
  WorkspaceView, 
  BoardTab,
  BoardEffectsSettings,
  DEFAULT_BOARD_EFFECTS,
  XMindNode
} from './types';
import { BOARD_THEMES, CHALK_PALETTE } from './utils/themes';
import { TaskInput } from './components/TaskInput';
import { TaskRow } from './components/TaskRow';
import { DraggableChalkNotes } from './components/DraggableChalkNotes';
import { DraggableStickers } from './components/DraggableStickers';
import { ChalkDrawingCanvas } from './components/ChalkDrawingCanvas';
import { ChalkArrowsLayer } from './components/ChalkArrowsLayer';
import { BoardsBar } from './components/BoardsBar';
import { ContextMenuModal } from './components/ContextMenuModal';
import { BoardContextMenu } from './components/BoardContextMenu';
import { StickerTrayModal, StickerPreset } from './components/StickerTrayModal';
import { EffectsModal } from './components/EffectsModal';
import { ChalkXMindMap } from './components/ChalkXMindMap';
import { FocusTimerModal, FocusTimerState } from './components/FocusTimerModal';
import { BoardBackgroundModal } from './components/BoardBackgroundModal';
import { chalkSounds } from './utils/audio';

const BOARDS_STORAGE_KEY = 'chalkboard_multi_boards_v10';
const ACTIVE_BOARD_ID_KEY = 'chalkboard_active_board_id_v10';
const FONT_KEY = 'chalkboard_font_v10';
const SOUND_KEY = 'chalkboard_sound_v10';
const COLOR_KEY = 'chalkboard_color_v10';

const DEFAULT_BOARDS: BoardTab[] = [
  {
    id: 'board-main',
    title: 'الصبورة الرئيسية',
    themeId: 'emerald',
    tasks: [
      {
        id: '1',
        name: 'قراءة 20 صفحة من الكتاب',
        completed: true,
        chalkColor: 'white',
        icon: '📖',
        subtasks: [
          { id: 'sub-1', name: 'الفصل الأول: البدايات', completed: true, createdAt: Date.now() - 3600000 },
          { id: 'sub-2', name: 'تلخيص الأفكار الرئيسية', completed: false, createdAt: Date.now() - 3500000 },
        ],
        createdAt: Date.now() - 3600000 * 3,
      },
      {
        id: '2',
        name: 'مراجعة التقرير المالي الأسبوعي',
        completed: false,
        chalkColor: 'yellow',
        icon: '⭐',
        subtasks: [
          { id: 'sub-3', name: 'تدقيق الأرقام والمصروفات', completed: false, createdAt: Date.now() - 3400000 },
        ],
        createdAt: Date.now() - 3600000 * 2,
      },
      {
        id: '3',
        name: 'تمارين رياضية مسائية',
        completed: false,
        chalkColor: 'mint',
        icon: '⚡',
        createdAt: Date.now() - 3600000,
      },
    ],
    freeNotes: [
      {
        id: 'free-1',
        text: 'انقر مرتين للتعديل، أو اضغط Ctrl واسحب للاستنساخ السريع 📋',
        x: 60,
        y: 110,
        color: 'yellow',
        icon: '💡',
        fontSize: 28,
        rotation: 0,
        createdAt: Date.now() - 100000,
      },
    ],
    stickers: [
      {
        id: 'stk-1',
        icon: '🔥',
        label: 'عاجل جداً',
        badgeStyle: 'chalk-badge',
        x: 80,
        y: 280,
        size: 48,
        rotation: -6,
        color: 'pink',
        createdAt: Date.now() - 80000,
      },
      {
        id: 'stk-2',
        icon: '🎯',
        label: 'الهدف اليومي',
        badgeStyle: 'chalk-badge',
        x: 720,
        y: 140,
        size: 52,
        rotation: 8,
        color: 'yellow',
        createdAt: Date.now() - 60000,
      }
    ],
    strokes: [],
    links: [
      {
        id: 'link-1',
        taskId: '2',
        noteId: 'free-1',
        color: 'yellow',
        createdAt: Date.now() - 50000,
      },
    ],
    workspace: { panX: 0, panY: 0, zoom: 1 },
    createdAt: Date.now(),
  },
  {
    id: 'board-ideas',
    title: 'صبورة الأفكار والمشاريع',
    themeId: 'midnight',
    tasks: [
      {
        id: 'b2-1',
        name: 'تصميم واجهة المستخدم الجديدة',
        completed: false,
        chalkColor: 'cyan',
        icon: '✨',
        createdAt: Date.now() - 100000,
      },
    ],
    freeNotes: [
      {
        id: 'b2-free-1',
        text: 'مسودة أفكار حرة قابلة للسحب في كل مكان',
        x: 100,
        y: 120,
        color: 'pink',
        icon: '📌',
        fontSize: 32,
        rotation: -4,
        createdAt: Date.now(),
      },
    ],
    stickers: [
      {
        id: 'stk-b2-1',
        icon: '💡',
        label: 'فكرة ذهبية',
        badgeStyle: 'pin-note',
        x: 200,
        y: 280,
        size: 50,
        rotation: 4,
        color: 'yellow',
        createdAt: Date.now(),
      }
    ],
    strokes: [],
    links: [],
    workspace: { panX: 0, panY: 0, zoom: 1 },
    createdAt: Date.now(),
  },
];

export default function App() {
  // Boards state
  const [boards, setBoards] = useState<BoardTab[]>(() => {
    try {
      const saved = localStorage.getItem(BOARDS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_BOARDS;
  });

  const [activeBoardId, setActiveBoardId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_BOARD_ID_KEY);
      if (saved && boards.some((b) => b.id === saved)) return saved;
    } catch {}
    return boards[0]?.id || 'board-main';
  });

  // Current active board data helper
  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

  // Handwriting Font
  const [fontChoice, setFontChoice] = useState<FontChoice>(() => {
    try {
      const saved = localStorage.getItem(FONT_KEY);
      if (saved) return saved as FontChoice;
    } catch {}
    return 'aref';
  });

  // Sound
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_KEY);
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  // Active Chalk Color
  const [selectedChalkColor, setSelectedChalkColor] = useState<ChalkColor>(() => {
    try {
      const saved = localStorage.getItem(COLOR_KEY);
      if (saved) return saved as ChalkColor;
    } catch {}
    return 'yellow';
  });

  // Drawing Tools Mode: 'select' | 'draw' | 'erase' | 'pan'
  const [toolMode, setToolMode] = useState<'select' | 'draw' | 'erase' | 'pan'>('select');
  const [brushSize, setBrushSize] = useState<number>(6); // 3, 6, 12, 20

  // Connection mode state
  const [connectingFrom, setConnectingFrom] = useState<{ type: 'task' | 'note'; id: string } | null>(null);
  const [cursorBoardPos, setCursorBoardPos] = useState<{ x: number; y: number } | null>(null);

  // Pan State
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sticker tray modal state
  const [isStickerTrayOpen, setIsStickerTrayOpen] = useState(false);

  // DOM elements mapping for drawing connecting arrows accurately
  const [taskElementsMap, setTaskElementsMap] = useState<Map<string, HTMLElement>>(new Map());
  const [noteElementsMap, setNoteElementsMap] = useState<Map<string, HTMLElement>>(new Map());
  const [boardContainerRect, setBoardContainerRect] = useState<DOMRect | null>(null);
  const workspaceContainerRef = useRef<HTMLDivElement>(null);

  const [filter, setFilter] = useState<FilterType>('all');
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Board Background Texture Studio Modal (Vintage Wood Planks & Classroom Slates)
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);

  const handleApplyBoardBackground = (dataUrl: string, presetId?: string, applyToAll?: boolean) => {
    if (applyToAll) {
      setBoards((prev) =>
        prev.map((b) => ({
          ...b,
          customBgUrl: dataUrl,
          customBgPresetId: presetId,
        }))
      );
    } else {
      setBoards((prev) =>
        prev.map((b) =>
          b.id === activeBoardId
            ? { ...b, customBgUrl: dataUrl, customBgPresetId: presetId }
            : b
        )
      );
    }
  };

  const handleResetBoardBackground = () => {
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoardId
          ? { ...b, customBgUrl: undefined, customBgPresetId: undefined }
          : b
      )
    );
  };

  // Chalkboard Visual Effects Settings state (persisted in localStorage)
  const [boardEffects, setBoardEffects] = useState<BoardEffectsSettings>(() => {
    try {
      const saved = localStorage.getItem('chalk_board_effects_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_BOARD_EFFECTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('chalk_board_effects_v2', JSON.stringify(boardEffects));
    } catch {}
  }, [boardEffects]);

  const handleToggleEffect = (key: keyof BoardEffectsSettings) => {
    setBoardEffects((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSetAllEffects = (value: boolean) => {
    setBoardEffects({
      chippedEdges: value,
      depthOfField: value,
      dustGrain: value,
      frameVignette: value,
      gritNoise: value,
      chalkBorder: value,
    });
  };

  const handleResetEffects = () => {
    setBoardEffects(DEFAULT_BOARD_EFFECTS);
  };

  // View mode: 'tasks' (standard vertical tasks list) | 'xmind' (interactive chalk mind map)
  const [viewMode, setViewMode] = useState<'tasks' | 'xmind'>('tasks');

  // Top Toolbar Visibility state (Persisted in localStorage, toggled via Context Menu)
  const [isTopToolbarVisible, setIsTopToolbarVisible] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('chalk_top_toolbar_visible_v1');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  useEffect(() => {
    try {
      localStorage.setItem('chalk_top_toolbar_visible_v1', String(isTopToolbarVisible));
    } catch {}
  }, [isTopToolbarVisible]);

  const handleToggleTopToolbar = () => {
    chalkSounds.playTap();
    setIsTopToolbarVisible((prev) => !prev);
  };

  // Focus Timer Tool State (Persisted in localStorage)
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [isFocusTimerMinimized, setIsFocusTimerMinimized] = useState(false);

  const [focusTimerState, setFocusTimerState] = useState<FocusTimerState>(() => {
    try {
      const saved = localStorage.getItem('chalk_focus_timer_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      isActive: false,
      totalDurationSeconds: 25 * 60,
      remainingSeconds: 25 * 60,
      notificationsEnabled: true,
      soundEnabled: true,
      triggeredMilestones: [],
    };
  });

  // Save focus timer state
  useEffect(() => {
    try {
      localStorage.setItem('chalk_focus_timer_v2', JSON.stringify(focusTimerState));
    } catch {}
  }, [focusTimerState]);

  // Main countdown interval for Focus Timer
  useEffect(() => {
    if (!focusTimerState.isActive) return;

    const timer = setInterval(() => {
      setFocusTimerState((prev) => {
        if (!prev.isActive) return prev;
        if (prev.remainingSeconds <= 1) {
          return {
            ...prev,
            remainingSeconds: 0,
            isActive: false,
          };
        }
        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [focusTimerState.isActive]);

  // Handle updating the active board's XMind tree
  const handleUpdateXMindTree = (rootNode: XMindNode) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === activeBoardId ? { ...b, xmindMap: rootNode } : b))
    );
  };

  // Handle exporting XMind branches to active board tasks
  const handleSyncXMindToTasks = (newTasks: TaskItem[]) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === activeBoardId ? { ...b, tasks: newTasks } : b))
    );
  };

  // Right-click Context Menu State
  const [boardContextMenu, setBoardContextMenu] = useState<{
    isOpen: boolean;
    screenX: number;
    screenY: number;
    boardX: number;
    boardY: number;
  }>({
    isOpen: false,
    screenX: 0,
    screenY: 0,
    boardX: 0,
    boardY: 0,
  });

  // Selected chalk note state
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Save boards to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOARDS_STORAGE_KEY, JSON.stringify(boards));
    } catch {}
  }, [boards]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_BOARD_ID_KEY, activeBoardId);
    } catch {}
  }, [activeBoardId]);

  useEffect(() => {
    try {
      localStorage.setItem(FONT_KEY, fontChoice);
    } catch {}
  }, [fontChoice]);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, String(soundEnabled));
      chalkSounds.enabled = soundEnabled;
    } catch {}
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(COLOR_KEY, selectedChalkColor);
    } catch {}
  }, [selectedChalkColor]);

  // Keep DOM elements map in sync for drawing connecting arrows accurately
  const updateElementsMap = () => {
    if (!workspaceContainerRef.current) return;
    const rect = workspaceContainerRef.current.getBoundingClientRect();
    setBoardContainerRect(rect);

    const taskMap = new Map<string, HTMLElement>();
    const taskEls = workspaceContainerRef.current.querySelectorAll('[data-task-id]');
    taskEls.forEach((el) => {
      const id = el.getAttribute('data-task-id');
      if (id) taskMap.set(id, el as HTMLElement);
    });
    setTaskElementsMap(taskMap);

    const noteMap = new Map<string, HTMLElement>();
    const noteEls = workspaceContainerRef.current.querySelectorAll('[data-note-id]');
    noteEls.forEach((el) => {
      const id = el.getAttribute('data-note-id');
      if (id) noteMap.set(id, el as HTMLElement);
    });
    setNoteElementsMap(noteMap);
  };

  useEffect(() => {
    updateElementsMap();
    const handleResize = () => updateElementsMap();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeBoard, activeBoardId, filter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateElementsMap();
    }, 50);
    return () => clearTimeout(timer);
  }, [activeBoard.tasks, activeBoard.freeNotes, activeBoard.links]);

  // Cancel connecting mode on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (connectingFrom) {
          setConnectingFrom(null);
          setCursorBoardPos(null);
        }
        if (toolMode === 'draw' || toolMode === 'erase') {
          setToolMode('select');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connectingFrom, toolMode]);

  // Fullscreen support
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Update current active board state helper
  const updateActiveBoard = (updater: (prevBoard: BoardTab) => BoardTab) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === activeBoardId ? updater(b) : b))
    );
  };

  // Boards Management
  const handleCreateBoard = (title: string) => {
    const newBoard: BoardTab = {
      id: `board-${Date.now()}`,
      title,
      themeId: activeBoard.themeId || 'emerald',
      tasks: [],
      freeNotes: [],
      stickers: [],
      strokes: [],
      links: [],
      workspace: { panX: 0, panY: 0, zoom: 1 },
      createdAt: Date.now(),
    };
    setBoards((prev) => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
  };

  const handleRenameBoard = (id: string, newTitle: string) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === id ? { ...b, title: newTitle } : b))
    );
  };

  const handleDeleteBoard = (id: string) => {
    if (boards.length <= 1) return;
    const remaining = boards.filter((b) => b.id !== id);
    setBoards(remaining);
    if (activeBoardId === id) {
      setActiveBoardId(remaining[0].id);
    }
  };

  const handleSelectTheme = (themeId: BoardThemeId) => {
    updateActiveBoard((b) => ({ ...b, themeId }));
  };

  // Task Actions on Active Board
  const handleAddTask = (name: string, color: ChalkColor) => {
    const newTask: TaskItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name,
      completed: false,
      chalkColor: color,
      subtasks: [],
      createdAt: Date.now(),
    };
    updateActiveBoard((b) => ({ ...b, tasks: [newTask, ...b.tasks] }));
  };

  const handleToggleTask = (id: string) => {
    updateActiveBoard((b) => ({
      ...b,
      tasks: b.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const handleDeleteTask = (id: string) => {
    updateActiveBoard((b) => ({
      ...b,
      tasks: b.tasks.filter((t) => t.id !== id),
      links: b.links.filter((l) => l.taskId !== id),
    }));
  };

  const handleRenameTask = (id: string, newName: string) => {
    updateActiveBoard((b) => ({
      ...b,
      tasks: b.tasks.map((t) => (t.id === id ? { ...t, name: newName } : t)),
    }));
  };

  const handleSetTaskIcon = (id: string, icon?: string) => {
    updateActiveBoard((b) => ({
      ...b,
      tasks: b.tasks.map((t) => (t.id === id ? { ...t, icon } : t)),
    }));
  };

  const handleToggleLockTask = (id: string) => {
    updateActiveBoard((b) => ({
      ...b,
      tasks: b.tasks.map((t) => (t.id === id ? { ...t, locked: !t.locked } : t)),
    }));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    updateActiveBoard((b) => {
      const updated = [...b.tasks];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return { ...b, tasks: updated };
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= activeBoard.tasks.length - 1) return;
    updateActiveBoard((b) => {
      const updated = [...b.tasks];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return { ...b, tasks: updated };
    });
  };

  // Drag and drop task reordering
  const draggedTaskIdxRef = useRef<number | null>(null);

  const handleDragStartTask = (e: React.DragEvent, index: number) => {
    draggedTaskIdxRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverTask = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropTask = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedTaskIdxRef.current;
    if (sourceIndex === null || sourceIndex === targetIndex) return;

    updateActiveBoard((b) => {
      const list = [...b.tasks];
      const [draggedItem] = list.splice(sourceIndex, 1);
      list.splice(targetIndex, 0, draggedItem);
      return { ...b, tasks: list };
    });
    chalkSounds.playTap();
    draggedTaskIdxRef.current = null;
  };

  // Subtasks Actions
  const handleAddSubtask = (taskId: string, name: string) => {
    const newSub = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name,
      completed: false,
      createdAt: Date.now(),
    };

    updateActiveBoard((b) => ({
      ...b,
      tasks: b.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const currentSubs = t.subtasks || [];
        return { ...t, subtasks: [...currentSubs, newSub] };
      }),
    }));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    updateActiveBoard((b) => ({
      ...b,
      tasks: b.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubs = (t.subtasks || []).map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...t, subtasks: updatedSubs };
      }),
    }));
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    updateActiveBoard((b) => ({
      ...b,
      tasks: b.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubs = (t.subtasks || []).filter((s) => s.id !== subtaskId);
        return { ...t, subtasks: updatedSubs };
      }),
    }));
  };

  const handleRenameSubtask = (taskId: string, subtaskId: string, newName: string) => {
    updateActiveBoard((b) => ({
      ...b,
      tasks: b.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubs = (t.subtasks || []).map((s) =>
          s.id === subtaskId ? { ...s, name: newName } : s
        );
        return { ...t, subtasks: updatedSubs };
      }),
    }));
  };

  const handleEraseCompleted = () => {
    updateActiveBoard((b) => ({
      ...b,
      tasks: b.tasks.filter((t) => !t.completed),
    }));
  };

  const handleResetBoard = () => {
    updateActiveBoard((b) => ({
      ...b,
      tasks: [],
      freeNotes: [],
      stickers: [],
      strokes: [],
      links: [],
    }));
  };

  // Freeform Keyboard Notes Actions
  const handleAddFreeNote = (note: FreeChalkText) => {
    updateActiveBoard((b) => ({
      ...b,
      freeNotes: [...b.freeNotes, note],
    }));
  };

  const handleUpdateFreeNote = (id: string, updates: Partial<FreeChalkText>) => {
    updateActiveBoard((b) => ({
      ...b,
      freeNotes: b.freeNotes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
  };

  const handleDeleteFreeNote = (id: string) => {
    updateActiveBoard((b) => ({
      ...b,
      freeNotes: b.freeNotes.filter((n) => n.id !== id),
      links: b.links.filter((l) => l.noteId !== id),
    }));
  };

  const handleClearFreeNotes = () => {
    updateActiveBoard((b) => ({
      ...b,
      freeNotes: [],
      links: [],
    }));
  };

  // Free Chalk Hand Drawing Actions
  const handleAddStroke = (stroke: ChalkStroke) => {
    updateActiveBoard((b) => ({
      ...b,
      strokes: [...(b.strokes || []), stroke],
    }));
  };

  const handleUpdateStrokes = (strokes: ChalkStroke[]) => {
    updateActiveBoard((b) => ({
      ...b,
      strokes,
    }));
  };

  const handleClearStrokes = () => {
    chalkSounds.playErase();
    updateActiveBoard((b) => ({
      ...b,
      strokes: [],
    }));
  };

  // Direct Storing of an added Sticker (presets or clones)
  const handleAddStickerDirect = (sticker: ChalkSticker) => {
    updateActiveBoard((b) => ({
      ...b,
      stickers: [...(b.stickers || []), sticker],
    }));
  };

  // Stickers Actions
  const handleAddSticker = (preset: StickerPreset) => {
    const ws = activeBoard.workspace || { panX: 0, panY: 0, zoom: 1 };
    const centerX = (window.innerWidth / 2 - ws.panX) / ws.zoom - 60;
    const centerY = (window.innerHeight / 2 - ws.panY) / ws.zoom - 100;

    const newSticker: ChalkSticker = {
      id: `stk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      icon: preset.icon,
      label: preset.label,
      badgeStyle: preset.badgeStyle,
      x: centerX + (Math.random() * 40 - 20),
      y: centerY + (Math.random() * 40 - 20),
      size: 52,
      rotation: Math.floor(Math.random() * 16 - 8),
      color: preset.defaultColor || selectedChalkColor,
      createdAt: Date.now(),
    };

    handleAddStickerDirect(newSticker);
  };

  const handleUpdateSticker = (id: string, updates: Partial<ChalkSticker>) => {
    updateActiveBoard((b) => ({
      ...b,
      stickers: (b.stickers || []).map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const handleDeleteSticker = (id: string) => {
    chalkSounds.playErase();
    updateActiveBoard((b) => ({
      ...b,
      stickers: (b.stickers || []).filter((s) => s.id !== id),
    }));
  };

  // Two-way Arrow Link Creation Handlers
  const handleStartConnectFromTask = (taskId: string) => {
    if (connectingFrom?.type === 'task' && connectingFrom.id === taskId) {
      setConnectingFrom(null);
      setCursorBoardPos(null);
      return;
    }
    if (connectingFrom?.type === 'note') {
      const noteId = connectingFrom.id;
      completeLink(taskId, noteId);
      return;
    }
    chalkSounds.playTap();
    setConnectingFrom({ type: 'task', id: taskId });
  };

  const handleStartConnectFromNote = (noteId: string) => {
    if (connectingFrom?.type === 'note' && connectingFrom.id === noteId) {
      setConnectingFrom(null);
      setCursorBoardPos(null);
      return;
    }
    if (connectingFrom?.type === 'task') {
      const taskId = connectingFrom.id;
      completeLink(taskId, noteId);
      return;
    }
    chalkSounds.playTap();
    setConnectingFrom({ type: 'note', id: noteId });
  };

  const completeLink = (taskId: string, noteId: string) => {
    const exists = activeBoard.links.some((l) => l.taskId === taskId && l.noteId === noteId);
    if (!exists) {
      const newLink: ChalkLink = {
        id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        taskId,
        noteId,
        color: selectedChalkColor,
        createdAt: Date.now(),
      };
      updateActiveBoard((b) => ({
        ...b,
        links: [...b.links, newLink],
      }));
      chalkSounds.playChalkStroke();
    }
    setConnectingFrom(null);
    setCursorBoardPos(null);
  };

  const handleDeleteLink = (linkId: string) => {
    chalkSounds.playErase();
    updateActiveBoard((b) => ({
      ...b,
      links: b.links.filter((l) => l.id !== linkId),
    }));
  };

  const handleClearAllLinks = () => {
    chalkSounds.playErase();
    updateActiveBoard((b) => ({
      ...b,
      links: [],
    }));
  };

  // Quick button to add note at comfortable side coordinate
  const handleQuickAddNote = () => {
    chalkSounds.playTap();
    const ws = activeBoard.workspace || { panX: 0, panY: 0, zoom: 1 };
    const posX = (window.innerWidth * 0.15 - ws.panX) / ws.zoom;
    const posY = (window.innerHeight * 0.28 - ws.panY) / ws.zoom;

    const newNote: FreeChalkText = {
      id: crypto.randomUUID ? crypto.randomUUID() : `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: 'ملاحظة جديدة...',
      x: Math.max(20, Math.round(posX)),
      y: Math.max(60, Math.round(posY)),
      color: selectedChalkColor,
      fontSize: 32,
      rotation: 0,
      createdAt: Date.now(),
    };
    handleAddFreeNote(newNote);
  };

  // Open Context Menu on Right Click (or Long Press)
  const handleOpenContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't trigger if right-clicked on an input, button or task row
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('header') ||
      target.closest('footer') ||
      target.closest('[data-workspace-controls]')
    ) {
      return;
    }

    e.preventDefault();
    const ws = activeBoard.workspace || { panX: 0, panY: 0, zoom: 1 };
    const boardX = Math.round((e.clientX - ws.panX) / ws.zoom);
    const boardY = Math.round((e.clientY - ws.panY) / ws.zoom);

    chalkSounds.playTap();
    setBoardContextMenu({
      isOpen: true,
      screenX: e.clientX,
      screenY: e.clientY,
      boardX,
      boardY,
    });
  };

  const handleCloseContextMenu = () => {
    setBoardContextMenu((prev) => ({ ...prev, isOpen: false }));
  };

  // Context Menu Actions: Add Note at exact click position
  const handleAddNoteFromContextMenu = () => {
    const newNote: FreeChalkText = {
      id: crypto.randomUUID ? crypto.randomUUID() : `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: 'ملاحظة جديدة...',
      x: boardContextMenu.boardX,
      y: boardContextMenu.boardY,
      color: selectedChalkColor,
      fontSize: 32,
      rotation: 0,
      createdAt: Date.now(),
    };
    handleAddFreeNote(newNote);
    chalkSounds.playChalkStroke();
  };

  // Context Menu Action: Add Task at position / into tasks list
  const handleAddTaskFromContextMenu = () => {
    handleAddTask('مهمة جديدة', selectedChalkColor);
    chalkSounds.playChalkStroke();
  };

  // Context Menu Action: Add Quick Sticker at click position
  const handleAddStickerFromContextMenu = (preset: StickerPreset) => {
    const newSticker: ChalkSticker = {
      id: `stk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      icon: preset.icon,
      label: preset.label,
      badgeStyle: preset.badgeStyle,
      x: boardContextMenu.boardX,
      y: boardContextMenu.boardY,
      size: 52,
      rotation: Math.floor(Math.random() * 16 - 8),
      color: preset.defaultColor || selectedChalkColor,
      createdAt: Date.now(),
    };
    handleAddStickerDirect(newSticker);
    chalkSounds.playChalkStroke();
  };

  // Workspace Pan & Zoom Controls for active board
  const handleZoomIn = () => {
    chalkSounds.playTap();
    updateActiveBoard((b) => ({
      ...b,
      workspace: {
        ...b.workspace,
        zoom: Math.min(2.5, +(b.workspace.zoom + 0.15).toFixed(2)),
      },
    }));
  };

  const handleZoomOut = () => {
    chalkSounds.playTap();
    updateActiveBoard((b) => ({
      ...b,
      workspace: {
        ...b.workspace,
        zoom: Math.max(0.4, +(b.workspace.zoom - 0.15).toFixed(2)),
      },
    }));
  };

  const handleResetWorkspace = () => {
    chalkSounds.playTap();
    updateActiveBoard((b) => ({
      ...b,
      workspace: { panX: 0, panY: 0, zoom: 1 },
    }));
  };

  // Mouse wheel to zoom (Ctrl+Wheel or standard Wheel)
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.08 : -0.08;
      updateActiveBoard((b) => ({
        ...b,
        workspace: {
          ...b.workspace,
          zoom: Math.max(0.4, Math.min(2.5, +(b.workspace.zoom + zoomFactor).toFixed(2))),
        },
      }));
    } else {
      updateActiveBoard((b) => ({
        ...b,
        workspace: {
          ...b.workspace,
          panX: b.workspace.panX - e.deltaX * 0.8,
          panY: b.workspace.panY - e.deltaY * 0.8,
        },
      }));
    }
  };

  // Pan navigation dragging (Hand tool or Middle-click)
  const handleWorkspacePointerDown = (e: React.PointerEvent) => {
    if (toolMode === 'pan' || e.button === 1 || e.altKey) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { 
        x: e.clientX - activeBoard.workspace.panX, 
        y: e.clientY - activeBoard.workspace.panY 
      };
    }
  };

  const handleWorkspacePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      updateActiveBoard((b) => ({
        ...b,
        workspace: {
          ...b.workspace,
          panX: e.clientX - panStartRef.current.x,
          panY: e.clientY - panStartRef.current.y,
        },
      }));
    }

    if (connectingFrom) {
      setCursorBoardPos({
        x: (e.clientX - activeBoard.workspace.panX) / activeBoard.workspace.zoom,
        y: (e.clientY - activeBoard.workspace.panY) / activeBoard.workspace.zoom,
      });
    }
  };

  const handleWorkspacePointerUp = () => {
    setIsPanning(false);
  };

  const filteredTasks = activeBoard.tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = activeBoard.tasks.filter((t) => t.completed).length;
  const currentTheme = BOARD_THEMES[activeBoard.themeId] || BOARD_THEMES.emerald;
  const strokesCount = (activeBoard.strokes || []).length;

  // Dynamic vignette calculations mimicking reaching physical chalkboard frame edges
  const panDist = Math.hypot(activeBoard.workspace.panX, activeBoard.workspace.panY);
  const vignetteOpacity = Math.min(0.92, Math.max(0.35, 0.35 + (panDist / 1000) * 0.55)).toFixed(3);

  return (
    <div
      onWheel={handleWheel}
      onPointerDown={handleWorkspacePointerDown}
      onPointerMove={handleWorkspacePointerMove}
      onPointerUp={handleWorkspacePointerUp}
      onPointerCancel={handleWorkspacePointerUp}
      onContextMenu={handleOpenContextMenu}
      className={`fixed inset-0 w-screen h-screen select-none overflow-hidden transition-colors duration-700 chalk-surface-grain chalk-smudge flex flex-col justify-between ${
        boardEffects.chippedEdges ? 'effect-chipped-edges' : ''
      } ${
        boardEffects.chalkBorder ? 'effect-chalk-border' : ''
      } ${
        boardEffects.frameVignette ? 'effect-frame-vignette' : ''
      } ${
        toolMode === 'pan' || isPanning ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{
        background: activeBoard.customBgUrl 
          ? `url("${activeBoard.customBgUrl}") center/cover no-repeat fixed` 
          : currentTheme.backgroundStyle,
        '--pan-x': `${activeBoard.workspace.panX}px`,
        '--pan-y': `${activeBoard.workspace.panY}px`,
        '--pan-x-num': activeBoard.workspace.panX,
        '--pan-y-num': activeBoard.workspace.panY,
        '--pan-dist': `${Math.round(panDist)}px`,
        '--vignette-opacity': vignetteOpacity,
        '--zoom-blur': boardEffects.depthOfField && activeBoard.workspace.zoom > 1
          ? `${Math.min(5, (activeBoard.workspace.zoom - 1) * 2.8).toFixed(1)}px`
          : '0px',
        '--dust-layer-opacity': boardEffects.dustGrain ? 1 : 0,
        '--grit-layer-opacity': boardEffects.gritNoise ? 0.22 : 0,
      } as React.CSSProperties}
      dir="rtl"
    >
      {/* Realistic Chalkboard Vignette & Atmospheric Depth */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: boardEffects.frameVignette ? 1 : 0,
          boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.75), inset 0 0 40px rgba(0, 0, 0, 0.9)',
        }}
      />

      {/* Connection Mode Alert Banner at Top when active */}
      {connectingFrom && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-amber-400 text-black px-4 py-1.5 rounded-full font-bold shadow-2xl animate-bounce pointer-events-auto">
          <Share2 className="w-4 h-4" />
          <span className="text-xs">
            {connectingFrom.type === 'task'
              ? 'انقر الآن على أي كتابة حرة لتوصيل السهم معها'
              : 'انقر الآن على المهمة المستهدفة لإتمام السهم'}
          </span>
          <button
            type="button"
            onClick={() => {
              setConnectingFrom(null);
              setCursorBoardPos(null);
            }}
            className="p-0.5 rounded-full hover:bg-black/20 cursor-pointer"
            title="إلغاء التوصيل (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Discreet Button to Reveal Top Toolbar when hidden */}
      {!isTopToolbarVisible && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-fade-in">
          <button
            type="button"
            onClick={handleToggleTopToolbar}
            title="إظهار شريط الأدوات العلوي (أو انقر بالزر الأيمن في أي مكان على السبورة)"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black/95 text-white/90 hover:text-white border border-white/25 text-xs font-semibold backdrop-blur-xl shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>إظهار شريط الأدوات العلوي 👁️</span>
          </button>
        </div>
      )}

      {/* TOP FLOATING BAR: Multi-Boards Tabs, Tools (Pen, Eraser, Select, Pan), Workspace Controls, Options */}
      <header 
        className={`relative z-40 w-full flex flex-col gap-2 p-3 sm:p-5 transition-all duration-300 ${
          isTopToolbarVisible 
            ? 'translate-y-0 opacity-100 pointer-events-auto' 
            : '-translate-y-full opacity-0 pointer-events-none h-0 p-0 overflow-hidden'
        }`}
      >
        <div className="flex items-center justify-between gap-3 w-full flex-wrap sm:flex-nowrap">
          {/* Multiple Chalkboards Switcher Bar */}
          <div className="flex-1 min-w-0 pr-1">
            <BoardsBar
              boards={boards}
              activeBoardId={activeBoardId}
              onSelectBoard={setActiveBoardId}
              onCreateBoard={handleCreateBoard}
              onRenameBoard={handleRenameBoard}
              onDeleteBoard={handleDeleteBoard}
            />
          </div>

          {/* View Mode Switcher: Tasks List vs XMind Mind Map */}
          <div 
            data-workspace-controls="true"
            className="flex items-center gap-1 bg-black/60 border border-white/20 backdrop-blur-md rounded-2xl p-1 shadow-2xl text-white shrink-0"
          >
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                setViewMode('tasks');
              }}
              title="عرض قائمة المهام والمهام الفرعية"
              className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'tasks'
                  ? 'bg-amber-400 text-black font-bold shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>المهام</span>
            </button>

            <button
              type="button"
              onClick={() => {
                chalkSounds.playChalkStroke();
                setViewMode('xmind');
              }}
              title="عرض خريطة ذهن XMind التفاعلية ببوكسات تشبه الكتابة بالطبشور"
              className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'xmind'
                  ? 'bg-amber-400 text-black font-bold shadow-md'
                  : 'text-white/70 hover:text-amber-300 hover:bg-white/10'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-current" />
              <span>خريطة XMind 🧠</span>
            </button>
          </div>

          {/* Center: Chalk Drawing & Board Toolbar */}
          <div 
            data-workspace-controls="true"
            className="flex items-center gap-1 bg-black/60 border border-white/20 backdrop-blur-md rounded-2xl p-1 shadow-2xl text-white shrink-0"
          >
            {/* Select Tool */}
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                setToolMode('select');
              }}
              title="أداة التحديد والتحكم العادي (انقر للكتابة أو اسحب المهام)"
              className={`p-1.5 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer ${
                toolMode === 'select'
                  ? 'bg-amber-400 text-black font-bold shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">تحديد</span>
            </button>

            {/* Chalk Pen Drawing Tool */}
            <button
              type="button"
              onClick={() => {
                chalkSounds.playChalkStroke();
                setToolMode(toolMode === 'draw' ? 'select' : 'draw');
              }}
              title="فرشاة رسم الطبشور الحر بالماوس (Chalk Pen)"
              className={`p-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                toolMode === 'draw'
                  ? 'bg-emerald-500 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)] ring-1 ring-emerald-300'
                  : 'text-white/70 hover:text-emerald-300 hover:bg-white/10'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>رسم بالطبشور</span>
            </button>

            {/* Chalk Eraser Tool */}
            <button
              type="button"
              onClick={() => {
                chalkSounds.playErase();
                setToolMode(toolMode === 'erase' ? 'select' : 'erase');
              }}
              title="ممحاة الطبشور لمسح خطوط الرسم بالماوس"
              className={`p-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                toolMode === 'erase'
                  ? 'bg-red-500 text-white font-bold shadow-[0_0_12px_rgba(239,68,68,0.5)] ring-1 ring-red-300'
                  : 'text-white/70 hover:text-red-300 hover:bg-white/10'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>ممحاة</span>
            </button>

            {/* Brush Sizes Selector (if drawing or erasing) */}
            {(toolMode === 'draw' || toolMode === 'erase') && (
              <div className="flex items-center gap-1 bg-white/10 rounded-xl px-1.5 py-0.5 mr-0.5">
                {[3, 6, 12, 20].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      chalkSounds.playTap();
                      setBrushSize(size);
                    }}
                    title={`حجم الخط: ${size}px`}
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      brushSize === size
                        ? 'bg-white text-black font-bold scale-110 shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span 
                      className="rounded-full bg-current" 
                      style={{ width: `${Math.max(3, Math.min(10, size / 1.6))}px`, height: `${Math.max(3, Math.min(10, size / 1.6))}px` }} 
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="w-px h-4 bg-white/20 mx-0.5" />

            {/* Pan hand tool toggle */}
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                setToolMode(toolMode === 'pan' ? 'select' : 'pan');
              }}
              title={toolMode === 'pan' ? 'الخروج من وضع تحريك المساحة' : 'أداة اليد لتحريك مساحة العمل (Pan)'}
              className={`p-1.5 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer ${
                toolMode === 'pan'
                  ? 'bg-amber-400 text-black font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Hand className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تحريك</span>
            </button>

            {/* Zoom Out */}
            <button
              type="button"
              onClick={handleZoomOut}
              title="تصغير مساحة العمل"
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {/* Zoom percentage badge */}
            <span 
              className="text-[11px] font-mono px-1 py-0.5 text-white/80 min-w-[38px] text-center"
              title="مقياس التكبير الحالي"
            >
              {Math.round(activeBoard.workspace.zoom * 100)}%
            </span>

            {/* Zoom In */}
            <button
              type="button"
              onClick={handleZoomIn}
              title="تكبير مساحة العمل"
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Reset Workspace View */}
            {(activeBoard.workspace.zoom !== 1 || activeBoard.workspace.panX !== 0 || activeBoard.workspace.panY !== 0) && (
              <button
                type="button"
                onClick={handleResetWorkspace}
                title="إعادة ضبط مساحة العمل إلى المركز (100%)"
                className="p-1.5 rounded-xl text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Quick Free Chalk Typing Button, Sticker Tray & Options */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Focus Timer Tool Button */}
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                setIsFocusTimerOpen(true);
                setIsFocusTimerMinimized(false);
              }}
              title="أداة وقت التركيز مع إشعارات كروم (25% - 50% - 75% - 100%) والبروجرس بار الطبشوري"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                focusTimerState.isActive
                  ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.6)] ring-1 ring-amber-300 animate-pulse'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-400/40'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${focusTimerState.isActive ? 'animate-spin-slow text-black' : 'text-amber-400'}`} />
              <span>
                {focusTimerState.isActive
                  ? `${Math.floor(focusTimerState.remainingSeconds / 60)}:${String(focusTimerState.remainingSeconds % 60).padStart(2, '0')}`
                  : 'وقت التركيز ⏱️'}
              </span>
            </button>

            {/* Board Background Texture Studio (Wood Planks & Vintage School Slates) */}
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                setIsBackgroundModalOpen(true);
              }}
              title="توليد وتخصيص خلفيات السبورة (ألواح خشبية قديمة، سبورات مدرسية عتيقة، حجر أردواز)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                activeBoard.customBgUrl
                  ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)] ring-1 ring-amber-300'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-400/40'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-current" />
              <span>الخلفيات 🪵</span>
            </button>

            {/* Open Stickers Tray Button */}
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                setIsStickerTrayOpen(true);
              }}
              title="إضافة ستيكرات شارات وأيقونات قابلة للسحب والإفلات"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ستيكرات 🎯</span>
            </button>

            {/* Live Visual Effects Controller */}
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                setIsEffectsModalOpen(true);
              }}
              title="التحكم في كافة تأثيرات السبورة الواقعية (الحواف المكسورة، إطار الطبشور، التظليل، الغبار، الخشونة، التركيز)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>التأثيرات ({Object.values(boardEffects).filter(Boolean).length}/6)</span>
            </button>

            {/* Quick Free Chalk Note Button */}
            <button
              type="button"
              onClick={handleQuickAddNote}
              title="إضافة ملاحظة حرة، أو انقر في أي مساحة بالصبورة للكتابة المباشرة"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/15 text-white/90 text-xs font-handwriting-ruqaa transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <Type className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">+ كتابة حرة</span>
            </button>

            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                setIsOptionsModalOpen(true);
              }}
              title="قائمة الإمكانيات والخيارات الإضافية (تدرجات السبورة، الخطوط، الألوان، الصوت...)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/15 text-white/80 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-medium">الإمكانيات</span>
            </button>
          </div>
        </div>
      </header>

      {/* INFINITE/PANNABLE WORKSPACE CANVAS CONTAINER */}
      <div
        ref={workspaceContainerRef}
        className="relative flex-1 w-full h-full overflow-hidden"
        style={{
          perspective: 1000,
        }}
      >
        <div
          style={{
            transform: `translate(${activeBoard.workspace.panX}px, ${activeBoard.workspace.panY}px) scale(${activeBoard.workspace.zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
          }}
          className="relative w-full h-full"
        >
          {/* Layer for Free Chalk Hand Drawing with Mouse (Canvas Layer) */}
          <ChalkDrawingCanvas
            strokes={activeBoard.strokes || []}
            onAddStroke={handleAddStroke}
            onUpdateStrokes={handleUpdateStrokes}
            isDrawingMode={toolMode === 'draw'}
            isEraserMode={toolMode === 'erase'}
            currentColor={selectedChalkColor}
            brushSize={brushSize}
            zoom={activeBoard.workspace.zoom}
            panX={activeBoard.workspace.panX}
            panY={activeBoard.workspace.panY}
          />

          {/* Layer for Draggable Freeform Notes Typed with Keyboard (Background surface z-12, Notes z-28) */}
          <DraggableChalkNotes
            notes={activeBoard.freeNotes}
            onAddNote={handleAddFreeNote}
            onUpdateNote={handleUpdateFreeNote}
            onDeleteNote={handleDeleteFreeNote}
            currentColor={selectedChalkColor}
            fontChoice={fontChoice}
            zoom={activeBoard.workspace.zoom}
            panX={activeBoard.workspace.panX}
            panY={activeBoard.workspace.panY}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            onStartConnect={handleStartConnectFromNote}
            onContextMenu={handleOpenContextMenu}
            onSelectConnectTarget={(noteId) => {
              if (connectingFrom?.type === 'task') {
                completeLink(connectingFrom.id, noteId);
              }
            }}
            isConnectingFromThis={(noteId) => connectingFrom?.type === 'note' && connectingFrom.id === noteId}
            isConnectingActive={!!connectingFrom}
          />

          {/* Layer for Draggable, Resizable & Rotatable Chalk Stickers (z-26) */}
          <DraggableStickers
            stickers={activeBoard.stickers || []}
            onAddSticker={handleAddStickerDirect}
            onUpdateSticker={handleUpdateSticker}
            onDeleteSticker={handleDeleteSticker}
            fontChoice={fontChoice}
            zoom={activeBoard.workspace.zoom}
            panX={activeBoard.workspace.panX}
            panY={activeBoard.workspace.panY}
          />

          {/* MAIN CENTERED SECTION: Tasks View OR Interactive XMind Mind Map */}
          {viewMode === 'xmind' ? (
            <div className="absolute inset-0 w-full h-full flex flex-col pointer-events-auto z-25">
              <ChalkXMindMap
                initialRoot={activeBoard.xmindMap}
                boardTitle={activeBoard.title}
                boardTasks={activeBoard.tasks}
                fontChoice={fontChoice}
                currentColor={selectedChalkColor}
                onUpdateTree={handleUpdateXMindTree}
                onSyncToTasks={handleSyncXMindToTasks}
                onToggleTaskCompletion={(taskId, subtaskId) => {
                  if (subtaskId) {
                    handleToggleSubtask(taskId, subtaskId);
                  } else {
                    handleToggleTask(taskId);
                  }
                }}
                onCloseView={() => setViewMode('tasks')}
              />
            </div>
          ) : (
            <div 
              className="absolute inset-0 w-full h-full flex flex-col justify-center items-center pointer-events-none z-20"
            >
              <main 
                className="w-full max-w-xl mx-auto px-4 flex flex-col justify-center pointer-events-none"
                style={{
                  pointerEvents: toolMode === 'pan' || toolMode === 'draw' || toolMode === 'erase' ? 'none' : undefined,
                }}
              >
                {/* Seamless Borderless Task Input */}
                <div className="mb-4 pointer-events-auto">
                  <TaskInput
                    onAddTask={handleAddTask}
                    currentColor={selectedChalkColor}
                    fontChoice={fontChoice}
                  />
                </div>

                {/* Task List with Drag-and-Drop Reordering, Icons, Nested Subtasks and Connect Arrow Actions */}
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[60vh] pr-1 pl-1 pointer-events-none">
                  {filteredTasks.length === 0 ? (
                    <div className="py-12 text-center text-white/30 select-none pointer-events-none flex flex-col items-center">
                      <p className="font-handwriting-ruqaa text-2xl sm:text-3xl mb-1 text-white/40">
                        {filter === 'completed'
                          ? 'لا توجد مهام مكتملة'
                          : filter === 'active'
                          ? 'لا توجد مهام قيد الإنجاز'
                          : `الصبورة (${activeBoard.title}) فارغة`}
                      </p>
                      <p className="text-xs text-white/25 mb-3">
                        اكتب اسم المهمة واضغط Enter للبدء، أو ارسم بحرية بالطبشور والممحاة
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          chalkSounds.playChalkStroke();
                          setViewMode('xmind');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all shadow-md hover:scale-105 pointer-events-auto cursor-pointer"
                      >
                        <Brain className="w-4 h-4" />
                        <span>فتح خريطة ذهن XMind للمشروع 🧠</span>
                      </button>
                    </div>
                  ) : (
                    filteredTasks.map((task, idx) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        index={idx}
                        totalTasks={filteredTasks.length}
                        fontChoice={fontChoice}
                        onToggle={handleToggleTask}
                        onDelete={handleDeleteTask}
                        onRename={handleRenameTask}
                        onSetIcon={handleSetTaskIcon}
                        onToggleLock={handleToggleLockTask}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        onDragStartTask={handleDragStartTask}
                        onDragOverTask={handleDragOverTask}
                        onDropTask={handleDropTask}
                        onAddSubtask={handleAddSubtask}
                        onToggleSubtask={handleToggleSubtask}
                        onDeleteSubtask={handleDeleteSubtask}
                        onRenameSubtask={handleRenameSubtask}
                        onStartConnect={handleStartConnectFromTask}
                        onSelectConnectTargetTask={(taskId) => {
                          if (connectingFrom?.type === 'note') {
                            completeLink(taskId, connectingFrom.id);
                          }
                        }}
                        isConnectingThis={connectingFrom?.type === 'task' && connectingFrom.id === task.id}
                        isConnectingActive={!!connectingFrom}
                        hasLinks={activeBoard.links.some((l) => l.taskId === task.id)}
                      />
                    ))
                  )}
                </div>
              </main>
            </div>
          )}

          {/* Dynamic Chalk Arrows & Connectors SVG Layer (z-40: Topmost layer over tasks & notes so (X) and path are always reachable) */}
          <ChalkArrowsLayer
            links={activeBoard.links}
            taskElements={taskElementsMap}
            noteElements={noteElementsMap}
            boardContainerRect={boardContainerRect}
            zoom={activeBoard.workspace.zoom}
            panX={activeBoard.workspace.panX}
            panY={activeBoard.workspace.panY}
            onDeleteLink={handleDeleteLink}
            connectingFrom={connectingFrom}
            cursorBoardPos={cursorBoardPos}
            activeColor={selectedChalkColor}
          />
        </div>
      </div>

      {/* Bottom Discreet Hints & Link / Stroke count indicator */}
      <footer className="relative z-40 w-full flex items-center justify-center gap-3 py-2 text-[11px] text-white/35 pointer-events-auto select-none flex-wrap">
        <span>* انقر بالزر الأيمن (Right-Click) في أي مكان لفتح <strong>قائمة السياق</strong> وإضافة ستيكر أو كتابة حرة أو مهام</span>
        {strokesCount > 0 && (
          <button
            type="button"
            onClick={handleClearStrokes}
            className="text-cyan-300/80 hover:text-cyan-200 underline underline-offset-2 cursor-pointer transition-colors"
            title="مسح جميع خطوط الرسم في هذه الصبورة"
          >
            مسح جميع الرسومات ({strokesCount})
          </button>
        )}
        {activeBoard.links.length > 0 && (
          <button
            type="button"
            onClick={handleClearAllLinks}
            className="text-amber-300/70 hover:text-amber-300 underline underline-offset-2 cursor-pointer transition-colors"
            title="مسح جميع أسهم الربط في هذه الصبورة"
          >
            مسح جميع الأسهم ({activeBoard.links.length})
          </button>
        )}
      </footer>

      {/* Stickers Tray Modal */}
      <StickerTrayModal
        isOpen={isStickerTrayOpen}
        onClose={() => setIsStickerTrayOpen(false)}
        onSelectSticker={handleAddSticker}
      />

      {/* Right-click Context Menu */}
      <BoardContextMenu
        isOpen={boardContextMenu.isOpen}
        x={boardContextMenu.screenX}
        y={boardContextMenu.screenY}
        onClose={handleCloseContextMenu}
        onAddNoteAtPos={handleAddNoteFromContextMenu}
        onAddTaskAtPos={handleAddTaskFromContextMenu}
        onOpenStickerTray={() => setIsStickerTrayOpen(true)}
        onSelectQuickSticker={handleAddStickerFromContextMenu}
        onActivateDrawing={() => setToolMode('draw')}
        onOpenXMind={() => setViewMode('xmind')}
        onOpenFocusTimer={() => {
          setIsFocusTimerOpen(true);
          setIsFocusTimerMinimized(false);
        }}
        onOpenBackgroundModal={() => setIsBackgroundModalOpen(true)}
        isTopToolbarVisible={isTopToolbarVisible}
        onToggleTopToolbar={handleToggleTopToolbar}
        currentColor={selectedChalkColor}
        onSelectColor={setSelectedChalkColor}
      />

      {/* Context Menu Modal with All Options */}
      <ContextMenuModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        currentThemeId={activeBoard.themeId}
        onSelectTheme={handleSelectTheme}
        selectedColor={selectedChalkColor}
        onSelectColor={setSelectedChalkColor}
        fontChoice={fontChoice}
        onFontChange={setFontChoice}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        filter={filter}
        onFilterChange={setFilter}
        totalCount={activeBoard.tasks.length}
        completedCount={completedCount}
        freeNotesCount={activeBoard.freeNotes.length}
        strokesCount={strokesCount}
        onClearFreeNotes={handleClearFreeNotes}
        onClearStrokes={handleClearStrokes}
        onEraseCompleted={handleEraseCompleted}
        onResetBoard={handleResetBoard}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        effects={boardEffects}
        onToggleEffect={handleToggleEffect}
        onOpenEffectsModal={() => setIsEffectsModalOpen(true)}
        onOpenXMind={() => setViewMode('xmind')}
        onOpenFocusTimer={() => {
          setIsFocusTimerOpen(true);
          setIsFocusTimerMinimized(false);
        }}
        onOpenBackgroundModal={() => setIsBackgroundModalOpen(true)}
        isTopToolbarVisible={isTopToolbarVisible}
        onToggleTopToolbar={handleToggleTopToolbar}
      />

      {/* Visual Effects Control Modal */}
      <EffectsModal
        isOpen={isEffectsModalOpen}
        onClose={() => setIsEffectsModalOpen(false)}
        effects={boardEffects}
        onToggleEffect={handleToggleEffect}
        onSetAllEffects={handleSetAllEffects}
        onResetEffects={handleResetEffects}
      />

      {/* Focus Timer Tool & Chrome Notifications Modal */}
      <FocusTimerModal
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
        boardTasks={activeBoard.tasks}
        currentColor={selectedChalkColor}
        fontChoice={fontChoice}
        onMarkTaskCompleted={handleToggleTask}
        timerState={focusTimerState}
        onUpdateTimerState={(updates) => {
          if (typeof updates === 'function') {
            setFocusTimerState(updates);
          } else {
            setFocusTimerState((prev) => ({ ...prev, ...updates }));
          }
        }}
        isMinimized={isFocusTimerMinimized}
        onToggleMinimize={() => {
          setIsFocusTimerMinimized((prev) => !prev);
          if (isFocusTimerMinimized) {
            setIsFocusTimerOpen(true);
          }
        }}
      />

      {/* Board Background Texture Studio Modal (Vintage Wood & Classroom Slates) */}
      <BoardBackgroundModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
        activeBoardTitle={activeBoard.title}
        currentCustomBgUrl={activeBoard.customBgUrl}
        currentPresetId={activeBoard.customBgPresetId}
        onApplyBackground={handleApplyBoardBackground}
        onResetBackground={handleResetBoardBackground}
      />
    </div>
  );
}
