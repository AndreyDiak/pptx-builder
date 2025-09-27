import { useEffect } from "react";

interface UseIntervalOptions {
	delay: number;
	callback: () => void;
}

export function useInterval({ callback, delay }: UseIntervalOptions) {
	useEffect(() => {
		const interval = setInterval(() => {
			callback();
		}, delay);
		return () => clearInterval(interval);
	}, [delay]);
}