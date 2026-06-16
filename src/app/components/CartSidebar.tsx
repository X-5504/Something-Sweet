import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft, Calendar as CalendarIcon, Info } from 'lucide-react';
import { useCart } from '../CartContext';
import { useTheme } from '../ThemeContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { DayPicker } from 'react-day-picker';
import { addDays, isBefore, startOfDay, format } from 'date-fns';

type DeliveryMethod = 'grab' | 'gosend' | null;

export function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart } = useCart();
  const { theme } = useTheme();
  
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [delivery, setDelivery] = useState<DeliveryMethod>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Mock disabled/full dates (e.g., tomorrow and the next day are full)
  const today = startOfDay(new Date());
  const fullDates = [addDays(today, 1), addDays(today, 2)];
  
  const isDateDisabled = (date: Date) => {
    // Disable past dates
    if (isBefore(startOfDay(date), today)) return true;
    
    // Disable "full" dates
    return fullDates.some(fullDate => 
      fullDate.getDate() === date.getDate() &&
      fullDate.getMonth() === date.getMonth() &&
      fullDate.getFullYear() === date.getFullYear()
    );
  };

  // Reset step when cart opens/closes
  React.useEffect(() => {
    if (!isCartOpen) {
      setTimeout(() => setStep('cart'), 300);
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const DELIVERY_FEE = 20000;
  const finalTotal = items.length > 0 ? totalPrice + DELIVERY_FEE : 0;

  const handleSubmitPreOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !phone || !delivery || !selectedDate) {
      toast.error('Please fill in all details to proceed.');
      return;
    }

    setIsSubmitting(true);
    // Simulate order submission
    setTimeout(() => {
      setIsSubmitting(false);
      clearCart();
      setIsCartOpen(false);
      setStep('cart');
      setAddress('');
      setPhone('');
      setDelivery(null);
      setSelectedDate(undefined);
      toast.success("Pre-order confirmed! We'll contact you via WhatsApp shortly.");
    }, 1500);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col transform transition-transform duration-300 ease-in-out`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme.borderLight} bg-white z-10`}>
          <div className="flex items-center gap-2">
            {step === 'checkout' ? (
              <button 
                onClick={() => setStep('cart')}
                className="p-1 -ml-1 text-gray-400 hover:text-gray-900 transition-colors mr-2"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            ) : (
              <ShoppingBag className={`w-6 h-6 ${theme.textPrimary}`} />
            )}
            <h2 className="text-xl font-bold text-gray-900">
              {step === 'checkout' ? 'Pre-order Details' : 'Your Cart'}
            </h2>
            {step === 'cart' && (
              <span className={`bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-sm font-medium ml-2`}>
                {totalItems}
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 relative">
          
          {/* View: Cart */}
          {step === 'cart' && (
            <div className="p-6 h-full flex flex-col">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 my-auto">
                  <div className={`w-24 h-24 rounded-full ${theme.bgLightHalf} flex items-center justify-center mb-4`}>
                    <ShoppingBag className={`w-12 h-12 ${theme.textLight}`} />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">Your cart is empty</h3>
                  <p className="text-gray-500">Looks like you haven't added any sweet treats yet.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className={`mt-4 px-6 py-2 rounded-full ${theme.bgPrimary} text-white font-medium ${theme.hoverBgPrimary} transition-colors`}
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Pre-order notice */}
                  <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl flex gap-3 items-start border border-yellow-200">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
                    <p className="text-sm">
                      <strong>Reminder:</strong> All items are for pre-order. You'll choose your delivery date on the next step.
                    </p>
                  </div>

                  {items.map((item) => (
                    <div key={item.id} className={`flex gap-4 p-4 rounded-2xl bg-white border ${theme.borderLight} shadow-sm`}>
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <ImageWithFallback src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
                            <p className={`text-sm ${theme.textPrimary} font-medium mt-1`}>
                              Rp {item.price.toLocaleString('id-ID')}{item.unit}
                            </p>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className={`p-1.5 ${theme.textPrimary} ${theme.hoverTextDark} transition-colors`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="font-bold text-gray-900">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* View: Checkout Form */}
          {step === 'checkout' && (
            <div className="p-6">
              <form id="checkout-form" onSubmit={handleSubmitPreOrder} className="space-y-8">
                
                {/* Contact & Address */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full ${theme.bgPrimary} text-white flex items-center justify-center text-xs`}>1</span>
                    Delivery Details
                  </h3>
                  
                  <div className="space-y-3 pl-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="e.g. 08123456789"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className={`w-full p-3 rounded-xl border ${theme.borderLight} focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow ${theme.textDark}`}
                        style={{ '--tw-ring-color': 'var(--primary-color, #f472b6)' } as React.CSSProperties}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Delivery Address</label>
                      <textarea 
                        required
                        placeholder="Street name, building, apartment details..."
                        rows={3}
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className={`w-full p-3 rounded-xl border ${theme.borderLight} focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow ${theme.textDark} resize-none`}
                        style={{ '--tw-ring-color': 'var(--primary-color, #f472b6)' } as React.CSSProperties}
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Option */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full ${theme.bgPrimary} text-white flex items-center justify-center text-xs`}>2</span>
                    Courier Service
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 pl-8">
                    <label className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${delivery === 'grab' ? `${theme.borderMedium} bg-white shadow-md` : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-500'}`}>
                      <input 
                        type="radio" 
                        name="delivery" 
                        value="grab" 
                        checked={delivery === 'grab'}
                        onChange={() => setDelivery('grab')}
                        className="sr-only" 
                      />
                      <span className="font-bold text-sm">Grab Instant</span>
                    </label>
                    <label className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${delivery === 'gosend' ? `${theme.borderMedium} bg-white shadow-md` : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-500'}`}>
                      <input 
                        type="radio" 
                        name="delivery" 
                        value="gosend" 
                        checked={delivery === 'gosend'}
                        onChange={() => setDelivery('gosend')}
                        className="sr-only" 
                      />
                      <span className="font-bold text-sm">GoSend</span>
                    </label>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full ${theme.bgPrimary} text-white flex items-center justify-center text-xs`}>3</span>
                    Pre-order Date
                  </h3>
                  
                  <div className="pl-8">
                    <div className={`bg-white rounded-xl border ${theme.borderLight} p-2 shadow-sm overflow-hidden flex justify-center`}>
                      <DayPicker 
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={isDateDisabled}
                        modifiers={{
                          full: fullDates
                        }}
                        modifiersStyles={{
                          full: { textDecoration: 'line-through', color: '#dc2626', backgroundColor: '#fee2e2' }
                        }}
                        className={`rdp-custom ${theme.textDark}`}
                        styles={{
                          day_selected: { backgroundColor: 'var(--primary-color, #f472b6)', color: 'white', fontWeight: 'bold' }
                        }}
                      />
                    </div>
                    <div className="mt-3 flex gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div> Fully Booked
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-gray-200"></div> Available
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={`p-6 bg-white border-t ${theme.borderLight} shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10`}>
            
            {/* Show totals only on cart step to save space, or a compact version on checkout */}
            {step === 'cart' ? (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>Rp {DELIVERY_FEE.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-100">
                    <span>Total</span>
                    <span>Rp {finalTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setStep('checkout')}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-lg transition-all ${theme.bgPrimary} ${theme.hoverBgPrimary} shadow-lg ${theme.hoverShadowMedium} transform hover:-translate-y-0.5`}
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex-shrink-0">
                  <p className="text-xs text-gray-500 mb-0.5">Grand Total</p>
                  <p className="text-lg font-bold text-gray-900">Rp {finalTotal.toLocaleString('id-ID')}</p>
                </div>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting || !selectedDate || !delivery || !phone || !address}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold transition-all ${isSubmitting || !selectedDate || !delivery || !phone || !address ? 'bg-gray-300 cursor-not-allowed' : `${theme.bgPrimary} ${theme.hoverBgPrimary} shadow-md transform hover:-translate-y-0.5`}`}
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm Pre-order'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}