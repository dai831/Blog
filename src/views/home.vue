<template>
	<div class="home">
		<el-row>
			<el-col :span="6" :xs="1"></el-col>
			<el-col :span="12" :xs="22">
				<div class="home_center">
					<el-row :gutter="20" class="main">
						<el-col :span="12" v-for="(item) in titleData" :key="item.url">
							<div class="home_item">
								<div class="home_img" @click="categoryList(item.class_id)">
									<img v-lazy="item.url" :alt="item.category">
									<div class="overlay"></div>
								</div>
								<div class="home_text">
									<div class="text1 text_overflow">{{ item.category }}</div>
									<div class="text2 text_overflow">{{ item.tag }}</div>
								</div>
							</div>
						</el-col>
					</el-row>
					<Pagination 
						@onSizeChange="onSizeChange"
						@onCurrentChange="onCurrentChange"
						:page="page">
					</Pagination>
				</div>
			</el-col>
			<el-col :span="6" :xs="1"></el-col>
		</el-row>
	</div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { getBlogApi, newestListApi } from "@/api/home"; 
import {  useRouter } from 'vue-router'
import Pagination from '../components/Pagination.vue';
import { useUserStore } from "@/store/user";
const User = useUserStore();

const router = useRouter()
const titleData = ref([]);
const page = reactive({
	pageno: 1,
	count: 10,
	total: 0
})
onMounted( async() =>{
	newestList();
	// getBlogList();
})
// const getBlogList = async () =>{
// 	const list = await getBlogApi();
// 	const data = list?.data?.data;
// 	if(list.status == 200 && data) {
// 		titleData.value = data;
// 	}
// }

const newestList = async () =>{
	let params = {
		pageno: page.pageno,
		count: page.count
	}
	const res = await newestListApi(params);
	titleData.value = res?.data?.data?.list || [];
	page.total = res?.data?.data?.total_count || 0;
}

const categoryList = async (cids) =>{
	User.userInfo.routeKey = null;
	router.push({ path: '/home-detail', query: { cids }})
}

const onSizeChange = (val) => {
	page.count = val;
	newestList();
}
const onCurrentChange = (val) => {
	page.pageno = val;
	newestList();
}

</script>
<style lang="scss" scoped>
.home{
	height: 94vh;
	background: #f2f3f5;
}
.home_center{
}
.main{
	height: calc(94vh - 4rem);
	overflow: auto;
}
.home_item{
	margin-top: 20px;
	box-sizing: border-box;
	transition: all 0.3s ease;
	.home_text{
		padding: 2% 4%;
		background-color: #fff;
		font-family: 'KAITI';
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
	}
	.text1{
		padding-bottom: 2%;
		font-weight: bolder;
	}
	.home_img{
		position: relative;
		overflow: hidden;
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		img{
			display: block; //如果是行内快存在自带3px的下边距
			transition: all 0.5s ease;
			border: none;
  			background: none;
		}
		&:hover > img{
			transform: scale(1.3);
		}	
		.overlay{
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, 0.5); /* 蒙层的颜色和透明度 */
			opacity: 0;
			transition: opacity 0.3s ease;
		}
		&:hover .overlay{
			opacity: 0.5;
		}	
	}
	&:hover{
		border-radius: 8px;
	}
}
</style>