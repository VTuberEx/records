import type { IHeftTaskSession } from '@rushstack/heft';
import { fileURLToPath } from 'url';
import { Logger, SourceSpan } from 'sass';

export interface ExLogger extends Logger {
	warn(
		message: string,
		options?: {
			deprecation: boolean;
			span?: SourceSpan;
			stack?: string;
		}
	): void;

	debug(message: string, options?: { span: SourceSpan }): void;
}

const emptySpan: SourceSpan = {
	start: { line: 0, column: 0, offset: 0 },
	end: { line: 0, column: 0, offset: 0 },
	text: '',
};

export function shimLogger(session: IHeftTaskSession): ExLogger {
	const logger: ExLogger = {
		debug(message, options = { span: emptySpan }) {
			if (options.span.url) {
				message += ` (${fileURLToPath(options.span.url)}:${options.span.start.line}:${
					options.span.start.column
				})`;
			}
			session.logger.terminal.writeDebugLine(message);
		},
		warn(message, options = { deprecation: false }) {
			if (options.span?.url) {
				message += ` (${fileURLToPath(options.span.url)}:${options.span.start.line}:${
					options.span.start.column
				})`;
			}

			const e = new Error(message);
			e.stack = options.stack || e.message;

			session.logger.emitError(e);
		},
	};

	return logger;
}
