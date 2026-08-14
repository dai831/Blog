import request from '@/utils/axios';
import qs from 'qs'

/**
 *  查询文章
 * @param {Object} id//参数
 * 
 */
 export const idArticleApi = (id = null) => {
	return request({
		url: `/apk/articles/${id}`,
		method: 'GET',
		istoken: true
	})
}



