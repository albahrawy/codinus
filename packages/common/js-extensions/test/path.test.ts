import { joinAsPath, getFileInfo } from '../util/path';

describe('joinAsPath', () => {
    it('should join multiple path parts correctly', () => {
        expect(joinAsPath('folder', 'subfolder', 'file.txt')).toBe('folder/subfolder/file.txt');
    });

    it('should handle leading and trailing slashes', () => {
        expect(joinAsPath('/folder/', '/subfolder/', '/file.txt/')).toBe('folder/subfolder/file.txt');
    });

    it('should handle duplicate slashes', () => {
        expect(joinAsPath('folder//', 'subfolder//', 'file.txt')).toBe('folder/subfolder/file.txt');
    });

    it('should handle file protocol', () => {
        expect(joinAsPath('file:///folder', 'subfolder', 'file.txt')).toBe('file:///folder/subfolder/file.txt');
    });

    it('should handle http protocol', () => {
        expect(joinAsPath('http://website', 'subfolder', 'page/1')).toBe('http://website/subfolder/page/1');
    });

    it('should return empty string for no arguments', () => {
        expect(joinAsPath()).toBe('');
    });
});

describe('getFileInfo', () => {
    it('should split file name and extension correctly', () => {
        expect(getFileInfo('example.txt')).toEqual({ name: 'example', extension: 'txt' });
    });

    it('should handle file names without extension', () => {
        expect(getFileInfo('example')).toEqual({ name: 'example', extension: '' });
    });

    it('should handle file names with multiple dots', () => {
        expect(getFileInfo('example.test.txt')).toEqual({ name: 'example.test', extension: 'txt' });
    });

    it('should handle file names with leading dots', () => {
        expect(getFileInfo('.example')).toEqual({ name: '.example', extension: '' });
    });

    it('should handle file names with only extension', () => {
        expect(getFileInfo('.gitignore')).toEqual({ name: '', extension: 'gitignore' });
    });
});