import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth' // 可以自动处理一些常见的反爬虫机制，提高爬取数据的成功率。
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import { password } from '@inquirer/prompts'
import { EPlatform, writeFileContent } from '@headless/common'

puppeteer.use(StealthPlugin())
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
puppeteer.use(RecaptchaPlugin())

const browser = await puppeteer.launch({
	headless: false,
	defaultViewport: {
		width: 1200,
		height: 800,
	},
	args: ['--no-sandbox', '--disable-web-security', `--window-size=1600,800`],
	devtools: true,
})

const page = await browser.newPage()

await page.goto('https://juejin.cn/user/center/signin?from=main_page')

await page.click('.login-user-name')
await page.waitForSelector('.number-input')
await page.screenshot({ path: 'progress/l1.png', fullPage: true })
await page.type('.number-input', '19905076109')
await page.click('.send-vcode-btn')

await page.waitForSelector('#captcha-verify-image')
async function handleDrag() {
	// 调用 evaluate 可以在浏览器中执行代码，最后返回我们需要的滑动距离
	const coordinateShift = await page.evaluate(async () => {
		// 从这开始就是在浏览器中执行代码，已经可以看到我们用熟悉的 querySelector 查找标签
		const cvs = document.querySelector(
			'#captcha-verify-image'
		) as HTMLCanvasElement

		await new Promise(resolve => {
			setTimeout(() => {
				resolve(null)
			}, 3000)
		})

		const dataUrl = cvs.toDataURL()
		const image = new Image()
		image.width = 340 // 这个得先写死一下
		image.height = 212 // 这个得先写死一下
		image.src = dataUrl
		document.body.appendChild(image)

		// // 等待图片加载完成
		await new Promise(resolve => {
			image.onload = () => {
				resolve(null)
			}
		})

		// 创建画布
		const canvas = document.createElement('canvas')

		canvas.width = image.width
		canvas.height = image.height

		const ctx = canvas.getContext('2d')
		// 将验证码图片绘制到画布上
		ctx?.drawImage(image, 0, 0, image.width, image.height)
		// 获取画布上的像素数据
		const imageData = ctx?.getImageData(0, 0, image.width, image.height)
		// 将像素数据转换为二维数组，处理灰度、二值化，将像素点转换为0（黑色）或1（白色）
		const data: number[][] = []
		for (let h = 0; h < image.height; h++) {
			data.push([])
			for (let w = 0; w < image.width; w++) {
				const index = (h * image.width + w) * 4
				const r = imageData!.data[index] * 0.2126
				const g = imageData!.data[index + 1] * 0.7152
				const b = imageData!.data[index + 2] * 0.0722
				if (r + g + b > 100) {
					data[h].push(1)
				} else {
					data[h].push(0)
				}
			}
		}
		// 计算每一列黑白色像素点相邻的个数，找到最多的一列，大概率为缺口位置
		let maxChangeCount = 0
		let coordinateShift = 0
		for (let w = 0; w < image.width; w++) {
			let changeCount = 0
			for (let h = 0; h < image.height; h++) {
				if (data[h][w] == 0 && data[h][w - 1] == 1) {
					changeCount++
				}
			}
			if (changeCount > maxChangeCount) {
				maxChangeCount = changeCount
				coordinateShift = w
			}
		}
		return coordinateShift
	})
	// 你无需理解参数都是什么作用
	function easeOutBounce(t: number, b: number, c: number, d: number) {
		if ((t /= d) < 1 / 2.75) {
			return c * (7.5625 * t * t) + b
		} else if (t < 2 / 2.75) {
			return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b
		} else if (t < 2.5 / 2.75) {
			return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b
		} else {
			return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b
		}
	}
	const drag = await page.$('.secsdk-captcha-drag-icon')
	const dragBox = await drag?.boundingBox()
	const dragX = dragBox?.x! + dragBox!.width / 2 + 2
	const dragY = dragBox!.y + dragBox!.height / 2 + 2

	await page.mouse.move(dragX, dragY)
	await page.mouse.down()
	await page.waitForTimeout(300)
	console.log({ dragX, dragY })

	// 定义每个步骤的时间和总时间
	const totalSteps = 100
	const stepTime = 5

	for (let i = 0; i <= totalSteps; i++) {
		// 当前步骤占总时间的比例
		const t = i / totalSteps
		// 使用easeOutBounce函数计算当前位置占总距离的比例
		const easeT = easeOutBounce(t, 0, 1, 1)

		const newX = dragX + coordinateShift * easeT - 5
		const newY = dragY + Math.random() * 10

		await page.mouse.move(newX, newY, { steps: 1 })
		await page.waitForTimeout(stepTime)
	}
	// 松手前最好还是等待一下，这也很符合真实操作
	await page.waitForTimeout(800)
	await page.mouse.up()
	await page.screenshot({ path: 'progress/l2.png', fullPage: true })

	try {
		// 等待校验成功的元素出现
		await page.waitForSelector('.captcha_verify_message-success', {
			timeout: 1000,
		})
	} catch (error) {
		console.log('catch 了')
		await page.waitForTimeout(500)
		// 再次执行上面的代码
		// await handleDrag()
	}
}

await handleDrag()

const smsCode = await password({ message: '请输入掘金验证码\n', mask: true })
await page.type('input[name="registerSmsCode"]', smsCode)
await page.click('button.btn')

await page.evaluate(() => {
	const buttons = document.querySelectorAll('.btn') as unknown as HTMLElement[]
	for (let button of buttons) {
		if (button.innerText.includes('登录 / 注册')) {
			button.click()
			break
		}
	}
})

console.log('🎉 登录成功')

await page.waitForFunction(() => {
	const elements = document.querySelector('.login-user-name')
	return !elements
})

const cookies = await page.cookies()
console.log('cookie.length', cookies.length)
try {
	const res = await writeFileContent(
		EPlatform.稀土掘金,
		JSON.stringify(cookies)
	)
	if (res) {
		console.log('🎉 cookie 已重新获取 并写入成功 🎉')
	}
} catch (error) {
	console.log('💥 cookie 写入失败，请检查登录环节 💥')
}

await browser.close()
