// const { writeFile } = require('fs')
// const { getCookiePath } = require('./core')
import { writeFile, readFile } from 'fs'
// @ts-ignore
import { getCookiePath } from './core.ts'
// @ts-ignore
import { EPlatform } from './type.ts'

export function clearFileContent() {
	const path = ''
	return new Promise((resolve, reject) => {
		writeFile(path, '', err => {
			if (err) {
				reject('clear file content error')
			} else {
				resolve('clear file content success')
			}
		})
	})
}

export function writeFileContent(type: EPlatform, content: string) {
	const path = getCookiePath(type)
	return new Promise((resolve, reject) => {
		writeFile(path, content, err => {
			if (err) {
				reject('clear file content error')
			} else {
				resolve('clear file content success')
			}
		})
	})
}

export function getFileContent(type: EPlatform) {
	const path = getCookiePath(type)
	return new Promise((resolve, reject) => {
		readFile(path, 'utf-8', (err, data) => {
			if (err) {
				reject('clear file content error')
			} else {
				resolve(data)
			}
		})
	})
}

// module.exports = {
// 	clearFileContent,
// 	writeFileContent,
// }
