import React from 'react';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useTheme } from '../ThemeContext';
import { useCart } from '../CartContext';
import { toast } from 'sonner';

const menuItems = [
  {
    category: "Signature Chiffon Cakes",
    description: "Cloud-like, airy perfection in three irresistible flavors.",
    items: [
      {
        id: "c1",
        name: "Pandan Chiffon",
        desc: "Infused with real pandan leaves for an aromatic, lightly sweet bite.",
        price: 240000,
        unit: "",
        img: "https://images.unsplash.com/photo-1759324351433-c5a1063f8ac6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHNwb25nZSUyMGNha2UlMjBzbGljZXxlbnwxfHx8fDE3NzY1NjAyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: "c2",
        name: "Chocolate Chiffon",
        desc: "Airy cocoa goodness that melts perfectly in your mouth.",
        price: 260000,
        unit: "",
        img: "https://images.unsplash.com/photo-1574344069030-b2926f1b3d06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBzcG9uZ2UlMjBjYWtlfGVufDF8fHx8MTc3NjU2MDI3MHww&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: "c3",
        name: "Cheese Chiffon",
        desc: "Sweet meets savory in this impossibly soft cheese-topped sponge.",
        price: 280000,
        unit: "",
        img: "https://images.unsplash.com/photo-1731045102967-6e97132a7245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVlc2UlMjBzcG9uZ2UlMjBjYWtlJTIwc2xpY2V8ZW58MXx8fHwxNzc2NTYwMjc3fDA&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  },
  {
    category: "Classic Rolls & Bakes",
    description: "Our beloved staples that you can never go wrong with.",
    items: [
      {
        id: "r1",
        name: "Strawberry Cake Roll",
        desc: "Fresh strawberries and light cream hugged by a delicate, pillowy sponge.",
        price: 320000,
        unit: "",
        img: "https://images.unsplash.com/photo-1724805054535-90caaeb76102?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJhd2JlcnJ5JTIwc3dpc3MlMjByb2xsJTIwY2FrZXxlbnwxfHx8fDE3NzY1NjAyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: "r2",
        name: "Fudgy Chocolate Brownies",
        desc: "Intensely chocolatey and dense with that irresistible crinkly top.",
        price: 200000,
        unit: "",
        img: "https://images.unsplash.com/photo-1608732220898-9e419b03d71f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdWRneSUyMGNob2NvbGF0ZSUyMGJyb3duaWVzfGVufDF8fHx8MTc3NjU2MDI3MHww&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  },
  {
    category: "Other Sweets",
    description: "Little treats for the moments when you just need a quick bite of joy.",
    items: [
      {
        id: "s1",
        name: "Rose Vanilla Cupcakes",
        desc: "Delicate vanilla cake crowned with our signature whipped pink frosting.",
        price: 180000,
        unit: " / half-dozen",
        img: "https://images.unsplash.com/photo-1622995706580-a332aed41cdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcGluayUyMGZyb3N0ZWQlMjBjdXBjYWtlc3xlbnwxfHx8fDE3NzY1NjAyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: "s2",
        name: "Fresh Berry Tart",
        desc: "Crisp buttery crust filled with rich custard and topped with seasonal fruits.",
        price: 350000,
        unit: "",
        img: "https://images.unsplash.com/photo-1773907889788-ed2a37755d76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZydWl0JTIwdGFydCUyMGJha2VyeXxlbnwxfHx8fDE3NzY1NjAyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080"
      },
      {
        id: "s3",
        name: "Pastel Macarons",
        desc: "Chewy almond shells with ganache fillings in a variety of delightful flavors.",
        price: 220000,
        unit: " / box",
        img: "https://images.unsplash.com/photo-1652555286866-1bef20014bc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0ZWwlMjBmcmVuY2glMjBtYWNhcm9uc3xlbnwxfHx8fDE3NzY1NjAyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  }
];

export function Menu() {
  const { theme } = useTheme();
  const { items, addToCart, updateQuantity } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      img: item.img,
      unit: item.unit
    });
    toast.success(`Added ${item.name} to your cart!`);
  };

  return (
    <section id="menu" className="py-24 bg-white transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Our Menu
          </h2>
          <p className="text-lg text-gray-500">
            Freshly baked everyday. Crafted to be not too sweet, but definitely hard to share.
          </p>
        </div>

        <div className="space-y-24">
          {menuItems.map((section, idx) => (
            <div key={idx} className="space-y-12">
              <div className={`text-center sm:text-left border-b ${theme.borderLight} pb-4 transition-colors duration-500`}>
                <h3 className="text-2xl font-bold text-gray-900">{section.category}</h3>
                <p className={`${theme.textPrimary} mt-1 transition-colors duration-500`}>{section.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.items.map((item) => {
                  const cartItem = items.find(i => i.id === item.id);
                  const quantity = cartItem ? cartItem.quantity : 0;

                  return (
                    <div 
                      key={item.id} 
                      className={`group ${theme.bgLightHalf} rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-transparent ${theme.hoverBorderLight} hover:-translate-y-1 flex flex-col`}
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <ImageWithFallback 
                          src={item.img} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <h4 className="text-xl font-bold text-gray-900">{item.name}</h4>
                          <span className={`${theme.textPrimary} font-semibold bg-white px-3 py-1 rounded-full text-sm shadow-sm whitespace-nowrap transition-colors duration-500`}>
                            Rp {item.price.toLocaleString('id-ID')}{item.unit}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">
                          {item.desc}
                        </p>
                        
                        {quantity > 0 ? (
                          <div className={`flex items-center justify-between bg-white border-2 ${theme.borderLight} rounded-xl overflow-hidden h-12`}>
                            <button 
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                              className={`h-full px-4 text-gray-500 hover:text-gray-900 ${theme.hoverBgLight} transition-colors flex items-center justify-center`}
                            >
                              <Minus className="w-5 h-5" />
                            </button>
                            <span className="font-bold text-gray-900 w-12 text-center">{quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                              className={`h-full px-4 ${theme.textPrimary} ${theme.hoverBgLight} transition-colors flex items-center justify-center`}
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleAddToCart(item)}
                            className={`w-full flex items-center justify-center gap-2 text-center bg-white border-2 ${theme.borderLight} ${theme.textDark} font-bold py-3 rounded-xl ${theme.hoverBgLight} ${theme.hoverBorderMedium} transition-colors duration-300 h-12`}
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-24 p-8 rounded-3xl ${theme.bgLightHalf} border ${theme.borderMedium} text-center max-w-4xl mx-auto`}>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Looking for something special?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We do custom cakes for weddings, birthdays, and special events! Let's chat about your dream cake.
          </p>
          <a 
            href="https://wa.me/1234567890?text=Hi!%20I'd%20like%20to%20request%20a%20custom%20order!"
            target="_blank"
            rel="noreferrer"
            className={`inline-flex justify-center items-center px-8 py-3 rounded-full text-white font-medium ${theme.bgPrimary} ${theme.hoverBgPrimary} shadow-md transition-colors`}
          >
            Request Custom Order
          </a>
        </div>
      </div>
    </section>
  );
}