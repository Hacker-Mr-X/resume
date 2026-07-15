import React, { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Save, Home,
  Upload, Eye, Edit3, Trash, Check, AlertCircle, FileText, Globe,
  Volume2, X, Image as ImageIcon, Award, ShieldAlert, Sparkles
} from 'lucide-react';

// ==========================================
// 1. REORDERABLE ITEM WRAPPER
// ==========================================
interface ReorderableItemProps {
  item: any;
  index: number;
  onDelete: () => void;
  title: string;
  subtitle?: string;
  period?: string;
  icon?: string;
  children: React.ReactNode;
}

const ReorderableItem: React.FC<ReorderableItemProps> = ({
  item,
  index,
  onDelete,
  title,
  subtitle,
  period,
  icon,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="relative border border-slate-200 dark:border-slate-800 rounded-2xl bg-white/60 dark:bg-slate-900/45 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Collapsed Header / Title Bar */}
      <div className="p-4 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/20 select-none border-b border-transparent dark:border-transparent">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Drag Handle */}
          <div
            onPointerDown={(e) => controls.start(e)}
            className="p-1.5 text-slate-400 hover:text-slate-605 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="按住拖拽排序 / Drag to reorder"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Icon */}
          {icon && <span className="text-lg shrink-0">{icon}</span>}

          {/* Text details */}
          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 truncate">
                {title || '未命名 / Unnamed'}
              </span>
              {period && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 shrink-0">
                  {period}
                </span>
              )}
            </div>
            {subtitle && (
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            title={isExpanded ? "收起 / Collapse" : "展开 / Expand"}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
            title="删除 / Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Expanded Content Area */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="border-t border-slate-200 dark:border-slate-800/80"
          >
            <div className="p-6 space-y-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
};

// ==========================================
// 2. DRAG & DROP STRING ARRAY MANAGER
// ==========================================
interface StringArrayItemProps {
  item: { id: string; value: string };
  index: number;
  handleTextChange: (index: number, val: string) => void;
  handleDelete: (index: number) => void;
}

const StringArrayItem: React.FC<StringArrayItemProps> = ({ item, index, handleTextChange, handleDelete }) => {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="flex gap-2 items-center bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-250 dark:border-slate-850 shadow-sm"
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <textarea
        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 resize-none font-sans"
        value={item.value}
        rows={2}
        onChange={e => handleTextChange(index, e.target.value)}
        placeholder="输入内容... / Enter content..."
      />
      <button
        onClick={() => handleDelete(index)}
        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </Reorder.Item>
  );
};

interface StringArrayManagerProps {
  path: (string | number)[];
  label: string;
  formData: any;
  updateField: (path: (string | number)[], value: any) => void;
}

const StringArrayManager: React.FC<StringArrayManagerProps> = ({ path, label, formData, updateField }) => {
  let array: string[] = formData;
  for (const p of path) {
    if (array === undefined) return null;
    array = (array as any)[p];
  }
  if (!array || !Array.isArray(array)) array = [];

  const [items, setItems] = useState<{ id: string; value: string }[]>([]);

  useEffect(() => {
    setItems(prev => {
      return array.map((str, idx) => {
        const existing = prev[idx];
        if (existing && existing.value === str) {
          return existing;
        }
        return {
          id: existing?.id || `str-${idx}-${Math.random().toString(36).substring(2, 9)}`,
          value: str
        };
      });
    });
  }, [JSON.stringify(array)]);

  const handleReorder = (newItems: typeof items) => {
    setItems(newItems);
    updateField(path, newItems.map(item => item.value));
  };

  const handleTextChange = (index: number, val: string) => {
    const updated = [...items];
    updated[index].value = val;
    setItems(updated);
    updateField(path, updated.map(item => item.value));
  };

  const handleAdd = () => {
    updateField(path, [...array, ""]);
  };

  const handleDelete = (index: number) => {
    updateField(path, array.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-sm">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-350 mb-3">{label}</label>
      
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-2">暂无项 / No items</p>
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
          {items.map((item, index) => (
            <StringArrayItem
              key={item.id}
              item={item}
              index={index}
              handleTextChange={handleTextChange}
              handleDelete={handleDelete}
            />
          ))}
        </Reorder.Group>
      )}
      
      <button
        onClick={handleAdd}
        className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold transition-colors"
      >
        <Plus className="w-4 h-4" /> 添加项 / Add Item
      </button>
    </div>
  );
};

// ==========================================
// 2.5 AWARD ARRAY MANAGER (Specialized for Education Awards)
// ==========================================

const AwardArrayItem = ({ item, index, handleAwardChange, handleDelete, availableCerts }: any) => {
  return (
    <Reorder.Item
      value={item}
      className="flex flex-col gap-2 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg group hover:border-blue-300 dark:hover:border-blue-700/50 transition-colors shadow-sm cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <div className="flex flex-col items-center justify-center shrink-0 mt-1">
          <GripVertical className="w-5 h-5 text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing" />
          <span className="text-xs font-black text-purple-600 dark:text-purple-400 mt-1 font-mono">
            #{index + 1}
          </span>
        </div>
        <div className="flex-1 space-y-2">
          <input
            className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400 border-b border-slate-100 dark:border-slate-800 focus:border-blue-500 pb-1"
            value={item.value.zh}
            onChange={(e) => handleAwardChange(index, 'zh', e.target.value)}
            placeholder="竞赛名称 (中文)"
          />
          <input
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400 border-b border-slate-100 dark:border-slate-800 focus:border-blue-500 pb-1"
            value={item.value.en}
            onChange={(e) => handleAwardChange(index, 'en', e.target.value)}
            placeholder="Award Name (English)"
          />
          <select
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded p-1.5 text-slate-600 dark:text-slate-400 focus:outline-none focus:border-blue-500"
            value={item.value.certificate || ''}
            onChange={(e) => handleAwardChange(index, 'certificate', e.target.value)}
          >
            <option value="">-- 无关联证书 / No linked certificate --</option>
            {availableCerts?.map((cert: string) => (
              <option key={cert} value={cert}>{cert}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => handleDelete(index)}
          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Reorder.Item>
  );
};

interface AwardArrayManagerProps {
  path: (string | number)[];
  label: string;
  formData: any;
  updateField: (path: (string | number)[], value: any) => void;
  availableCerts: string[];
}

const AwardArrayManager: React.FC<AwardArrayManagerProps> = ({ path, label, formData, updateField, availableCerts }) => {
  let array: any[] = formData;
  for (const p of path) {
    if (array === undefined) return null;
    array = (array as any)[p];
  }
  if (!array || !Array.isArray(array)) array = [];

  const [items, setItems] = useState<{ id: string; value: any }[]>([]);

  useEffect(() => {
    setItems(prev => {
      return array.map((obj, idx) => {
        const existing = prev[idx];
        if (existing && JSON.stringify(existing.value) === JSON.stringify(obj)) {
          return existing;
        }
        return {
          id: existing?.id || `award-${idx}-${Math.random().toString(36).substring(2, 9)}`,
          value: obj || { en: '', zh: '', certificate: '' }
        };
      });
    });
  }, [JSON.stringify(array)]);

  const handleReorder = (newItems: typeof items) => {
    setItems(newItems);
    updateField(path, newItems.map(item => item.value));
  };

  const handleAwardChange = (index: number, field: string, val: string) => {
    const updated = [...items];
    updated[index].value = { ...updated[index].value, [field]: val };
    setItems(updated);
    updateField(path, updated.map(item => item.value));
  };

  const handleAdd = () => {
    updateField(path, [...array, { en: '', zh: '', certificate: '' }]);
  };

  const handleDelete = (index: number) => {
    updateField(path, array.filter((_, i) => i !== index));
  };

  return (
    <div className="col-span-full mb-4 p-4 border border-purple-200 dark:border-purple-900/50 rounded-xl bg-purple-50/30 dark:bg-purple-950/20 backdrop-blur-sm">
      <label className="block text-sm font-bold text-purple-700 dark:text-purple-400 mb-3">{label}</label>
      
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-2">暂无项 / No items</p>
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-3">
          {items.map((item, index) => (
            <AwardArrayItem
              key={item.id}
              item={item}
              index={index}
              handleAwardChange={handleAwardChange}
              handleDelete={handleDelete}
              availableCerts={availableCerts}
            />
          ))}
        </Reorder.Group>
      )}
      
      <button
        onClick={handleAdd}
        className="mt-4 flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-bold transition-colors px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-purple-100 dark:border-purple-900/60 shadow-sm"
      >
        <Plus className="w-4 h-4" /> 添加新奖项 / Add Award
      </button>
    </div>
  );
};

// ==========================================
// 2.6 SCHOLARSHIP ARRAY MANAGER (Specialized for Education Scholarships)
// ==========================================

const ScholarshipArrayItem = ({ item, index, handleScholarshipChange, handleDelete, availableCerts }: any) => {
  return (
    <Reorder.Item
      value={item}
      className="flex flex-col gap-2 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg group hover:border-blue-300 dark:hover:border-blue-700/50 transition-colors shadow-sm cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <div className="flex flex-col items-center justify-center shrink-0 mt-1">
          <GripVertical className="w-5 h-5 text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing" />
          <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
            #{index + 1}
          </span>
        </div>
        <div className="flex-1 space-y-2">
          <textarea
            className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400 border-b border-slate-100 dark:border-slate-800 focus:border-blue-500 pb-1 resize-none"
            value={item.value.zh}
            rows={2}
            onChange={(e) => handleScholarshipChange(index, 'zh', e.target.value)}
            placeholder="奖学金描述 (中文)"
          />
          <textarea
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400 border-b border-slate-100 dark:border-slate-800 focus:border-blue-500 pb-1 resize-none"
            value={item.value.en}
            rows={2}
            onChange={(e) => handleScholarshipChange(index, 'en', e.target.value)}
            placeholder="Scholarship Description (English)"
          />
          <select
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded p-1.5 text-slate-600 dark:text-slate-400 focus:outline-none focus:border-blue-500"
            value={item.value.certificate || ''}
            onChange={(e) => handleScholarshipChange(index, 'certificate', e.target.value)}
          >
            <option value="">-- 无关联证书 / No linked certificate --</option>
            {availableCerts?.map((cert: string) => (
              <option key={cert} value={cert}>{cert}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => handleDelete(index)}
          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Reorder.Item>
  );
};

interface ScholarshipArrayManagerProps {
  path: (string | number)[];
  label: string;
  formData: any;
  updateField: (path: (string | number)[], value: any) => void;
  availableCerts: string[];
}

const ScholarshipArrayManager: React.FC<ScholarshipArrayManagerProps> = ({ path, label, formData, updateField, availableCerts }) => {
  let array: any[] = formData;
  for (const p of path) {
    if (array === undefined) return null;
    array = (array as any)[p];
  }
  if (!array || !Array.isArray(array)) array = [];

  const [items, setItems] = useState<{ id: string; value: any }[]>([]);

  useEffect(() => {
    setItems(prev => {
      return array.map((obj, idx) => {
        const existing = prev[idx];
        if (existing && JSON.stringify(existing.value) === JSON.stringify(obj)) {
          return existing;
        }
        return {
          id: existing?.id || `scholarship-${idx}-${Math.random().toString(36).substring(2, 9)}`,
          value: obj || { en: '', zh: '', certificate: '' }
        };
      });
    });
  }, [JSON.stringify(array)]);

  const handleReorder = (newItems: typeof items) => {
    setItems(newItems);
    updateField(path, newItems.map(item => item.value));
  };

  const handleScholarshipChange = (index: number, field: string, val: string) => {
    const updated = [...items];
    updated[index].value = { ...updated[index].value, [field]: val };
    setItems(updated);
    updateField(path, updated.map(item => item.value));
  };

  const handleAdd = () => {
    updateField(path, [...array, { en: '', zh: '', certificate: '' }]);
  };

  const handleDelete = (index: number) => {
    updateField(path, array.filter((_, i) => i !== index));
  };

  return (
    <div className="col-span-full mb-4 p-4 border border-amber-200 dark:border-amber-900/50 rounded-xl bg-amber-50/30 dark:bg-amber-950/20 backdrop-blur-sm">
      <label className="block text-sm font-bold text-amber-700 dark:text-amber-400 mb-3">{label}</label>
      
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-2">暂无项 / No items</p>
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-3">
          {items.map((item, index) => (
            <ScholarshipArrayItem
              key={item.id}
              item={item}
              index={index}
              handleScholarshipChange={handleScholarshipChange}
              handleDelete={handleDelete}
              availableCerts={availableCerts}
            />
          ))}
        </Reorder.Group>
      )}
      
      <button
        onClick={handleAdd}
        className="mt-4 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-bold transition-colors px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-100 dark:border-amber-900/60 shadow-sm"
      >
        <Plus className="w-4 h-4" /> 添加新奖学金 / Add Scholarship
      </button>
    </div>
  );
};

// ==========================================
// 3. INTERACTIVE MEDIA UPLOAD MANAGER
// ==========================================
interface MediaUploadManagerProps {
  type: string;
  id: string;
  category: 'photos' | 'certificates' | 'transcript' | 'scholarships' | 'awards';
  files: string[];
  isSingle?: boolean;
  onSync: (newData: any) => void;
  label: string;
}

const MediaUploadManager: React.FC<MediaUploadManagerProps> = ({
  type, id, category, files, isSingle = false, onSync, label
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const getFileUrl = (filename: string) => {
    const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
    return `${base}experiences/${type}/${id}/${category}/${filename}`;
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type,
              id,
              category,
              filename: file.name,
              fileData: base64
            })
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success) {
              onSync(json.data);
            } else {
              setError(json.error || '上传失败');
            }
          } else {
            setError('上传接口错误');
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message);
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`确定要删除媒体文件 "${filename}" 吗？`)) return;
    try {
      const res = await fetch('/api/delete-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, category, filename })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          onSync(json.data);
        }
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const fileList = isSingle ? (files[0] ? [files[0]] : []) : files;

  return (
    <div className="mb-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 backdrop-blur-sm">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      
      {/* File Preview Grid */}
      {fileList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {fileList.map((file, idx) => {
            const url = getFileUrl(file);
            const isImage = /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(file);
            return (
              <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 aspect-video flex flex-col justify-center items-center">
                {isImage ? (
                  <img src={url} alt={file} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center p-2 text-center text-slate-400">
                    <FileText className="w-8 h-8 mb-1" />
                    <span className="text-[10px] truncate max-w-full font-mono">{file}</span>
                  </div>
                )}
                {/* Delete Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 gap-2">
                  <a href={url} target="_blank" rel="noreferrer" className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg text-xs font-semibold">
                    预览
                  </a>
                  <button
                    onClick={() => handleDelete(file)}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Box */}
      {(!isSingle || fileList.length === 0) && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleUpload(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
            dragOver ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-900/10' : 'border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30'
          }`}
        >
          <Upload className="w-8 h-8 text-slate-400 mb-1" />
          <p className="text-xs text-slate-500 text-center font-medium">
            {uploading ? '上传中/Uploading...' : '拖拽文件至此 或 点击浏览 / Drag files or click to browse'}
          </p>
          <input
            type="file"
            className="hidden"
            id={`file-input-${category}-${id}`}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleUpload(e.target.files[0]);
              }
            }}
          />
          <label
            htmlFor={`file-input-${category}-${id}`}
            className="mt-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
          >
            选择文件 / Choose File
          </label>
          {error && <p className="text-[10px] text-red-500 mt-1 font-bold">⚠️ {error}</p>}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. BILINGUAL MARKDOWN EDITOR MODAL
// ==========================================
interface MarkdownEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  id: string;
  title: string;
  onSync: (newData: any) => void;
}

const MarkdownEditorModal: React.FC<MarkdownEditorModalProps> = ({
  isOpen, onClose, type, id, title, onSync
}) => {
  const [contentZh, setContentZh] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [activeLang, setActiveLang] = useState<'zh' | 'en'>('zh');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && id && type) {
      setLoading(true);
      Promise.all([
        fetch(`/api/markdown?type=${type}&id=${id}&lang=zh`).then(r => r.json()),
        fetch(`/api/markdown?type=${type}&id=${id}&lang=en`).then(r => r.json())
      ]).then(([zhData, enData]) => {
        setContentZh(zhData.content || '');
        setContentEn(enData.content || '');
      }).catch(err => {
        console.error('Error loading markdown', err);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen, id, type]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const resZh = await fetch('/api/markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, lang: 'zh', content: contentZh })
      });
      const resEn = await fetch('/api/markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, lang: 'en', content: contentEn })
      });
      if (resZh.ok && resEn.ok) {
        const json = await resZh.json();
        if (json.success) {
          onSync(json.data);
        }
        onClose();
      }
    } catch (err) {
      console.error('Error saving markdown', err);
    } finally {
      setSaving(false);
    }
  };

  // Quick Markdown Parser for HTML Live Preview
  const parseMarkdown = (md: string) => {
    if (!md) return '<p class="text-slate-400 italic">在此处开始编辑 Markdown 内容...</p>';
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-md font-bold my-2 text-slate-800 dark:text-slate-200">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-extrabold my-3 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-1">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-black my-4 text-slate-900 dark:text-white">$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
    
    // Bullet lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-650 dark:text-slate-300 my-0.5">$1</li>');
    
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm text-red-500 font-mono font-bold">$1</code>');
    
    // Paragraph breaks
    html = html.replace(/\n\s*\n/g, '<p class="my-2"></p>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br />');
    
    return html;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-6xl h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-slate-250 dark:border-slate-850">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-800 dark:text-white">
              编辑详情 Markdown / Edit details.md: <span className="text-blue-500 font-mono">{title}</span>
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Language Selection Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-1 gap-1">
          <button
            onClick={() => setActiveLang('zh')}
            className={`flex-1 sm:flex-initial px-6 py-2 text-xs font-bold rounded-lg transition-all ${
              activeLang === 'zh' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:bg-white/40 dark:hover:bg-slate-900/30'
            }`}
          >
            🇨🇳 中文详情 (details_zh.md)
          </button>
          <button
            onClick={() => setActiveLang('en')}
            className={`flex-1 sm:flex-initial px-6 py-2 text-xs font-bold rounded-lg transition-all ${
              activeLang === 'en' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:bg-white/40 dark:hover:bg-slate-900/30'
            }`}
          >
            🇬🇧 English Details (details_en.md)
          </button>
        </div>

        {/* Editor Main Content Pane */}
        {loading ? (
          <div className="flex-1 flex justify-center items-center bg-white dark:bg-slate-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-900">
            
            {/* Left Column: Input Textarea */}
            <div className="flex-1 flex flex-col h-1/2 md:h-full p-4">
              <div className="flex justify-between items-center mb-1 text-[11px] font-bold text-slate-400 uppercase select-none">
                <span>Markdown 编辑器 / Editor</span>
                <span>支持常规格式</span>
              </div>
              <textarea
                className="flex-1 w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                value={activeLang === 'zh' ? contentZh : contentEn}
                onChange={e => {
                  if (activeLang === 'zh') setContentZh(e.target.value);
                  else setContentEn(e.target.value);
                }}
                placeholder="# 标题 / Title&#10;&#10;关于此经历的详细描述... / Detailed descriptions..."
              />
            </div>

            {/* Right Column: Live Render HTML Preview */}
            <div className="flex-1 flex flex-col h-1/2 md:h-full p-4 bg-slate-50/50 dark:bg-slate-950/20 overflow-y-auto">
              <div className="mb-1 text-[11px] font-bold text-slate-400 uppercase select-none">
                实时效果预览 / Live Preview
              </div>
              <div
                className="flex-1 w-full p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-y-auto text-sm leading-relaxed text-slate-800 dark:text-slate-300 font-sans"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(activeLang === 'zh' ? contentZh : contentEn) }}
              />
            </div>
            
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors text-slate-750 dark:text-slate-250"
          >
            取消 / Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5"
          >
            {saving ? '保存中...' : <><Save className="w-4 h-4" /> 保存 / Save Changes</>}
          </button>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// 5. MAIN ADMIN PORTAL COMPONENT
// ==========================================
const Admin: React.FC = () => {
  const { data, loading, saveData } = usePortfolio();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language as 'en' | 'zh';

  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState<string>('settings');

  // Markdown Editor modal state
  const [mdModal, setMdModal] = useState<{
    isOpen: boolean;
    type: string;
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: '',
    id: '',
    title: ''
  });

  useEffect(() => {
    if (data) {
      const clone = JSON.parse(JSON.stringify(data));
      // Ensure all arrays exist
      const arrayKeys = ['education', 'internships', 'projects', 'exchanges', 'volunteers', 'skills'];
      arrayKeys.forEach(k => {
        if (!clone[k]) clone[k] = [];
      });

      // Ensure stable IDs for skills for Reorder
      clone.skills = clone.skills.map((s: any, idx: number) => ({
        id: s.id || `skill-${idx}-${Math.random().toString(36).substring(2, 9)}`,
        ...s
      }));
      setFormData(clone);
    }
  }, [data]);

  if (loading || !formData) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    const success = await saveData(formData);
    setSaving(false);
    if (success) {
      setSaveMessage(t('saved'));
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('Error saving data');
    }
  };

  const updateField = (path: (string | number)[], value: any) => {
    const newData = { ...formData };
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setFormData(newData);
  };

  // Re-sync after file upload/delete re-scans folders
  const handleDataSync = (updatedData: any) => {
    const clone = JSON.parse(JSON.stringify(updatedData));
    // Re-inject IDs for skills if they got overwritten on file scan save
    clone.skills = clone.skills.map((s: any, idx: number) => ({
      id: s.id || `skill-${idx}-${Math.random().toString(36).substring(2, 9)}`,
      ...s
    }));
    setFormData(clone);
  };

  // ==========================================
  // INPUT FIELDS RENDERING UTILS
  // ==========================================
  const renderToggle = (path: (string | number)[], label: string) => {
    let value: any = formData;
    for (const p of path) {
      if (value === undefined) break;
      value = value[p];
    }
    if (value === undefined) value = true;

    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{label}</span>
        <button
          onClick={() => updateField(path, !value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            value ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  };

  const renderTextField = (path: (string | number)[], label: string, isTextarea = false) => {
    let value = formData;
    for (const p of path) {
      if (value === undefined) return null;
      value = value[p];
    }
    if (value === undefined) value = '';

    return (
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-650 dark:text-slate-350 mb-1">{label}</label>
        {isTextarea ? (
          <textarea
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 text-sm leading-relaxed"
            value={value}
            rows={3}
            onChange={e => updateField(path, e.target.value)}
          />
        ) : (
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 text-sm"
            value={value}
            onChange={e => updateField(path, e.target.value)}
          />
        )}
      </div>
    );
  };

  const renderSelectField = (path: (string | number)[], label: string, options: { value: string; label: string }[]) => {
    let value = formData;
    for (const p of path) {
      if (value === undefined) return null;
      value = value[p];
    }
    if (value === undefined) value = '';

    return (
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-650 dark:text-slate-350 mb-1">{label}</label>
        <select
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 text-sm"
          value={value}
          onChange={e => updateField(path, e.target.value)}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // ==========================================
  // EXPERIENCE SPECIFIC MANAGEMENT BANNER
  // ==========================================
  const renderExperienceDirectoryBanner = (key: string, item: any, itemPath: (string | number)[]) => {
    if (!item || !item.id) return null;

    const isEducation = key === 'education';
    const photoCount = item.photos?.length || 0;
    const certCount = item.certificates?.length || 0;

    return (
      <div className="mt-6 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 space-y-4">
        
        {/* Title and Settings row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white">📂 资源与资产管理 / Resource Directory</h4>
            <code className="text-xs text-slate-400 dark:text-slate-500 select-all block mt-0.5 font-mono">
              public/experiences/{key}/{item.id}/
            </code>
          </div>
          <div className="flex items-center gap-2">
            {!isEducation && renderToggle([...itemPath, 'showCerts'], '启用证书模块 / Show Certificates')}
          </div>
        </div>

        {/* Media uploads */}
        {isEducation ? (
          <div className="space-y-4">
            {/* Transcript Image (Single Upload) */}
            <MediaUploadManager
              type="education"
              id={item.id}
              category="transcript"
              files={item.transcriptImage ? [item.transcriptImage] : []}
              isSingle={true}
              onSync={handleDataSync}
              label="📊 成绩单图片上传 / Transcript Image"
            />
            {/* Scholarship Certificates (Array) */}
            <MediaUploadManager
              type="education"
              id={item.id}
              category="scholarships"
              files={item.scholarshipCertificates || []}
              onSync={handleDataSync}
              label="🏅 奖学金证书列表 / Scholarship Certificates"
            />
            {/* Award Certificates (Array) */}
            <MediaUploadManager
              type="education"
              id={item.id}
              category="awards"
              files={item.awardCertificates || []}
              onSync={handleDataSync}
              label="🏆 竞赛证书列表 / Award Certificates"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Markdown details link editor */}
            <div className="p-4 rounded-xl border border-blue-150 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h5 className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> Markdown 详情文档 / Details (details.md)
                </h5>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                  前台点击卡片弹出的全屏介绍内容，支持图文排版。
                </p>
              </div>
              <button
                onClick={() => setMdModal({
                  isOpen: true,
                  type: key,
                  id: item.id,
                  title: item.name?.[lang] || item.company?.[lang] || 'Markdown Editor'
                })}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" /> 编辑 Details.md / Edit
              </button>
            </div>

            {/* Photos Upload */}
            <MediaUploadManager
              type={key}
              id={item.id}
              category="photos"
              files={item.photos || []}
              onSync={handleDataSync}
              label="🖼️ 项目照片库 / Project Photos (建议 1-9 张)"
            />

            {/* Certificates Upload */}
            {(item.showCerts !== false) && (
              <MediaUploadManager
                type={key}
                id={item.id}
                category="certificates"
                files={item.certificates || []}
                onSync={handleDataSync}
                label="📜 证书扫描件 / Certificates"
              />
            )}
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // TABS & GROUPS RENDERING
  // ==========================================
  const renderArraySection = (
    key: string,
    emptyTemplate: any,
    getItemInfo: (item: any) => { title: string; subtitle?: string; period?: string; icon?: string },
    renderItem: (itemPath: (string | number)[], index: number) => React.ReactNode
  ) => {
    return (
      <div className="space-y-4">
        {formData[key] && (
          <Reorder.Group
            axis="y"
            values={formData[key]}
            onReorder={(newOrder) => updateField([key], newOrder)}
            className="space-y-3"
          >
            {formData[key].map((item: any, index: number) => {
              const info = getItemInfo(item);
              return (
                <ReorderableItem
                  key={item.id || `reorder-${index}`}
                  item={item}
                  index={index}
                  onDelete={() => {
                    if (confirm('确认删除该条目吗？删除将连带清理本地对应的文件夹，不可逆。')) {
                      const newArray = formData[key].filter((_: any, i: number) => i !== index);
                      updateField([key], newArray);
                    }
                  }}
                  title={info.title}
                  subtitle={info.subtitle}
                  period={info.period}
                  icon={info.icon}
                >
                  {renderItem([key, index], index)}
                </ReorderableItem>
              );
            })}
          </Reorder.Group>
        )}

        <button
          onClick={() => updateField([key], [...formData[key], JSON.parse(JSON.stringify(emptyTemplate))])}
          className="w-full py-4 border-2 border-dashed border-slate-355 dark:border-slate-800 rounded-2xl flex justify-center items-center gap-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-bold text-sm"
        >
          <Plus className="w-5 h-5" /> 添加新记录 / Add New Entry
        </button>
      </div>
    );
  };

  const tabs = [
    { id: 'settings', label: '全局配置', enLabel: 'Settings', icon: '⚙️' },
    { id: 'hero', label: '个人简介', enLabel: 'Profile', icon: '👤' },
    { id: 'education', label: '教育背景', enLabel: 'Education', count: formData.education?.length, icon: '🎓' },
    { id: 'internships', label: '实习经历', enLabel: 'Internships', count: formData.internships?.length, icon: '💼' },
    { id: 'projects', label: '科研经历', enLabel: 'Projects', count: formData.projects?.length, icon: '🔬' },
    { id: 'exchanges', label: '海外交流', enLabel: 'Exchanges', count: formData.exchanges?.length, icon: '🌏' },
    { id: 'volunteers', label: '志愿服务', enLabel: 'Volunteers', count: formData.volunteers?.length, icon: '🤝' },
    { id: 'skills', label: '技能特长', enLabel: 'Skills', count: formData.skills?.length, icon: '🛠️' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-850 z-50 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              {t('admin')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-lg border border-green-200/50">
                {saveMessage}
              </span>
            )}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 px-4 py-2 text-xs font-extrabold border border-slate-350 dark:border-slate-850 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Home className="w-3.5 h-3.5" /> {t('home')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-md shadow-blue-600/10"
            >
              <Check className="w-4 h-4" /> {saving ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Navigation Sidebar */}
        <div className="md:col-span-1 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-850 pr-0 md:pr-4 h-fit sticky top-20 z-40 select-none scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-between w-full p-3 rounded-xl transition-all text-left text-xs font-extrabold whitespace-nowrap md:whitespace-normal shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{tab.icon}</span>
                <span>{lang === 'zh' ? tab.label : tab.enLabel}</span>
              </div>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200/50 dark:bg-slate-800 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right Form Editor Panel */}
        <div className="md:col-span-3 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Tab: Settings */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="p-6 border border-slate-250 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
                    <h3 className="text-base font-black text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                      ⚙️ 系统与交互配置 (Global Settings)
                    </h3>
                    
                    {renderSelectField(['defaultLanguage'], '默认语言 / Default Language', [
                      { value: 'zh', label: '🇨🇳 中文 / Chinese' },
                      { value: 'en', label: '🇬🇧 English' }
                    ])}

                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-500 mb-3 flex items-center gap-1">
                          <Volume2 className="w-4 h-4 text-blue-500" /> 卡片翻页音效 / Card Flip Sound
                        </h4>
                        {renderSelectField(['settings', 'cardSound'], '音效选择', [
                          { value: 'none', label: '🔇 Mute (静音)' },
                          { value: 'wood', label: '🪵 Wood (木质)' },
                          { value: 'clock', label: '⏱️ Clock (机械)' },
                          { value: 'typewriter', label: '⌨️ Typewriter (打字机)' },
                          { value: 'paper', label: '📄 Paper (纸摩擦)' },
                          { value: 'water', label: '💧 Water (水滴)' },
                          { value: 'bubble', label: '🫧 Bubble (泡泡)' },
                          { value: 'click', label: '🖱️ Light Click (微动)' },
                          { value: 'scifi', label: '🛸 Sci-Fi (科幻)' },
                          { value: 'chime', label: '🔔 Chime (风铃)' }
                        ])}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-500 mb-3 flex items-center gap-1">
                          <Volume2 className="w-4 h-4 text-blue-500" /> 板块切换音效 / Section Sound
                        </h4>
                        {renderSelectField(['settings', 'sectionSound'], '音效选择', [
                          { value: 'none', label: '🔇 Mute (静音)' },
                          { value: 'wood', label: '🪵 Wood (木质)' },
                          { value: 'clock', label: '⏱️ Clock (机械)' },
                          { value: 'typewriter', label: '⌨️ Typewriter (打字机)' },
                          { value: 'paper', label: '📄 Paper (纸摩擦)' },
                          { value: 'water', label: '💧 Water (水滴)' },
                          { value: 'bubble', label: '🫧 Bubble (泡泡)' },
                          { value: 'click', label: '🖱️ Light Click (微动)' },
                          { value: 'scifi', label: '🛸 Sci-Fi (科幻)' },
                          { value: 'chime', label: '🔔 Chime (风铃)' }
                        ])}
                      </div>
                    </div>

                    <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
                      <h4 className="text-xs font-extrabold text-slate-500 mb-4 flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-amber-500" /> 视觉特效配置 / Visual Effects
                      </h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          {renderToggle(['settings', 'enableLightRays'], '启用首屏顶部体积光射线 (LightRays)')}
                          <p className="text-xs text-slate-400 mt-2 px-1">
                            在首页欢迎屏的顶部增加一层炫酷的交互式光线特效。开启可能会影响部分低端设备的性能，默认关闭。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Hero Profile */}
              {activeTab === 'hero' && (
                <div className="space-y-6">
                  <div className="p-6 border border-slate-250 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
                    <h3 className="text-base font-black text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                      👤 个人主页配置 (Hero Profile)
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-blue-500 border-b border-blue-100 dark:border-blue-900/40 pb-1">English Profile</h4>
                        {renderTextField(['hero', 'name', 'en'], 'Name')}
                        {renderTextField(['hero', 'role', 'en'], 'Role Title')}
                        {renderTextField(['hero', 'intro', 'en'], 'Intro Bio', true)}
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-red-500 border-b border-red-100 dark:border-red-900/40 pb-1">中文资料</h4>
                        {renderTextField(['hero', 'name', 'zh'], '姓名')}
                        {renderTextField(['hero', 'role', 'zh'], '身份定位')}
                        {renderTextField(['hero', 'intro', 'zh'], '个人简介', true)}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      {renderTextField(['hero', 'email'], 'Email')}
                      {renderTextField(['hero', 'phone'], 'Phone')}
                      {renderTextField(['hero', 'wechat'], 'WeChat')}
                      {renderTextField(['hero', 'instagram'], 'Instagram')}
                      {renderTextField(['hero', 'avatarUrl'], '头像地址 / Avatar Path')}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-black text-slate-500 mb-3">信息可见性控制 / Visibility Settings</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {renderToggle(['hero', 'visibility', 'email'], '显示 Email')}
                        {renderToggle(['hero', 'visibility', 'phone'], '显示电话')}
                        {renderToggle(['hero', 'visibility', 'wechat'], '显示微信')}
                        {renderToggle(['hero', 'visibility', 'instagram'], '显示 Ins')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Education */}
              {activeTab === 'education' &&
                renderArraySection(
                  'education',
                  { id: `edu-${Date.now()}`, institution: { en: '', zh: '' }, degree: { en: '', zh: '' }, period: '', location: { en: '', zh: '' }, gpa: { en: '', zh: '' }, courses: { en: '', zh: '' }, scholarships: [], awards: [], transcriptImage: '', scholarshipCertificates: [], awardCertificates: [] },
                  (item) => ({
                    title: item.institution?.[lang] || item.institution?.zh || item.institution?.en || '新就读经历 / New Education',
                    subtitle: item.degree?.[lang] || item.degree?.zh || item.degree?.en,
                    period: item.period,
                    icon: '🎓'
                  }),
                  (path, index) => {
                    const item = formData.education[index];
                    return (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-blue-500">English Info</h4>
                            {renderTextField([...path, 'institution', 'en'], 'Institution')}
                            {renderTextField([...path, 'degree', 'en'], 'Degree')}
                            {renderTextField([...path, 'location', 'en'], 'Location')}
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-red-500">中文信息</h4>
                            {renderTextField([...path, 'institution', 'zh'], '学校名称')}
                            {renderTextField([...path, 'degree', 'zh'], '学位/专业')}
                            {renderTextField([...path, 'location', 'zh'], '就读地点')}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                          {renderTextField([...path, 'period'], '就读时间段 / Period')}
                          <div className="grid grid-cols-1 gap-2">
                            {renderTextField([...path, 'gpa', 'zh'], '绩点 GPA (ZH)')}
                            {renderTextField([...path, 'gpa', 'en'], 'GPA Description (EN)')}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                          {renderTextField([...path, 'courses', 'zh'], '核心课程 (ZH)', true)}
                          {renderTextField([...path, 'courses', 'en'], 'Core Courses (EN)', true)}
                        </div>

                        <div className="grid grid-cols-1 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                          <ScholarshipArrayManager 
                            path={[...path, 'scholarships']} 
                            label="🏅 奖学金描述与证书绑定 / Scholarships & Certificates" 
                            formData={formData} 
                            updateField={updateField} 
                            availableCerts={item.scholarshipCertificates || []} 
                          />
                        </div>

                        <div className="grid grid-cols-1 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                          <AwardArrayManager 
                            path={[...path, 'awards']} 
                            label="🏆 竞赛获奖与证书绑定 / Awards & Certificates" 
                            formData={formData} 
                            updateField={updateField} 
                            availableCerts={item.awardCertificates || []} 
                          />
                        </div>

                        {renderExperienceDirectoryBanner('education', item, path)}
                      </div>
                    );
                  }
                )
              }

              {/* Tab: Internships */}
              {activeTab === 'internships' &&
                renderArraySection(
                  'internships',
                  { id: `int-${Date.now()}`, company: { en: '', zh: '' }, role: { en: '', zh: '' }, period: '', location: { en: '', zh: '' }, details: { en: [], zh: [] }, keywords: { en: [], zh: [] } },
                  (item) => ({
                    title: item.company?.[lang] || item.company?.zh || item.company?.en || '新实习经历 / New Internship',
                    subtitle: item.role?.[lang] || item.role?.zh || item.role?.en,
                    period: item.period,
                    icon: '💼'
                  }),
                  (path, index) => {
                    const item = formData.internships[index];
                    return (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-blue-500">English Info</h4>
                            {renderTextField([...path, 'company', 'en'], 'Company Name')}
                            {renderTextField([...path, 'role', 'en'], 'Role / Title')}
                            {renderTextField([...path, 'location', 'en'], 'Location')}
                            <StringArrayManager path={[...path, 'keywords', 'en']} label="🏷️ Keywords (EN)" formData={formData} updateField={updateField} />
                            <StringArrayManager path={[...path, 'details', 'en']} label="📝 Bullet Points (EN)" formData={formData} updateField={updateField} />
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-red-500">中文信息</h4>
                            {renderTextField([...path, 'company', 'zh'], '公司名称')}
                            {renderTextField([...path, 'role', 'zh'], '职位 / 职责')}
                            {renderTextField([...path, 'location', 'zh'], '工作地点')}
                            <StringArrayManager path={[...path, 'keywords', 'zh']} label="🏷️ 关键词 (ZH)" formData={formData} updateField={updateField} />
                            <StringArrayManager path={[...path, 'details', 'zh']} label="📝 工作明细 (ZH)" formData={formData} updateField={updateField} />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60">
                          {renderTextField([...path, 'period'], '实习时间段 / Period')}
                        </div>

                        {renderExperienceDirectoryBanner('internships', item, path)}
                      </div>
                    );
                  }
                )
              }

              {/* Tab: Projects */}
              {activeTab === 'projects' &&
                renderArraySection(
                  'projects',
                  { id: `proj-${Date.now()}`, name: { en: '', zh: '' }, role: { en: '', zh: '' }, period: '', location: { en: '', zh: '' }, details: { en: [], zh: [] }, keywords: { en: [], zh: [] } },
                  (item) => ({
                    title: item.name?.[lang] || item.name?.zh || item.name?.en || '新科研项目 / New Project',
                    subtitle: item.role?.[lang] || item.role?.zh || item.role?.en,
                    period: item.period,
                    icon: '🔬'
                  }),
                  (path, index) => {
                    const item = formData.projects[index];
                    return (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-blue-500">English Info</h4>
                            {renderTextField([...path, 'name', 'en'], 'Project Name')}
                            {renderTextField([...path, 'role', 'en'], 'Role / Title')}
                            {renderTextField([...path, 'location', 'en'], 'Location')}
                            <StringArrayManager path={[...path, 'keywords', 'en']} label="🏷️ Keywords (EN)" formData={formData} updateField={updateField} />
                            <StringArrayManager path={[...path, 'details', 'en']} label="📝 Key Tasks (EN)" formData={formData} updateField={updateField} />
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-red-500">中文信息</h4>
                            {renderTextField([...path, 'name', 'zh'], '项目名称')}
                            {renderTextField([...path, 'role', 'zh'], '项目分工 / 职责')}
                            {renderTextField([...path, 'location', 'zh'], '研究地点')}
                            <StringArrayManager path={[...path, 'keywords', 'zh']} label="🏷️ 关键词 (ZH)" formData={formData} updateField={updateField} />
                            <StringArrayManager path={[...path, 'details', 'zh']} label="📝 项目明细 (ZH)" formData={formData} updateField={updateField} />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60">
                          {renderTextField([...path, 'period'], '时间段 / Period')}
                        </div>

                        {renderExperienceDirectoryBanner('projects', item, path)}
                      </div>
                    );
                  }
                )
              }

              {/* Tab: Exchanges */}
              {activeTab === 'exchanges' &&
                renderArraySection(
                  'exchanges',
                  { id: `exc-${Date.now()}`, name: { en: '', zh: '' }, role: { en: '', zh: '' }, period: '', location: { en: '', zh: '' }, details: { en: [], zh: [] } },
                  (item) => ({
                    title: item.name?.[lang] || item.name?.zh || item.name?.en || '新海外交流 / New Exchange',
                    subtitle: item.role?.[lang] || item.role?.zh || item.role?.en,
                    period: item.period,
                    icon: '🌏'
                  }),
                  (path, index) => {
                    const item = formData.exchanges[index];
                    return (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-blue-500">English Info</h4>
                            {renderTextField([...path, 'name', 'en'], 'Program Name')}
                            {renderTextField([...path, 'role', 'en'], 'Role / Title')}
                            {renderTextField([...path, 'location', 'en'], 'Location')}
                            <StringArrayManager path={[...path, 'details', 'en']} label="📝 Highlights (EN)" formData={formData} updateField={updateField} />
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-red-500">中文信息</h4>
                            {renderTextField([...path, 'name', 'zh'], '交流项目名称')}
                            {renderTextField([...path, 'role', 'zh'], '职责 / 身份')}
                            {renderTextField([...path, 'location', 'zh'], '交流地点')}
                            <StringArrayManager path={[...path, 'details', 'zh']} label="📝 收获详情 (ZH)" formData={formData} updateField={updateField} />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60">
                          {renderTextField([...path, 'period'], '交流时间段 / Period')}
                        </div>

                        {renderExperienceDirectoryBanner('exchanges', item, path)}
                      </div>
                    );
                  }
                )
              }

              {/* Tab: Volunteers */}
              {activeTab === 'volunteers' &&
                renderArraySection(
                  'volunteers',
                  { id: `vol-${Date.now()}`, name: { en: '', zh: '' }, role: { en: '', zh: '' }, period: '', location: { en: '', zh: '' }, details: { en: [], zh: [] } },
                  (item) => ({
                    title: item.name?.[lang] || item.name?.zh || item.name?.en || '新志愿活动 / New Volunteer',
                    subtitle: item.role?.[lang] || item.role?.zh || item.role?.en,
                    period: item.period,
                    icon: '🤝'
                  }),
                  (path, index) => {
                    const item = formData.volunteers[index];
                    return (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-blue-500">English Info</h4>
                            {renderTextField([...path, 'name', 'en'], 'Activity Name')}
                            {renderTextField([...path, 'role', 'en'], 'Role / Duties')}
                            {renderTextField([...path, 'location', 'en'], 'Location')}
                            <StringArrayManager path={[...path, 'details', 'en']} label="📝 Contributions (EN)" formData={formData} updateField={updateField} />
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-red-500">中文信息</h4>
                            {renderTextField([...path, 'name', 'zh'], '志愿活动名称')}
                            {renderTextField([...path, 'role', 'zh'], '职责 / 身份')}
                            {renderTextField([...path, 'location', 'zh'], '志愿地点')}
                            <StringArrayManager path={[...path, 'details', 'zh']} label="📝 志愿明细 (ZH)" formData={formData} updateField={updateField} />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60">
                          {renderTextField([...path, 'period'], '活动时间 / Period')}
                        </div>

                        {renderExperienceDirectoryBanner('volunteers', item, path)}
                      </div>
                    );
                  }
                )
              }

              {/* Tab: Skills */}
              {activeTab === 'skills' &&
                renderArraySection(
                  'skills',
                  { id: `skill-${Date.now()}`, category: { en: '', zh: '' }, items: { en: [], zh: [] } },
                  (item) => ({
                    title: item.category?.[lang] || item.category?.zh || item.category?.en || '新技能分类 / New Skill Category',
                    subtitle: (item.items?.[lang] || []).join(', '),
                    icon: '🛠️'
                  }),
                  (path) => (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-blue-500">English Info</h4>
                        {renderTextField([...path, 'category', 'en'], 'Category Name')}
                        <StringArrayManager path={[...path, 'items', 'en']} label="🛠️ Skills List (EN)" formData={formData} updateField={updateField} />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-red-500">中文信息</h4>
                        {renderTextField([...path, 'category', 'zh'], '技能分类名称')}
                        <StringArrayManager path={[...path, 'items', 'zh']} label="🛠️ 技能列表 (ZH)" formData={formData} updateField={updateField} />
                      </div>
                    </div>
                  )
                )
              }
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Markdown Editor Modal Dialog */}
      <MarkdownEditorModal
        isOpen={mdModal.isOpen}
        onClose={() => setMdModal(prev => ({ ...prev, isOpen: false }))}
        type={mdModal.type}
        id={mdModal.id}
        title={mdModal.title}
        onSync={handleDataSync}
      />

    </div>
  );
};

export default Admin;
