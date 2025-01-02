import { Nullable } from "@codinus/types";

const Mask_Defs: Record<string, string> = {
    '#': '[0-9]',
    '1': '[0-1]',
    '2': '[0-2]',
    '3': '[0-3]',
    '4': '[0-4]',
    '5': '[0-5]',
    '6': '[0-6]',
    '7': '[0-7]',
    '8': '[0-8]',
    '9': '[0-9]',
    a: '[A-Za-z]',
    '*': '[A-Za-z]|[0-9]'
};

export type Caret = { begin: number; end: number };
type AccessorHandler = {
    writeBuffer: () => void;
    caret(first?: Nullable<number>, last?: Nullable<number>): Caret | null;
}

export class MaskConfig {
    buffer: string[] = [];
    private length = 0;
    private tests: (RegExp | null)[] = [];
    private partialPosition = 0;
    private firstNonMaskPos: Nullable<number> = null;
    private lastRequiredNonMaskPos: Nullable<number> = null;
    private defaultBuffer?: string;

    constructor(mask: string, private placeHolderChar = '-', private accessorHandler: AccessorHandler) {
        const maskTokens = [...mask];
        this.partialPosition = this.length = maskTokens.length;
        this.buffer = [];
        for (let i = 0; i < maskTokens.length; i++) {
            const c = maskTokens[i];
            if (c == '?') {
                this.length--;
                this.partialPosition = i;
            } else if (Mask_Defs[c]) {
                this.tests.push(new RegExp(Mask_Defs[c]));
                if (this.firstNonMaskPos === null) {
                    this.firstNonMaskPos = this.tests.length - 1;
                }
                if (i < this.partialPosition)
                    this.lastRequiredNonMaskPos = this.tests.length - 1;
                this.buffer.push(this.getPlaceholder(i));

            } else {
                this.tests.push(null);
                this.buffer.push(c);
            }
        }

        this.defaultBuffer = this.buffer.join('');
        return this;
    }

    getBufferValue() {
        return this.buffer.join('');
    }

    processValue(value: string, validate: boolean, clear: boolean) {
        let lastMatch = -1, c, pos, i;
        for (i = 0, pos = 0; i < (this.length); i++) {
            if (this.tests[i]) {
                this.buffer[i] = this.getPlaceholder(i);
                while (pos++ < value.length) {
                    c = value.charAt(pos - 1);
                    if (this.tests?.[i]?.test(c)) {
                        this.buffer[i] = c;
                        lastMatch = i;
                        break;
                    }
                }
                if (pos > value.length) {
                    this.clearBuffer(i + 1, this.length);
                    break;
                }
            } else {
                if (this.buffer[i] === value.charAt(pos)) {
                    pos++;
                }
                if (i < this.partialPosition) {
                    lastMatch = i;
                }
            }
        }
        if (validate)
            value = this.getBufferValue();
        else if (lastMatch + 1 < this.partialPosition) {
            if (clear || this.getBufferValue() === this.defaultBuffer) {
                this.clearBuffer(0, this.length);
                value = '';
            }
            else {
                value = this.getBufferValue();
            }
        } else {
            value = this.getBufferValue().substring(0, lastMatch + 1);
        }

        return {
            value,
            position: this.partialPosition ? i : this.firstNonMaskPos
        };
    }

    shiftPosition(pos: Nullable<Caret>, deletion: boolean) {
        if (!pos)
            return;
        if (deletion) {
            while (pos.begin > 0 && !this.tests[pos.begin - 1])
                pos.begin--;
            if (pos.begin === 0) {
                while (pos.begin < (this.firstNonMaskPos as number) && !this.tests[pos.begin])
                    pos.begin++;
            }
        } else {
            while (pos.begin < this.length && !this.tests[pos.begin])
                pos.begin++;
        }
    }

    getUnmaskedValue() {
        return this.buffer.filter((c, i) => this.tests[i] && c != this.getPlaceholder(i)).join('');
    }

    processSpecialKey(key: string, pos: Caret | null) {
        if (!pos)
            return;
        let begin = pos.begin;
        let end = pos.end;
        if (end - begin === 0) {
            begin = key !== 'Delete' ? this.seekPrev(begin) : (end = this.seekNext(begin - 1));
            end = key === 'Delete' ? this.seekNext(end) : end;
        }

        this.clearBuffer(begin, end);
        this.shiftL(begin, end - 1);
    }

    processKey(key: string, pos: Caret | null) {
        if (!pos)
            return null;

        if (pos.end - pos.begin !== 0) {
            this.clearBuffer(pos.begin, pos.end);
            this.shiftL(pos.begin, pos.end - 1);
        }
        const p = this.seekNext(pos.begin - 1);

        if (p < this.length && this.tests?.[p]?.test(key)) {
            this.shiftR(p);
            this.buffer[p] = key;
            this.accessorHandler.writeBuffer();

            return {
                next: this.seekNext(p),
                completed: pos.begin <= (this.lastRequiredNonMaskPos ?? 0) && this.isCompleted(),
            }
        }
        return null;
    }

    isCompleted(): boolean {
        for (let i = this.firstNonMaskPos as number; i <= (this.lastRequiredNonMaskPos as number); i++) {
            if (this.tests[i] && this.buffer[i] === this.getPlaceholder(i))
                return false;
        }

        return true;
    }

    private clearBuffer(start: number, end: number) {
        for (let i = start; i < end && i < this.length; i++) {
            if (this.tests[i])
                this.buffer[i] = this.getPlaceholder(i);
        }
    }

    private seekNext(pos: number) {
        while (++pos < this.length && !this.tests[pos]);
        return pos;
    }

    private seekPrev(pos: number) {
        while (--pos >= 0 && !this.tests[pos]);
        return pos;
    }

    private shiftL(begin: number, end: number) {
        if (begin < 0)
            return;
        let i, j;

        for (i = begin, j = this.seekNext(end); i < this.length; i++) {
            const _test = this.tests[i];
            if (_test != null) {
                if (j < this.length && _test.test(this.buffer[j])) {
                    this.buffer[i] = this.buffer[j];
                    this.buffer[j] = this.getPlaceholder(j);
                } else {
                    break;
                }

                j = this.seekNext(j);
            }
        }
        this.accessorHandler.writeBuffer();
        this.accessorHandler.caret(Math.max(this.firstNonMaskPos as number, begin));
    }

    private shiftR(pos: number) {
        let i, c, j, t;

        for (i = pos, c = this.getPlaceholder(pos); i < this.length; i++) {
            const _test = this.tests[i];
            if (_test) {
                j = this.seekNext(i);
                t = this.buffer[i];
                this.buffer[i] = c;
                if (j < this.length && _test.test(t)) {
                    c = t;
                } else {
                    break;
                }
            }
        }
    }

    private getPlaceholder(i: number) {
        if (i < this.placeHolderChar.length)
            return this.placeHolderChar.charAt(i);
        return this.placeHolderChar.charAt(0);
    }
}
