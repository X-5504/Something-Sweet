import React from 'react';
import { Heart } from 'lucide-react';

export function Footer() {
	return (
		<footer className="bg-pink-50/40 pt-16 pb-8 border-t border-pink-100 transition-colors duration-500">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col items-center justify-center text-center">
					<a href="#" className="text-3xl font-bold text-pink-500 tracking-tighter lowercase mb-6 transition-colors duration-500">
						something sweet
					</a>
					
					<p className="text-gray-500 max-w-sm mb-8">
						The modern neighborhood bakery serving up cloud-like treats and layered moments of joy.
					</p>

					<div className="flex space-x-6 mb-12">
						<a href="#" className="text-pink-400 hover:text-pink-700 transition-colors p-2 bg-white rounded-full shadow-sm hover:shadow-md">
							<span className="sr-only">Instagram</span>
							<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
								<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
								<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
							</svg>
						</a>
						<a href="#" className="text-pink-400 hover:text-pink-700 transition-colors p-2 bg-white rounded-full shadow-sm hover:shadow-md">
							<span className="sr-only">Facebook</span>
							<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
							</svg>
						</a>
					</div>

					<div className="border-t border-pink-200/50 w-full max-w-md mb-8 transition-colors duration-500"></div>

					<p className="text-gray-400 text-sm flex items-center justify-center">
						Made with <Heart className="h-4 w-4 mx-1 fill-pink-500 text-pink-500 transition-colors duration-500" /> by something sweet © {new Date().getFullYear()}
					</p>
				</div>
			</div>
		</footer>
	);
}
