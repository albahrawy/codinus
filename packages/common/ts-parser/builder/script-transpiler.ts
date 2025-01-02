import { Nullable } from "@codinus/types";
import { IOptions } from "../types/basic";
import { AnyNode } from "../types/nodes";
import { TypeScriptParser } from "../typescript/parser";

class StringBuilder {
    private _lines: string[] = [];
    private _importsMap = new Map<string, string[]>();

    write(line = ""): void {
        this._lines.push(line);
    }

    writeln(line = ""): void {
        this._lines.push("\n");
        this._lines.push(line);
    }

    addImports(source: string, imports: string[]) {
        if (this._importsMap.has(source))
            this._importsMap.get(source)?.push(...imports);
        else
            this._importsMap.set(source, imports);
    }

    getAllImports() {
        return [...this._importsMap.values()].flat();
    }

    getImports() {
        return Object.fromEntries([...this._importsMap.entries()]);
    }

    // addInject(inject: string) {
    //     //  this._injects.push(inject);
    // }

    // getInjects() {
    //     return []; // return [...this._injects];
    // }

    clear() {
        this._lines = [];
    }

    toString(): string {
        return this._lines.join("");
    }
}

export function transpileTypeScript(typeScriptCode: string, options?: IOptions) {
    const parser = new TypeScriptParser(options);
    const program = parser.parse(typeScriptCode);
    const sb = new StringBuilder();
    program.children.forEach(c => printNodeCore(c, sb));
    return { code: sb.toString(), imports: sb.getImports() };
}

export function transpileTypeScriptToCSScript(typeScriptCode: string, containerId: string, options?: IOptions) {
    const parser = new TypeScriptParser(options);
    const program = parser.parse(typeScriptCode);
    const printBuilder = new StringBuilder();
    const membersBuilder = new StringBuilder();
    const exports: string[] = [];
    const classesBuilder = new StringBuilder();
    program.children.forEach((c, i) => {
        printBuilder.clear();
        printNodeCore(c, printBuilder);
        if (c.type === 'ClassDeclaration') {
            classesBuilder.writeln(`${c.id?.name ?? `Class${i}`} : ${printBuilder.toString()},`);
        } else if (c.type === 'FunctionDeclaration') {
            const fnName = c.id?.name ?? `Function${i}`;
            membersBuilder.writeln(`const ${fnName} = ${printBuilder.toString()};`);
            exports.push(fnName);
        } else {
            membersBuilder.writeln(printBuilder.toString());
        }
    });
    const allImports = printBuilder.getAllImports();
    const finalBuilder = new StringBuilder();
    finalBuilder.write(`function ${containerId}Container() {`);
    finalBuilder.writeln(`const dependencies = class Dependencies{};`);
    if (allImports.length) {
        finalBuilder.writeln(`let ${allImports.join(',')};`);
        allImports.forEach(i => {
            finalBuilder.writeln(`Object.defineProperty(dependencies, '${i}', {`);
            finalBuilder.write(`set(value) {${i} = value;}});`);
        });
    }
    finalBuilder.writeln(membersBuilder.toString());
    finalBuilder.writeln('const classes = ()=> ({');
    finalBuilder.write(classesBuilder.toString());
    finalBuilder.write('});')
    finalBuilder.writeln(`return {
        imports:${JSON.stringify(printBuilder.getImports())},
        exports:{${exports.join(',')}},
        dependencies,classes
        }`);
    finalBuilder.writeln('}');
    return finalBuilder.toString();
}

function printSemiColon(sb: StringBuilder): void {
    sb.write(';');
}

function printNodeCore(node: AnyNode | null | undefined, sb: StringBuilder) {
    switch (node?.type) {
        case 'BlockStatement':
            sb.writeln('{');
            node.children.forEach(c => printNodeCore(c, sb));
            sb.writeln('}');
            break;
        case 'ExportNamedDeclaration':
            printNodeCore(node.declaration, sb);
            break;
        case 'ImportDeclaration':
            return sb.addImports(node.source.value as string, node.specifiers.filter(s => s.type === 'ImportSpecifier')
                .map(s => s.key).filter(s => s.type === 'Identifier')
                .map(s => s.name));
        case 'ClassDeclaration':
            {
                const className = node.id?.name ?? 'RunTimeClass';
                sb.write(`class ${className} `);
                if (node.superClass) {
                    sb.write(`extends `);
                    printNodeCore(node.superClass, sb);
                }
                sb.write('{');
                node.body.children.forEach(c => printNodeCore(c, sb));
                sb.writeln('}');
                break;
            }
        case 'Super':
            sb.write('super');
            break;
        case 'ClassMethod':
            {
                if (node.key.type !== 'Identifier')
                    return;
                let isConstructor = false;
                sb.writeln();
                switch (node.kind) {
                    case 'constructor':
                        isConstructor = true;
                        break;
                    case 'get':
                    case 'set':
                        sb.write(`${node.kind} `);
                        break;
                }

                sb.write(`${node.key.name}(`);
                const ctorParams = printParams(node.params, sb, isConstructor);
                sb.write('){');
                if (isConstructor && ctorParams?.length)
                    ctorParams.forEach(p => sb.writeln(`this.${p} = ${p}; `));

                node.body.children.forEach(c => printNodeCore(c, sb));
                sb.writeln('}');
                break;
            }
        case 'FunctionDeclaration':
            {
                sb.writeln('function ');
                sb.write(`${node.id.name} (`);
                printParams(node.params, sb);
                sb.write('){');
                node.body.children.forEach(c => printNodeCore(c, sb));
                sb.writeln('}');
                break;
            }
            break;
        case 'ClassProperty':
            sb.writeln();
            printNodeCore(node.key, sb);
            if (node.value) {
                sb.write(' = ');
                printNodeCore(node.value, sb);
            }
            printSemiColon(sb);
            break;
        case 'ArrowFunctionExpression':
            sb.write('(');
            printForEach(node.params, sb);
            sb.write(')');
            sb.write('=> ');
            printNodeCore(node.body, sb);
            break;
        case 'VariableDeclaration':
            {
                if (!node.inLoopDeclration)
                    sb.writeln();
                sb.write(`${node.kind} `);
                forEach(node.declarations, sb, d => {
                    printNodeCore(d.id, sb);
                    if (d.init) {
                        sb.write(' = ');
                        printNodeCore(d.init, sb);
                    }
                });
                if (!node.inLoopDeclration)
                    printSemiColon(sb);
                break;
            }
        case 'ExpressionStatement':
            sb.writeln();
            printNodeCore(node.expression, sb);
            printSemiColon(sb);
            break;
        case 'OptionalCallExpression':
        case 'CallExpression':
            printNodeCore(node.callee, sb);
            sb.write('(');
            printParams(node.arguments, sb);
            sb.write(')');
            break;
        case 'MemberExpression':
            printNodeCore(node.object, sb);
            sb.write(node.computed ? '[' : '.');
            printNodeCore(node.property, sb);
            if (node.computed)
                sb.write(']');
            break;
        case 'OptionalMemberExpression':
            printNodeCore(node.object, sb);
            sb.write('?.');
            printNodeCore(node.property, sb);
            break;
        case 'BinaryExpression':
            printNodeCore(node.left, sb);
            sb.write(` ${node.operator} `);
            printNodeCore(node.right, sb);
            break;
        case 'LogicalExpression':
            {
                const needParentheses = node.operator === '||';
                if (needParentheses) sb.write('(');
                printNodeCore(node.left, sb);
                sb.write(` ${node.operator} `);
                printNodeCore(node.right, sb);
                if (needParentheses) sb.write(')');
                break;
            }
        case 'UnaryExpression':
            sb.write(`${node.operator} `);
            printNodeCore(node.argument, sb);
            break;
        case 'AssignmentExpression':
            printNodeCore(node.left, sb);
            sb.write(` ${node.operator} `);
            printNodeCore(node.right, sb);
            break;
        case 'StringLiteral':
            return sb.write(node.rawValue);
        case 'NumericLiteral':
        case 'DecimalLiteral':
        case 'BooleanLiteral':
        case 'NullLiteral':
        case 'BigIntLiteral':
            return sb.write(`${node.value} `);
        case 'Identifier':
            return sb.write(node.name);
        case 'ThisExpression':
            return sb.write('this');
        case 'NewExpression':
            sb.write(`new `);
            printNodeCore(node.callee, sb);
            sb.write(' (');
            printParams(node.arguments, sb, false);
            sb.write(')');
            break;
        case 'TSAsExpression':
        case 'TSTypeAssertion':
            return printNodeCore(node.expression, sb);
        case 'ArrayExpression':
            sb.write('[');
            printForEach(node.elements, sb);
            sb.write(']');
            break;
        case 'SpreadElement':
            sb.write('...');
            printNodeCore(node.argument, sb);
            break;
        case 'IfStatement':
            sb.writeln('if(');
            printNodeCore(node.test, sb);
            sb.write('){');
            printNodeCore(node.consequent, sb);
            sb.writeln('}');
            break;
        case 'ForStatement':
            sb.writeln('for(');
            printNodeCore(node.init, sb);
            sb.write(';');
            printNodeCore(node.test, sb);
            sb.write(';');
            printNodeCore(node.update, sb);
            sb.write('){');
            printNodeCore(node.body, sb);
            sb.writeln('}');
            break;
        case 'ForOfStatement':
        case 'ForInStatement':
            sb.writeln('for(');
            printNodeCore(node.left, sb);
            sb.write(node.type === 'ForInStatement' ? ' in ' : ' of ');
            printNodeCore(node.right, sb);
            sb.write('){');
            printNodeCore(node.body, sb);
            sb.writeln('}');
            break;
        case 'UpdateExpression':
            if (node.prefix)
                sb.write(`${node.operator} `);
            printNodeCore(node.argument, sb);
            if (!node.prefix)
                sb.write(`${node.operator} `);
            break;
        case 'ConditionalExpression':
            printNodeCore(node.test, sb);
            sb.write(' ? ');
            printNodeCore(node.consequent, sb);
            sb.write(' : ');
            printNodeCore(node.alternate, sb);
            break;
        case 'ReturnStatement':
            sb.writeln('return ');
            printNodeCore(node.argument, sb);
            printSemiColon(sb);
            break;
        case 'ObjectExpression':
            sb.write('{');
            printForEach(node.properties, sb);
            sb.write('}');
            break;
        case 'ObjectProperty':
            printNodeCore(node.key, sb);
            sb.write(':');
            printNodeCore(node.value, sb);
            break;

        default:
            if (node)
                console.warn("Unsupported Node", node);
    }
}

function generateParam(node: AnyNode | null | undefined, sb: StringBuilder): string | null {
    switch (node?.type) {
        case 'TSParameterProperty':
            return generateParam(node.parameter, sb);
        case 'AssignmentPattern':
            {
                const name = generateParam(node.left, sb);
                sb.write(' = ');
                printNodeCore(node.right, sb);
                return name;
            }
        case 'Identifier':
            sb.write(node.name);
            return node.name;
        default:
            printNodeCore(node, sb);
    }
    return null;
}

function forEach<T>(array: T[], sb: StringBuilder, action: (e: T) => void) {
    const length = array.length;
    array.forEach((d, i) => {
        action(d);
        if (i < length - 1)
            sb.write(' , ');
    });
}

function printForEach<T extends Nullable<AnyNode>>(array: T[], sb: StringBuilder) {
    forEach(array, sb, e => printNodeCore(e, sb));
}

function printParams(params: Nullable<AnyNode>[], sb: StringBuilder, isConstructor = false): string[] | null {
    if (!params)
        return null;
    const ctorParams: string[] = [];
    forEach(params, sb, p => {
        const name = generateParam(p, sb);
        if (name && isConstructor && p?.type === 'TSParameterProperty')
            ctorParams.push(name);
    });
    return ctorParams;
}

// function checkForInject(node: ICallOrNewExpression, sb: StringBuilder) {
//     const addInject = (name?: string) => {
//         if (name) {
//             node.arguments = [{ type: 'StringLiteral', rawValue: `'${name}'` } as IStringLiteral];
//             sb.addInject(name);
//         }
//     }

//     if (node.callee.type === 'Identifier' && node.callee.name === 'inject') {
//         if (node.typeParameters?.type === 'TSTypeParameterInstantiation'
//             && node.typeParameters.params?.at(0)?.type === 'TSTypeReference') {
//             const identifier = (node.typeParameters.params[0] as TsTypeReference).typeName as Identifier;
//             addInject(identifier.name);
//         } else {
//             const identifier = node.arguments[0] as Identifier;
//             addInject(identifier.name);
//         }
//     }
// }

