'use client';

import React, { useEffect, useMemo, useState } from 'react';
import IconLock from '@/components/icon/icon-lock';
import IconGlobe from '@/components/icon/icon-globe';
import IconUsers from '@/components/icon/icon-users';

export type AccessValue = {
  all: boolean;
  seriesIds: string[];
  studentIds: string[];
};

type Student = { id: string; label: string };

export function AccessEditor({
  value,
  onChange,
  series,
  students,
}: {
  value: AccessValue;
  onChange: (v: AccessValue) => void;
  series: string[];
  students: Student[];
}) {
  // mode intern ca sa stim ce sa aratam jos
  const [mode, setMode] = useState<'private' | 'public' | 'restricted'>('private');

  // sincronizam cand vine o valoare noua din afara
  useEffect(() => {
    if (value.all) {
      setMode('public');
    } else if (value.seriesIds.length > 0 || value.studentIds.length > 0) {
      setMode('restricted');
    } else {
      // aici sunt goale si all=false
      // daca user-ul tocmai a ales restrictionat, nu il intoarcem la privat
      setMode((prev) => (prev === 'restricted' ? 'restricted' : 'private'));
    }
  }, [value.all, value.seriesIds, value.studentIds]);

  const [seriesQuery, setSeriesQuery] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [studentLimit, setStudentLimit] = useState(200);

  // actiuni de top
  const selectPrivate = () => {
    setMode('private');
    onChange({
      all: false,
      seriesIds: [],
      studentIds: [],
    });
  };

  const selectPublic = () => {
    setMode('public');
    onChange({
      all: true,
      seriesIds: [],
      studentIds: [],
    });
  };

  const selectRestricted = () => {
    setMode('restricted');
    onChange({
      all: false,
      seriesIds: value.seriesIds ?? [],
      studentIds: value.studentIds ?? [],
    });
  };

  // filtrari
  const filteredSeries = useMemo(() => {
    const q = seriesQuery.trim().toLowerCase();
    if (!q) return series;
    return series.filter((s) => s.toLowerCase().includes(q));
  }, [series, seriesQuery]);

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((st) => st.label.toLowerCase().includes(q));
  }, [students, studentQuery]);

  const visibleStudents = filteredStudents.slice(0, studentLimit);

  // select all visible series
  const allSeriesVisibleSelected =
    filteredSeries.length > 0 && filteredSeries.every((s) => value.seriesIds.includes(s));

  const toggleAllSeriesVisible = () => {
    if (allSeriesVisibleSelected) {
      onChange({
        ...value,
        all: false,
        seriesIds: value.seriesIds.filter((id) => !filteredSeries.includes(id)),
      });
    } else {
      const set = new Set(value.seriesIds);
      filteredSeries.forEach((id) => set.add(id));
      onChange({ ...value, all: false, seriesIds: Array.from(set) });
    }
  };

  // select all visible students
  const allStudentsVisibleSelected =
    visibleStudents.length > 0 && visibleStudents.every((st) => value.studentIds.includes(st.id));

  const toggleAllStudentsVisible = () => {
    if (allStudentsVisibleSelected) {
      onChange({
        ...value,
        all: false,
        studentIds: value.studentIds.filter(
          (id) => !visibleStudents.some((st) => st.id === id)
        ),
      });
    } else {
      const set = new Set(value.studentIds);
      visibleStudents.forEach((st) => set.add(st.id));
      onChange({ ...value, all: false, studentIds: Array.from(set) });
    }
  };

  const clearSelections = () =>
    onChange({
      ...value,
      all: false,
      seriesIds: [],
      studentIds: [],
    });

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Acces material</h3>
        <p className="text-xs text-muted-foreground">
          Alege cine poate vedea acest material.
        </p>
      </div>

      {/* cele 3 optiuni */}
      <div className="grid gap-2 md:grid-cols-3">
        {/* Privat */}
        <label
          className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition ${
            mode === 'private' ? 'border-primary/70 bg-primary/5' : 'border-transparent bg-muted/20'
          }`}
        >
          <input
            type="checkbox"
            checked={mode === 'private'}
            onChange={selectPrivate}
            className="mt-1"
          />
          <div className="flex items-start gap-2">
            <IconLock className="mt-0.5 h-4 w-4 text-rose-500" />
            <div>
              <div className="font-medium">Privat</div>
              <div className="text-xs text-muted-foreground">Nimeni nu are acces.</div>
            </div>
          </div>
        </label>

        {/* Public */}
        <label
          className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition ${
            mode === 'public' ? 'border-primary/70 bg-primary/5' : 'border-transparent bg-muted/20'
          }`}
        >
          <input
            type="checkbox"
            checked={mode === 'public'}
            onChange={selectPublic}
            className="mt-1"
          />
          <div className="flex items-start gap-2">
            <IconGlobe className="mt-0.5 h-4 w-4 text-green-500" />
            <div>
              <div className="font-medium">Public</div>
              <div className="text-xs text-muted-foreground">Toti studentii au acces.</div>
            </div>
          </div>
        </label>

        {/* Restrictionat */}
        <label
          className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition ${
            mode === 'restricted'
              ? 'border-primary/70 bg-primary/5'
              : 'border-transparent bg-muted/20'
          }`}
        >
          <input
            type="checkbox"
            checked={mode === 'restricted'}
            onChange={selectRestricted}
            className="mt-1"
          />
          <div className="flex items-start gap-2">
            <IconUsers className="mt-0.5 h-4 w-4 text-blue-500" />
            <div>
              <div className="font-medium">Restrictionat</div>
              <div className="text-xs text-muted-foreground">
                Doar seriile sau studentii selectati au acces.
              </div>
            </div>
          </div>
        </label>
      </div>

      {/* zona de selectie apare doar la restrictionat */}
      {mode === 'restricted' && (
        <>
          {/* rezumat */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-md bg-white/40 px-2 py-1 dark:bg-white/10">
              Serii selectate: <strong>{value.seriesIds.length}</strong>
            </span>
            <span className="rounded-md bg-white/40 px-2 py-1 dark:bg-white/10">
              Studenti selectati: <strong>{value.studentIds.length}</strong>
            </span>
            {(value.seriesIds.length > 0 || value.studentIds.length > 0) && (
              <button
                type="button"
                className="btn btn-xs btn-outline-danger"
                onClick={clearSelections}
              >
                Goleste selectia
              </button>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* serii */}
            <section className="space-y-3 rounded-lg border border-white/20 p-3 dark:border-white/10">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium uppercase text-muted-foreground">Serii</div>
                <div className="text-xs text-muted-foreground">
                  {filteredSeries.length} rezultate
                </div>
              </div>

              <input
                className="form-input"
                placeholder="Cauta serie"
                value={seriesQuery}
                onChange={(e) => setSeriesQuery(e.target.value)}
              />

              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSeriesVisibleSelected}
                    onChange={toggleAllSeriesVisible}
                  />
                  <span>Selecteaza toate vizibile</span>
                </label>
              </div>

              <div className="max-h-64 overflow-auto rounded-md border border-white/10 p-2">
                {filteredSeries.map((s) => {
                  const active = value.seriesIds.includes(s);
                  return (
                    <label key={s} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => {
                          const set = new Set(value.seriesIds);
                          set.has(s) ? set.delete(s) : set.add(s);
                          onChange({
                            ...value,
                            all: false,
                            seriesIds: Array.from(set),
                          });
                        }}
                      />
                      <span className="truncate">{s}</span>
                    </label>
                  );
                })}
                {filteredSeries.length === 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    Nicio serie gasita.
                  </div>
                )}
              </div>
            </section>

            {/* studenti */}
            <section className="space-y-3 rounded-lg border border-white/20 p-3 dark:border-white/10">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium uppercase text-muted-foreground">Studenti</div>
                <div className="text-xs text-muted-foreground">
                  {filteredStudents.length} rezultate (afiseaza{' '}
                  {Math.min(studentLimit, filteredStudents.length)})
                </div>
              </div>

              <input
                className="form-input"
                placeholder="Cauta student (nume/email)"
                value={studentQuery}
                onChange={(e) => {
                  setStudentLimit(200);
                  setStudentQuery(e.target.value);
                }}
              />

              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allStudentsVisibleSelected}
                    onChange={toggleAllStudentsVisible}
                  />
                  <span>Selecteaza toate vizibile</span>
                </label>
                {studentLimit < filteredStudents.length && (
                  <button
                    type="button"
                    className="btn btn-xs btn-outline-primary"
                    onClick={() =>
                      setStudentLimit((x) => Math.min(x + 200, filteredStudents.length))
                    }
                  >
                    Incarca mai multe
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-auto rounded-md border border-white/10 p-2">
                {visibleStudents.map((st) => {
                  const active = value.studentIds.includes(st.id);
                  return (
                    <label
                      key={st.id}
                      className="flex cursor-pointer items-center gap-2 py-1 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => {
                          const set = new Set(value.studentIds);
                          set.has(st.id) ? set.delete(st.id) : set.add(st.id);
                          onChange({
                            ...value,
                            all: false,
                            studentIds: Array.from(set),
                          });
                        }}
                      />
                      <span className="truncate">{st.label}</span>
                    </label>
                  );
                })}
                {visibleStudents.length === 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    Niciun student gasit.
                  </div>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
