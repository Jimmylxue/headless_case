import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth' // 可以自动处理一些常见的反爬虫机制，提高爬取数据的成功率。
// import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import {
	EPlatform,
	getFileContent,
	uploadFile,
	writeFileContent,
} from '@headless/common'
import { spawnSync } from 'child_process'
import { writeFileSync } from 'fs'
import path from 'path'

puppeteer.use(StealthPlugin())
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
puppeteer.use(RecaptchaPlugin())

let fileCookie: string = ''
let cookies

const fileContent = await getFileContent(EPlatform.后盾人)

if (!fileContent) {
	spawnSync('ts-node-esm', ['login.ts'], {
		stdio: 'inherit', // 将子进程的标准输出流重定向到父进程的标准输出流中
	})
}

const browser = await puppeteer.launch({
	headless: false,
	defaultViewport: {
		width: 1200,
		height: 800,
	},
	args: ['--no-sandbox', '--disable-web-security', `--window-size=1600,800`],
	devtools: true,
})

// 创建一个新页面
let page = await browser.newPage()

async function refreshCookie() {
	console.log('🚩 主进程 刷新了 cookie')
	fileCookie = (await getFileContent(EPlatform.后盾人)) as string
	cookies = JSON.parse(fileCookie)
	// @ts-ignore
	cookies.forEach(cookie => {
		page.setCookie(cookie)
	})
}

async function start() {
	await refreshCookie()

	await page.goto('https://www.houdunren.com/sign')

	await page.waitForFunction(
		() => {
			const elements = document.querySelectorAll(
				'button'
			) as unknown as HTMLElement[]
			for (let element of elements) {
				if (element?.textContent?.includes('登录后签到')) {
					element.click()
					return true
				}
			}
		},
		{ timeout: 100000 }
	)

	// await page.click('.login-user-name')
	await page.waitForTimeout(2000)
	// await page.waitForSelector('input[placeholder="请输入用户名、邮箱或手机号"]')
	// console.log('登录框出现了')
	console.log('comming')
	await page.waitForFunction(
		() => {
			const elements = document.querySelectorAll(
				'.hd-input'
			) as unknown as HTMLElement[]
			const arr = ['username', 'password', 'checkCode']
			elements.forEach((item, index) => {
				item.classList.add(arr[index])
			})
			return true
		},
		{ timeout: 100000 }
	)
	console.log('进入输入了')
	await page.type('.username', '19905076109')
	await page.type('.password', 'yshzx171107.')

	const pathAddress = path.join(process.cwd() + 'img.png')

	await page.waitForFunction(
		() => {
			const img = document.querySelector(
				'.el-image.rounded-md > img'
			) as unknown as HTMLElement[]
			// @ts-ignore
			if (img && img.src) {
				// @ts-ignore
				localStorage.setItem('dz-base64', img.src)
				return true
			}
		},
		{ timeout: 100000 }
	)

	await page.waitForTimeout(1000)
	const base64 = await page.evaluate(() => {
		return localStorage.getItem('dz-base64')
	})
	function base64ToImage(base64String: string, filename: string) {
		const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '')
		const buffer = Buffer.from(base64Data, 'base64')
		writeFileSync(filename, buffer)
	}

	base64ToImage(base64!, pathAddress)

	const res = await uploadFile()
	if (res.data.code === 200) {
		try {
			const checkStr = res.data.result.sumDst
			console.log('checkStr', res.data.result)
			const checkCode = eval(checkStr)
			await page.type('.checkCode', checkCode)
		} catch (error) {
			console.log('error', error)
		}
	}
	// console.log('imgSrc', imgSrc.length)
}

console.log('>>>>>')

await start()

console.log('登录成功了')

const cookie = await page.cookies()
await writeFileContent(EPlatform.后盾人, JSON.stringify(cookie))

// await browser.close()

// console.log('cookies', cookies)

// setTimeout(async () => {
// 	console.log('时间到了')

// }, 30000)
