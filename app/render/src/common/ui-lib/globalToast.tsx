import { Component, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';

export let globalToast: Omit<Toast, keyof Component>;

export function GlobalToast() {
	const toast = useRef(null);
	useEffect(() => {
		globalToast = toast.current;
	}, [toast.current]);
	return <Toast ref={toast} />;
}
