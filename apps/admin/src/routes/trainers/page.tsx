import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';
import Header from '../../components/layout/Header';
import { X, Plus, Pencil, CheckCircle, AlertCircle } from 'lucide-react';

interface Trainer {
  id: string;
  bio?: string;
  experienceYears: number;
  specializations: string[];
  photoUrl?: string;
  isActive: boolean;
  user?: { id: string; firstName: string; lastName?: string; username?: string };
  _count?: { classes: number; exercises: number };
}

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  bio: '',
  experienceYears: 0,
  specializations: [] as string[],
  photoUrl: '',
  isActive: true,
};

// ── Rich Text Editor ────────────────────────────────────────────────────────

function RichEditor({ initialValue, onChange }: { initialValue: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== initialValue) {
      ref.current.innerHTML = initialValue || '';
    }
  }, []); // only on mount

  function exec(cmd: string, val?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, val ?? '');
    if (ref.current) onChange(ref.current.innerHTML);
  }

  const btnCls = 'px-2.5 py-1 text-xs rounded-lg bg-dark-100 text-cream/60 hover:text-cream hover:bg-dark-50 transition-colors select-none';

  return (
    <div className="border border-dark-50 rounded-xl overflow-hidden">
      <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-dark-200 border-b border-dark-50">
        <button type="button" className={`${btnCls} font-bold text-base leading-none`} onClick={() => exec('formatBlock', 'h2')}>H</button>
        <button type="button" className={`${btnCls} font-bold`} onClick={() => exec('bold')}>B</button>
        <button type="button" className={`${btnCls} italic`} onClick={() => exec('italic')}>I</button>
        <div className="w-px bg-dark-50 self-stretch mx-0.5" />
        <button type="button" className={btnCls} onClick={() => exec('insertUnorderedList')}>• Список</button>
        <button type="button" className={btnCls} onClick={() => exec('formatBlock', 'p')}>¶ Параграф</button>
        <div className="w-px bg-dark-50 self-stretch mx-0.5" />
        <button
          type="button"
          className={`${btnCls} text-red-400/60 hover:text-red-400`}
          onClick={() => { if (ref.current) { ref.current.innerHTML = ''; onChange(''); } }}
        >
          Очистить
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
        className="min-h-36 p-4 text-cream/80 text-sm focus:outline-none"
        style={{
          lineHeight: '1.7',
        }}
      />
      <style>{`
        [contenteditable] h2 { font-size: 1.1rem; font-weight: 700; color: #FFECCC; margin: 0.5em 0 0.25em; }
        [contenteditable] h3 { font-size: 0.95rem; font-weight: 600; color: #FFECCC; margin: 0.4em 0 0.2em; }
        [contenteditable] ul { list-style: disc; padding-left: 1.25em; margin: 0.4em 0; }
        [contenteditable] li { margin: 0.15em 0; }
        [contenteditable] b, [contenteditable] strong { color: #FFECCC; }
        [contenteditable] p { margin: 0.2em 0; }
        [contenteditable]:empty:before { content: 'Введите описание тренера...'; color: rgba(255,236,204,0.2); }
      `}</style>
    </div>
  );
}

// ── Specializations input ───────────────────────────────────────────────────

function SpecsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');

  function add() {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  }

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          className="input flex-1"
          placeholder="Йога, Пилатес, Стретчинг..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button type="button" onClick={add} className="btn-secondary px-3">+</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {value.map(s => (
          <span key={s} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-purple/20 text-purple-light">
            {s}
            <button type="button" onClick={() => onChange(value.filter(x => x !== s))}>
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function TrainersPage() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null); // null = create, string = edit id
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-trainers'],
    queryFn: () => apiFetch<{ data: Trainer[] }>('/admin/trainers'),
  });

  const trainers = data?.data ?? [];

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  }
  function showError(msg: string) {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  }

  const createMutation = useMutation({
    mutationFn: (body: typeof form) =>
      apiFetch('/admin/trainers', { method: 'POST', body: JSON.stringify({ ...body, experienceYears: Number(body.experienceYears) }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-trainers'] });
      setShowForm(false);
      setForm(EMPTY_FORM);
      showSuccess('Тренер создан!');
    },
    onError: (err: Error) => showError(err.message || 'Ошибка при создании'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: typeof form }) =>
      apiFetch(`/admin/trainers/${id}`, { method: 'PUT', body: JSON.stringify({ ...body, experienceYears: Number(body.experienceYears) }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-trainers'] });
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      showSuccess('Тренер обновлён!');
    },
    onError: (err: Error) => showError(err.message || 'Ошибка при обновлении'),
  });

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(t: Trainer) {
    setEditingId(t.id);
    setForm({
      firstName: t.user?.firstName ?? '',
      lastName: t.user?.lastName ?? '',
      bio: t.bio ?? '',
      experienceYears: t.experienceYears,
      specializations: [...t.specializations],
      photoUrl: t.photoUrl ?? '',
      isActive: t.isActive,
    });
    setShowForm(true);
  }

  function handleSubmit() {
    if (editingId) {
      updateMutation.mutate({ id: editingId, body: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <Header
        title="Тренеры"
        actions={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Добавить тренера
          </button>
        }
      />

      {/* Уведомления */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 shadow-lg">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X size={14} /></button>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 shadow-lg">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X size={14} /></button>
        </div>
      )}

      {/* Форма создания/редактирования */}
      {showForm && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="font-syne font-bold text-cream">
              {editingId ? 'Редактировать тренера' : 'Новый тренер'}
            </div>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="text-cream/30 hover:text-cream transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-5">
            {/* Имя и фото */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-cream/50 text-xs mb-1 block">Имя *</label>
                <input
                  className="input"
                  placeholder="Камила"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-cream/50 text-xs mb-1 block">Фамилия</label>
                <input
                  className="input"
                  placeholder="Рахимова"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>

            {/* Фото URL */}
            <div>
              <label className="text-cream/50 text-xs mb-1 block">Фото (URL)</label>
              <div className="flex gap-3 items-center">
                <input
                  className="input flex-1"
                  placeholder="https://..."
                  value={form.photoUrl}
                  onChange={e => setForm({ ...form, photoUrl: e.target.value })}
                />
                {form.photoUrl && (
                  <img
                    src={form.photoUrl}
                    alt="preview"
                    className="w-12 h-12 rounded-full object-cover border border-dark-50 flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>
            </div>

            {/* Опыт и статус */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-cream/50 text-xs mb-1 block">Лет опыта</label>
                <input
                  type="number"
                  className="input"
                  min={0}
                  value={form.experienceYears}
                  onChange={e => setForm({ ...form, experienceYears: +e.target.value })}
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.isActive ? 'bg-purple' : 'bg-dark-50'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-cream/70 text-sm">{form.isActive ? 'Активен' : 'Неактивен'}</span>
                </label>
              </div>
            </div>

            {/* Специализации */}
            <div>
              <label className="text-cream/50 text-xs mb-1 block">Специализации</label>
              <SpecsInput value={form.specializations} onChange={v => setForm({ ...form, specializations: v })} />
            </div>

            {/* Описание / Bio */}
            <div>
              <label className="text-cream/50 text-xs mb-1 block">Описание</label>
              <RichEditor
                initialValue={form.bio}
                onChange={html => setForm(f => ({ ...f, bio: html }))}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSubmit}
              disabled={isPending || !form.firstName}
              className="btn-primary disabled:opacity-50"
            >
              {isPending ? 'Сохранение...' : editingId ? 'Сохранить' : 'Создать'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="btn-secondary">
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Список тренеров */}
      {isLoading && <div className="text-cream/40 text-center py-12">Загрузка...</div>}

      <div className="grid grid-cols-2 gap-4">
        {trainers.map(t => (
          <div key={t.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {t.photoUrl ? (
                  <img
                    src={t.photoUrl}
                    alt={t.user?.firstName}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-purple/20 flex items-center justify-center text-xl font-syne font-bold text-purple-light flex-shrink-0">
                    {(t.user?.firstName ?? '?')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-cream font-syne font-bold">
                    {t.user?.firstName} {t.user?.lastName ?? ''}
                  </div>
                  <div className="text-cream/40 text-xs mt-0.5">{t.experienceYears} лет опыта</div>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${
                    t.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {t.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => openEdit(t)}
                className="flex items-center gap-1.5 text-xs text-cream/40 hover:text-cream transition-colors px-2 py-1.5 rounded-lg hover:bg-dark-50"
              >
                <Pencil size={13} /> Изменить
              </button>
            </div>

            {t.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {t.specializations.map(s => (
                  <span key={s} className="badge bg-purple/20 text-purple-light text-[10px]">{s}</span>
                ))}
              </div>
            )}

            {t.bio && (
              <div
                className="text-cream/50 text-xs leading-relaxed mb-3 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: t.bio }}
              />
            )}

            <div className="flex gap-4 pt-3 border-t border-dark-50">
              <div className="text-center">
                <div className="text-cream font-syne font-bold">{t._count?.classes || 0}</div>
                <div className="text-cream/30 text-xs">Занятий</div>
              </div>
              <div className="text-center">
                <div className="text-cream font-syne font-bold">{t._count?.exercises || 0}</div>
                <div className="text-cream/30 text-xs">Упражнений</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && trainers.length === 0 && !showForm && (
        <div className="text-center py-16 text-cream/30">
          <div className="text-4xl mb-3">👤</div>
          <p>Тренеры не найдены</p>
          <button onClick={openCreate} className="btn-primary mt-4">Добавить первого тренера</button>
        </div>
      )}
    </div>
  );
}
