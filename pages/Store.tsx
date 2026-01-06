import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

interface StoreProps {
  products: Product[];
  categories: Category[];
  initialCategoryId?: string;
  onViewProduct: (id: string) => void;
  onAddToCart: (product: Product) => void;
}

const Store: React.FC<StoreProps> = ({
  products,
  categories: allCategories,
  initialCategoryId = 'All',
  onViewProduct,
  onAddToCart
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>(initialCategoryId);

  React.useEffect(() => {
    setSelectedCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by category ID in the product.categories array
    const matchesCategory = selectedCategoryId === 'All' || p.categories.includes(selectedCategoryId);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h1 className="text-4xl font-black text-brand-primary tracking-tight uppercase italic">Marketplace</h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-content-muted" />
            <input
              type="text"
              placeholder="Search workflows..."
              className="w-full pl-12 pr-6 py-4 bg-white border border-base-border rounded-2xl focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-content-muted" />
            <select
              className="appearance-none pl-12 pr-12 py-4 bg-white border border-base-border rounded-2xl focus:ring-2 focus:ring-brand-secondary outline-none transition-all cursor-pointer min-w-[200px] font-bold"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              <option value="All">All Payloads</option>
              {allCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-base-border">
          <SlidersHorizontal className="h-16 w-16 text-base-border mx-auto mb-6" />
          <h3 className="text-2xl font-black text-content-primary tracking-tight">No matching blueprints found</h3>
          <p className="text-content-secondary mt-2 font-medium">Try adjusting your search terms or mission parameters.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategoryId('All'); }}
            className="mt-8 text-brand-secondary font-black uppercase tracking-widest text-xs hover:text-brand-primary"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewProduct}
              onAddToCart={onAddToCart}
              style={{ animationDelay: `${idx * 50}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Store;
