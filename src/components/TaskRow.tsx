import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Pencil, 
  Plus, 
  CornerDownLeft, 
  ChevronDown, 
  ChevronRight,
  GripVertical,
  Share2,
  Smile,
  Lock,
  Unlock
} from 'lucide-react';
import { TaskItem, SubTaskItem, FontChoice } from '../types';
import { CHALK_PALETTE } from '../utils/themes';
import { getHandwritingFontClass } from '../utils/fonts';
import { chalkSounds } from '../utils/audio';
import { IconPickerPopover } from './IconPickerPopover';

interface TaskRowProps {
  task: TaskItem;
  index: number;
  totalTasks: number;
  fontChoice: FontChoice;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onSetIcon: (id: string, icon?: string) => void;
  onToggleLock?: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  // Drag and drop reordering
  onDragStartTask: (e: React.DragEvent, index: number) => void;
  onDragOverTask: (e: React.DragEvent, index: number) => void;
  onDropTask: (e: React.DragEvent, index: number) => void;
  // Subtasks actions
  onAddSubtask: (taskId: string, name: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onRenameSubtask: (taskId: string, subtaskId: string, newName: string) => void;
  // Arrow Link connection action (two-way)
  onStartConnect: (taskId: string) => void;
  onSelectConnectTargetTask?: (taskId: string) => void;
  isConnectingThis: boolean;
  isConnectingActive: boolean;
  hasLinks: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  index,
  totalTasks,
  fontChoice,
  onToggle,
  onDelete,
  onRename,
  onSetIcon,
  onToggleLock,
  onMoveUp,
  onMoveDown,
  onDragStartTask,
  onDragOverTask,
  onDropTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onRenameSubtask,
  onStartConnect,
  onSelectConnectTargetTask,
  isConnectingThis,
  isConnectingActive,
  hasLinks,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.name);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Deleting fade-out animation states
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [deletingSubtaskIds, setDeletingSubtaskIds] = useState<Set<string>>(new Set());

  // Icon picker state
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Subtasks UI state
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  // Inline editing for a subtask
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editSubtaskText, setEditSubtaskText] = useState('');
  const editSubtaskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.select();
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  useEffect(() => {
    if (isAddingSubtask && subtaskInputRef.current) {
      subtaskInputRef.current.focus();
    }
  }, [isAddingSubtask]);

  useEffect(() => {
    if (editingSubtaskId && editSubtaskInputRef.current) {
      editSubtaskInputRef.current.focus();
      editSubtaskInputRef.current.select();
    }
  }, [editingSubtaskId]);

  const handleCommitEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== task.name) {
      chalkSounds.playChalkStroke();
      onRename(task.id, trimmed);
    } else {
      setEditText(task.name);
    }
    setIsEditing(false);
  };

  const handleCommitSubtask = () => {
    const trimmed = newSubtaskName.trim();
    if (trimmed) {
      chalkSounds.playChalkStroke();
      onAddSubtask(task.id, trimmed);
      setNewSubtaskName('');
      setIsAddingSubtask(false);
    } else {
      setIsAddingSubtask(false);
    }
  };

  const handleCommitSubtaskEdit = (subtaskId: string) => {
    const trimmed = editSubtaskText.trim();
    if (trimmed) {
      chalkSounds.playChalkStroke();
      onRenameSubtask(task.id, subtaskId, trimmed);
    }
    setEditingSubtaskId(null);
  };

  const handleDeleteTaskWithAnimation = () => {
    if (isDeletingTask) return;
    chalkSounds.playErase();
    setIsDeletingTask(true);
    setTimeout(() => {
      onDelete(task.id);
    }, 380);
  };

  const handleDeleteSubtaskWithAnimation = (subtaskId: string) => {
    if (deletingSubtaskIds.has(subtaskId)) return;
    chalkSounds.playErase();
    setDeletingSubtaskIds((prev) => new Set(prev).add(subtaskId));
    setTimeout(() => {
      onDeleteSubtask(task.id, subtaskId);
      setDeletingSubtaskIds((prev) => {
        const next = new Set(prev);
        next.delete(subtaskId);
        return next;
      });
    }, 380);
  };

  const fontClass = getHandwritingFontClass(fontChoice, 'md');
  const subtaskFontClass = getHandwritingFontClass(fontChoice, 'sm');
  const chalkInfo = CHALK_PALETTE[task.chalkColor] || CHALK_PALETTE.white;

  const subtasks = task.subtasks || [];
  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const isLocked = !!task.locked;

  return (
    <div
      data-task-id={task.id}
      draggable={!isDeletingTask && !isLocked}
      onDragStart={(e) => {
        if (isLocked) {
          e.preventDefault();
          return;
        }
        onDragStartTask(e, index);
      }}
      onDragOver={(e) => onDragOverTask(e, index)}
      onDrop={(e) => onDropTask(e, index)}
      onClick={() => {
        if (isConnectingActive && onSelectConnectTargetTask) {
          onSelectConnectTargetTask(task.id);
        }
      }}
      className={`group/task relative pointer-events-auto flex flex-col py-2 px-2.5 transition-all duration-150 select-none border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.03] rounded-xl ${
        isDeletingTask ? 'chalk-fade-out' : ''
      } ${
        isConnectingActive ? 'cursor-pointer hover:ring-2 hover:ring-amber-300 hover:bg-amber-400/10' : ''
      } ${
        isConnectingThis ? 'ring-2 ring-amber-400 bg-amber-400/15' : ''
      } ${
        isLocked ? 'bg-white/[0.015]' : ''
      }`}
    >
      {/* Main Task Line */}
      <div className="flex items-start justify-between gap-2.5 min-w-0">
        {/* Right side (RTL start): Drag Grip Handle / Lock Icon + Checkbox + Icon + Task Name */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Subtle drag handle or lock indicator */}
          {isLocked ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleLock) {
                  chalkSounds.playTap();
                  onToggleLock(task.id);
                }
              }}
              className="text-amber-400/80 hover:text-amber-300 transition-colors cursor-pointer p-0.5 mt-1 shrink-0"
              title="المهمة مقفلة في مكانها (انقر لفك القفل)"
            >
              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
          ) : (
            <span
              className="text-white/20 group-hover/task:text-white/60 hover:text-white transition-colors cursor-grab active:cursor-grabbing p-0.5 mt-1 shrink-0"
              title="اسحب لإعادة ترتيب المهمة"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </span>
          )}

          {/* Borderless Chalk Checkbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              chalkSounds.playChalkStroke();
              onToggle(task.id);
            }}
            title={task.completed ? 'تعيين كغير مكتملة' : 'تعيين كمكتملة'}
            className={`shrink-0 w-5 h-5 rounded-sm flex items-center justify-center transition-all duration-150 cursor-pointer mt-1 ${
              task.completed
                ? 'bg-white/20 border border-white/60 text-white shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                : 'border border-white/40 hover:border-white/80 hover:bg-white/10'
            }`}
            style={{
              borderColor: task.completed ? undefined : chalkInfo.colorHex,
            }}
          >
            {task.completed && (
              <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
            )}
          </button>

          {/* Task Icon (if set) OR button to choose an icon */}
          <div className="relative shrink-0 mt-0.5">
            {task.icon ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowIconPicker(!showIconPicker);
                }}
                title="تغيير الأيقونة"
                className="text-lg hover:scale-125 transition-transform cursor-pointer leading-none p-0.5"
              >
                {task.icon}
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowIconPicker(!showIconPicker);
                }}
                title="إضافة أيقونة للمهمة"
                className="opacity-0 group-hover/task:opacity-60 hover:!opacity-100 p-0.5 text-white/40 hover:text-amber-300 transition-all cursor-pointer"
              >
                <Smile className="w-4 h-4" />
              </button>
            )}

            {/* Icon Picker Popover */}
            {showIconPicker && (
              <div className="absolute top-7 right-0 z-50">
                <IconPickerPopover
                  currentIcon={task.icon}
                  onSelectIcon={(icon) => {
                    onSetIcon(task.id, icon);
                    setShowIconPicker(false);
                  }}
                  onRemoveIcon={() => {
                    onSetIcon(task.id, undefined);
                    setShowIconPicker(false);
                  }}
                  onClose={() => setShowIconPicker(false)}
                  title="أيقونة المهمة"
                />
              </div>
            )}
          </div>

          {/* Task Name or Inline Edit Textarea */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <textarea
                  ref={editTextareaRef}
                  rows={1}
                  value={editText}
                  onChange={(e) => {
                    setEditText(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onBlur={handleCommitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCommitEdit();
                    }
                    if (e.key === 'Escape') {
                      setEditText(task.name);
                      setIsEditing(false);
                    }
                  }}
                  className={`w-full bg-transparent border-b-2 border-white/40 outline-none leading-relaxed resize-none p-0 m-0 ${fontClass} ${chalkInfo.textClass}`}
                  maxLength={300}
                />
              </div>
            ) : (
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  onClick={(e) => {
                    if (isConnectingActive && onSelectConnectTargetTask) {
                      onSelectConnectTargetTask(task.id);
                      return;
                    }
                    e.stopPropagation();
                    chalkSounds.playChalkStroke();
                    onToggle(task.id);
                  }}
                  title="انقر للإنجاز، أو انقر مرتين للتعديل"
                  className={`select-none cursor-pointer transition-all duration-150 leading-relaxed whitespace-pre-wrap break-words ${fontClass} ${chalkInfo.textClass} ${chalkInfo.glowClass} ${
                    task.completed ? 'chalk-strikethrough opacity-45' : ''
                  }`}
                >
                  {task.name}
                </span>

                {/* Subtasks summary indicator */}
                {subtasks.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSubtasks(!showSubtasks);
                    }}
                    className="flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                    title="عرض/إخفاء القائمة الفرعية"
                  >
                    {showSubtasks ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    <span>
                      {completedSubtasksCount}/{subtasks.length}
                    </span>
                  </button>
                )}

                {/* Indicator if task has connected arrow link */}
                {hasLinks && (
                  <span
                    className="text-[10px] text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 shrink-0"
                    title="مرتبطة بملاحظة حرة عبر سهم وصلة"
                  >
                    ↗ متصلة
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Left side (RTL end): Floating Quick Actions on Hover */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/task:opacity-100 transition-opacity duration-150 mt-1">
          {/* Lock / Unlock Toggle Button */}
          {onToggleLock && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                chalkSounds.playTap();
                onToggleLock(task.id);
              }}
              title={isLocked ? 'فك قفل المهمة والسماح بسحبها' : 'قفل المهمة في مكانها لمنع سحبها بالخطأ'}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isLocked
                  ? 'text-amber-300 bg-amber-400/20'
                  : 'text-white/40 hover:text-amber-300 hover:bg-white/10'
              }`}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Arrow / Link connector button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              chalkSounds.playTap();
              onStartConnect(task.id);
            }}
            title="رسم سهم ووصلة مع كتابة حرة على السبورة"
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
              isConnectingThis
                ? 'bg-amber-400 text-black font-semibold'
                : 'text-amber-300/80 hover:text-amber-300 hover:bg-white/10'
            }`}
          >
            <Share2 className="w-3 h-3" />
            <span className="text-[11px] hidden sm:inline">سهم</span>
          </button>

          {/* Add Subtask Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              chalkSounds.playTap();
              setIsAddingSubtask(true);
              setShowSubtasks(true);
            }}
            title="إضافة قائمة فرعية / مهمة تابعة"
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-white/60 hover:text-amber-300 hover:bg-white/10 text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span className="text-[11px]">فرعية</span>
          </button>

          {index > 0 && !isLocked && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                chalkSounds.playTap();
                onMoveUp(index);
              }}
              title="تحريك لأعلى"
              className="p-1 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}

          {index < totalTasks - 1 && !isLocked && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                chalkSounds.playTap();
                onMoveDown(index);
              }}
              title="تحريك لأسفل"
              className="p-1 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          {!isEditing && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                chalkSounds.playTap();
                setIsEditing(true);
              }}
              title="تعديل اسم المهمة"
              className="p-1 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTaskWithAnimation();
            }}
            title="حذف المهمة وكل تفرعاتها"
            className="p-1 text-red-300/40 hover:text-red-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subtasks Section (Indented Branch) */}
      {(subtasks.length > 0 || isAddingSubtask) && showSubtasks && (
        <div className="mr-8 mt-2 pr-3 border-r-2 border-white/20 flex flex-col gap-1.5">
          {/* Subtasks List */}
          {subtasks.map((subtask) => {
            const isEditingThisSub = editingSubtaskId === subtask.id;
            const isDeletingThisSub = deletingSubtaskIds.has(subtask.id);

            return (
              <div
                key={subtask.id}
                className={`group/subtask flex items-center justify-between gap-2 py-1 px-1.5 rounded-lg hover:bg-white/[0.04] transition-colors ${
                  isDeletingThisSub ? 'chalk-fade-out' : ''
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      chalkSounds.playTap();
                      onToggleSubtask(task.id, subtask.id);
                    }}
                    title={subtask.completed ? 'تعيين كغير منجزة' : 'تعيين كمنجزة'}
                    className={`shrink-0 w-4 h-4 rounded-xs flex items-center justify-center transition-all cursor-pointer ${
                      subtask.completed
                        ? 'bg-white/20 border border-white/50 text-white'
                        : 'border border-white/30 hover:border-white/70'
                    }`}
                  >
                    {subtask.completed && (
                      <Check className="w-3 h-3 stroke-[3] text-white" />
                    )}
                  </button>

                  {isEditingThisSub ? (
                    <input
                      ref={editSubtaskInputRef}
                      type="text"
                      value={editSubtaskText}
                      onChange={(e) => setEditSubtaskText(e.target.value)}
                      onBlur={() => handleCommitSubtaskEdit(subtask.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCommitSubtaskEdit(subtask.id);
                        if (e.key === 'Escape') setEditingSubtaskId(null);
                      }}
                      className={`w-full bg-transparent border-b border-white/40 outline-none leading-none p-0 m-0 ${subtaskFontClass} text-white/90`}
                      maxLength={200}
                    />
                  ) : (
                    <span
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingSubtaskId(subtask.id);
                        setEditSubtaskText(subtask.name);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        chalkSounds.playTap();
                        onToggleSubtask(task.id, subtask.id);
                      }}
                      className={`cursor-pointer leading-tight transition-all whitespace-pre-wrap break-words ${subtaskFontClass} ${
                        subtask.completed
                          ? 'chalk-strikethrough text-white/40'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      {subtask.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover/subtask:opacity-100 transition-opacity">
                  {!isEditingThisSub && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSubtaskId(subtask.id);
                        setEditSubtaskText(subtask.name);
                      }}
                      title="تعديل المهمة الفرعية"
                      className="p-0.5 text-white/30 hover:text-white transition-colors cursor-pointer"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubtaskWithAnimation(subtask.id);
                    }}
                    title="حذف المهمة الفرعية"
                    className="p-0.5 text-red-300/40 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* New Subtask Input Form */}
          {isAddingSubtask ? (
            <div className="flex items-center gap-1.5 py-1 px-1.5 bg-white/[0.03] rounded-lg border border-white/10">
              <input
                ref={subtaskInputRef}
                type="text"
                value={newSubtaskName}
                onChange={(e) => setNewSubtaskName(e.target.value)}
                onBlur={handleCommitSubtask}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCommitSubtask();
                  }
                  if (e.key === 'Escape') {
                    setNewSubtaskName('');
                    setIsAddingSubtask(false);
                  }
                }}
                placeholder="اكتب اسم المهمة الفرعية..."
                className={`w-full bg-transparent border-none outline-none leading-none p-0 m-0 ${subtaskFontClass} text-white/90 placeholder:text-white/30`}
                maxLength={200}
              />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCommitSubtask();
                }}
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
                title="إضافة (Enter)"
              >
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                chalkSounds.playTap();
                setIsAddingSubtask(true);
              }}
              className="flex items-center gap-1 py-1 text-[11px] text-white/40 hover:text-amber-300 transition-colors cursor-pointer self-start"
            >
              <Plus className="w-3 h-3" />
              <span>إضافة مهمة فرعية جديدة...</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
