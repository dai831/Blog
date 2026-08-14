import request from '@/utils/axios';
// import qs from 'qs'

/**
 *  类别
 * @param {Object} params//参数
 * 
 */
 export const categoryApi = (params = {}) => {
	return request({
		url: `https://wp.shanhutech.cn/intf/GetListByCategory`,
		method: 'GET',
		params: params,
		istoken: false
	})
}
