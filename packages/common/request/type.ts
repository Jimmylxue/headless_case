type BaseResponse<T> = {
	code: 200 | 201 | 500
	result: T
}

type TCookieItem = {
	site_cookie_id: number
	userId: number
	website_id: number
	cookies: string
}

export type TCookieDetail = BaseResponse<TCookieItem>

export type TUserCookieDetails = BaseResponse<TCookieItem[]>

export type TUpdateCookies = BaseResponse<{
	message: string
}>
