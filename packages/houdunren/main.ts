import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth' // 可以自动处理一些常见的反爬虫机制，提高爬取数据的成功率。
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import { EPlatform, getFileContent, writeFileContent } from '@headless/common'
import { spawnSync } from 'child_process'

puppeteer.use(StealthPlugin())
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
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
	devtools: false,
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

	await page.goto('https://www.houdunren.com/')

	try {
		await page.waitForFunction(
			() => {
				const elements = document.querySelectorAll(
					'.text-gray-600'
				) as unknown as HTMLElement[]
				for (let element of elements) {
					if (element?.textContent?.includes('注册于 3 年前')) {
						console.log('登录成功了')
						return true
					}
				}
			},
			{ timeout: 100000 }
		)
	} catch (error) {
		await page.waitForTimeout(800)
		spawnSync('ts-node-esm', ['login.ts'], {
			stdio: 'inherit', // 将子进程的标准输出流重定向到父进程的标准输出流中
		})
		await start()
	}
}

await start()

await page.waitForFunction(() => {
	const elements = document.querySelectorAll(
		'button'
	) as unknown as HTMLElement[]
	for (let element of elements) {
		if (element?.textContent?.includes('签到打卡')) {
			element.click()
			return true
		}
	}
})
