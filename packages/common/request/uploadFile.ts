import axios from 'axios'
import { createReadStream } from 'fs'
import path from 'path'
import FormData from 'form-data'

const pathAddress = path.join(process.cwd() + 'img.png')
// import FormData from 'form-data'

export async function uploadFile() {
	const formData = new FormData()
	formData.append('file', createReadStream(pathAddress))
	formData.append('from', 'zh')
	formData.append('to', 'en')

	const response = await axios.post(
		'https://api.jimmyxuexue.top/translate/picture_translate',
		formData,
		{
			headers: {
				'Content-Type': `multipart/form-data`,
			},
		}
	)

	return response
}
