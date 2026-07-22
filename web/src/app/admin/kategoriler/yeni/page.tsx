import { createCategory } from '../actions';
import { CategoryForm } from '@/components/admin/CategoryForm';
import Link from 'next/link';

export default function NewCategoryPage() {
  return (
    <div>
      <Link href="/admin/kategoriler" className="text-sm text-aegean-600 hover:underline">← Kategoriler</Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold text-pine-900">Yeni kategori</h1>
      <CategoryForm category={{}} action={createCategory} submitLabel="Oluştur" />
    </div>
  );
}
