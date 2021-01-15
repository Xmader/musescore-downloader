import { exec as _exec } from 'child_process';
import { promisify } from 'util';

const exec = promisify(_exec);

export async function isNpx() {
	const output = await exec('npm list -g musescore-downloader')
	return output.stdout.includes('(empty)');
}

export async function isLatest() {
	const version = (/musescore-downloader@([\d\.]+)/).exec((await exec('npm list -g musescore-downloader')).stdout)![1]
	const latest = (await exec('npm info musescore-downloader version')).stdout.trim()

	return version.trim() === latest
}