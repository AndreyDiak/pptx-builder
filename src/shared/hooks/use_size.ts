import { useEffect, useMemo, useState } from "react";

export function useSize() {
	const [size, setSize] = useState(() => {
		if (typeof window === 'undefined') {
			return 1024; 
		}
		return window.innerWidth;
	});

	const handleResize = useMemo(() => {
		return () => {
			setSize(window.innerWidth);
		};
	}, []);

	useEffect(() => {
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [handleResize]);

	return useMemo(() => {
		if (size < 768) {
			return 'sm';
		}  
		if (size < 1400) {
			return 'default';
		} 
		return 'lg';
	}, [size]);
}