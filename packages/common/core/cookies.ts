type cookiesArr = {
	name: string
	value: string
}[]

/**
 * 用于将 document.cookies 里面的字符串cookies 转成数组的 cookies
 * @param cookieString
 * @returns {string[]}
 */
export function parseCookiesToArray(cookieString: string) {
	var cookies: cookiesArr = []
	var cookieArray = cookieString.split('; ')

	for (var i = 0; i < cookieArray.length; i++) {
		var cookie = cookieArray[i].split('=')
		var name = cookie[0]
		var value = cookie[1]

		cookies.push({ name: name, value: value })
	}

	return cookies
}

/**
 * 用于将 cookies 数组 转成 document.cookies 类型
 * @param cookieString
 * @returns {string}
 */
export function setCookiesToString(cookiesArray: cookiesArr) {
	var cookieString = ''

	for (var i = 0; i < cookiesArray.length; i++) {
		var cookie = cookiesArray[i]
		cookieString += cookie.name + '=' + cookie.value + '; '
	}
	document.cookie = cookieString
}
