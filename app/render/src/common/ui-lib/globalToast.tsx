import { Component, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';

export let globalToast: Omit<Toast, keyof Component>;

export function GlobalToast() {
	const toast = useRef(null);
	useEffect(() => {
		globalToast = toast.current as any;
	}, [toast.current]);
	return <Toast ref={toast} />;
}

export function toastError(e: Error) {
	globalToast.show({
		closable: true,
		severity: 'error',
		summary: '错误',
		detail: e.message,
	});
}

export function toastErrorRethrow(e: Error) {
	toastError(e);
	throw e;
}
