import * as React from 'react';
export * from './colorUtils';
export * from './schemaUtils';
export * from './styledUtils';

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

export const hashCode = function (text: string, max: number): number {
	let hash = 0;
	for (let index = 0; index < text.length; index++) {
		// tslint:disable-next-line no-bitwise
		hash = text.charCodeAt(index) + ((hash << 5) - hash);
	}

	// tslint:disable-next-line no-bitwise
	return (hash >> (text.length * 8)) & max;
};

export const randomString = (length = 16) => {
	let text = '';
	const possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

export const regexEscape = (str: string) =>
	str.replace(matchOperatorsRe, '\\$&');

export const withConditional = <TProps extends {}>(
	hoc: (Base: React.ForwardRefExoticComponent<TProps>) => any,
	fn: (props: TProps) => boolean,
) => {
	return (Base: React.ForwardRefExoticComponent<TProps>) => {
		const Wrapped = hoc(Base);

		return React.forwardRef<any, TProps>((props, ref) => {
			const Component = fn(props) ? Wrapped : Base;
			return React.createElement(Component, { ...props, ref });
		});
	};
};

export const stopEvent = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
	event.preventDefault();
	event.stopPropagation();
};

export const stopKeyDownEvent = (
	e: React.KeyboardEvent<HTMLElement>,
	keyCode: number,
	handler?: () => void,
) => {
	if (!e.defaultPrevented && e.keyCode === keyCode) {
		e.preventDefault();
		e.stopPropagation();
		if (handler) {
			handler();
		}
	}
};

export const withPreventDefault = (fn: () => unknown) => (
	e?: React.FormEvent<HTMLElement>,
) => {
	if (e && e.preventDefault) {
		e.preventDefault();
	}
	return fn();
};

export const limitedMap = <T, U>(
	arr: T[],
	fn: (currentValue: T, index: number, array: T[]) => Promise<U>,
	limit: number,
): Promise<U[]> => {
	if (limit >= arr.length) {
		return Promise.all(arr.map(fn));
	}
	return new Promise<U[]>((resolve, reject) => {
		const result: U[] = new Array(arr.length);
		let inFlight = 0;
		let idx = 0;
		const runNext = async () => {
			// Store the idx to use for this call before incrementing the main counter
			const i = idx;
			idx++;
			if (i >= arr.length) {
				return;
			}
			try {
				inFlight++;
				result[i] = await fn(arr[i], i, arr);
				runNext();
			} catch (err) {
				// Stop any further iterations
				idx = arr.length;
				// Clear the results so far for gc
				result.length = 0;
				reject(err);
			} finally {
				inFlight--;
				if (inFlight === 0) {
					resolve(result);
				}
			}
		};
		while (inFlight < limit) {
			runNext();
		}
	});
};