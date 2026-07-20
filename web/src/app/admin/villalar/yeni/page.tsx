import { createVilla } from '../actions';
import { VillaCoreForm } from '@/components/admin/VillaCoreForm';
import Link from 'next/link';

export default function NewVillaPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/villalar" className="text-sm text-aegean-600 hover:underline">← Villalar</Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold text-pine-900">Yeni villa</h1>
      <p className="mb-4 text-sm text-slate-600">
        Önce temel bilgileri kaydedin; başlık, açıklama, fotoğraf ve sezon fiyatları bir sonraki adımda eklenir.
      </p>
      <VillaCoreForm villa={{}} action={createVilla} submitLabel="Oluştur ve devam et" />
    </div>
  );
}
