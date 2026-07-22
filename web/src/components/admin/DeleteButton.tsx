'use client';

export function DeleteButton({ id, confirmLabel, action }: {
  id: string; confirmLabel: string; action: (fd: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(confirmLabel)) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button className="text-sm text-red-600 hover:underline">Sil</button>
    </form>
  );
}
