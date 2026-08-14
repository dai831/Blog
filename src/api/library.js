import request from '@/utils/axios';
import qs from 'qs'

/**
 *  根据分页所有查询文章
 * @param {Object} params//参数
 * 
 */
 export const articlesApi = (params = {}) => {
	return request({
		url: '/apk/articles?populate=*',
		method: 'GET',
		params: params,
		istoken: true
	})
}

/**
 *  根据文章类型查询所有文章
 * @param {Object} type//文章类型
 * 
 */
 export const typeArticleApi = (type = null) => {
	return request({
		url: `/apk/articles?filters[type][$eq]=${type}`,
		method: 'GET',
		istoken: true
	})
} 



