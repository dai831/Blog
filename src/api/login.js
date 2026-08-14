import request from '@/utils/axios';
import qs from 'qs'

/**
 *  注册
 * @param {Object} params//参数
 * 
 */
 export const registerApi = (params = {}) => {
	let data = qs.stringify(params);
	return request({
		url: `/apk/auth/local/register`,
		method: 'POST',
		data: data,
		istoken: false
	})
}

/**
 *  登录
 * @param {Object} params//参数
 * 
 */
 export const loginApi = (params = {}) => {
	let data = qs.stringify(params);
	return request({
		url: `/apk/auth/local`, 
		method: 'POST',
		data: data,
		istoken: false
	})
}
