'use client';

import React, { useMemo, useState } from 'react';

export type AccessValue = {
  all: boolean;         // daca e true, ignoram selectiile
  seriesIds: string[];  // coduri serii selectate
  studentIds: string[]; // id-uri studenti selectati
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
  const [seriesQuery, setSeriesQuery] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [studentLimit, setStudentLimit] = useState(200);

  // SERII
  const filteredSeries = useMemo(() => {
    const q = seriesQuery.trim().toLowerCase();
    if (!q) return series;
    return series.filter(s => s.toLowerCase().includes(q));
  }, [series, seriesQuery]);

  const allSeriesVisibleSelected = filteredSeries.length > 0 && filteredSeries.every(s => value.seriesIds.includes(s));
  const toggleAllSeriesVisible = () => {
    if (allSeriesVisibleSelected) {
      onChange({
        ...value,
        all: false,
        seriesIds: value.seriesIds.filter(id => !filteredSeries.includes(id)),
      });
    } else {
      const set = new Set(value.seriesIds);
      filteredSeries.forEach(id => set.add(id));
      onChange({ ...value, all: false, seriesIds: Array.from(set) });
    }
  };

  // STUDENTI
  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(st => st.label.toLowerCase().includes(q));
  }, [students, studentQuery]);

  const visibleStudents = filteredStudents.slice(0, studentLimit);
  const allStudentsVisibleSelected =
    visibleStudents.length > 0 && visibleStudents.every(st => value.studentIds.includes(st.id));

  const toggleAllStudentsVisible = () => {
    if (allStudentsVisibleSelected) {
      onChange({
        ...value,
        all: false,
        studentIds: value.studentIds.filter(id => !visibleStudents.some(st => st.id === id)),
      });
    } else {
      const set = new Set(value.studentIds);
      visibleStudents.forEach(st => set.add(st.id));
      onChange({ ...value, all: false, studentIds: Array.from(set) });
    }
  };

  const toggleSeries = (id: string) => {
    const set = new Set(value.seriesIds);
    set.has(id) ? set.delete(id) : set.add(id);
    onChange({ ...value, all: false, seriesIds: Array.from(set) });
  };

  const toggleStudent = (id: string) => {
    const set = new Set(value.studentIds);
    set.has(id) ? set.delete(id) : set.add(id);
    onChange({ ...value, all: false, studentIds: Array.from(set) });
  };

  const clearSelections = () => onChange({ ...value, all: false, seriesIds: [], studentIds: [] });

  return (
    <div className="space-y-4">
      {/* Toti studentii */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.all}
          onChange={(e) =>
            onChange({
              all: e.target.checked,
              seriesIds: [],
              studentIds: [],
            })
          }
        />
        <span>Toti studentii (ignora selectiile de mai jos)</span>
      </label>

      {!value.all && (
        <>
          {/* Rezumat selectii */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-md bg-white/50 px-2 py-1 dark:bg-white/10">
              Serii selectate: <strong>{value.seriesIds.length}</strong>
            </span>
            <span className="rounded-md bg-white/50 px-2 py-1 dark:bg-white/10">
              Studenti selectati: <strong>{value.studentIds.length}</strong>
            </span>
            {(value.seriesIds.length > 0 || value.studentIds.length > 0) && (
              <button type="button" className="btn btn-xs btn-outline-danger" onClick={clearSelections}>
                Goleste selectia
              </button>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* COL STANGA: SERII */}
            <section className="space-y-3 rounded-lg border border-white/20 p-3 dark:border-white/10">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium uppercase text-muted-foreground">Serii</div>
                <div className="text-xs text-muted-foreground">{filteredSeries.length} rezultate</div>
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
                        onChange={() => toggleSeries(s)}
                      />
                      <span className="truncate">{s}</span>
                    </label>
                  );
                })}
                {filteredSeries.length === 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground">Nicio serie gasita.</div>
                )}
              </div>
            </section>

            {/* COL DREAPTA: STUDENTI */}
            <section className="space-y-3 rounded-lg border border-white/20 p-3 dark:border-white/10">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium uppercase text-muted-foreground">Studenti</div>
                <div className="text-xs text-muted-foreground">
                  {filteredStudents.length} rezultate (afiseaza {Math.min(studentLimit, filteredStudents.length)})
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
                    onClick={() => setStudentLimit(x => Math.min(x + 200, filteredStudents.length))}
                  >
                    Incarca mai multe
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-auto rounded-md border border-white/10 p-2">
                {visibleStudents.map((st) => {
                  const active = value.studentIds.includes(st.id);
                  return (
                    <label key={st.id} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleStudent(st.id)}
                      />
                      <span className="truncate">{st.label}</span>
                    </label>
                  );
                })}
                {visibleStudents.length === 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground">Niciun student gasit.</div>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
