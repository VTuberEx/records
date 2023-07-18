import { BaseSyntheticEvent } from 'react';

export function disableEvent(e: BaseSyntheticEvent) {
	e.preventDefault();
}
