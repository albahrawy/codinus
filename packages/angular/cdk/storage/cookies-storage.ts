import { IStringRecord } from "@codinus/types";

export class CookiesStorage implements Storage {

    public static current: CookiesStorage = new CookiesStorage();

    get length(): number {
        return Object.keys(this.getData()).length;
    }

    clear(): void {
        const data = Object.keys(this.getData() || {});
        data.forEach(key => this.removeItem(key));
    }

    getItem(key: string): string | null {
        return this.getData()?.[key] ?? null;
    }

    key(index: number): string | null {
        const data = Object.values(this.getData() || {});
        return data.length > index ? data[index] : null;
    }

    removeItem(key: string): void {
        const date = new Date();
        date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
        document.cookie = `${key}=; expires=${date.toUTCString()}; path=/`;
    }

    setItem(key: string, value: string): void {
        const date = new Date();
        date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
        document.cookie = `${key}=${value}; expires=${date.toUTCString()}; path=/`;
    }

    private getData(): IStringRecord {
        return Object.fromEntries(document.cookie.split(/; */).map(c => {
            const [key, ...v] = c.split('=');
            return [key, decodeURIComponent(v.join('='))];
        }));
    }
}
