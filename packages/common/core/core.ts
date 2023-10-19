// const { resolve } = require('path')
import { resolve } from 'path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
// @ts-ignore
import { EPlatform } from './type.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function getCookiePath(platform: EPlatform) {
	switch (platform) {
		case EPlatform.稀土掘金:
			return resolve(__dirname, '../cookies/juejin.ts')
		case EPlatform.后盾人:
			return resolve(__dirname, '../cookies/houdunren.ts')
	}
}

export function formatArgs(arr: string[]) {
	const obj: {
		[key in string]: string
	} = {}
	arr.forEach(item => {
		const [key, value] = item.split('=')
		obj[key] = value
	})
	return obj
}
