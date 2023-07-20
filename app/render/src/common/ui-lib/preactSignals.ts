import { Signal } from '@preact/signals';

interface _ReadonlySignal<T> {
	subscribe(fn: (value: T) => void): () => void;
	valueOf(): T;
	toString(): string;
	toJSON(): T;
	peek(): T;
	get value(): T;
}

export type ReadonlySignal<T> = T extends Signal<infer V> ? _ReadonlySignal<V> : _ReadonlySignal<T>;
