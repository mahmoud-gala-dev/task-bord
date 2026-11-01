import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  FolderSync, 
  Download, 
  Sparkles, 
  Layers, 
  ChevronDown, 
  Palette, 
  ListTodo, 
  Edit3, 
  CornerDownLeft,
  X,
  HelpCircle
} from 'lucide-react';
import { TaskItem, ChalkColor, FontChoice, XMindNode, XMindBoxStyle } from '../types';
import { CHALK_PALETTE } from '../utils/themes';
import { getHandwritingFontClass } from '../utils/fonts';
import { chalkSounds } from '../utils/audio';
import { ChalkHandDrawnBox } from './ChalkHandDrawnBox';
import { 
  computeMindMapLayout, 
  createNewXMindNode, 
  updateNodeInTree, 
  deleteNodeFromTree, 
  addChildToNode, 
  addSiblingToNode, 
  convertTasksToXMind, 
  convertXMindToTasks, 
  XMIND_TEMPLATES 
} from '../utils/xmindHelpers';

interface ChalkXMindMapProps {
  initialRoot?: XMindNode;
  boardTitle: string;
  boardTasks: TaskItem[];
  fontChoice: FontChoice;
  currentColor: ChalkColor;
  onUpdateTree?: (root: XMindNode) => void;
  onSyncToTasks?: (tasks: TaskItem[]) => void;
  onToggleTaskCompletion?: (taskId: string, subtaskId?: string) => void;
  onCloseView?: () => void;
}

export const ChalkXMindMap: React.FC<ChalkXMindMapProps> = ({
  initialRoot,
  boardTitle,
  boardTasks,
  fontChoice,
  currentColor,
  onUpdateTree,
  onSyncToTasks,
  onToggleTaskCompletion,
  onCloseView,
}) => {
  // شجرة الخريطة الذهنية
  const [root, setRoot] = useState<XMindNode>(() => {
    if (initialRoot) return initialRoot;
    if (boardTasks && boardTasks.length > 0) {
      return convertTasksToXMind(boardTasks, boardTitle);
    }
    return XMIND_TEMPLATES.projectLaunch.getTree(boardTitle);
  });

  // العقدة المحددة حالياً
  const [selectedNodeId, setSelectedNodeId] = useState<string>(root.id);

  // حالة التعديل المباشر للنص
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // قوائم منبثقة للتحكم السريع
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState<boolean>(false);
  const [isBoxStyleMenuOpen, setIsBoxStyleMenuOpen] = useState<boolean>(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState<boolean>(false);
  const [showHelpBanner, setShowHelpBanner] = useState<boolean>(true);

  // رسائل التنبيه والمزامنة
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // تحريك وتكبير مساحة العمل الخاصة بالخريطة
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // حساب الإحداثيات والخطوط التوصيلية المقوسة
  const { nodes: layoutNodes, connectors, bounds } = useMemo(() => {
    return computeMindMapLayout(root, 0, 0);
  }, [root]);

  // إشعار الأب بالتغيير
  const updateTreeAndNotify = useCallback((newRoot: XMindNode) => {
    setRoot(newRoot);
    if (onUpdateTree) {
      onUpdateTree(newRoot);
    }
  }, [onUpdateTree]);

  // توسط الخريطة تلقائياً في الشاشة
  const handleCenterView = useCallback(() => {
    chalkSounds.playTap();
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({ x: rect.width / 2, y: rect.height / 2 });
      setZoom(1);
    }
  }, []);

  // تمركز أولي عند الفتح
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  // تركيز حقل الإدخال عند بدء التعديل
  useEffect(() => {
    if (editingNodeId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingNodeId]);

  // إخفاء إشعار المزامنة بعد 3.5 ثوانٍ
  useEffect(() => {
    if (syncToast) {
      const timer = setTimeout(() => setSyncToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [syncToast]);

  // العقدة المحددة
  const selectedNode = useMemo(() => {
    const found = layoutNodes.find((n) => n.node.id === selectedNodeId);
    return found ? found.node : null;
  }, [layoutNodes, selectedNodeId]);

  // بدء التعديل المباشر
  const handleStartEdit = (node: XMindNode) => {
    chalkSounds.playTap();
    setEditingNodeId(node.id);
    setEditText(node.text);
  };

  // حفظ التعديل
  const handleCommitEdit = () => {
    if (!editingNodeId) return;
    const trimmed = editText.trim();
    if (trimmed) {
      chalkSounds.playChalkStroke();
      const updated = updateNodeInTree(root, editingNodeId, (n) => ({
        ...n,
        text: trimmed,
      }));
      updateTreeAndNotify(updated);
    }
    setEditingNodeId(null);
  };

  // إلغاء التعديل
  const handleCancelEdit = () => {
    setEditingNodeId(null);
  };

  // إضافة فرع فرعي مباشر لعقدة محددة
  const handleAddChildTo = (targetParentId: string) => {
    chalkSounds.playChalkStroke();
    const parent = layoutNodes.find((n) => n.node.id === targetParentId)?.node;
    const newChild = createNewXMindNode(
      'فكرة فرعية جديدة',
      parent?.color || currentColor,
      undefined,
      parent?.boxStyle || 'sketch'
    );
    const updated = addChildToNode(root, targetParentId, newChild);
    updateTreeAndNotify(updated);
    setSelectedNodeId(newChild.id);
    setEditingNodeId(newChild.id);
    setEditText(newChild.text);
  };

  // إضافة فرع موازي في نفس المستوى
  const handleAddSiblingTo = (targetNodeId: string) => {
    if (targetNodeId === root.id) {
      handleAddChildTo(targetNodeId);
      return;
    }
    chalkSounds.playChalkStroke();
    const current = layoutNodes.find((n) => n.node.id === targetNodeId)?.node;
    const newSibling = createNewXMindNode(
      'فرع جديد',
      current?.color || currentColor,
      undefined,
      current?.boxStyle || 'sketch'
    );
    const updated = addSiblingToNode(root, targetNodeId, newSibling);
    updateTreeAndNotify(updated);
    setSelectedNodeId(newSibling.id);
    setEditingNodeId(newSibling.id);
    setEditText(newSibling.text);
  };

  // حذف الفرع المحدد
  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === root.id) return;
    chalkSounds.playErase();
    const updated = deleteNodeFromTree(root, nodeId);
    updateTreeAndNotify(updated);
    setSelectedNodeId(root.id);
    setEditingNodeId(null);
  };

  // طوي أو توسيع فروع العقدة
  const handleToggleCollapse = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    chalkSounds.playTap();
    const updated = updateNodeInTree(root, nodeId, (n) => ({
      ...n,
      collapsed: !n.collapsed,
    }));
    updateTreeAndNotify(updated);
  };

  // تبديل إنجاز المهمة المرتبطة
  const handleToggleCompletion = (node: XMindNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    chalkSounds.playChalkStroke();
    const nextCompleted = !node.completed;
    const updated = updateNodeInTree(root, node.id, (n) => ({
      ...n,
      completed: nextCompleted,
    }));
    updateTreeAndNotify(updated);

    if (onToggleTaskCompletion) {
      if (node.subtaskId && node.taskId) {
        onToggleTaskCompletion(node.taskId, node.subtaskId);
      } else if (node.taskId) {
        onToggleTaskCompletion(node.taskId);
      }
    }
  };

  // تغيير لون طبشور الفرع
  const handleChangeColor = (color: ChalkColor) => {
    if (!selectedNodeId) return;
    chalkSounds.playTap();
    const updated = updateNodeInTree(root, selectedNodeId, (n) => ({
      ...n,
      color,
    }));
    updateTreeAndNotify(updated);
    setIsColorMenuOpen(false);
  };

  // تغيير نمط رسم البوكس اليدوي
  const handleChangeBoxStyle = (boxStyle: XMindBoxStyle) => {
    if (!selectedNodeId) return;
    chalkSounds.playTap();
    const updated = updateNodeInTree(root, selectedNodeId, (n) => ({
      ...n,
      boxStyle,
    }));
    updateTreeAndNotify(updated);
    setIsBoxStyleMenuOpen(false);
  };

  // استيراد ومزامنة المهام من الصبورة
  const handleSyncFromBoard = () => {
    chalkSounds.playChalkStroke();
    const freshTree = convertTasksToXMind(boardTasks, boardTitle);
    updateTreeAndNotify(freshTree);
    setSelectedNodeId(freshTree.id);
    setSyncToast('تم استيراد كافة مهام وقوائم الصبورة بنجاح إلى شجرة XMind 🧠');
  };

  // تصدير الفروع كمهام في الصبورة
  const handleExportToBoard = () => {
    if (!onSyncToTasks) return;
    chalkSounds.playChalkStroke();
    const generatedTasks = convertXMindToTasks(root);
    onSyncToTasks(generatedTasks);
    setSyncToast(`تم تصدير (${generatedTasks.length}) مهمة رئيسية وتفريعاتها إلى الصبورة بنجاح! 🎯`);
  };

  // تطبيق قالب جاهز
  const handleApplyTemplate = (templateKey: string) => {
    chalkSounds.playTap();
    const tmpl = XMIND_TEMPLATES[templateKey];
    if (tmpl) {
      const newTree = tmpl.getTree(boardTitle);
      updateTreeAndNotify(newTree);
      setSelectedNodeId(newTree.id);
      setIsTemplateMenuOpen(false);
      setSyncToast(`تم تحميل قالب: ${tmpl.title}`);
    }
  };

  // اختصارات لوحة المفاتيح
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingNodeId) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCommitEdit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleCancelEdit();
        }
        return;
      }

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        handleAddChildTo(selectedNodeId);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleAddSiblingTo(selectedNodeId);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId && selectedNodeId !== root.id) {
          e.preventDefault();
          handleDeleteNode(selectedNodeId);
        }
      } else if (e.key === ' ' || e.key === 'F2') {
        e.preventDefault();
        if (selectedNode) {
          handleStartEdit(selectedNode);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingNodeId, selectedNodeId, root, selectedNode, editText]);

  // تحريك مساحة العمل بالسحب (Pan)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-xmind-interactive]')) {
      return;
    }

    setIsDraggingCanvas(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingCanvas) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingCanvas) {
      setIsDraggingCanvas(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // تكبير وتصغير بالعجلة
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(2.5, Math.max(0.35, prev * zoomFactor)));
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-full h-full flex-1 overflow-hidden select-none cursor-grab active:cursor-grabbing"
      dir="rtl"
    >
      {/* Toast Notification Banner */}
      {syncToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-amber-400 text-black px-4 py-2 rounded-full font-bold shadow-2xl animate-fade-in text-xs border border-amber-300">
          <Sparkles className="w-4 h-4 text-black shrink-0" />
          <span>{syncToast}</span>
          <button 
            type="button" 
            onClick={() => setSyncToast(null)} 
            className="p-0.5 hover:bg-black/10 rounded-full cursor-pointer ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP FLOATING PRIMARY CONTROL BAR */}
      <div 
        data-xmind-interactive="true"
        className="absolute top-3 left-4 right-4 z-40 flex items-center justify-between gap-2 pointer-events-auto flex-wrap sm:flex-nowrap"
      >
        {/* Left: Close/Back to Tasks, Add Branch Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onCloseView && (
            <button
              type="button"
              onClick={() => {
                chalkSounds.playTap();
                onCloseView();
              }}
              title="العودة إلى عرض قائمة المهام العادية"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 text-xs font-semibold backdrop-blur-md transition-all shadow-xl hover:scale-105 cursor-pointer"
            >
              <ListTodo className="w-3.5 h-3.5 text-amber-300" />
              <span>قائمة المهام 📋</span>
            </button>
          )}

          {/* زر إضافة فرع رئيسي كبير وبارز */}
          <button
            type="button"
            onClick={() => handleAddChildTo(selectedNodeId || root.id)}
            title="إضافة فرع جديد مرتبط بالعقدة المحددة (أو اضغط Tab)"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ إضافة فرع</span>
            <span className="text-[10px] opacity-75 font-mono">(Tab)</span>
          </button>

          {/* إضافة فرع موازي إذا لم يكن الجذر */}
          {selectedNodeId !== root.id && (
            <button
              type="button"
              onClick={() => handleAddSiblingTo(selectedNodeId)}
              title="إضافة فرع موازي في نفس المستوى (أو اضغط Enter)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>فرع موازي</span>
              <span className="text-[10px] text-cyan-300/70 font-mono">(Enter)</span>
            </button>
          )}

          {/* Sync from Board Tasks */}
          <button
            type="button"
            onClick={handleSyncFromBoard}
            title="تحديث واستيراد مهام الصبورة الحالية كشجرة خريطة ذهن"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-cyan-200 border border-cyan-400/30 text-xs font-medium backdrop-blur-md transition-all shadow-lg hover:scale-105 cursor-pointer"
          >
            <FolderSync className="w-3.5 h-3.5" />
            <span className="hidden md:inline">مزامنة مهام الصبورة</span>
          </button>

          {/* Export XMind branches to Board Tasks */}
          <button
            type="button"
            onClick={handleExportToBoard}
            title="تحويل وتصدير كافة فروع هذه الخريطة إلى مهام بالصبورة"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-emerald-300 border border-emerald-400/30 text-xs font-medium backdrop-blur-md transition-all shadow-lg hover:scale-105 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">تطبيق الفروع كمهام</span>
          </button>
        </div>

        {/* Center: Template Picker & Board Title */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              chalkSounds.playTap();
              setIsTemplateMenuOpen((prev) => !prev);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-amber-300 border border-amber-400/40 text-xs font-bold backdrop-blur-md shadow-xl transition-all hover:scale-105 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>قوالب XMind 🧠</span>
            <ChevronDown className="w-3 h-3 text-white/60" />
          </button>

          {/* Dropdown Menu */}
          {isTemplateMenuOpen && (
            <div className="absolute top-full mt-2 right-0 w-72 bg-neutral-900/95 border border-white/20 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-1 text-right">
              <div className="text-[11px] text-white/50 px-2 py-1 font-bold border-b border-white/10 mb-1">
                اختر نموذج خريطة ذهن جاهز:
              </div>
              {Object.entries(XMIND_TEMPLATES).map(([key, tmpl]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleApplyTemplate(key)}
                  className="flex flex-col text-right p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <span className="text-xs font-bold text-white group-hover:text-amber-300">
                    {tmpl.title}
                  </span>
                  <span className="text-[10px] text-white/60 leading-tight mt-0.5">
                    {tmpl.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Zoom & Reset Controls */}
        <div className="flex items-center gap-1 bg-black/60 border border-white/20 backdrop-blur-md rounded-2xl p-1 shadow-2xl text-white shrink-0">
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(0.35, prev * 0.88))}
            title="تصغير الخريطة"
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono px-1 py-0.5 text-white/80 min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setZoom((prev) => Math.min(2.5, prev * 1.14))}
            title="تكبير الخريطة"
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCenterView}
            title="إعادة ضبط وتوسيط الخريطة"
            className="p-1.5 rounded-xl text-amber-300 hover:bg-white/10 transition-colors cursor-pointer ml-0.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* QUICK HELPER HINT BANNER AT TOP RIGHT */}
      {showHelpBanner && (
        <div 
          data-xmind-interactive="true"
          className="absolute top-16 right-4 z-30 hidden sm:flex items-center gap-2 bg-black/75 border border-white/15 px-3 py-1.5 rounded-xl text-white/70 text-xs backdrop-blur-md shadow-lg"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>انقر على زر <strong>(+)</strong> بجانب أي بوكس لإضافة فرع فوراً، أو انقر مرتين لتعديل النص</span>
          <button
            type="button"
            onClick={() => setShowHelpBanner(false)}
            className="p-0.5 hover:bg-white/10 rounded-md text-white/40 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* INFINITE PANNABLE/ZOOMABLE CHALK MIND MAP CANVAS */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {/* SVG LAYER: Hand-drawn Curved Chalk Connectors */}
        <svg
          className="absolute overflow-visible pointer-events-none"
          style={{
            top: 0,
            left: 0,
            width: '1px',
            height: '1px',
          }}
        >
          <defs>
            <filter id="chalkBranchFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="currentColor" floodOpacity="0.45" />
            </filter>
          </defs>

          {connectors.map((conn) => {
            const dx = Math.abs(conn.toX - conn.fromX) * 0.52;
            const pathData = `M ${conn.fromX} ${conn.fromY} C ${
              conn.side === 'right' ? conn.fromX + dx : conn.fromX - dx
            } ${conn.fromY}, ${
              conn.side === 'right' ? conn.toX - dx : conn.toX + dx
            } ${conn.toY}, ${conn.toX} ${conn.toY}`;

            const colorObj = CHALK_PALETTE[conn.color] || CHALK_PALETTE.yellow;

            return (
              <g key={conn.id} className={colorObj.textClass}>
                {/* خط الطبشور المنحني والمميز */}
                <path
                  d={pathData}
                  className="chalk-xmind-path"
                  stroke={colorObj.colorHex}
                  strokeWidth="2.8"
                  strokeDasharray="9 2"
                  opacity="0.85"
                  filter="url(#chalkBranchFilter)"
                />
              </g>
            );
          })}
        </svg>

        {/* HTML NODES LAYER: Hand-drawn Sketched Chalk Boxes */}
        <div className="relative w-0 h-0 overflow-visible pointer-events-auto">
          {layoutNodes.map(({ node, x, y, width, height, side }) => {
            const isRoot = side === 'root';
            const isSelected = selectedNodeId === node.id;
            const isEditing = editingNodeId === node.id;
            const colorObj = CHALK_PALETTE[node.color || 'yellow'] || CHALK_PALETTE.yellow;
            const hasChildren = node.children && node.children.length > 0;
            const fontClass = getHandwritingFontClass(fontChoice, isRoot ? 'lg' : 'md');
            const boxStyle = node.boxStyle || 'sketch';

            return (
              <div
                key={node.id}
                data-xmind-interactive="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(node.id);
                  chalkSounds.playTap();
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit(node);
                }}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                  width: `${width}px`,
                  minHeight: `${height}px`,
                  color: colorObj.colorHex,
                  zIndex: isSelected ? 35 : isRoot ? 25 : 20,
                }}
                className="group relative flex items-center justify-center p-2.5 transition-transform duration-150 cursor-pointer"
              >
                {/* 1. بوكس الرسم اليدوي بالطبشور الفعلي (ChalkHandDrawnBox) */}
                <ChalkHandDrawnBox
                  nodeId={node.id}
                  width={width}
                  height={height}
                  colorHex={colorObj.colorHex}
                  isSelected={isSelected}
                  isRoot={isRoot}
                  boxStyle={boxStyle}
                />

                {/* 2. شريط الأدوات المصغر الملتصق بالعقدة مباشرة عند تحديدها */}
                {isSelected && !isEditing && (
                  <div
                    data-xmind-interactive="true"
                    className="absolute -top-11 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-black/90 border border-white/30 rounded-xl px-2 py-1 shadow-2xl backdrop-blur-xl animate-fade-in pointer-events-auto text-xs whitespace-nowrap"
                  >
                    {/* إضافة فرع فرعي */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddChildTo(node.id);
                      }}
                      title="إضافة فرع فرعي من هذا البوكس (Tab)"
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-400 text-black font-bold hover:bg-amber-300 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>+ فرع</span>
                    </button>

                    {/* إضافة فرع موازي */}
                    {!isRoot && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSiblingTo(node.id);
                        }}
                        title="إضافة فرع موازي في نفس المستوى (Enter)"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <CornerDownLeft className="w-3 h-3 text-cyan-300" />
                        <span>موازي</span>
                      </button>
                    )}

                    {/* تعديل النص */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(node);
                      }}
                      title="تعديل النص (نقرتين أو مسافة)"
                      className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/15 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-yellow-300" />
                    </button>

                    {/* تبديل الإنجاز */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleCompletion(node, e)}
                      title={node.completed ? 'إلغاء الإنجاز' : 'تحديد كمكتمل'}
                      className={`p-1 rounded-lg cursor-pointer ${
                        node.completed ? 'text-emerald-300 bg-emerald-500/20' : 'text-white/80 hover:bg-white/15'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {/* تغيير نمط الرسم اليدوي */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          chalkSounds.playTap();
                          setIsBoxStyleMenuOpen((prev) => !prev);
                          setIsColorMenuOpen(false);
                        }}
                        title="تغيير مظهر الرسم اليدوي للبوكس"
                        className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/15 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-pink-300" />
                      </button>

                      {isBoxStyleMenuOpen && (
                        <div className="absolute bottom-full mb-1.5 right-0 bg-neutral-900 border border-white/20 rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-1 w-44">
                          {[
                            { id: 'sketch', label: 'مستطيل مرسوم باليد ✏️' },
                            { id: 'underline', label: 'تسطير طبشوري باليد ✍️' },
                            { id: 'bracket', label: 'أقواس كتابية [ ]' },
                            { id: 'cloud', label: 'سحابة أفكار متموجة ☁️' },
                          ].map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChangeBoxStyle(st.id as XMindBoxStyle);
                              }}
                              className={`text-right px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                node.boxStyle === st.id
                                  ? 'bg-amber-400/20 text-amber-300 font-bold'
                                  : 'text-white/80 hover:bg-white/10'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* تغيير لون الطبشور */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          chalkSounds.playTap();
                          setIsColorMenuOpen((prev) => !prev);
                          setIsBoxStyleMenuOpen(false);
                        }}
                        title="تغيير لون طبشور هذا الفرع"
                        className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/15 cursor-pointer"
                      >
                        <Palette className="w-3.5 h-3.5 text-cyan-300" />
                      </button>

                      {isColorMenuOpen && (
                        <div className="absolute bottom-full mb-1.5 right-0 bg-neutral-900 border border-white/20 rounded-xl p-2 shadow-2xl z-50 flex items-center gap-1.5">
                          {(Object.keys(CHALK_PALETTE) as ChalkColor[]).map((cKey) => {
                            const item = CHALK_PALETTE[cKey];
                            return (
                              <button
                                key={cKey}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChangeColor(cKey);
                                }}
                                title={item.name}
                                className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${item.bgDot} ${
                                  node.color === cKey ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110 opacity-70 hover:opacity-100'
                                }`}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* حذف الفرع */}
                    {!isRoot && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                        title="حذف الفرع وتفريعاته (Delete)"
                        className="p-1 rounded-lg text-red-400 hover:bg-red-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* 3. زر إضافة فرع المباشر الملتصق بحافة البوكس (+) Handlers */}
                {/* للعقدة الرئيسية (Root): زر فرع على اليمين وزر فرع على اليسار */}
                {isRoot && (
                  <>
                    {/* إضافة فرع يمين */}
                    <button
                      type="button"
                      data-xmind-interactive="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddChildTo(node.id);
                      }}
                      title="إضافة فرع رئيسي جديد"
                      className="absolute -right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shadow-lg hover:scale-125 transition-transform z-40 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>

                    {/* إضافة فرع يسار */}
                    <button
                      type="button"
                      data-xmind-interactive="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddChildTo(node.id);
                      }}
                      title="إضافة فرع رئيسي جديد"
                      className="absolute -left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shadow-lg hover:scale-125 transition-transform z-40 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </>
                )}

                {/* للعقد الفرعية: زر (+) على الطرف الخارجي المتجه للتفريعات */}
                {!isRoot && (
                  <button
                    type="button"
                    data-xmind-interactive="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddChildTo(node.id);
                    }}
                    title="إضافة فرع فرعي مباشر من هذا البوكس"
                    className={`absolute ${
                      side === 'right' ? '-right-3.5' : '-left-3.5'
                    } top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold shadow-lg opacity-80 group-hover:opacity-100 hover:scale-125 transition-all z-40 cursor-pointer`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                )}

                {/* محتوى النص والتفاعل الداخلي */}
                <div className="relative z-10 flex items-center justify-center gap-2 w-full text-center px-1">
                  {/* مربع الاختيار اليدوي إذا كانت مهمة */}
                  {(node.taskId || node.completed !== undefined) && (
                    <button
                      type="button"
                      onClick={(e) => handleToggleCompletion(node, e)}
                      title={node.completed ? 'مكتملة' : 'غير مكتملة'}
                      className={`chalk-xmind-checkbox shrink-0 ${
                        node.completed ? 'bg-white/20' : ''
                      }`}
                    >
                      {node.completed && <Check className="w-3.5 h-3.5 text-current stroke-[3]" />}
                    </button>
                  )}

                  {/* رمز العقدة إذا وجد */}
                  {node.icon && (
                    <span className="text-base select-none shrink-0">{node.icon}</span>
                  )}

                  {/* حقل التعديل المباشر أو عرض النص بالخط اليدوي الأصيل */}
                  {isEditing ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={handleCommitEdit}
                      className={`bg-transparent outline-none border-b-2 border-current text-center font-bold px-1 py-0.5 text-current ${fontClass}`}
                      style={{ minWidth: '70px', maxWidth: '300px' }}
                      dir="auto"
                    />
                  ) : (
                    <span
                      className={`text-center leading-relaxed transition-all ${fontClass} ${colorObj.glowClass} ${
                        node.completed ? 'chalk-strikethrough opacity-60' : ''
                      }`}
                    >
                      {node.text}
                    </span>
                  )}
                </div>

                {/* مؤشر طوي وتوسيع الفروع التابعة */}
                {hasChildren && !isRoot && (
                  <button
                    type="button"
                    data-xmind-interactive="true"
                    onClick={(e) => handleToggleCollapse(node.id, e)}
                    title={node.collapsed ? 'فتح الفروع التابعة' : 'طوي الفروع التابعة'}
                    className={`absolute ${
                      side === 'right' ? '-left-3' : '-right-3'
                    } top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-neutral-900 border border-current text-current flex items-center justify-center text-[10px] font-bold shadow-md hover:scale-125 transition-transform z-30 cursor-pointer`}
                  >
                    {node.collapsed ? `+${node.children!.length}` : '−'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM HINTS BAR */}
      <div 
        data-xmind-interactive="true"
        className="absolute bottom-2 right-4 left-4 z-20 flex items-center justify-between text-[11px] text-white/40 pointer-events-none flex-wrap"
      >
        <span>
          * انقر على زر <strong>(+)</strong> بجانب أي بوكس لإضافة فرع فرعي • اضغط <strong>Tab</strong> للفرع الفرعي و <strong>Enter</strong> للفرع الموازي
        </span>
        <span className="hidden sm:inline">
          اسحب مساحة العمل لتحريك الخريطة • عجلة الفأرة للتكبير والتصغير
        </span>
      </div>
    </div>
  );
};
