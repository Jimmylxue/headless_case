import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth' // 可以自动处理一些常见的反爬虫机制，提高爬取数据的成功率。
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'

puppeteer.use(StealthPlugin())
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
puppeteer.use(RecaptchaPlugin())

const browser = await puppeteer.launch({ headless: true })

const page = await browser.newPage()
await page.setViewport({ width: 1960, height: 1080 })

await page.goto('https://juejin.cn/user/center/signin?from=main_page')
await page.screenshot({ path: 'progress/1.png', fullPage: true })
await page.click('.login-user-name')
await page.waitForSelector('.number-input')
await page.screenshot({ path: 'progress/2.png', fullPage: true })
await page.type('.number-input', '19905076109')
// await page.type('input[name="registerSmsCode"]', 'yshzx171107.')
await page.click('.send-vcode-btn')
await page.screenshot({ path: 'progress/3.png', fullPage: true })

// 等待验证码 img 标签加载（注意这里还没有加载完成图片）
await page.waitForSelector('#captcha-verify-image')
// await page.screenshot({ path: 'progress/4.png', fullPage: true })
async function handleDrag() {
	// 调用 evaluate 可以在浏览器中执行代码，最后返回我们需要的滑动距离
	const coordinateShift = await page.evaluate(async () => {
		// 从这开始就是在浏览器中执行代码，已经可以看到我们用熟悉的 querySelector 查找标签
		const image = document.querySelector(
			'#captcha-verify-image'
		) as HTMLImageElement
		// 创建画布
		const canvas = document.createElement('canvas')
		canvas.width = image.width
		canvas.height = image.height
		const ctx = canvas.getContext('2d')
		// // 等待图片加载完成
		await new Promise(resolve => {
			// image.onload = () => {
			// 	resolve(null)
			// }
			setTimeout(() => {
				resolve(null)
			}, 1000)
		})
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
	console.log('2222', coordinateShift)
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
	console.log('dragBox', dragBox)

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
	await page.screenshot({ path: 'progress/5aaaa.png', fullPage: true })
}

await handleDrag()

console.log('3333')

try {
	// 等待校验成功的元素出现
	await page.waitForSelector('.captcha_verify_message-success', {
		timeout: 1000,
	})
	console.log('success')
} catch (error) {
	console.log('error')
	// await page.waitForTimeout(500)
	// // 再次执行上面的代码
	// await handleDrag()
}
console.log('444444')
setTimeout(async () => {
	await page.screenshot({ path: 'progress/5.png', fullPage: true })
	await page.screenshot({ path: 'progress/ssss.png', fullPage: true })
	console.log('didididi')
	await browser.close()
}, 4000)
