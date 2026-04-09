import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  AlertTriangle,
  Wallet,
  Menu,
  X,
  ChevronRight,
  Printer,
  Edit,
  Trash2,
  Save,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Banknote,
  Lock,
  Eye,
  Download,
  Calendar,
  Hammer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  increment,
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestore-utils';
import { Auth } from './components/Auth';

// --- COMPONENTES DE UI REDISEÑADOS ---

const Badge = ({ children, variant = 'info' }: { children: React.ReactNode, variant?: 'info' | 'success' | 'warning' | 'danger' | 'construction' }) => {
  const styles = {
    info: 'bg-blue-50 text-blue-600 border-blue-100',
    success: 'bg-green-50 text-green-600 border-green-100',
    warning: 'bg-orange-50 text-orange-600 border-orange-100',
    danger: 'bg-red-50 text-red-600 border-red-100',
    construction: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[variant]}`}>{children}</span>;
};

const Card = ({ title, value, icon: Icon, color, subtitle, trend, iconColor = "text-white" }: any) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white flex flex-col justify-between transition-all h-full"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-4 rounded-2xl ${color} ${iconColor} shadow-lg`}>
        <Icon size={32} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-3 py-1 rounded-xl font-bold text-xs ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {subtitle}
        </div>
      )}
    </div>
    <div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h3 className="text-4xl font-black text-slate-800">{value}</h3>
    </div>
  </motion.div>
);

const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const variants: any = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-xl',
    secondary: 'bg-white border-2 border-slate-100 text-slate-700 hover:border-blue-200 hover:bg-blue-50',
    success: 'bg-green-500 text-white hover:bg-green-600 shadow-green-200 shadow-xl',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-red-200 shadow-xl',
    construction: 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow-yellow-200 shadow-xl',
    ghost: 'hover:bg-slate-100 text-slate-600'
  };
  return (
    <button className={`px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- VISTAS ---

const Dashboard = ({ products, sales, userProfile }: any) => {
  const lowStockCount = products.filter((p: any) => p.stock <= p.stock_minimo).length;
  const totalSalesVal = sales.reduce((acc: any, s: any) => acc + s.total, 0);

  const chartData = [45, 52, 38, 65, 48, 72, 58];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">¡Hola, {userProfile?.nombre?.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Aquí tienes el resumen de {userProfile?.empresas?.nombre} para hoy.</p>
        </div>
        <Button variant="construction" className="w-full md:w-auto">
          <Plus size={20} /> Nueva Venta Rápida
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Ventas Totales" value={`$${totalSalesVal.toFixed(2)}`} icon={ShoppingCart} color="bg-orange-600" subtitle="12%" trend="up" />
        <Card title="Productos" value={products.length} icon={Package} color="bg-yellow-400" iconColor="text-yellow-900" />
        <Card title="Stock Crítico" value={lowStockCount} icon={AlertTriangle} color={lowStockCount > 0 ? "bg-red-500" : "bg-green-500"} subtitle={lowStockCount > 0 ? "Revisar ahora" : "Todo bien"} trend={lowStockCount > 0 ? "down" : "up"} />
        <Card title="Caja Fuerte" value="$1,250" icon={Wallet} color="bg-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800">Rendimiento Semanal</h3>
            <div className="flex gap-2">
              <Badge variant="success">Ventas +15%</Badge>
            </div>
          </div>
          <div className="flex items-end justify-between h-56 gap-4">
            {chartData.map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 1, delay: i * 0.1, type: 'spring' }}
                  className={`w-full rounded-2xl shadow-lg ${i === 5 ? 'bg-blue-600' : 'bg-slate-100'}`}
                />
                <span className="text-xs font-black text-slate-400">D{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white">
          <h3 className="text-xl font-black text-slate-800 mb-6">Ventas Recientes</h3>
          <div className="space-y-5">
            {sales.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart size={24} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold text-sm">Sin ventas hoy</p>
              </div>
            ) : (
              sales.slice(-4).reverse().map((sale: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-blue-600">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700">Ticket #{sale.id}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sale.time}</p>
                    </div>
                  </div>
                  <p className="font-black text-blue-600">${sale.total.toFixed(0)}</p>
                </div>
              ))
            )}
          </div>
          <Button variant="secondary" className="w-full mt-6">Ver todo el historial</Button>
        </div>
      </div>
    </motion.div>
  );
};

const POS = ({ products, onSaleComplete }: any) => {
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const addToCart = (product: any) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.map(item => item.id === product.id ? {...item, qty: item.qty + 1} : item);
      return [...prev, {...product, qty: 1}];
    });
  };

  const removeFromCart = (id: string) => setCart(cart.filter(item => item.id !== id));
  const total = useMemo(() => cart.reduce((acc, item) => acc + (item.precio_venta * item.qty), 0), [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    onSaleComplete(cart, total);
    setCart([]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col lg:flex-row h-full gap-6 md:gap-8 overflow-hidden"
    >
      <div className="flex-1 flex flex-col gap-4 md:gap-6 overflow-hidden">
        <div className="relative group">
          <Search className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors md:w-6 md:h-6" size={20} />
          <input 
            type="text" 
            placeholder="¿Qué herramienta buscas hoy?"
            className="w-full pl-12 md:pl-14 pr-6 py-3 md:py-4 bg-white rounded-2xl md:rounded-[1.5rem] border-2 border-transparent shadow-xl shadow-slate-200/40 focus:border-blue-500 outline-none text-base md:text-lg font-medium transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-12">
          {products.filter((p: any) => p.nombre.toLowerCase().includes(search.toLowerCase())).map((product: any) => (
            <motion.div 
              key={product.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addToCart(product)}
              className={`bg-white p-6 rounded-[2rem] border-2 transition-all shadow-lg hover:shadow-2xl ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed border-slate-100' : 'cursor-pointer border-transparent hover:border-blue-500 shadow-slate-200/50'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <Badge variant={product.stock <= product.stock_minimo ? "danger" : "construction"}>
                  {product.categoria_id || 'General'}
                </Badge>
                {product.stock <= product.stock_minimo && product.stock > 0 && (
                  <AlertTriangle size={20} className="text-orange-500 animate-pulse" />
                )}
              </div>
              <h4 className="text-lg font-black text-slate-800 line-clamp-2 h-14 leading-tight">{product.nombre}</h4>
              <div className="flex items-end justify-between mt-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio</p>
                  <p className="text-2xl font-black text-blue-600">${product.precio_venta?.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</p>
                  <p className={`text-sm font-black ${product.stock <= product.stock_minimo ? 'text-red-500' : 'text-slate-800'}`}>{product.stock} un.</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[400px] xl:w-[450px] bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl shadow-slate-300/50 border border-slate-100 flex flex-col h-[500px] lg:h-full overflow-hidden shrink-0">
        <div className="p-4 md:p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg md:text-xl font-black text-slate-800">Orden Actual</h3>
          <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-black">
            <ShoppingCart size={14} /> {cart.length} ÍTEMS
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-slate-300"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart size={40} />
                </div>
                <p className="text-lg font-black opacity-50">Carrito vacío</p>
                <p className="text-sm font-medium opacity-40">Selecciona productos a la izquierda</p>
              </motion.div>
            ) : (
              cart.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-[1.5rem] group border border-transparent hover:border-blue-100 transition-all"
                >
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800 truncate w-56">{item.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-blue-600">${item.precio_venta?.toFixed(2)}</span>
                      <span className="text-xs font-bold text-slate-400">x {item.qty}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <p className="font-black text-slate-900">${(item.precio_venta * item.qty).toFixed(2)}</p>
                     <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-300 hover:text-red-500 shadow-sm transition-all">
                       <X size={16} />
                     </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 md:p-8 bg-slate-900 text-white space-y-4 md:space-y-6">
          <div className="space-y-1 md:space-y-2">
            <div className="flex justify-between text-slate-400 text-xs md:text-sm font-bold">
              <span>Subtotal</span>
              <span>${(total / 1.19).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs md:text-sm font-bold">
              <span>IVA (19%)</span>
              <span>${(total - (total / 1.19)).toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between text-2xl md:text-3xl font-black pt-4 border-t border-white/10">
            <span>Total</span>
            <span className="text-yellow-400">${total.toFixed(2)}</span>
          </div>
          
          <Button variant="construction" className="w-full py-4 md:py-5 text-base md:text-lg" onClick={handleCheckout} disabled={cart.length === 0}>
            FINALIZAR VENTA
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const Inventory = ({ products, userProfile, refreshData }: any) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempProduct, setTempProduct] = useState<any>({});
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setTempProduct(p);
  };

  const saveEdit = async () => {
    try {
      await updateDoc(doc(db, 'productos', editingId!), {
        nombre: tempProduct.nombre,
        precio_venta: tempProduct.precio_venta,
        stock: tempProduct.stock,
      });
      setEditingId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `productos/${editingId}`);
    }
  };

  const deleteProduct = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteDoc(doc(db, 'productos', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `productos/${id}`);
      }
    }
  };

  const filteredProducts = products.filter((p: any) => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) || 
    (p.codigo_barras && p.codigo_barras.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden"
    >
      {isModalOpen && (
        <ProductModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => { setIsModalOpen(false); }}
          userProfile={userProfile}
        />
      )}
      <div className="p-4 md:p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full md:w-auto">
          <h3 className="text-xl md:text-2xl font-black text-slate-800 whitespace-nowrap">Almacén Central</h3>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-transparent rounded-xl outline-none focus:border-blue-500 shadow-sm font-medium transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <Button variant="construction" className="w-full md:w-auto" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Registrar Producto
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50/30 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
            <tr>
              <th className="px-4 md:px-8 py-4 md:py-6">SKU / Código</th>
              <th className="px-4 md:px-8 py-4 md:py-6">Descripción</th>
              <th className="px-4 md:px-8 py-4 md:py-6">Categoría</th>
              <th className="px-4 md:px-8 py-4 md:py-6 text-right">Precio</th>
              <th className="px-4 md:px-8 py-4 md:py-6 text-center">Stock</th>
              <th className="px-4 md:px-8 py-4 md:py-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredProducts.map((p: any) => (
              <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-4 md:px-8 py-4 md:py-6">
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg font-mono text-[10px] font-bold">
                    {p.codigo_barras || 'S/C'}
                  </span>
                </td>
                <td className="px-4 md:px-8 py-4 md:py-6">
                  {editingId === p.id ? (
                    <input 
                      className="border-2 border-blue-500 rounded-xl px-3 py-1.5 w-full text-sm font-bold outline-none shadow-lg"
                      value={tempProduct.nombre}
                      onChange={e => setTempProduct({...tempProduct, nombre: e.target.value})}
                    />
                  ) : (
                    <span className="font-black text-slate-700 text-sm">{p.nombre}</span>
                  )}
                </td>
                <td className="px-4 md:px-8 py-4 md:py-6">
                  <Badge variant="info">{p.categoria_id || 'General'}</Badge>
                </td>
                <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                   {editingId === p.id ? (
                    <input 
                      type="number"
                      className="border-2 border-blue-500 rounded-xl px-3 py-1.5 w-20 text-sm font-bold outline-none text-right shadow-lg"
                      value={tempProduct.precio_venta}
                      onChange={e => setTempProduct({...tempProduct, precio_venta: parseFloat(e.target.value)})}
                    />
                  ) : (
                    <span className="font-black text-blue-600 text-base md:text-lg">${p.precio_venta?.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-4 md:px-8 py-4 md:py-6">
                  <div className="flex items-center justify-center gap-2 md:gap-3">
                    {editingId === p.id ? (
                      <input 
                        type="number"
                        className="border-2 border-blue-500 rounded-xl px-3 py-1.5 w-20 text-sm font-bold outline-none text-center shadow-lg"
                        value={tempProduct.stock}
                        onChange={e => setTempProduct({...tempProduct, stock: parseInt(e.target.value)})}
                      />
                    ) : (
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-black text-xs md:text-sm ${p.stock <= p.stock_minimo ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {p.stock}
                        {p.stock <= p.stock_minimo && <AlertTriangle size={12} className="animate-pulse" />}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 md:px-8 py-4 md:py-6">
                  <div className="flex items-center justify-center gap-1 md:gap-2">
                    {editingId === p.id ? (
                      <button onClick={saveEdit} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-green-500 text-white rounded-lg md:rounded-xl shadow-lg shadow-green-200 hover:bg-green-600 transition-all">
                        <Save size={18} />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => startEdit(p)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-lg md:rounded-xl shadow-sm transition-all">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-lg md:rounded-xl shadow-sm transition-all">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const ProductModal = ({ onClose, onSave, userProfile }: any) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [code, setCode] = useState('');

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'productos'), {
        empresa_id: userProfile.empresa_id,
        nombre: name,
        precio_venta: parseFloat(price),
        precio_compra: parseFloat(cost),
        stock: parseInt(stock),
        stock_minimo: parseInt(minStock),
        codigo_barras: code,
        created_at: serverTimestamp()
      });
      onSave();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'productos');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-xl rounded-3xl md:rounded-[3rem] shadow-2xl overflow-hidden my-auto"
      >
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl md:text-2xl font-black text-slate-800">Nuevo Producto</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-h-[60vh] overflow-y-auto">
          <div className="sm:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre del Producto</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 rounded-xl md:rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all text-sm md:text-base" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Precio Venta</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 rounded-xl md:rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all text-sm md:text-base" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Precio Compra</label>
            <input type="number" value={cost} onChange={e => setCost(e.target.value)} className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 rounded-xl md:rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all text-sm md:text-base" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Stock Inicial</label>
            <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 rounded-xl md:rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all text-sm md:text-base" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Stock Mínimo</label>
            <input type="number" value={minStock} onChange={e => setMinStock(e.target.value)} className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 rounded-xl md:rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all text-sm md:text-base" />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Código de Barras / SKU</label>
            <input value={code} onChange={e => setCode(e.target.value)} className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 rounded-xl md:rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all text-sm md:text-base" />
          </div>
        </div>
        <div className="p-6 md:p-8 bg-slate-50 flex flex-col sm:flex-row gap-3 md:gap-4">
          <Button variant="secondary" className="flex-1 order-2 sm:order-1" onClick={onClose}>Cancelar</Button>
          <Button variant="construction" className="flex-1 order-1 sm:order-2" onClick={handleSave}>Guardar Producto</Button>
        </div>
      </motion.div>
    </div>
  );
};

const Directory = ({ title, items, type, userProfile, refreshData }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const deleteItem = async (id: string) => {
    if (confirm(`¿Estás seguro de eliminar este ${type === 'customer' ? 'cliente' : 'proveedor'}?`)) {
      const table = type === 'customer' ? 'clientes' : 'proveedores';
      try {
        await deleteDoc(doc(db, table, id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `${table}/${id}`);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {isModalOpen && (
        <ContactModal 
          type={type} 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => { setIsModalOpen(false); }}
          userProfile={userProfile}
        />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{title}</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Gestiona tus contactos comerciales con facilidad.</p>
        </div>
        <Button variant="construction" className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={20} /> Nuevo {type === 'customer' ? 'Cliente' : 'Proveedor'}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item: any) => (
          <motion.div 
            key={item.id} 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group"
          >
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 font-black text-2xl shadow-inner group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                {item.nombre?.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-800 leading-tight">{item.nombre}</h4>
                <Badge variant={type === 'customer' ? 'info' : 'construction'}>
                  {type === 'customer' ? 'CLIENTE VIP' : item.categoria || 'PROVEEDOR'}
                </Badge>
              </div>
            </div>
            <div className="space-y-4 text-sm font-bold text-slate-500">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl group-hover:bg-white transition-colors">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                  <Phone size={16} />
                </div>
                {item.telefono || 'N/A'}
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl group-hover:bg-white transition-colors">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                  <Mail size={16} />
                </div>
                <span className="truncate">{item.email || item.contacto || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl group-hover:bg-white transition-colors">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                  <MapPin size={16} />
                </div>
                <span className="truncate">{item.direccion || 'Dirección no registrada'}</span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end gap-3">
              <button className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm">
                <Edit size={18} />
              </button>
              <button onClick={() => deleteItem(item.id)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm">
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const ContactModal = ({ type, onClose, onSave, userProfile }: any) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  const handleSave = async () => {
    const table = type === 'customer' ? 'clientes' : 'proveedores';
    try {
      await addDoc(collection(db, table), {
        empresa_id: userProfile.empresa_id,
        nombre,
        email,
        telefono,
        direccion,
        created_at: serverTimestamp()
      });
      onSave();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, table);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-800">Nuevo {type === 'customer' ? 'Cliente' : 'Proveedor'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Nombre / Razón Social</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Correo Electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Teléfono</label>
            <input value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Dirección</label>
            <input value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all" />
          </div>
        </div>
        <div className="p-8 bg-slate-50 flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button variant="construction" className="flex-1" onClick={handleSave}>Guardar Contacto</Button>
        </div>
      </motion.div>
    </div>
  );
};

const Purchases = ({ products, userProfile, refreshData }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  useEffect(() => {
    if (userProfile) fetchPurchases();
  }, [userProfile]);

  const fetchPurchases = async () => {
    try {
      const q = query(collection(db, 'compras'), where('empresa_id', '==', userProfile.empresa_id));
      const snapshot = await getDocs(q);
      setPurchaseOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'compras');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {isModalOpen && (
        <PurchaseModal 
          products={products}
          onClose={() => setIsModalOpen(false)} 
          onSave={() => { setIsModalOpen(false); fetchPurchases(); }}
          userProfile={userProfile}
        />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Órdenes de Compra</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Abastece tu inventario con los mejores proveedores.</p>
        </div>
        <Button variant="construction" className="w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
          <ShoppingCart size={20} /> Nueva Orden
        </Button>
      </div>

      <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50/30 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-4 md:px-8 py-4 md:py-6">ID Orden</th>
                <th className="px-4 md:px-8 py-4 md:py-6">Proveedor</th>
                <th className="px-4 md:px-8 py-4 md:py-6">Fecha</th>
                <th className="px-4 md:px-8 py-4 md:py-6 text-right">Monto Total</th>
                <th className="px-4 md:px-8 py-4 md:py-6 text-center">Estado</th>
                <th className="px-4 md:px-8 py-4 md:py-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {purchaseOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 md:px-8 py-4 md:py-6 font-mono font-bold text-blue-600 text-[10px] md:text-xs truncate max-w-[100px]">{order.id}</td>
                  <td className="px-4 md:px-8 py-4 md:py-6 font-black text-slate-700 text-sm">{order.proveedores?.nombre || 'General'}</td>
                  <td className="px-4 md:px-8 py-4 md:py-6 font-bold text-slate-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 md:px-8 py-4 md:py-6 text-right font-black text-slate-800 text-sm">${order.total.toFixed(2)}</td>
                  <td className="px-4 md:px-8 py-4 md:py-6">
                    <div className="flex justify-center">
                      <Badge variant="success">Recibido</Badge>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-6">
                    <div className="flex justify-center gap-1 md:gap-2">
                      <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg md:rounded-xl transition-all">
                        <Eye size={16} />
                      </button>
                      <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-green-600 rounded-lg md:rounded-xl transition-all">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

const PurchaseModal = ({ products, onClose, onSave, userProfile }: any) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState('');
  const [items, setItems] = useState<any[]>([]);

  const addItem = () => {
    const prod = products.find((p: any) => p.id === selectedProduct);
    if (prod && qty && cost) {
      setItems([...items, { ...prod, qty: parseInt(qty), cost: parseFloat(cost) }]);
      setSelectedProduct('');
      setQty('');
      setCost('');
    }
  };

  const handleSave = async () => {
    try {
      const batch = writeBatch(db);
      const total = items.reduce((acc, i) => acc + (i.cost * i.qty), 0);
      
      const purchaseRef = doc(collection(db, 'compras'));
      batch.set(purchaseRef, {
        empresa_id: userProfile.empresa_id,
        total,
        created_at: serverTimestamp()
      });

      for (const i of items) {
        const detailRef = doc(collection(db, 'detalles_compra'));
        batch.set(detailRef, {
          compra_id: purchaseRef.id,
          producto_id: i.id,
          cantidad: i.qty,
          precio_unitario: i.cost,
          subtotal: i.cost * i.qty
        });

        const productRef = doc(db, 'productos', i.id);
        batch.update(productRef, {
          stock: increment(i.qty),
          precio_compra: i.cost
        });
      }

      await batch.commit();
      onSave();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'compras/batch');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-800">Nueva Compra</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Producto</label>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all">
                <option value="">Seleccionar...</option>
                {products.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Cant.</label>
              <input type="number" value={qty} onChange={e => setQty(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Costo Unit.</label>
              <div className="flex gap-2">
                <input type="number" value={cost} onChange={e => setCost(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all" />
                <Button variant="construction" onClick={addItem}><Plus size={20} /></Button>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 max-h-48 overflow-y-auto">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                <span className="font-bold text-sm">{item.nombre}</span>
                <span className="font-black text-blue-600">{item.qty} x ${item.cost}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-8 bg-slate-50 flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button variant="construction" className="flex-1" onClick={handleSave} disabled={items.length === 0}>Finalizar Compra</Button>
        </div>
      </motion.div>
    </div>
  );
};

const Reports = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Centro de Reportes</h2>
          <p className="text-slate-500 font-medium mt-1">Analiza el rendimiento de tu ferretería en tiempo real.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary"><Calendar size={20} /> Últimos 30 días</Button>
          <Button variant="primary"><Download size={20} /> Exportar PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Ventas Totales', value: '$124,500', trend: '+12%', color: 'bg-blue-600' },
          { label: 'Margen de Utilidad', value: '32.5%', trend: '+5%', color: 'bg-green-500' },
          { label: 'Gastos Operativos', value: '$45,200', trend: '-2%', color: 'bg-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-4xl font-black text-slate-800">{stat.value}</h3>
              <span className={`text-sm font-black px-3 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
            <div className="mt-6 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${stat.color}`} style={{ width: '70%' }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-white shadow-2xl shadow-slate-200/60">
        <h3 className="text-xl font-black text-slate-800 mb-8">Comparativa de Ventas Mensuales</h3>
        <div className="flex items-end justify-between h-64 gap-4">
          {[40, 60, 45, 90, 65, 80, 95].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
              <div className="w-full bg-slate-50 rounded-2xl relative overflow-hidden h-full flex items-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full bg-blue-600 rounded-t-xl group-hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                />
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Mes {i+1}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Cashier = ({ userProfile }: any) => {
  const [movements, setMovements] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (userProfile) fetchMovements();
  }, [userProfile]);

  const fetchMovements = async () => {
    try {
      // 1. Get Cashier for company
      const q = query(collection(db, 'cajas'), where('empresa_id', '==', userProfile.empresa_id));
      const snapshot = await getDocs(q);
      
      let cashierDoc;
      if (snapshot.empty) {
        // Create initial cashier if not exists
        const newCashierRef = await addDoc(collection(db, 'cajas'), {
          empresa_id: userProfile.empresa_id,
          nombre: 'Caja Principal',
          saldo_actual: 0,
          created_at: serverTimestamp()
        });
        const newDoc = await getDoc(newCashierRef);
        cashierDoc = newDoc;
      } else {
        cashierDoc = snapshot.docs[0];
      }
      
      if (cashierDoc) {
        setBalance(cashierDoc.data().saldo_actual);
        // 2. Get Movements
        const movQ = query(collection(db, 'movimientos_caja'), where('caja_id', '==', cashierDoc.id));
        const movSnapshot = await getDocs(movQ);
        setMovements(movSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'cajas/movimientos');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Control de Caja</h2>
          <p className="text-slate-500 font-medium mt-1">Supervisa el flujo de efectivo de tu sucursal.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="danger"><ArrowDownRight size={20} /> Registrar Egreso</Button>
          <Button variant="success"><ArrowUpRight size={20} /> Registrar Ingreso</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-900/30 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-2">Saldo en Caja</p>
              <h3 className="text-5xl font-black">${balance.toFixed(2)}</h3>
              <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase opacity-50">Apertura</p>
                  <p className="font-bold">$0.00</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase opacity-50">Ventas Hoy</p>
                  <p className="font-bold">${balance.toFixed(2)}</p>
                </div>
              </div>
              <Button variant="white" className="w-full mt-8 text-blue-600">
                <Lock size={20} /> Cerrar Caja
              </Button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">Movimientos Recientes</h3>
              <Badge variant="info">Hoy, {new Date().toLocaleDateString()}</Badge>
            </div>
            <div className="divide-y divide-slate-50">
              {movements.length === 0 ? (
                <div className="p-12 text-center text-slate-300 font-bold">Sin movimientos registrados</div>
              ) : (
                movements.map((m) => (
                  <div key={m.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${m.tipo === 'ingreso' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {m.tipo === 'ingreso' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800">{m.concepto}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(m.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className={`text-xl font-black ${m.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                      {m.monto > 0 ? '+' : ''}{m.monto.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SettingsView = () => {
  const [activeSubTab, setActiveSubTab] = useState('perfil');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden flex h-full"
    >
      <div className="w-72 bg-slate-50/50 border-r border-slate-100 p-8 space-y-2">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-4">Configuración</h3>
        {['perfil', 'empresa', 'sucursales', 'suscripcion', 'seguridad'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`w-full text-left px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
              activeSubTab === tab ? 'bg-white text-blue-600 shadow-xl shadow-blue-900/5' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-2xl space-y-10">
          <header>
            <h2 className="text-3xl font-black text-slate-800 capitalize tracking-tight">{activeSubTab}</h2>
            <p className="text-slate-500 font-medium mt-1">Personaliza tu experiencia en FerreSaaS.</p>
          </header>

          {activeSubTab === 'perfil' && (
            <div className="space-y-8">
              <div className="flex items-center gap-8 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-900/20">
                  MA
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800">Martín Ivan Arteaga</h4>
                  <p className="text-slate-400 font-bold">Administrador General</p>
                  <Button variant="secondary" className="mt-4 py-2 px-4 text-xs">Cambiar Foto</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Nombre Completo</label>
                  <input type="text" defaultValue="Martín Ivan Arteaga" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Correo Electrónico</label>
                  <input type="email" defaultValue="martin@ferresaas.com" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all" />
                </div>
              </div>
              <Button variant="primary" className="px-12">Guardar Cambios</Button>
            </div>
          )}

          {activeSubTab !== 'perfil' && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-300 bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-100">
              <Settings size={48} className="opacity-20 animate-spin-slow mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">Módulo en desarrollo</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- APP SHELL PRINCIPAL ---

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setSession(user);
        // Fetch user profile
        try {
          const profileDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (profileDoc.exists()) {
            setUserProfile({ id: profileDoc.id, ...profileDoc.data() });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `usuarios/${user.uid}`);
        }
      } else {
        setSession(null);
        setUserProfile(null);
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userProfile) return;

    const empresaId = userProfile.empresa_id;

    // Real-time listeners
    const unsubProducts = onSnapshot(
      query(collection(db, 'productos'), where('empresa_id', '==', empresaId)),
      (snapshot) => {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'productos')
    );

    const unsubSales = onSnapshot(
      query(collection(db, 'ventas'), where('empresa_id', '==', empresaId)),
      (snapshot) => {
        setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'ventas')
    );

    const unsubClients = onSnapshot(
      query(collection(db, 'clientes'), where('empresa_id', '==', empresaId)),
      (snapshot) => {
        setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'clientes')
    );

    const unsubSuppliers = onSnapshot(
      query(collection(db, 'proveedores'), where('empresa_id', '==', empresaId)),
      (snapshot) => {
        setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'proveedores')
    );

    return () => {
      unsubProducts();
      unsubSales();
      unsubClients();
      unsubSuppliers();
    };
  }, [userProfile]);

  const handleSaleComplete = async (cart: any[], total: number) => {
    if (!userProfile) return;

    try {
      const batch = writeBatch(db);
      
      // 1. Create Sale
      const saleRef = doc(collection(db, 'ventas'));
      batch.set(saleRef, {
        empresa_id: userProfile.empresa_id,
        usuario_id: userProfile.id,
        total,
        iva: total * 0.19,
        metodo_pago: 'efectivo',
        created_at: serverTimestamp(),
      });

      // 2. Create Details & Update Stock
      for (const item of cart) {
        const detailRef = doc(collection(db, 'detalles_venta'));
        batch.set(detailRef, {
          venta_id: saleRef.id,
          producto_id: item.id,
          cantidad: item.qty,
          precio_unitario: item.price,
          subtotal: item.price * item.qty,
        });

        const productRef = doc(db, 'productos', item.id);
        batch.update(productRef, {
          stock: increment(-item.qty)
        });
      }

      await batch.commit();
      setActiveTab('dashboard');
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'ventas/batch');
    }
  };

  const handleLogout = async () => {
    if (isDemo) {
      setIsDemo(false);
      setUserProfile(null);
    } else {
      await signOut(auth);
    }
  };

  const handleDemoAccess = () => {
    const demoProfile = {
      id: 'demo-user',
      nombre: 'Usuario Demo',
      rol: 'Administrador',
      empresa_id: 'demo-company-id',
      empresas: {
        nombre: 'SurBytes Ferretero Demo'
      }
    };
    setIsDemo(true);
    setUserProfile(demoProfile);
  };

  if (loading && !isDemo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session && !isDemo) {
    return <Auth onDemoAccess={handleDemoAccess} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'pos', label: 'Ventas', icon: ShoppingCart },
    { id: 'products', label: 'Almacén', icon: Package },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'suppliers', label: 'Proveedores', icon: Truck },
    { id: 'purchases', label: 'Compras', icon: ShoppingBag },
    { id: 'cash', label: 'Caja', icon: Banknote },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative"
    >
      {/* Overlay para móvil cuando el sidebar está abierto */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Rediseñado y Responsivo */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 md:w-24'} 
        fixed md:relative inset-y-0 left-0 bg-slate-900 text-slate-400 transition-all duration-500 flex flex-col z-50 md:z-20 shadow-2xl
      `}>
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-xl shadow-orange-900/20">
            <Hammer className="text-white" size={28} />
          </div>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden"
            >
              <h2 className="font-black text-2xl text-white tracking-tight leading-none">SurBytes</h2>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-orange-500 mt-1.5 opacity-80">Ferretero ERP</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 mt-8 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/40' 
                : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={24} className={activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400 transition-colors'} />
              {sidebarOpen && <span className="font-black text-sm tracking-wide">{item.label}</span>}
              {!sidebarOpen && activeTab === item.id && (
                <div className="absolute left-2 w-1 h-8 bg-yellow-400 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 p-4 w-full hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all group"
          >
            <LogOut size={24} className="group-hover:rotate-12 transition-transform" />
            {sidebarOpen && <span className="text-sm font-black">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Area Principal Rediseñada */}
      <main className="flex-1 flex flex-col relative overflow-hidden w-full">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 md:gap-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 md:p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm bg-white border border-slate-100">
              <Menu size={20} className="md:w-6 md:h-6" />
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              {isDemo && (
                <div className="px-2 md:px-4 py-1 bg-orange-500 text-white rounded-full text-[8px] md:text-[10px] font-black border border-orange-600 animate-pulse whitespace-nowrap">
                  DEMO
                </div>
              )}
              <div className="hidden sm:block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black border border-blue-100 whitespace-nowrap">
                SUCURSAL CENTRAL
              </div>
              <ChevronRight size={16} className="text-slate-300 hidden sm:block" />
              <span className="text-slate-800 font-black text-xs md:text-sm uppercase tracking-widest truncate max-w-[100px] md:max-w-none">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
             <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Caja Registradora</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-black">TURNO ACTIVO</span>
              </div>
             </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-700 font-black border-2 border-white shadow-lg uppercase text-sm md:text-base">
              {userProfile?.nombre?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-10 overflow-y-auto bg-slate-50/50">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <Dashboard key="dash" products={products} sales={sales} userProfile={userProfile} />}
            {activeTab === 'pos' && <POS key="pos" products={products} onSaleComplete={handleSaleComplete} />}
            {activeTab === 'products' && <Inventory key="inv" products={products} userProfile={userProfile} />}
            {activeTab === 'customers' && <Directory key="cust" title="Directorio de Clientes" items={customers} type="customer" userProfile={userProfile} />}
            {activeTab === 'suppliers' && <Directory key="supp" title="Directorio de Proveedores" items={suppliers} type="supplier" userProfile={userProfile} />}
            {activeTab === 'purchases' && <Purchases key="purch" products={products} userProfile={userProfile} />}
            {activeTab === 'reports' && <Reports key="rep" />}
            {activeTab === 'cash' && <Cashier key="cash" userProfile={userProfile} />}
            {activeTab === 'settings' && <SettingsView key="sett" userProfile={userProfile} />}
            
            {!['dashboard', 'pos', 'products', 'customers', 'suppliers', 'purchases', 'reports', 'cash', 'settings'].includes(activeTab) && (
              <motion.div 
                key="other"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 shadow-inner"
              >
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <Settings size={56} className="opacity-20 animate-spin-slow text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-800">Módulo en Construcción</h3>
                <p className="max-w-sm text-center mt-3 font-medium text-slate-400">Estamos preparando las mejores herramientas para que gestiones tu {activeTab} con facilidad.</p>
                <Button variant="construction" className="mt-10 px-10" onClick={() => setActiveTab('dashboard')}>
                  Volver al Inicio
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
}

/*
-- SQL SCHEMA FOR SUPABASE --

CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  empresa_id UUID REFERENCES empresas(id),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  rol TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  nombre TEXT NOT NULL
);

CREATE TABLE marcas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  nombre TEXT NOT NULL
);

CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  categoria_id TEXT,
  marca_id TEXT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio_compra NUMERIC(10,2),
  precio_venta NUMERIC(10,2),
  stock INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  codigo_barras TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE proveedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  contacto TEXT,
  categoria TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  cliente_id UUID REFERENCES clientes(id),
  total NUMERIC(10,2) NOT NULL,
  metodo_pago TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE detalle_ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venta_id UUID REFERENCES ventas(id),
  producto_id UUID REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL
);

CREATE TABLE compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  proveedor_id UUID REFERENCES proveedores(id),
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE detalle_compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  compra_id UUID REFERENCES compras(id),
  producto_id UUID REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL
);

CREATE TABLE cajas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  nombre TEXT NOT NULL,
  saldo_actual NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE movimientos_caja (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caja_id UUID REFERENCES cajas(id),
  tipo TEXT CHECK (tipo IN ('ingreso', 'egreso')),
  monto NUMERIC(10,2) NOT NULL,
  concepto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gastos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  concepto TEXT NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  categoria TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
*/
