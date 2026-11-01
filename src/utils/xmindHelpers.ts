import { TaskItem, ChalkColor, XMindNode, XMindBoxStyle } from '../types';

export interface LayoutNode {
  node: XMindNode;
  x: number;
  y: number;
  width: number;
  height: number;
  side: 'root' | 'left' | 'right';
  parentId: string | null;
}

export interface LayoutConnector {
  id: string;
  fromId: string;
  toId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: ChalkColor;
  side: 'left' | 'right';
}

// إنشاء عقدة ذهن جديدة
export function createNewXMindNode(
  text: string = 'فرع جديد',
  color: ChalkColor = 'yellow',
  icon?: string,
  boxStyle: XMindBoxStyle = 'sketch'
): XMindNode {
  return {
    id: `xnode-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    color,
    icon,
    boxStyle,
    children: [],
  };
}

// تحويل مهام الصبورة الحالية إلى خريطة XMind متكاملة
export function convertTasksToXMind(tasks: TaskItem[], boardTitle: string = 'لوحة المهام'): XMindNode {
  const rootNode: XMindNode = {
    id: 'xmind-root-main',
    text: boardTitle || 'خطة المشروع والمهام',
    color: 'yellow',
    icon: '🎯',
    boxStyle: 'sketch',
    children: [],
  };

  tasks.forEach((task) => {
    const taskNode: XMindNode = {
      id: `xnode-task-${task.id}`,
      taskId: task.id,
      text: task.name,
      color: task.chalkColor || 'white',
      icon: task.icon,
      completed: task.completed,
      boxStyle: 'sketch',
      children: [],
    };

    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach((sub) => {
        taskNode.children?.push({
          id: `xnode-sub-${sub.id}`,
          taskId: task.id,
          subtaskId: sub.id,
          text: sub.name,
          color: task.chalkColor || 'white',
          completed: sub.completed,
          boxStyle: 'underline',
          children: [],
        });
      });
    }

    rootNode.children?.push(taskNode);
  });

  return rootNode;
}

// تحويل فروع خريطة XMind إلى قائمة مهام صبورة رسمية
export function convertXMindToTasks(root: XMindNode): TaskItem[] {
  if (!root.children || root.children.length === 0) return [];

  return root.children.map((child, idx) => {
    return {
      id: child.taskId || `task-from-xmind-${Date.now()}-${idx}`,
      name: child.text,
      completed: !!child.completed,
      chalkColor: child.color || 'yellow',
      icon: child.icon || (child.children && child.children.length > 0 ? '📁' : '⚡'),
      createdAt: Date.now() - (root.children!.length - idx) * 1000,
      subtasks: child.children?.map((sub, sIdx) => ({
        id: sub.subtaskId || `sub-from-xmind-${Date.now()}-${sIdx}`,
        name: sub.text,
        completed: !!sub.completed,
        createdAt: Date.now() - (child.children!.length - sIdx) * 1000,
      })),
    };
  });
}

// قوالب خريطة XMind جاهزة تخدم أهداف المشاريع المختلفة
export const XMIND_TEMPLATES: Record<string, { title: string; description: string; getTree: (boardTitle?: string) => XMindNode }> = {
  projectLaunch: {
    title: 'خطة إطلاق وتطوير مشروع 🚀',
    description: 'تقسيم هيكلي شامل لمراحل إطلاق المشروع من الرؤية إلى التنفيذ والتقييم',
    getTree: () => ({
      id: 'template-launch',
      text: 'خطة إطلاق المشروع 🚀',
      color: 'yellow',
      icon: '🎯',
      boxStyle: 'sketch',
      children: [
        {
          id: 'p-1',
          text: 'التخطيط والأبحاث 🔍',
          color: 'cyan',
          boxStyle: 'sketch',
          children: [
            { id: 'p-1-1', text: 'تحديد أهداف ومخرجات المشروع', color: 'cyan', boxStyle: 'underline', completed: true },
            { id: 'p-1-2', text: 'دراسة احتياجات المستخدمين', color: 'cyan', boxStyle: 'underline', completed: true },
            { id: 'p-1-3', text: 'تحليل المنافسين والميزات', color: 'cyan', boxStyle: 'underline', completed: false },
          ]
        },
        {
          id: 'p-2',
          text: 'التصميم وتجربة المستخدم 🎨',
          color: 'pink',
          boxStyle: 'sketch',
          children: [
            { id: 'p-2-1', text: 'رسم المخطط الهيكلي Wireframes', color: 'pink', boxStyle: 'underline', completed: true },
            { id: 'p-2-2', text: 'اختيار هوية وألوان التصميم', color: 'pink', boxStyle: 'underline', completed: false },
            { id: 'p-2-3', text: 'مراجعة نموذج التفاعل المبدئي', color: 'pink', boxStyle: 'underline', completed: false },
          ]
        },
        {
          id: 'p-3',
          text: 'التنفيذ والبرمجة 💻',
          color: 'mint',
          boxStyle: 'sketch',
          children: [
            { id: 'p-3-1', text: 'بناء الواجهات التفاعلية', color: 'mint', boxStyle: 'underline', completed: false },
            { id: 'p-3-2', text: 'ربط البيانات وإعداد المنطق', color: 'mint', boxStyle: 'underline', completed: false },
            { id: 'p-3-3', text: 'فحص واختبار الأداء والسرعة', color: 'mint', boxStyle: 'underline', completed: false },
          ]
        },
        {
          id: 'p-4',
          text: 'التسويق والنشر 📢',
          color: 'yellow',
          boxStyle: 'sketch',
          children: [
            { id: 'p-4-1', text: 'إعداد حملة الإطلاق والمنشورات', color: 'yellow', boxStyle: 'underline', completed: false },
            { id: 'p-4-2', text: 'جمع آراء الدفعة الأولى من المستخدمين', color: 'yellow', boxStyle: 'underline', completed: false },
          ]
        }
      ]
    })
  },
  brainstorming: {
    title: 'عصف ذهني وتوليد الأفكار 💡',
    description: 'جلسة عصف ذهني سريعة لجمع وتحليل الأفكار المبتكرة والحلول',
    getTree: () => ({
      id: 'template-brainstorm',
      text: 'فكرة المشروع الرئيسية 💡',
      color: 'yellow',
      icon: '✨',
      boxStyle: 'sketch',
      children: [
        {
          id: 'b-1',
          text: 'الفرص والميزات الجديدة ✨',
          color: 'cyan',
          boxStyle: 'cloud',
          children: [
            { id: 'b-1-1', text: 'واجهة استخدام طبيعية كالكتابة', color: 'cyan', boxStyle: 'underline' },
            { id: 'b-1-2', text: 'أداء فائق واستجابة لحظية', color: 'cyan', boxStyle: 'underline' },
            { id: 'b-1-3', text: 'إمكانية مشاركة وطباعة الخريطة', color: 'cyan', boxStyle: 'underline' },
          ]
        },
        {
          id: 'b-2',
          text: 'التحديات المحتملة ⚡',
          color: 'pink',
          boxStyle: 'bracket',
          children: [
            { id: 'b-2-1', text: 'إدارة وتنسيق عدد كبير من الفروع', color: 'pink', boxStyle: 'underline' },
            { id: 'b-2-2', text: 'الحفاظ على بساطة الشاشة وعدم التعقيد', color: 'pink', boxStyle: 'underline' },
          ]
        },
        {
          id: 'b-3',
          text: 'الحلول المقترحة 🛠️',
          color: 'mint',
          boxStyle: 'sketch',
          children: [
            { id: 'b-3-1', text: 'طي وفتح الفروع بنقرة واحدة', color: 'mint', boxStyle: 'underline' },
            { id: 'b-3-2', text: 'مزامنة ثنائية ذكية مع المهام', color: 'mint', boxStyle: 'underline' },
          ]
        },
        {
          id: 'b-4',
          text: 'الخطوات التنفيذية القادمة 🎯',
          color: 'white',
          boxStyle: 'sketch',
          children: [
            { id: 'b-4-1', text: 'ترتيب الأولويات من الأعلى للأدنى', color: 'white', boxStyle: 'underline' },
            { id: 'b-4-2', text: 'تحويل الأفكار إلى مهام قابلة للإنجاز', color: 'white', boxStyle: 'underline' },
          ]
        }
      ]
    })
  },
  weeklyPlanning: {
    title: 'تنظيم وإنجاز الأسبوع 📅',
    description: 'توزيع أهداف ومهام الأسبوع حسب المجالات لتركيز وإنتاجية أعلى',
    getTree: () => ({
      id: 'template-weekly',
      text: 'أهداف الأسبوع الحالي 🎯',
      color: 'yellow',
      icon: '📅',
      boxStyle: 'sketch',
      children: [
        {
          id: 'w-1',
          text: 'العمل والمشاريع 💼',
          color: 'cyan',
          boxStyle: 'sketch',
          children: [
            { id: 'w-1-1', text: 'إنهاء مهام المرحلة الحالية', color: 'cyan', boxStyle: 'underline', completed: false },
            { id: 'w-1-2', text: 'متابعة البريد والاجتماعات المهمة', color: 'cyan', boxStyle: 'underline', completed: true },
          ]
        },
        {
          id: 'w-2',
          text: 'التطوير والتعلم 📚',
          color: 'yellow',
          boxStyle: 'sketch',
          children: [
            { id: 'w-2-1', text: 'قراءة كتاب أو مقال متخصص', color: 'yellow', boxStyle: 'underline', completed: false },
            { id: 'w-2-2', text: 'تطبيق مهارة تقنية جديدة', color: 'yellow', boxStyle: 'underline', completed: false },
          ]
        },
        {
          id: 'w-3',
          text: 'الصحة والرياضة 🏃',
          color: 'mint',
          boxStyle: 'sketch',
          children: [
            { id: 'w-3-1', text: '3 جلسات تمارين أسبوعية', color: 'mint', boxStyle: 'underline', completed: false },
            { id: 'w-3-2', text: 'المشي في الهواء الطلق', color: 'mint', boxStyle: 'underline', completed: true },
          ]
        },
        {
          id: 'w-4',
          text: 'الحياة الشخصية والعائلة 🌟',
          color: 'pink',
          boxStyle: 'sketch',
          children: [
            { id: 'w-4-1', text: 'جلسة عائلية مميزة', color: 'pink', boxStyle: 'underline', completed: false },
            { id: 'w-4-2', text: 'تنظيم وترتيب المساحة الشخصية', color: 'pink', boxStyle: 'underline', completed: false },
          ]
        }
      ]
    })
  },
  blank: {
    title: 'خريطة ذهنية جديدة فارغة ✍️',
    description: 'صفحة بيضاء للبدء المباشر في تدوين الأفكار الحرة',
    getTree: (title?: string) => ({
      id: `blank-root-${Date.now()}`,
      text: title || 'الموضوع الرئيسي',
      color: 'yellow',
      icon: '🧠',
      boxStyle: 'sketch',
      children: [
        { id: `b-child-1-${Date.now()}`, text: 'الفكرة الأولى', color: 'cyan', boxStyle: 'sketch', children: [] },
        { id: `b-child-2-${Date.now()}`, text: 'الفكرة الثانية', color: 'mint', boxStyle: 'sketch', children: [] },
        { id: `b-child-3-${Date.now()}`, text: 'الفكرة الثالثة', color: 'pink', boxStyle: 'sketch', children: [] },
      ]
    })
  }
};

// خوارزمية تخطيط الشجرة المتوازنة (Bidirectional MindMap Layout)
export function computeMindMapLayout(
  root: XMindNode,
  centerX: number = 0,
  centerY: number = 0
): { nodes: LayoutNode[]; connectors: LayoutConnector[]; bounds: { minX: number; maxX: number; minY: number; maxY: number } } {
  const nodes: LayoutNode[] = [];
  const connectors: LayoutConnector[] = [];

  // تقدير تقريبي لأبعاد البوكس بناءً على طول النص
  function estimateNodeSize(node: XMindNode, isRoot: boolean): { width: number; height: number } {
    const textLen = node.text.length;
    const baseW = isRoot ? Math.max(160, textLen * 13 + 60) : Math.max(120, textLen * 11 + 50);
    const baseH = isRoot ? 64 : 46;
    return { width: Math.min(320, baseW), height: baseH };
  }

  const rootSize = estimateNodeSize(root, true);
  nodes.push({
    node: root,
    x: centerX,
    y: centerY,
    width: rootSize.width,
    height: rootSize.height,
    side: 'root',
    parentId: null,
  });

  const children = root.children || [];
  if (children.length === 0) {
    return {
      nodes,
      connectors,
      bounds: {
        minX: centerX - rootSize.width / 2 - 50,
        maxX: centerX + rootSize.width / 2 + 50,
        minY: centerY - rootSize.height / 2 - 50,
        maxY: centerY + rootSize.height / 2 + 50,
      }
    };
  }

  // توزيع الفروع الرئيسية بالتساوي: يمين ويسار (للغة العربية: اليمين يبدأ أولاً)
  const rightChildren: XMindNode[] = [];
  const leftChildren: XMindNode[] = [];

  children.forEach((child, idx) => {
    if (idx % 2 === 0) {
      rightChildren.push(child);
    } else {
      leftChildren.push(child);
    }
  });

  // حساب الارتفاع الكلي لكل شجرة فرعية
  function getSubtreeHeight(node: XMindNode): number {
    if (node.collapsed || !node.children || node.children.length === 0) {
      return 60;
    }
    const childrenH = node.children.reduce((acc, c) => acc + getSubtreeHeight(c), 0);
    return Math.max(60, childrenH);
  }

  // تخطيط جانب معين (يمين أو يسار)
  function layoutSide(sideNodes: XMindNode[], side: 'left' | 'right') {
    const totalHeight = sideNodes.reduce((acc, n) => acc + getSubtreeHeight(n), 0);
    let currentY = centerY - totalHeight / 2;

    const xOffsetDirection = side === 'right' ? 1 : -1;
    const level1X = centerX + xOffsetDirection * (rootSize.width / 2 + 100);

    sideNodes.forEach((node) => {
      const subtreeH = getSubtreeHeight(node);
      const nodeY = currentY + subtreeH / 2;
      const size = estimateNodeSize(node, false);

      const nodeX = level1X + (xOffsetDirection === 1 ? size.width / 2 : -size.width / 2);

      nodes.push({
        node,
        x: nodeX,
        y: nodeY,
        width: size.width,
        height: size.height,
        side,
        parentId: root.id,
      });

      // رابط من الجذر إلى الفرع الرئيسي
      connectors.push({
        id: `conn-${root.id}-${node.id}`,
        fromId: root.id,
        toId: node.id,
        fromX: centerX + (side === 'right' ? rootSize.width / 2 : -rootSize.width / 2),
        fromY: centerY,
        toX: nodeX + (side === 'right' ? -size.width / 2 : size.width / 2),
        toY: nodeY,
        color: node.color || 'yellow',
        side,
      });

      // تخطيط الفروع الفرعية التابعة إذا لم تكن مطوية
      if (!node.collapsed && node.children && node.children.length > 0) {
        layoutChildren(node, nodeX, nodeY, side, 2, currentY, subtreeH);
      }

      currentY += subtreeH;
    });
  }

  function layoutChildren(
    parent: XMindNode,
    parentX: number,
    parentY: number,
    side: 'left' | 'right',
    level: number,
    subtreeStartY: number,
    subtreeTotalH: number
  ) {
    const parentChildren = parent.children || [];
    if (parentChildren.length === 0) return;

    const parentSize = estimateNodeSize(parent, false);
    const xOffsetDirection = side === 'right' ? 1 : -1;
    let childY = subtreeStartY;

    parentChildren.forEach((child) => {
      const childSubH = getSubtreeHeight(child);
      const childCenterY = childY + childSubH / 2;
      const childSize = estimateNodeSize(child, false);

      const levelX = parentX + xOffsetDirection * (parentSize.width / 2 + 70 + childSize.width / 2);

      nodes.push({
        node: child,
        x: levelX,
        y: childCenterY,
        width: childSize.width,
        height: childSize.height,
        side,
        parentId: parent.id,
      });

      // رابط من الأب إلى الابن
      connectors.push({
        id: `conn-${parent.id}-${child.id}`,
        fromId: parent.id,
        toId: child.id,
        fromX: parentX + (side === 'right' ? parentSize.width / 2 : -parentSize.width / 2),
        fromY: parentY,
        toX: levelX + (side === 'right' ? -childSize.width / 2 : childSize.width / 2),
        toY: childCenterY,
        color: child.color || parent.color || 'yellow',
        side,
      });

      if (!child.collapsed && child.children && child.children.length > 0) {
        layoutChildren(child, levelX, childCenterY, side, level + 1, childY, childSubH);
      }

      childY += childSubH;
    });
  }

  layoutSide(rightChildren, 'right');
  layoutSide(leftChildren, 'left');

  // حساب الحدود الإجمالية للشجرة
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodes.forEach((n) => {
    minX = Math.min(minX, n.x - n.width / 2);
    maxX = Math.max(maxX, n.x + n.width / 2);
    minY = Math.min(minY, n.y - n.height / 2);
    maxY = Math.max(maxY, n.y + n.height / 2);
  });

  return {
    nodes,
    connectors,
    bounds: {
      minX: minX - 60,
      maxX: maxX + 60,
      minY: minY - 60,
      maxY: maxY + 60,
    }
  };
}

// دالة مساعدة للبحث والتعديل في الشجرة بالمعرف
export function updateNodeInTree(
  root: XMindNode,
  targetId: string,
  updateFn: (node: XMindNode) => XMindNode
): XMindNode {
  if (root.id === targetId) {
    return updateFn({ ...root });
  }

  if (!root.children || root.children.length === 0) {
    return root;
  }

  return {
    ...root,
    children: root.children.map((child) => updateNodeInTree(child, targetId, updateFn)),
  };
}

// دالة لحذف عقدة من الشجرة
export function deleteNodeFromTree(root: XMindNode, targetId: string): XMindNode {
  if (root.id === targetId) return root; // لا يمكن حذف الجذر

  if (!root.children) return root;

  return {
    ...root,
    children: root.children
      .filter((child) => child.id !== targetId)
      .map((child) => deleteNodeFromTree(child, targetId)),
  };
}

// دالة لإضافة ابن لعقدة
export function addChildToNode(root: XMindNode, parentId: string, newChild: XMindNode): XMindNode {
  return updateNodeInTree(root, parentId, (node) => ({
    ...node,
    collapsed: false,
    children: [...(node.children || []), newChild],
  }));
}

// دالة لإضافة أخ لعقدة
export function addSiblingToNode(root: XMindNode, targetId: string, newSibling: XMindNode): XMindNode {
  if (root.id === targetId) {
    return addChildToNode(root, targetId, newSibling);
  }

  if (!root.children) return root;

  const targetIndex = root.children.findIndex((c) => c.id === targetId);
  if (targetIndex !== -1) {
    const updated = [...root.children];
    updated.splice(targetIndex + 1, 0, newSibling);
    return { ...root, children: updated };
  }

  return {
    ...root,
    children: root.children.map((child) => addSiblingToNode(child, targetId, newSibling)),
  };
}
