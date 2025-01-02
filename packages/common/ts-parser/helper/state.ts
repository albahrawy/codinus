import { ParserError } from "../errors/errors";
import { tokenContextTypes, tokenTypes } from "../tokens/tokens";
import { ErrorDetails, IPosition, IStateLabel, ITokenContext } from "../types/basic";
import { ICommentWhitespace } from "../types/nodes";
import { ICommentNode } from "../types/nodes.common";
export class State {

    strict = true;
    position = 0;
    start = 0;
    end = 0;
    currentLine = 1;
    lineStart = -0;
    startLocation: IPosition = { line: 1, column: 0, index: 0 };
    endLocation: IPosition = { line: 1, column: 0, index: 0 };
    lastTokenStartLocation?: IPosition;
    lastTokenEndLocation?: IPosition;
    lastTokenStart = 0;
    firstInvalidTemplateEscapePos?: IPosition;
    canStartJSXElement = true;
    type: number = tokenTypes.eof;
    inType = false;
    value: unknown = null;
    containsEsc = false;
    errors: ParserError<unknown>[] = [];
    comments: Array<ICommentNode> = [];
    commentStack: Array<ICommentWhitespace> = [];
    strictErrors: Map<number, [ErrorDetails, IPosition]> = new Map();
    tokensLength = 0;
    labels: Array<IStateLabel> = [];
    potentialArrowAt = -1;
    soloAwait = false;
    maybeInArrowParameters = false;
    inFSharpPipelineDirectBody = false;
    isAmbientContext = false;
    inDisallowConditionalTypesContext = false;
    context: Array<ITokenContext> = [tokenContextTypes.brace];
    inAbstractClass = false;
    dependencies = new Set<string>();

    currentPosition(): IPosition {
        return { line: this.currentLine, column: this.position - this.lineStart, index: this.position };
    }

    clone(skipArrays?: boolean): State {
        const state = new State();
        const keys = Object.keys(this) as (keyof State)[];
        for (let i = 0, length = keys.length; i < length; i++) {
            const key = keys[i];
            let val = this[key];

            if (!skipArrays && Array.isArray(val))
                val = val.slice();
            (state as Record<keyof State, unknown>)[key] = val;
        }
        return state;
    }
}