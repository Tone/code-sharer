import execa from 'execa';
declare class Generate {
    init(dir: string): Promise<execa.ExecaReturnValue<string>>;
}
declare const _default: Generate;
export default _default;
