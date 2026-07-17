type MoveAction = (fd: FormData) => void | Promise<void>;

const btn =
  'grid size-6 place-items-center rounded border border-cream-200 text-ink/60 hover:bg-cream-100 hover:text-brand-600 disabled:opacity-40';

/** Up/Down reorder controls backed by a server action (id + dir). */
export function MoveButtons({ action, id }: { action: MoveAction; id: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="up" />
        <button type="submit" aria-label="Yuxarı" className={btn}>↑</button>
      </form>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="down" />
        <button type="submit" aria-label="Aşağı" className={btn}>↓</button>
      </form>
    </span>
  );
}
