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

const fileContent = await getFileContent(EPlatform.稀土掘金)

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
	fileCookie = (await getFileContent(EPlatform.稀土掘金)) as string
	cookies = JSON.parse(fileCookie)
	// @ts-ignore
	cookies.forEach(cookie => {
		page.setCookie(cookie)
	})
}

async function start() {
	await refreshCookie()

	await page.goto('https://juejin.cn/user/center/signin?from=main_page')

	try {
		await page.waitForFunction(
			() => {
				const elements = document.querySelector('.login-user-name')
				return !elements
			},
			{ timeout: 1000 }
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

await page.click('.signin .btn')

try {
	await page.waitForSelector('.header-text', { timeout: 2000 })
	console.log('🎉 签到成功')
	const cookies = await page.cookies()
	const res = await writeFileContent(
		EPlatform.稀土掘金,
		JSON.stringify(cookies)
	)
	if (res) {
		console.log('🎉 cookie 已覆盖 🎉')
	}

	await page.evaluate(() => {
		const buttons = document.querySelectorAll(
			'.btn'
		) as unknown as HTMLElement[]
		for (let button of buttons) {
			if (button.innerText.includes('去抽奖')) {
				button.click()
				break
			}
		}
	})
} catch (error) {
	console.log('💥 签到失败，反馈作者')
}

try {
	await page.waitForSelector('.text-free', { timeout: 3000 })
	await page.evaluate(() => {
		const buttons = document.querySelectorAll(
			'.text-free'
		) as unknown as HTMLElement[]
		for (let button of buttons) {
			if (button.innerText.includes('免费抽奖次数：1次')) {
				button.click()
				break
			}
		}
	})
	console.log('🎉 抽奖成功 🎉')
} catch (error) {
	console.log('💥 您已抽过奖')
}

await browser.close()
