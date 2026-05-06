import React, { useState, useMemo, useEffect } from 'react';

interface Kitchen {
  id: number;
  name: string;
  location: string;
  capacity: number;
}

interface Reservation {
  id: number;
  netid: string;
  startTime: string;
  endTime: string;
  comment: string | null;
  additionalNetids: string | null;
}

interface Props {
  kitchen: Kitchen;
  reservations: Reservation[];
  currentNetId: string | null;
  loginUrl: string | null;
}

const CELL_HEIGHT = 48; // px per hour — must match $calendar-cell-height in SCSS
const START_HOUR = 8;
const NUM_HOURS = 14; // 8 AM through 9 PM slots, ending at 10 PM
const HOURS = Array.from({ length: NUM_HOURS }, (_, i) => i + START_HOUR);
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// All date arithmetic is UTC so it matches how the server stores times.
// The server uses Time.zone.local with no timezone configured → stores UTC.
// e.g. user picks "9 AM" → stored as 09:00:00Z → must read back as UTC hour 9.

function utcMidnight(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

function todayUTC(): Date {
  const n = new Date();
  return utcMidnight(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
}

function getMondayUTC(date: Date): Date {
  const day = date.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(date.getTime() + diff * 86_400_000);
}

function addDays(date: Date, n: number): Date {
  return new Date(date.getTime() + n * 86_400_000);
}

function isSameUTCDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function formatHour(h: number): string {
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function toISODateUTC(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getCsrfToken(): string {
  return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}

function eventTopPx(start: Date): number {
  return (start.getUTCHours() + start.getUTCMinutes() / 60 - START_HOUR) * CELL_HEIGHT;
}

function eventHeightPx(start: Date, end: Date): number {
  return ((end.getTime() - start.getTime()) / 3_600_000) * CELL_HEIGHT;
}

interface FormState {
  date: string;
  startHour: number;
  duration: number;
  additionalNetids: string[];
  comment: string;
}

const defaultForm = (today: Date): FormState => ({
  date: toISODateUTC(today),
  startHour: START_HOUR,
  duration: 1,
  additionalNetids: [],
  comment: '',
});

const KitchenShow: React.FC<Props> = ({ kitchen, reservations: initialReservations, currentNetId, loginUrl }) => {
  const today = useMemo(() => todayUTC(), []);

  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [weekOffset, setWeekOffset] = useState(0);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'deleting'>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<Reservation | null>(null);
  const [netidInput, setNetidInput] = useState('');
  const [form, setForm] = useState<FormState>(() => defaultForm(today));

  const weekStart = useMemo(() => addDays(getMondayUTC(today), weekOffset * 7), [today, weekOffset]);
  const weekDates = useMemo(() => DAYS.map((_, i) => addDays(weekStart, i)), [weekStart]);

  // Past-hour guard: auto-advance startHour when today is selected and the chosen hour has passed
  const minStartHour = useMemo(() => {
    if (form.date !== toISODateUTC(today)) return START_HOUR;
    return Math.min(new Date().getUTCHours() + 1, START_HOUR + NUM_HOURS - 1);
  }, [form.date, today]);

  useEffect(() => {
    if (form.startHour < minStartHour) {
      setForm(f => ({ ...f, startHour: minStartHour }));
    }
  }, [minStartHour, form.startHour]);

  function addNetid() {
    const trimmed = netidInput.trim();
    if (trimmed && !form.additionalNetids.includes(trimmed)) {
      setForm(f => ({ ...f, additionalNetids: [...f.additionalNetids, trimmed] }));
    }
    setNetidInput('');
  }

  function removeNetid(id: string) {
    setForm(f => ({ ...f, additionalNetids: f.additionalNetids.filter(n => n !== id) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrors([]);
    setSuccessMessage(null);

    // Commit any pending netid input before submitting
    const pendingNetids = [...form.additionalNetids];
    const pending = netidInput.trim();
    if (pending && !pendingNetids.includes(pending)) pendingNetids.push(pending);

    try {
      const res = await fetch(`/kitchens/${kitchen.id}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify({
          date: form.date,
          startHour: form.startHour,
          duration: form.duration,
          additionalNetids: pendingNetids.length > 0 ? pendingNetids.join(', ') : null,
          comment: form.comment || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setReservations(r => [...r, data]);
        setSuccessMessage('confirmed');
        setForm(defaultForm(today));
        setNetidInput('');
        setStatus('idle');
      } else {
        setErrors(data.errors ?? [data.error ?? 'Something went wrong.']);
        setStatus('idle');
      }
    } catch {
      setErrors(['Network error. Please try again.']);
      setStatus('idle');
    }
  }

  function handleDelete(reservation: Reservation) {
    setDeleteModal(reservation);
  }

  async function confirmDelete() {
    const reservation = deleteModal;
    if (!reservation) return;
    setDeleteModal(null);
    setStatus('deleting');

    try {
      const res = await fetch(`/kitchens/${kitchen.id}/reservations/${reservation.id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': getCsrfToken() },
      });

      if (res.ok) {
        setReservations(r => r.filter(x => x.id !== reservation.id));
        setStatus('idle');
      } else {
        const data = await res.json();
        alert(data.error ?? 'Could not cancel reservation.');
        setStatus('idle');
      }
    } catch {
      alert('Network error. Please try again.');
      setStatus('idle');
    }
  }

  const isCurrentWeek = weekOffset === 0;
  const weekLabel = isCurrentWeek
    ? 'This Week'
    : `${formatDateLabel(weekStart)} – ${formatDateLabel(addDays(weekStart, 6))}`;

  return (
    <div className="page-island kitchen-show">
      <div className="kitchen-show__nav">
        <a href="/kitchens" className="kitchen-show__back">← All Kitchens</a>
        <a href="/kitchen-rules" className="kitchen-show__rules-link">Kitchen Rules</a>
      </div>

      <div className="kitchen-show__header">
        <h1 className="kitchen-show__name">{kitchen.name}</h1>
        <p className="kitchen-show__meta">
          {kitchen.location} &middot; capacity {kitchen.capacity}
        </p>
      </div>

      {/* Calendar */}
      <section className="kitchen-calendar">
        <div className="kitchen-calendar__nav">
          <button
            className="kitchen-calendar__nav-btn"
            onClick={() => setWeekOffset(w => w - 1)}
            disabled={isCurrentWeek}
          >
            ← Prev
          </button>
          <span className="kitchen-calendar__week-label">{weekLabel}</span>
          <button
            className="kitchen-calendar__nav-btn"
            onClick={() => setWeekOffset(w => w + 1)}
          >
            Next →
          </button>
        </div>

        {/*
          Scroll container wraps BOTH the header row and body so they share
          the same scrollbar width — prevents column misalignment.
        */}
        <div className="kitchen-calendar__scroll">
          {/* Sticky header row */}
          <div className="kitchen-calendar__header-row">
            <div className="kitchen-calendar__time-spacer" />
            {weekDates.map((date, di) => {
              const isToday = isSameUTCDay(date, today);
              return (
                <div
                  key={di}
                  className={`kitchen-calendar__day-header${isToday ? ' kitchen-calendar__day-header--today' : ''}`}
                >
                  <span className="kitchen-calendar__day-name">{DAYS[di]}</span>
                  <span className="kitchen-calendar__day-date">{formatDateLabel(date)}</span>
                </div>
              );
            })}
          </div>

          {/* Body: time labels + day columns with absolute-positioned events */}
          <div className="kitchen-calendar__body">
            <div className="kitchen-calendar__time-col">
              {HOURS.map(h => (
                <div key={h} className="kitchen-calendar__time-label">{formatHour(h)}</div>
              ))}
            </div>

            <div className="kitchen-calendar__days">
              {weekDates.map((date, di) => {
                const dayReservations = reservations.filter(r =>
                  isSameUTCDay(new Date(r.startTime), date)
                );

                return (
                  <div key={di} className="kitchen-calendar__day-col">
                    {HOURS.map(h => (
                      <div key={h} className="kitchen-calendar__grid-line" />
                    ))}

                    {dayReservations.map(r => {
                      const start = new Date(r.startTime);
                      const end = new Date(r.endTime);
                      const isOwn = r.netid === currentNetId;

                      return (
                        <div
                          key={r.id}
                          className={`kitchen-calendar__event${isOwn ? ' kitchen-calendar__event--own' : ''}`}
                          style={{
                            top: eventTopPx(start),
                            height: eventHeightPx(start, end),
                          }}
                          title={r.comment ?? undefined}
                        >
                          <span className="kitchen-calendar__event-netid">{r.netid}</span>
                          <span className="kitchen-calendar__event-time">
                            {formatHour(start.getUTCHours())}–{formatHour(end.getUTCHours())}
                          </span>
                          {isOwn && start > new Date() && (
                            <button
                              className="kitchen-calendar__event-delete"
                              onClick={() => handleDelete(r)}
                              disabled={status === 'deleting'}
                              aria-label="Cancel reservation"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Reservation form */}
      {currentNetId ? (
        <section className="reservation-form">
          <h2 className="reservation-form__heading">Make a Reservation</h2>
          <p className="reservation-form__auth-note">Booking as <strong>{currentNetId}</strong></p>

          {successMessage && (
            <div className="reservation-form__success">
              Your reservation has been confirmed!{' '}
              <a href="/kitchen-rules" className="reservation-form__success-link">
                Review the Kitchen Rules
              </a>{' '}
              before your session.
            </div>
          )}

          {errors.length > 0 && (
            <ul className="reservation-form__errors">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}

          <form onSubmit={handleSubmit} className="reservation-form__form">
            <div className="reservation-form__row">
              <label className="reservation-form__label" htmlFor="res-date">Date</label>
              <input
                id="res-date"
                type="date"
                className="reservation-form__input"
                value={form.date}
                min={toISODateUTC(today)}
                required
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>

            <div className="reservation-form__row">
              <label className="reservation-form__label" htmlFor="res-start">Start time</label>
              <select
                id="res-start"
                className="reservation-form__select"
                value={form.startHour}
                onChange={e => setForm(f => ({ ...f, startHour: Number(e.target.value) }))}
              >
                {HOURS.filter(h => h >= minStartHour).map(h => (
                  <option key={h} value={h}>{formatHour(h)}</option>
                ))}
              </select>
            </div>

            <div className="reservation-form__row">
              <label className="reservation-form__label" htmlFor="res-duration">Duration</label>
              <select
                id="res-duration"
                className="reservation-form__select"
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
              </select>
            </div>

            <div className="reservation-form__row">
              <label className="reservation-form__label" htmlFor="res-guests">
                Additional NetIDs
                <span className="reservation-form__hint"> (optional — press Enter or comma to add)</span>
              </label>
              {form.additionalNetids.length > 0 && (
                <div className="netid-chips">
                  {form.additionalNetids.map(id => (
                    <span key={id} className="netid-chip">
                      {id}
                      <button
                        type="button"
                        className="netid-chip__remove"
                        onClick={() => removeNetid(id)}
                        aria-label={`Remove ${id}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                id="res-guests"
                type="text"
                className="reservation-form__input"
                placeholder="netid1 netid2 netid3"
                value={netidInput}
                onChange={e => setNetidInput(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
                    e.preventDefault();
                    addNetid();
                  }
                }}
                onBlur={addNetid}
              />
            </div>

            <div className="reservation-form__row">
              <label className="reservation-form__label" htmlFor="res-comment">
                Comment
                <span className="reservation-form__hint"> (optional)</span>
              </label>
              <textarea
                id="res-comment"
                className="reservation-form__textarea"
                rows={3}
                placeholder="Any notes about your reservation…"
                value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              />
            </div>

            <button
              type="submit"
              className="reservation-form__submit"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Booking…' : 'Confirm Reservation'}
            </button>
          </form>
        </section>
      ) : (
        <section className="reservation-form reservation-form--guest">
          <p className="reservation-form__login-prompt">
            {loginUrl
              ? <><a href={loginUrl}>Log in</a> to make a reservation.</>
              : 'Authentication is not available in this environment.'}
          </p>
        </section>
      )}

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="reservation-modal" onClick={() => setDeleteModal(null)}>
          <div className="reservation-modal__card" onClick={e => e.stopPropagation()}>
            <h3 className="reservation-modal__heading">Cancel Reservation?</h3>
            <p className="reservation-modal__body">
              {deleteModal.netid} &mdash; {formatHour(new Date(deleteModal.startTime).getUTCHours())} to {formatHour(new Date(deleteModal.endTime).getUTCHours())}, {formatDateLabel(new Date(deleteModal.startTime))}
            </p>
            <div className="reservation-modal__actions">
              <button className="reservation-modal__confirm" onClick={confirmDelete}>
                Yes, Cancel
              </button>
              <button className="reservation-modal__dismiss" onClick={() => setDeleteModal(null)}>
                Keep It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenShow;
