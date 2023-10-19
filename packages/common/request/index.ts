import axios, { AxiosResponse } from 'axios'
import { EPlatform, EWebSite_ID } from '../core/type.ts'
import { TUpdateCookies, TUserCookieDetails } from './type.ts'
import { formatArgs } from '../core/core.ts'
const args = formatArgs(process.argv.slice(2))

console.log('args', args)

async function getJueJinCookies() {
	const res = await axios.post<any, AxiosResponse<TUserCookieDetails>>(
		'https://api.jimmyxuexue.top/cookies/detail',
		{
			website_id: 1001,
			userId: Number(args.userId),
		}
	)
	if (res?.data?.code === 200) {
		return res.data.result?.find(
			cookie => cookie.website_id === EWebSite_ID.稀土掘金
		)
	}
}

async function updateJueJinCookies(cookies: string) {
	const res = await axios.post<any, AxiosResponse<TUpdateCookies>>(
		'https://api.jimmyxuexue.top/cookies/update',
		{
			website_id: 1001,
			userId: args.userId,
			cookies,
		}
	)
	return res.data.code === 200
}

export async function getServerCookie(platform: EPlatform) {
	switch (platform) {
		case EPlatform.稀土掘金:
			return await getJueJinCookies()
	}
}

export async function updateServerCookies(
	platform: EPlatform,
	cookies: string
) {
	switch (platform) {
		case EPlatform.稀土掘金:
			return await updateJueJinCookies(cookies)
	}
}
