import { stat } from 'fs/promises';

interface ICallback<DataType, MetaType> {
	(filePath: string, meta: MetaType): PromiseLike<DataType> | DataType;
}

export interface ICacheFunction<DataType, MetaType> {
	(filePath: string, meta: MetaType): Promise<DataType>;
	delete(filePath: string): void;
	clear(): void;
}

export function createModifyTimeCache<DataType, MetaType = void>(
	callback: ICallback<DataType, MetaType>
): ICacheFunction<DataType, MetaType> {
	const dataCache = new Map<string, DataType>();
	const mtimeCache = new Map<string, Number>();

	return Object.assign(
		async function cacheHandle(filePath: string, meta: MetaType) {
			let mtime;
			try {
				const stats = await stat(filePath);
				mtime = stats.mtimeMs;
			} catch (e: any) {
				if (e.code === 'ENOENT') {
					dataCache.delete(filePath);
					mtimeCache.delete(filePath);
				}
				throw e;
			}

			if (mtimeCache.get(filePath) === mtime) {
				return dataCache.get(filePath)!;
			}

			const data = await callback(filePath, meta);

			mtimeCache.set(filePath, mtime);
			dataCache.set(filePath, data);
			return data;
		},
		{
			delete(filePath: string) {
				dataCache.delete(filePath);
				mtimeCache.delete(filePath);
			},
			clear() {
				dataCache.clear();
				mtimeCache.clear();
			},
		}
	);
}
