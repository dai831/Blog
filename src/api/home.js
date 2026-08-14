import request from '@/utils/axios';
import qs from 'qs'

/**
 *  查询博客
 * @param {Object} params//参数
 * 
 */
export const getBlogApi = (params = {}) => {
	return request({
		url: `/apk/blogs?populate=*`,
		method: 'GET',
		istoken: true
	})
}

/**
 *  精美图片
 * @param {Object} params//参数
 * 
 */
 export const newestListApi = (params = {}) => {
	let data = qs.stringify(params);
	return request({
		url: `https://shcdn-wp.shanhutech.cn/intf/newestList`,
		method: 'POST',
		data: data,
		istoken: false
	})
}

